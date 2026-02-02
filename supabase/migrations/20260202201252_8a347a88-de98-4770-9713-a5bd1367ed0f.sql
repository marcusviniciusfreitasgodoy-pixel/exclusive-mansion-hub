-- Drop e recriar VIEW com campos adicionais
DROP VIEW IF EXISTS public.feedbacks_visitas_publico;

CREATE VIEW public.feedbacks_visitas_publico
WITH (security_invoker = on)
AS SELECT 
  id,
  token_acesso_cliente,
  status,
  data_visita,
  cliente_nome,
  cliente_email,
  -- Dados do corretor (nome apenas, não email)
  corretor_nome,
  -- Campos que o cliente pode preencher
  nps_cliente,
  avaliacao_localizacao,
  avaliacao_acabamento,
  avaliacao_layout,
  avaliacao_custo_beneficio,
  avaliacao_atendimento,
  pontos_positivos,
  pontos_negativos,
  sugestoes,
  interesse_compra,
  objecoes,
  objecoes_detalhes,
  assinatura_cliente,
  assinatura_cliente_data,
  feedback_cliente_em,
  respostas_cliente_customizadas,
  -- PDF gerado (para download)
  pdf_url,
  -- Dados do imóvel para contexto (IDs apenas)
  imovel_id,
  imobiliaria_id,
  construtora_id
FROM feedbacks_visitas
WHERE token_acesso_cliente IS NOT NULL 
  AND status IN ('aguardando_cliente', 'aguardando_corretor', 'completo');

COMMENT ON VIEW feedbacks_visitas_publico IS 
'VIEW segura para acesso público via token. 
Expõe apenas campos necessários para formulário de feedback.
NÃO expõe: IP, device, geolocation, orçamento, dados financeiros, email do corretor.';