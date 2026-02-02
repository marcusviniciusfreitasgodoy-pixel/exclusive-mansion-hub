-- ═══════════════════════════════════════════════════════════
-- CRM COMPLETO: TABELAS PARA PIPELINE KANBAN
-- ═══════════════════════════════════════════════════════════

-- 1. Adicionar novos campos na tabela leads
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS estagio_pipeline VARCHAR(50) DEFAULT 'novo',
  ADD COLUMN IF NOT EXISTS score_qualificacao INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS orcamento DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS prazo_compra VARCHAR(50),
  ADD COLUMN IF NOT EXISTS origem_detalhada VARCHAR(100),
  ADD COLUMN IF NOT EXISTS ultimo_contato TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS responsavel_id UUID,
  ADD COLUMN IF NOT EXISTS responsavel_nome VARCHAR(255),
  ADD COLUMN IF NOT EXISTS construtora_id UUID REFERENCES public.construtoras(id);

-- Index para pipeline
CREATE INDEX IF NOT EXISTS idx_leads_estagio ON public.leads(estagio_pipeline);
CREATE INDEX IF NOT EXISTS idx_leads_responsavel ON public.leads(responsavel_id);

-- 2. Tabela de atividades do lead
CREATE TABLE IF NOT EXISTS public.atividades_lead (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  
  -- Tipo de atividade
  tipo VARCHAR(50) NOT NULL,
  -- 'email_enviado' | 'whatsapp_enviado' | 'ligacao_realizada' | 
  -- 'reuniao' | 'visita_agendada' | 'proposta_enviada' | 'nota' | 'status_alterado'
  
  titulo VARCHAR(255),
  descricao TEXT,
  
  -- Metadados específicos por tipo
  metadata JSONB DEFAULT '{}',
  
  -- Usuário responsável
  usuario_id UUID,
  usuario_nome VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_atividades_lead ON public.atividades_lead(lead_id);
CREATE INDEX IF NOT EXISTS idx_atividades_tipo ON public.atividades_lead(tipo);
CREATE INDEX IF NOT EXISTS idx_atividades_created ON public.atividades_lead(created_at DESC);

-- RLS para atividades_lead
ALTER TABLE public.atividades_lead ENABLE ROW LEVEL SECURITY;

-- Construtoras podem ver atividades de leads dos seus imóveis
CREATE POLICY "Construtoras podem ver atividades de seus leads"
ON public.atividades_lead FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.leads l
    JOIN public.imoveis i ON l.imovel_id = i.id
    WHERE l.id = atividades_lead.lead_id
    AND i.construtora_id = get_construtora_id(auth.uid())
  )
);

-- Imobiliárias podem ver atividades dos seus leads
CREATE POLICY "Imobiliarias podem ver atividades de seus leads"
ON public.atividades_lead FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = atividades_lead.lead_id
    AND l.imobiliaria_id = get_imobiliaria_id(auth.uid())
  )
);

-- Construtoras podem criar atividades
CREATE POLICY "Construtoras podem criar atividades"
ON public.atividades_lead FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads l
    JOIN public.imoveis i ON l.imovel_id = i.id
    WHERE l.id = atividades_lead.lead_id
    AND i.construtora_id = get_construtora_id(auth.uid())
  )
);

-- Imobiliárias podem criar atividades
CREATE POLICY "Imobiliarias podem criar atividades"
ON public.atividades_lead FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = atividades_lead.lead_id
    AND l.imobiliaria_id = get_imobiliaria_id(auth.uid())
  )
);

-- 3. Tabela de tarefas
CREATE TABLE IF NOT EXISTS public.tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  imobiliaria_id UUID REFERENCES public.imobiliarias(id),
  construtora_id UUID REFERENCES public.construtoras(id),
  
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  
  -- Responsável
  responsavel_id UUID,
  responsavel_nome VARCHAR(255),
  
  -- Prazos
  data_vencimento TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  
  -- Prioridade e status
  prioridade VARCHAR(20) DEFAULT 'media',
  -- 'baixa' | 'media' | 'alta' | 'urgente'
  
  status VARCHAR(20) DEFAULT 'pendente',
  -- 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'
  
  -- Notificações
  notificar_em TIMESTAMP WITH TIME ZONE,
  notificacao_enviada BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tarefas_lead ON public.tarefas(lead_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel ON public.tarefas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_vencimento ON public.tarefas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON public.tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_imobiliaria ON public.tarefas(imobiliaria_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_construtora ON public.tarefas(construtora_id);

-- RLS para tarefas
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Construtoras podem gerenciar suas tarefas"
ON public.tarefas FOR ALL
USING (construtora_id = get_construtora_id(auth.uid()))
WITH CHECK (construtora_id = get_construtora_id(auth.uid()));

CREATE POLICY "Imobiliarias podem gerenciar suas tarefas"
ON public.tarefas FOR ALL
USING (imobiliaria_id = get_imobiliaria_id(auth.uid()))
WITH CHECK (imobiliaria_id = get_imobiliaria_id(auth.uid()));

-- Trigger para updated_at em tarefas
CREATE TRIGGER update_tarefas_updated_at
BEFORE UPDATE ON public.tarefas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 4. Tabela de notas do lead
CREATE TABLE IF NOT EXISTS public.notas_lead (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  
  conteudo TEXT NOT NULL,
  
  -- Autor
  autor_id UUID,
  autor_nome VARCHAR(255),
  
  -- Anexos
  anexos JSONB DEFAULT '[]',
  
  -- Privacidade
  privada BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notas_lead ON public.notas_lead(lead_id);
CREATE INDEX IF NOT EXISTS idx_notas_created ON public.notas_lead(created_at DESC);

-- RLS para notas_lead
ALTER TABLE public.notas_lead ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Construtoras podem ver notas de seus leads"
ON public.notas_lead FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.leads l
    JOIN public.imoveis i ON l.imovel_id = i.id
    WHERE l.id = notas_lead.lead_id
    AND i.construtora_id = get_construtora_id(auth.uid())
  )
  AND (privada = false OR autor_id = auth.uid())
);

CREATE POLICY "Imobiliarias podem ver notas de seus leads"
ON public.notas_lead FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = notas_lead.lead_id
    AND l.imobiliaria_id = get_imobiliaria_id(auth.uid())
  )
  AND (privada = false OR autor_id = auth.uid())
);

CREATE POLICY "Construtoras podem criar notas"
ON public.notas_lead FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads l
    JOIN public.imoveis i ON l.imovel_id = i.id
    WHERE l.id = notas_lead.lead_id
    AND i.construtora_id = get_construtora_id(auth.uid())
  )
);

CREATE POLICY "Imobiliarias podem criar notas"
ON public.notas_lead FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = notas_lead.lead_id
    AND l.imobiliaria_id = get_imobiliaria_id(auth.uid())
  )
);

CREATE POLICY "Usuarios podem atualizar suas notas"
ON public.notas_lead FOR UPDATE
USING (autor_id = auth.uid());

CREATE POLICY "Usuarios podem deletar suas notas"
ON public.notas_lead FOR DELETE
USING (autor_id = auth.uid());

-- Trigger para updated_at em notas
CREATE TRIGGER update_notas_updated_at
BEFORE UPDATE ON public.notas_lead
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();