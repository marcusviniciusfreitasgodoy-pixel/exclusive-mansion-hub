-- Criar enum para status de agendamento
CREATE TYPE public.agendamento_status AS ENUM ('pendente', 'confirmado', 'realizado', 'cancelado', 'remarcado');

-- Criar tabela de agendamentos de visitas
CREATE TABLE public.agendamentos_visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  imovel_id UUID REFERENCES public.imoveis(id) ON DELETE CASCADE NOT NULL,
  imobiliaria_id UUID REFERENCES public.imobiliarias(id) ON DELETE SET NULL,
  construtora_id UUID REFERENCES public.construtoras(id) ON DELETE CASCADE NOT NULL,
  access_id UUID REFERENCES public.imobiliaria_imovel_access(id) ON DELETE SET NULL,
  
  -- Dados do cliente
  cliente_nome TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  cliente_telefone TEXT NOT NULL,
  
  -- Opções de data/horário propostas pelo cliente
  opcao_data_1 TIMESTAMP WITH TIME ZONE NOT NULL,
  opcao_data_2 TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Data confirmada pela imobiliária
  data_confirmada TIMESTAMP WITH TIME ZONE,
  
  -- Status do agendamento
  status public.agendamento_status DEFAULT 'pendente' NOT NULL,
  
  -- Integração Calendly
  calendly_event_url TEXT,
  calendly_event_id TEXT,
  
  -- Observações
  observacoes TEXT,
  motivo_cancelamento TEXT,
  
  -- Lembretes enviados
  lembrete_24h_enviado BOOLEAN DEFAULT FALSE,
  lembrete_1h_enviado BOOLEAN DEFAULT FALSE,
  
  -- Corretor responsável
  corretor_nome TEXT,
  corretor_email TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmado_em TIMESTAMP WITH TIME ZONE,
  realizado_em TIMESTAMP WITH TIME ZONE,
  cancelado_em TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX idx_agendamentos_status ON public.agendamentos_visitas(status);
CREATE INDEX idx_agendamentos_imovel ON public.agendamentos_visitas(imovel_id);
CREATE INDEX idx_agendamentos_imobiliaria ON public.agendamentos_visitas(imobiliaria_id);
CREATE INDEX idx_agendamentos_construtora ON public.agendamentos_visitas(construtora_id);
CREATE INDEX idx_agendamentos_data_confirmada ON public.agendamentos_visitas(data_confirmada);
CREATE INDEX idx_agendamentos_created_at ON public.agendamentos_visitas(created_at);

-- Trigger para updated_at
CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON public.agendamentos_visitas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Habilitar RLS
ALTER TABLE public.agendamentos_visitas ENABLE ROW LEVEL SECURITY;

-- Política: Imobiliárias podem ver seus agendamentos
CREATE POLICY "Imobiliarias podem ver seus agendamentos"
  ON public.agendamentos_visitas
  FOR SELECT
  USING (imobiliaria_id = get_imobiliaria_id(auth.uid()));

-- Política: Construtoras podem ver agendamentos de seus imóveis
CREATE POLICY "Construtoras podem ver agendamentos de seus imoveis"
  ON public.agendamentos_visitas
  FOR SELECT
  USING (construtora_id = get_construtora_id(auth.uid()));

-- Política: Qualquer pessoa pode criar agendamento (público)
CREATE POLICY "Publico pode criar agendamentos"
  ON public.agendamentos_visitas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.imoveis
      WHERE id = imovel_id AND status = 'ativo'::imovel_status
    )
  );

-- Política: Imobiliárias podem atualizar seus agendamentos
CREATE POLICY "Imobiliarias podem atualizar seus agendamentos"
  ON public.agendamentos_visitas
  FOR UPDATE
  USING (imobiliaria_id = get_imobiliaria_id(auth.uid()));

-- Política: Construtoras podem atualizar agendamentos de seus imóveis
CREATE POLICY "Construtoras podem atualizar agendamentos de seus imoveis"
  ON public.agendamentos_visitas
  FOR UPDATE
  USING (construtora_id = get_construtora_id(auth.uid()));