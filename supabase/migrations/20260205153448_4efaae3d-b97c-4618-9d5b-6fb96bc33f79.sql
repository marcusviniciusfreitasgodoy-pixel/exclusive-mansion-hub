-- 1. Criar enum de status
CREATE TYPE empreendimento_status AS ENUM (
  'em_lancamento',
  'em_construcao',
  'pronto_para_morar'
);

-- 2. Criar tabela empreendimentos
CREATE TABLE public.empreendimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  construtora_id uuid NOT NULL REFERENCES public.construtoras(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao_curta text NOT NULL,
  slug text NOT NULL UNIQUE,
  status empreendimento_status NOT NULL DEFAULT 'em_lancamento',
  localizacao jsonb NOT NULL DEFAULT '{}',
  caracteristicas_principais jsonb NOT NULL DEFAULT '[]',
  imagens jsonb NOT NULL DEFAULT '[]',
  precos jsonb NOT NULL DEFAULT '{}',
  detalhes jsonb NOT NULL DEFAULT '{}',
  link_visita_virtual text,
  cores_design_system jsonb DEFAULT '{}',
  componentes_ui jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Índices para performance
CREATE INDEX idx_empreendimentos_status ON public.empreendimentos(status);
CREATE INDEX idx_empreendimentos_construtora ON public.empreendimentos(construtora_id);
CREATE INDEX idx_empreendimentos_localizacao ON public.empreendimentos USING GIN (localizacao);

-- 4. Trigger para updated_at
CREATE TRIGGER update_empreendimentos_updated_at
  BEFORE UPDATE ON public.empreendimentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 5. Habilitar RLS
ALTER TABLE public.empreendimentos ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS
CREATE POLICY "Construtoras podem criar empreendimentos"
  ON public.empreendimentos FOR INSERT
  WITH CHECK (construtora_id = get_construtora_id(auth.uid()));

CREATE POLICY "Construtoras podem ver seus empreendimentos"
  ON public.empreendimentos FOR SELECT
  USING (construtora_id = get_construtora_id(auth.uid()));

CREATE POLICY "Construtoras podem atualizar seus empreendimentos"
  ON public.empreendimentos FOR UPDATE
  USING (construtora_id = get_construtora_id(auth.uid()));

CREATE POLICY "Construtoras podem deletar seus empreendimentos"
  ON public.empreendimentos FOR DELETE
  USING (construtora_id = get_construtora_id(auth.uid()));

CREATE POLICY "Publico pode ver empreendimentos"
  ON public.empreendimentos FOR SELECT
  USING (true);