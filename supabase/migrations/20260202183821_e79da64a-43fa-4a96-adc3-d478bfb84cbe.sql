-- Create table for chatbot conversations
CREATE TABLE public.conversas_chatbot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID NOT NULL REFERENCES public.imoveis(id) ON DELETE CASCADE,
  imobiliaria_id UUID REFERENCES public.imobiliarias(id),
  construtora_id UUID NOT NULL REFERENCES public.construtoras(id),
  
  -- Session identification
  session_id VARCHAR(255) UNIQUE NOT NULL,
  lead_id UUID REFERENCES public.leads(id),
  
  -- Visitor data captured during conversation
  nome_visitante VARCHAR(255),
  email_visitante VARCHAR(255),
  telefone_visitante VARCHAR(50),
  
  -- AI qualification
  score_qualificacao INTEGER DEFAULT 0,
  intencao_detectada VARCHAR(50),
  orcamento_estimado DECIMAL(15,2),
  prazo_estimado VARCHAR(50),
  
  -- Full message history (JSONB array)
  mensagens JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Status
  status VARCHAR(50) DEFAULT 'ativa',
  
  -- Metrics
  primeira_mensagem_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultima_mensagem_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_mensagens INTEGER DEFAULT 0,
  duracao_segundos INTEGER,
  
  -- Flags
  lead_gerado BOOLEAN DEFAULT FALSE,
  agendamento_gerado BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_conversas_imovel ON public.conversas_chatbot(imovel_id);
CREATE INDEX idx_conversas_session ON public.conversas_chatbot(session_id);
CREATE INDEX idx_conversas_lead ON public.conversas_chatbot(lead_id);
CREATE INDEX idx_conversas_status ON public.conversas_chatbot(status);
CREATE INDEX idx_conversas_construtora ON public.conversas_chatbot(construtora_id);

-- Enable RLS
ALTER TABLE public.conversas_chatbot ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public can create new conversations (for chatbot widget)
CREATE POLICY "Public can create conversations"
ON public.conversas_chatbot
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.imoveis
    WHERE imoveis.id = conversas_chatbot.imovel_id
    AND imoveis.status = 'ativo'
  )
);

-- Public can read/update own session conversations
CREATE POLICY "Public can access own session"
ON public.conversas_chatbot
FOR SELECT
USING (true);

CREATE POLICY "Public can update own session"
ON public.conversas_chatbot
FOR UPDATE
USING (true);

-- Construtoras can view conversations of their properties
CREATE POLICY "Construtoras can view conversations"
ON public.conversas_chatbot
FOR SELECT
USING (construtora_id = get_construtora_id(auth.uid()));

-- Imobiliarias can view their conversations
CREATE POLICY "Imobiliarias can view conversations"
ON public.conversas_chatbot
FOR SELECT
USING (imobiliaria_id = get_imobiliaria_id(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_conversas_chatbot_updated_at
BEFORE UPDATE ON public.conversas_chatbot
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();