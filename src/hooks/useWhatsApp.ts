import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SendWhatsAppParams {
  telefone: string;
  nome?: string;
  mensagem?: string;
  template_name?: string;
  template_params?: Record<string, string>;
  lead_id?: string;
  agendamento_id?: string;
  tipo_mensagem?: 'manual' | 'novo_lead' | 'agendamento' | 'lembrete' | 'followup';
}

interface WhatsAppResult {
  success: boolean;
  modo: 'api_oficial' | 'wa_link';
  wamid?: string;
  wa_link?: string;
  error?: string;
}

export function useWhatsApp() {
  const { construtora, imobiliaria } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Get WhatsApp integration config
  const getWhatsAppConfig = async () => {
    const ownerId = construtora?.id || imobiliaria?.id;
    const ownerField = construtora ? 'construtora_id' : 'imobiliaria_id';

    if (!ownerId) return null;

    // First check for API oficial
    const { data: apiIntegracao } = await supabase
      .from('integracoes')
      .select('*')
      .eq(ownerField, ownerId)
      .eq('tipo_integracao', 'whatsapp_business')
      .eq('ativa', true)
      .single();

    if (apiIntegracao) {
      return { tipo: 'api_oficial' as const, config: apiIntegracao };
    }

    // Check for simple mode
    const { data: simplesIntegracao } = await supabase
      .from('integracoes')
      .select('*')
      .eq(ownerField, ownerId)
      .eq('tipo_integracao', 'whatsapp_simples')
      .eq('ativa', true)
      .single();

    if (simplesIntegracao) {
      return { tipo: 'wa_link' as const, config: simplesIntegracao };
    }

    return null;
  };

  // Format phone number
  const formatPhone = (telefone: string): string => {
    const clean = telefone.replace(/\D/g, '');
    return clean.startsWith('55') ? clean : `55${clean}`;
  };

  // Generate wa.me link
  const generateWaLink = (telefone: string, mensagem?: string): string => {
    const formattedPhone = formatPhone(telefone);
    const encodedMessage = mensagem ? encodeURIComponent(mensagem) : '';
    return `https://wa.me/${formattedPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
  };

  // Send message via edge function (for API oficial)
  const sendViaApi = async (params: SendWhatsAppParams): Promise<WhatsAppResult> => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      return { success: false, modo: 'api_oficial', error: 'Não autenticado' };
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-whatsapp-message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...params,
          modo_envio: 'api_oficial'
        })
      }
    );

    return response.json();
  };

  // Open WhatsApp link (for simple mode)
  const openWaLink = (telefone: string, mensagem?: string): WhatsAppResult => {
    const waLink = generateWaLink(telefone, mensagem);
    window.open(waLink, '_blank');
    return { success: true, modo: 'wa_link', wa_link: waLink };
  };

  // Log message in database (for simple mode)
  const logSimpleMessage = async (params: SendWhatsAppParams) => {
    const ownerId = construtora?.id || imobiliaria?.id;
    if (!ownerId) return;

    try {
      // Use raw insert since types may not be updated yet
      const insertData: Record<string, unknown> = {
        telefone_destino: formatPhone(params.telefone),
        nome_destino: params.nome || null,
        tipo_mensagem: params.tipo_mensagem || 'manual',
        conteudo: params.mensagem || null,
        modo_envio: 'wa_link',
        status: 'enviado',
        enviado_em: new Date().toISOString()
      };

      if (construtora) {
        insertData.construtora_id = ownerId;
      } else {
        insertData.imobiliaria_id = ownerId;
      }

      if (params.lead_id) {
        insertData.lead_id = params.lead_id;
      }
      if (params.agendamento_id) {
        insertData.agendamento_id = params.agendamento_id;
      }

      await supabase
        .from('whatsapp_messages' as any)
        .insert(insertData as any);
    } catch (error) {
      console.error('Error logging WhatsApp message:', error);
    }
  };

  // Main send function - auto-detects mode
  const sendWhatsApp = async (params: SendWhatsAppParams): Promise<WhatsAppResult> => {
    setIsLoading(true);

    try {
      const config = await getWhatsAppConfig();

      if (config?.tipo === 'api_oficial') {
        // Use API oficial
        const result = await sendViaApi(params);
        
        if (result.success) {
          toast.success('Mensagem enviada via WhatsApp Business API');
        } else {
          toast.error(`Erro ao enviar: ${result.error}`);
        }
        
        return result;
      } else {
        // Use simple wa.me link
        const configData = config?.config?.configuracoes as Record<string, unknown> | null;
        const mensagem = (configData?.mensagem_padrao as string) || params.mensagem;
        const result = openWaLink(params.telefone, mensagem);
        
        // Log the message
        await logSimpleMessage({ ...params, mensagem });
        
        toast.success('WhatsApp aberto em nova aba');
        return result;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro: ${errorMsg}`);
      return { success: false, modo: 'wa_link', error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Quick open WhatsApp (always uses wa.me link, without logging)
  const quickOpenWhatsApp = (telefone: string, mensagem?: string) => {
    const waLink = generateWaLink(telefone, mensagem);
    window.open(waLink, '_blank');
  };

  return {
    sendWhatsApp,
    quickOpenWhatsApp,
    generateWaLink,
    formatPhone,
    getWhatsAppConfig,
    isLoading
  };
}
