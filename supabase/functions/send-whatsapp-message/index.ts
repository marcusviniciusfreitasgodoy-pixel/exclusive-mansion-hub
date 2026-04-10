import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  telefone: string;
  nome?: string;
  mensagem?: string;
  template_name?: string;
  template_params?: Record<string, string>;
  lead_id?: string;
  agendamento_id?: string;
  tipo_mensagem?: string;
  modo_envio?: 'api_oficial' | 'wa_link';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token to identify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: WhatsAppRequest = await req.json();
    const { 
      telefone, 
      nome, 
      mensagem, 
      lead_id, 
      agendamento_id, 
      tipo_mensagem = 'manual',
      modo_envio = 'wa_link'
    } = body;

    if (!telefone) {
      return new Response(
        JSON.stringify({ error: 'Telefone é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's construtora or imobiliaria
    const { data: construtora } = await supabase
      .from('construtoras')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const { data: imobiliaria } = await supabase
      .from('imobiliarias')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const ownerId = construtora?.id || imobiliaria?.id;
    const ownerType = construtora ? 'construtora' : 'imobiliaria';

    if (!ownerId) {
      return new Response(
        JSON.stringify({ error: 'Usuário não pertence a nenhuma construtora ou imobiliária' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Z-API integration config
    const { data: integracao } = await supabase
      .from('integracoes')
      .select('*')
      .eq(ownerType === 'construtora' ? 'construtora_id' : 'imobiliaria_id', ownerId)
      .eq('tipo_integracao', 'whatsapp_business')
      .eq('ativa', true)
      .single();

    let result: {
      success: boolean;
      modo: string;
      zapiMessageId?: string;
      wa_link?: string;
      error?: string;
    };

    // Clean phone number
    const cleanPhone = telefone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    if (modo_envio === 'api_oficial') {
      // Z-API mode - use integration credentials or env secrets
      let instanceId = '';
      let apiToken = '';
      let clientToken = '';

      if (integracao?.credenciais) {
        const creds = integracao.credenciais as Record<string, string>;
        instanceId = creds.instance_id || '';
        apiToken = creds.token || '';
        clientToken = creds.security_token || '';
      }

      // Fallback to env-level secrets
      instanceId = instanceId || Deno.env.get('ZAPI_INSTANCE_ID') || '';
      apiToken = apiToken || Deno.env.get('ZAPI_TOKEN') || '';
      clientToken = clientToken || Deno.env.get('ZAPI_CLIENT_TOKEN') || '';

      if (!instanceId || !apiToken) {
        return new Response(
          JSON.stringify({ error: 'Credenciais da Z-API não configuradas' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const zapiBaseUrl = `https://api.z-api.io/instances/${instanceId}/token/${apiToken}`;
        const zapiHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (clientToken) {
          zapiHeaders['Client-Token'] = clientToken;
        }

        if (mensagem) {
          // Send text message via Z-API
          const zapiResponse = await fetch(`${zapiBaseUrl}/send-text`, {
            method: 'POST',
            headers: zapiHeaders,
            body: JSON.stringify({
              phone: formattedPhone,
              message: mensagem
            })
          });

          const zapiData = await zapiResponse.json();

          if (!zapiResponse.ok || zapiData.error) {
            throw new Error(zapiData.message || zapiData.error || 'Erro ao enviar mensagem via Z-API');
          }

          result = {
            success: true,
            modo: 'api_oficial',
            zapiMessageId: zapiData.messageId || zapiData.id
          };
        } else {
          return new Response(
            JSON.stringify({ error: 'Mensagem é obrigatória para envio via Z-API' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update integration stats (only if integration exists in DB)
        if (integracao) {
          await supabase
            .from('integracoes')
            .update({
              ultima_sincronizacao: new Date().toISOString(),
              total_eventos_enviados: (integracao.total_eventos_enviados || 0) + 1,
              erro_ultima_tentativa: null
            })
            .eq('id', integracao.id);
        }

      } catch (apiError) {
        result = {
          success: false,
          modo: 'api_oficial',
          error: apiError instanceof Error ? apiError.message : 'Erro desconhecido'
        };

        if (integracao) {
          await supabase
            .from('integracoes')
            .update({ erro_ultima_tentativa: result.error })
            .eq('id', integracao.id);
        }
      }
    } else {
      // wa.me link mode (fallback)
      const encodedMessage = mensagem ? encodeURIComponent(mensagem) : '';
      const waLink = `https://wa.me/${formattedPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;

      result = {
        success: true,
        modo: 'wa_link',
        wa_link: waLink
      };
    }

    // Log the message attempt
    const messageRecord = {
      [ownerType === 'construtora' ? 'construtora_id' : 'imobiliaria_id']: ownerId,
      lead_id: lead_id || null,
      agendamento_id: agendamento_id || null,
      telefone_destino: formattedPhone,
      nome_destino: nome || null,
      tipo_mensagem,
      conteudo: mensagem || null,
      modo_envio: result.modo,
      status: result.success ? 'enviado' : 'falhou',
      wamid: result.zapiMessageId || null,
      erro: result.error || null,
      enviado_em: result.success ? new Date().toISOString() : null
    };

    await supabase.from('whatsapp_messages').insert(messageRecord);

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-whatsapp-message:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
