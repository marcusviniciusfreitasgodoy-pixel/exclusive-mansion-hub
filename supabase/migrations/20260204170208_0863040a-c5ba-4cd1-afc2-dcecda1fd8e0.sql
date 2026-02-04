-- Tabela para rastrear mensagens WhatsApp enviadas
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  construtora_id UUID REFERENCES public.construtoras(id) ON DELETE CASCADE,
  imobiliaria_id UUID REFERENCES public.imobiliarias(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  agendamento_id UUID REFERENCES public.agendamentos_visitas(id) ON DELETE SET NULL,
  
  -- Destinatário
  telefone_destino TEXT NOT NULL,
  nome_destino TEXT,
  
  -- Mensagem
  tipo_mensagem TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'novo_lead', 'agendamento', 'lembrete', 'followup'
  template_name TEXT, -- Nome do template para API oficial
  conteudo TEXT, -- Conteúdo da mensagem (para modo simples ou logs)
  
  -- Status
  modo_envio TEXT NOT NULL DEFAULT 'wa_link', -- 'api_oficial', 'wa_link'
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'enviado', 'entregue', 'lido', 'falhou'
  
  -- Meta API response tracking
  wamid TEXT, -- WhatsApp Message ID (para API oficial)
  erro TEXT,
  
  -- Timestamps
  enviado_em TIMESTAMP WITH TIME ZONE,
  entregue_em TIMESTAMP WITH TIME ZONE,
  lido_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraint: must belong to either construtora or imobiliaria
  CONSTRAINT whatsapp_messages_owner_check CHECK (
    (construtora_id IS NOT NULL AND imobiliaria_id IS NULL) OR
    (construtora_id IS NULL AND imobiliaria_id IS NOT NULL)
  )
);

-- Índices para performance
CREATE INDEX idx_whatsapp_messages_construtora ON public.whatsapp_messages(construtora_id);
CREATE INDEX idx_whatsapp_messages_imobiliaria ON public.whatsapp_messages(imobiliaria_id);
CREATE INDEX idx_whatsapp_messages_lead ON public.whatsapp_messages(lead_id);
CREATE INDEX idx_whatsapp_messages_status ON public.whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_created ON public.whatsapp_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Construtoras podem ver suas mensagens"
ON public.whatsapp_messages FOR SELECT
USING (construtora_id = get_construtora_id(auth.uid()));

CREATE POLICY "Construtoras podem criar mensagens"
ON public.whatsapp_messages FOR INSERT
WITH CHECK (construtora_id = get_construtora_id(auth.uid()));

CREATE POLICY "Imobiliárias podem ver suas mensagens"
ON public.whatsapp_messages FOR SELECT
USING (imobiliaria_id = get_imobiliaria_id(auth.uid()));

CREATE POLICY "Imobiliárias podem criar mensagens"
ON public.whatsapp_messages FOR INSERT
WITH CHECK (imobiliaria_id = get_imobiliaria_id(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_whatsapp_messages_updated_at
BEFORE UPDATE ON public.whatsapp_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Adicionar campo whatsapp_mode na tabela integracoes para configuração
COMMENT ON TABLE public.whatsapp_messages IS 'Rastreamento de mensagens WhatsApp enviadas via API oficial ou links wa.me';