
-- Tabela de propostas de compra
CREATE TABLE public.propostas_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID REFERENCES public.feedbacks_visitas(id),
  construtora_id UUID,
  imobiliaria_id UUID,
  imovel_id UUID,
  codigo TEXT NOT NULL UNIQUE,
  nome_completo TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  endereco_resumido TEXT,
  unidade TEXT,
  matricula TEXT,
  valor_ofertado NUMERIC,
  moeda TEXT DEFAULT 'BRL',
  sinal_entrada TEXT,
  parcelas TEXT,
  financiamento TEXT,
  outras_condicoes TEXT,
  validade_proposta TIMESTAMPTZ,
  forma_aceite TEXT DEFAULT 'assinatura',
  assinatura_proponente TEXT,
  cnh_url TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','aceita','recusada','expirada')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para updated_at
CREATE TRIGGER update_propostas_compra_updated_at
  BEFORE UPDATE ON public.propostas_compra
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Enable RLS
ALTER TABLE public.propostas_compra ENABLE ROW LEVEL SECURITY;

-- INSERT público (sem auth, como leads)
CREATE POLICY "Permitir insert publico propostas"
  ON public.propostas_compra FOR INSERT
  WITH CHECK (true);

-- SELECT restrito a imobiliaria/construtora dona
CREATE POLICY "Imobiliaria pode ver suas propostas"
  ON public.propostas_compra FOR SELECT
  USING (
    imobiliaria_id = get_imobiliaria_id(auth.uid())
    OR construtora_id = get_construtora_id(auth.uid())
  );

-- UPDATE restrito a imobiliaria/construtora dona (aceitar/recusar)
CREATE POLICY "Imobiliaria pode atualizar suas propostas"
  ON public.propostas_compra FOR UPDATE
  USING (
    imobiliaria_id = get_imobiliaria_id(auth.uid())
    OR construtora_id = get_construtora_id(auth.uid())
  );

-- Bucket privado para CNH
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-proposta', 'documentos-proposta', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: upload público para CNH (sem auth, como o formulário é público)
CREATE POLICY "Upload publico CNH proposta"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documentos-proposta');

-- Storage policy: leitura restrita a usuários autenticados
CREATE POLICY "Leitura autenticada CNH proposta"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documentos-proposta' AND auth.role() = 'authenticated');

-- RPC segura para submeter proposta validando token do feedback
CREATE OR REPLACE FUNCTION public.submit_proposta_compra(
  p_token UUID,
  p_nome_completo TEXT,
  p_cpf_cnpj TEXT,
  p_telefone TEXT,
  p_email TEXT DEFAULT NULL,
  p_endereco_resumido TEXT DEFAULT NULL,
  p_unidade TEXT DEFAULT NULL,
  p_matricula TEXT DEFAULT NULL,
  p_valor_ofertado NUMERIC DEFAULT NULL,
  p_sinal_entrada TEXT DEFAULT NULL,
  p_parcelas TEXT DEFAULT NULL,
  p_financiamento TEXT DEFAULT NULL,
  p_outras_condicoes TEXT DEFAULT NULL,
  p_validade_proposta TIMESTAMPTZ DEFAULT NULL,
  p_assinatura_proponente TEXT DEFAULT NULL,
  p_cnh_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_feedback RECORD;
  v_proposta_id UUID;
  v_codigo TEXT;
BEGIN
  -- Buscar feedback pelo token
  SELECT id, construtora_id, imobiliaria_id, imovel_id
  INTO v_feedback
  FROM public.feedbacks_visitas
  WHERE token_acesso_cliente = p_token
  LIMIT 1;

  IF v_feedback IS NULL THEN
    RAISE EXCEPTION 'Token de feedback inválido';
  END IF;

  -- Gerar código único
  v_codigo := 'PROP-' || upper(substring(gen_random_uuid()::text from 1 for 8));

  INSERT INTO public.propostas_compra (
    feedback_id, construtora_id, imobiliaria_id, imovel_id, codigo,
    nome_completo, cpf_cnpj, telefone, email,
    endereco_resumido, unidade, matricula,
    valor_ofertado, sinal_entrada, parcelas, financiamento, outras_condicoes,
    validade_proposta, assinatura_proponente, cnh_url
  ) VALUES (
    v_feedback.id, v_feedback.construtora_id, v_feedback.imobiliaria_id, v_feedback.imovel_id, v_codigo,
    p_nome_completo, p_cpf_cnpj, p_telefone, p_email,
    p_endereco_resumido, p_unidade, p_matricula,
    p_valor_ofertado, p_sinal_entrada, p_parcelas, p_financiamento, p_outras_condicoes,
    p_validade_proposta, p_assinatura_proponente, p_cnh_url
  )
  RETURNING id INTO v_proposta_id;

  RETURN v_proposta_id;
END;
$$;
