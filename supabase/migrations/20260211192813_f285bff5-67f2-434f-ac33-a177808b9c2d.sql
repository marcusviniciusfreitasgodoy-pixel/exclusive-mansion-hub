
-- Add percepcao_valor column to feedbacks_visitas
ALTER TABLE public.feedbacks_visitas 
ADD COLUMN IF NOT EXISTS percepcao_valor TEXT;

-- Update submit_client_feedback RPC to accept and save percepcao_valor
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
  p_respostas_cliente_customizadas jsonb DEFAULT '{}'::jsonb,
  p_percepcao_valor text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_feedback_id uuid;
BEGIN
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
    percepcao_valor = NULLIF(p_percepcao_valor, ''),
    updated_at = now()
  WHERE token_acesso_cliente = p_token
    AND status = 'aguardando_cliente'
  RETURNING id INTO v_feedback_id;

  IF v_feedback_id IS NULL THEN
    RAISE EXCEPTION 'Feedback não encontrado ou já preenchido';
  END IF;

  RETURN v_feedback_id;
END;
$function$;
