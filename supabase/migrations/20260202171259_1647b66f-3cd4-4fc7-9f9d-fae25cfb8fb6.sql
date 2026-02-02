-- =============================================================
-- SISTEMA DE FORMULÁRIOS CUSTOMIZÁVEIS
-- =============================================================

-- 1. Tabela de configurações de formulários
CREATE TABLE public.configuracoes_formularios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imobiliaria_id UUID REFERENCES public.imobiliarias(id) ON DELETE CASCADE NOT NULL,
  
  -- Tipo de formulário
  tipo_formulario VARCHAR(50) NOT NULL,
  -- Valores: 'agendamento_visita' | 'feedback_corretor' | 'feedback_cliente'
  
  -- Configuração geral
  nome_formulario VARCHAR(255),
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  
  -- Campos do formulário (JSON array)
  campos JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraint: uma configuração ativa por tipo por imobiliária
  CONSTRAINT unique_tipo_per_imobiliaria UNIQUE (imobiliaria_id, tipo_formulario)
);

-- 2. Índices para performance
CREATE INDEX idx_config_formularios_imobiliaria ON public.configuracoes_formularios(imobiliaria_id);
CREATE INDEX idx_config_formularios_tipo ON public.configuracoes_formularios(tipo_formulario);
CREATE INDEX idx_config_formularios_ativo ON public.configuracoes_formularios(ativo);

-- 3. RLS
ALTER TABLE public.configuracoes_formularios ENABLE ROW LEVEL SECURITY;

-- Política para imobiliárias gerenciarem suas configurações
CREATE POLICY "Imobiliárias podem gerenciar suas configurações"
  ON public.configuracoes_formularios 
  FOR ALL
  USING (imobiliaria_id = get_imobiliaria_id(auth.uid()))
  WITH CHECK (imobiliaria_id = get_imobiliaria_id(auth.uid()));

-- Política para leitura pública (formulários precisam ser lidos por visitantes)
CREATE POLICY "Leitura pública de configurações ativas"
  ON public.configuracoes_formularios 
  FOR SELECT
  USING (ativo = true);

-- 4. Trigger para updated_at
CREATE TRIGGER set_updated_at_configuracoes_formularios
  BEFORE UPDATE ON public.configuracoes_formularios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 5. Adicionar colunas para respostas customizadas nas tabelas existentes
ALTER TABLE public.agendamentos_visitas 
  ADD COLUMN IF NOT EXISTS respostas_customizadas JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.feedbacks_visitas 
  ADD COLUMN IF NOT EXISTS respostas_corretor_customizadas JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.feedbacks_visitas 
  ADD COLUMN IF NOT EXISTS respostas_cliente_customizadas JSONB DEFAULT '{}'::jsonb;

-- 6. Comentários para documentação
COMMENT ON TABLE public.configuracoes_formularios IS 'Configurações customizáveis de formulários por imobiliária';
COMMENT ON COLUMN public.configuracoes_formularios.tipo_formulario IS 'Tipo: agendamento_visita, feedback_corretor, feedback_cliente';
COMMENT ON COLUMN public.configuracoes_formularios.campos IS 'Array JSON com definição dos campos do formulário';