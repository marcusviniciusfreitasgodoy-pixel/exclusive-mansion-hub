
-- RPC seguro para pagina publica de assinatura (nao expoe PII)
CREATE OR REPLACE FUNCTION public.get_ficha_for_signature(p_codigo TEXT)
RETURNS TABLE(
  id UUID,
  codigo TEXT,
  endereco_imovel TEXT,
  data_visita TIMESTAMPTZ,
  corretor_nome TEXT,
  status TEXT,
  assinatura_visitante TEXT,
  assinatura_corretor TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, codigo, endereco_imovel, data_visita, corretor_nome, status,
         assinatura_visitante, assinatura_corretor
  FROM public.fichas_visita
  WHERE codigo = p_codigo
  LIMIT 1;
$$;

-- RPC seguro para salvar assinatura remotamente (sem login)
CREATE OR REPLACE FUNCTION public.save_ficha_signature(p_codigo TEXT, p_tipo TEXT, p_assinatura TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_tipo = 'visitante' THEN
    UPDATE public.fichas_visita
    SET assinatura_visitante = p_assinatura, updated_at = now()
    WHERE codigo = p_codigo AND assinatura_visitante IS NULL;
  ELSIF p_tipo = 'corretor' THEN
    UPDATE public.fichas_visita
    SET assinatura_corretor = p_assinatura, updated_at = now()
    WHERE codigo = p_codigo AND assinatura_corretor IS NULL;
  ELSE
    RAISE EXCEPTION 'Tipo invalido. Use visitante ou corretor.';
  END IF;
  
  RETURN FOUND;
END;
$$;
