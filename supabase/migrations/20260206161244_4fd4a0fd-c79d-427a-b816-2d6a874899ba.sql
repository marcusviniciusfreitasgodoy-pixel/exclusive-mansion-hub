
-- Adicionar colunas de followup e dados do cliente no formulário de feedback
ALTER TABLE public.feedbacks_visitas 
  ADD COLUMN IF NOT EXISTS followup_enviado_cliente boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS followup_enviado_corretor boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS prazo_compra_cliente text,
  ADD COLUMN IF NOT EXISTS orcamento_cliente numeric,
  ADD COLUMN IF NOT EXISTS forma_pagamento_cliente text,
  ADD COLUMN IF NOT EXISTS proximos_passos_cliente text;
