
-- Tabela de Fichas de Visita
CREATE TABLE public.fichas_visita (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  
  -- Dados do visitante
  nome_visitante TEXT NOT NULL,
  cpf_visitante TEXT NOT NULL,
  telefone_visitante TEXT NOT NULL,
  email_visitante TEXT,
  rg_visitante TEXT,
  endereco_visitante TEXT,
  acompanhantes JSONB DEFAULT '[]'::jsonb,
  
  -- Dados do imóvel
  imovel_id UUID REFERENCES public.imoveis(id),
  endereco_imovel TEXT NOT NULL,
  condominio_edificio TEXT,
  unidade_imovel TEXT,
  valor_imovel NUMERIC,
  nome_proprietario TEXT,
  
  -- Intermediação
  corretor_nome TEXT NOT NULL,
  data_visita TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'confirmada', 'realizada', 'cancelada')),
  notas TEXT,
  
  -- Assinaturas
  assinatura_visitante TEXT,
  assinatura_corretor TEXT,
  
  -- LGPD
  aceita_ofertas_similares BOOLEAN DEFAULT false,
  
  -- Relacionamentos
  imobiliaria_id UUID REFERENCES public.imobiliarias(id),
  construtora_id UUID REFERENCES public.construtoras(id),
  agendamento_visita_id UUID REFERENCES public.agendamentos_visitas(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para updated_at
CREATE TRIGGER update_fichas_visita_updated_at
  BEFORE UPDATE ON public.fichas_visita
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.fichas_visita ENABLE ROW LEVEL SECURITY;

-- Imobiliária vê apenas suas fichas
CREATE POLICY "Imobiliaria ve suas fichas"
  ON public.fichas_visita FOR SELECT
  USING (imobiliaria_id = public.get_imobiliaria_id(auth.uid()));

CREATE POLICY "Imobiliaria cria fichas"
  ON public.fichas_visita FOR INSERT
  WITH CHECK (imobiliaria_id = public.get_imobiliaria_id(auth.uid()));

CREATE POLICY "Imobiliaria atualiza suas fichas"
  ON public.fichas_visita FOR UPDATE
  USING (imobiliaria_id = public.get_imobiliaria_id(auth.uid()));

CREATE POLICY "Imobiliaria deleta suas fichas"
  ON public.fichas_visita FOR DELETE
  USING (imobiliaria_id = public.get_imobiliaria_id(auth.uid()));

-- Construtora vê fichas dos seus imóveis
CREATE POLICY "Construtora ve fichas dos seus imoveis"
  ON public.fichas_visita FOR SELECT
  USING (construtora_id = public.get_construtora_id(auth.uid()));

-- Função para gerar código único de visita
CREATE OR REPLACE FUNCTION public.generate_visit_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE 
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'VIS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    SELECT EXISTS(SELECT 1 FROM fichas_visita WHERE codigo = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;
