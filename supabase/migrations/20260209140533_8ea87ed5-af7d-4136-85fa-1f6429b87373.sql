
-- Create RPC function to read feedback by token (replaces overly permissive SELECT policy)
CREATE OR REPLACE FUNCTION public.get_feedback_by_token(p_token uuid)
RETURNS SETOF feedbacks_visitas_publico
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT * FROM feedbacks_visitas_publico
  WHERE token_acesso_cliente = p_token
  LIMIT 1;
$$;

-- Create RPC function to submit client feedback by token (replaces overly permissive UPDATE policy)
CREATE OR REPLACE FUNCTION public.submit_client_feedback(
  p_token uuid,
  p_nps_cliente integer,
  p_avaliacao_localizacao integer,
  p_avaliacao_acabamento integer,
  p_avaliacao_layout integer,
  p_avaliacao_custo_beneficio integer,
  p_avaliacao_atendimento integer,
  p_pontos_positivos text,
  p_pontos_negativos text,
  p_sugestoes text,
  p_interesse_compra interesse_compra,
  p_objecoes jsonb,
  p_objecoes_detalhes text,
  p_efeito_uau text[],
  p_efeito_uau_detalhe text,
  p_prazo_compra_cliente text,
  p_orcamento_cliente numeric,
  p_forma_pagamento_cliente text,
  p_proximos_passos_cliente text,
  p_assinatura_cliente text,
  p_assinatura_cliente_device text,
  p_respostas_cliente_customizadas jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_feedback_id uuid;
BEGIN
  -- Only update if token matches AND status is aguardando_cliente
  UPDATE feedbacks_visitas
  SET
    nps_cliente = p_nps_cliente,
    avaliacao_localizacao = p_avaliacao_localizacao,
    avaliacao_acabamento = p_avaliacao_acabamento,
    avaliacao_layout = p_avaliacao_layout,
    avaliacao_custo_beneficio = p_avaliacao_custo_beneficio,
    avaliacao_atendimento = p_avaliacao_atendimento,
    pontos_positivos = p_pontos_positivos,
    pontos_negativos = NULLIF(p_pontos_negativos, ''),
    sugestoes = NULLIF(p_sugestoes, ''),
    interesse_compra = p_interesse_compra,
    objecoes = COALESCE(p_objecoes, '[]'::jsonb),
    objecoes_detalhes = NULLIF(p_objecoes_detalhes, ''),
    efeito_uau = CASE WHEN array_length(p_efeito_uau, 1) > 0 THEN p_efeito_uau ELSE NULL END,
    efeito_uau_detalhe = NULLIF(p_efeito_uau_detalhe, ''),
    prazo_compra_cliente = NULLIF(p_prazo_compra_cliente, ''),
    orcamento_cliente = p_orcamento_cliente,
    forma_pagamento_cliente = NULLIF(p_forma_pagamento_cliente, ''),
    proximos_passos_cliente = NULLIF(p_proximos_passos_cliente, ''),
    assinatura_cliente = p_assinatura_cliente,
    assinatura_cliente_data = now(),
    assinatura_cliente_device = p_assinatura_cliente_device,
    status = 'aguardando_corretor',
    feedback_cliente_em = now(),
    respostas_cliente_customizadas = COALESCE(p_respostas_cliente_customizadas, '{}'::jsonb),
    updated_at = now()
  WHERE token_acesso_cliente = p_token
    AND status = 'aguardando_cliente'
  RETURNING id INTO v_feedback_id;

  IF v_feedback_id IS NULL THEN
    RAISE EXCEPTION 'Feedback não encontrado ou já preenchido';
  END IF;

  RETURN v_feedback_id;
END;
$$;

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Token-based client feedback access" ON feedbacks_visitas;

-- Drop the overly permissive public UPDATE policy  
DROP POLICY IF EXISTS "Update publico via token cliente" ON feedbacks_visitas;
