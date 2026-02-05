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
      template_name, 
      template_params,
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

    // Get WhatsApp integration config
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
      wamid?: string;
      wa_link?: string;
      error?: string;
    };

    // Clean phone number (remove non-digits, add country code if needed)
    const cleanPhone = telefone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    if (modo_envio === 'api_oficial' && integracao?.credenciais) {
      // WhatsApp Business API mode
      const { phone_number_id, access_token } = integracao.credenciais as {
        phone_number_id: string;
        access_token: string;
      };

      if (!phone_number_id || !access_token) {
        return new Response(
          JSON.stringify({ error: 'Credenciais da API WhatsApp não configuradas' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        let apiBody: Record<string, unknown>;

        if (template_name) {
          // Template message
          apiBody = {
            messaging_product: 'whatsapp',
            to: formattedPhone,
            type: 'template',
            template: {
              name: template_name,
              language: { code: 'pt_BR' },
              components: template_params ? [
                {
                  type: 'body',
                  parameters: Object.values(template_params).map(value => ({
                    type: 'text',
                    text: value
                  }))
                }
              ] : []
            }
          };
        } else if (mensagem) {
          // Text message
          apiBody = {
            messaging_product: 'whatsapp',
            to: formattedPhone,
            type: 'text',
            text: { body: mensagem }
          };
        } else {
          return new Response(
            JSON.stringify({ error: 'Mensagem ou template é obrigatório para API oficial' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const waResponse = await fetch(
          `https://graph.facebook.com/v18.0/${phone_number_id}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(apiBody)
          }
        );

        const waData = await waResponse.json();

        if (!waResponse.ok) {
          throw new Error(waData.error?.message || 'Erro ao enviar mensagem');
        }

        result = {
          success: true,
          modo: 'api_oficial',
          wamid: waData.messages?.[0]?.id
        };

        // Update integration stats
        await supabase
          .from('integracoes')
          .update({
            ultima_sincronizacao: new Date().toISOString(),
            total_eventos_enviados: (integracao.total_eventos_enviados || 0) + 1,
            erro_ultima_tentativa: null
          })
          .eq('id', integracao.id);

      } catch (apiError) {
        result = {
          success: false,
          modo: 'api_oficial',
          error: apiError instanceof Error ? apiError.message : 'Erro desconhecido'
        };

        // Log error in integration
        if (integracao) {
          await supabase
            .from('integracoes')
            .update({
              erro_ultima_tentativa: result.error
            })
            .eq('id', integracao.id);
        }
      }
    } else {
      // wa.me link mode (simple mode)
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
      template_name: template_name || null,
      conteudo: mensagem || null,
      modo_envio: result.modo,
      status: result.success ? 'enviado' : 'falhou',
      wamid: result.wamid || null,
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
