
-- ============================================================
-- 1. COMPOSITE INDEXES for most frequent queries
-- ============================================================

-- Leads
CREATE INDEX IF NOT EXISTS idx_leads_imovel_status ON public.leads(imovel_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_imobiliaria_created ON public.leads(imobiliaria_id, created_at DESC);

-- Pageviews
CREATE INDEX IF NOT EXISTS idx_pageviews_imovel_created ON public.pageviews(imovel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pageviews_imobiliaria_created ON public.pageviews(imobiliaria_id, created_at DESC);

-- Access slugs (critical - entry point for all public pages)
CREATE INDEX IF NOT EXISTS idx_access_url_slug ON public.imobiliaria_imovel_access(url_slug);

-- Chatbot sessions
CREATE INDEX IF NOT EXISTS idx_conversas_session ON public.conversas_chatbot(session_id);

-- Feedback tokens
CREATE INDEX IF NOT EXISTS idx_feedbacks_token ON public.feedbacks_visitas(token_acesso_cliente);

-- Appointments
CREATE INDEX IF NOT EXISTS idx_agendamentos_imovel_status_data ON public.agendamentos_visitas(imovel_id, status, opcao_data_1);

-- ============================================================
-- 2. ENABLE pg_cron and pg_net extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ============================================================
-- 3. MATERIALIZED VIEWS for dashboard analytics
-- ============================================================

-- Daily leads summary
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_leads_diario AS
SELECT
  date_trunc('day', created_at)::date AS dia,
  imovel_id,
  imobiliaria_id,
  status,
  COUNT(*) AS total
FROM public.leads
GROUP BY 1, 2, 3, 4;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_leads_diario ON public.mv_leads_diario(dia, imovel_id, imobiliaria_id, status);

-- Daily pageviews summary
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_pageviews_diario AS
SELECT
  date_trunc('day', created_at)::date AS dia,
  imovel_id,
  imobiliaria_id,
  COUNT(*) AS total
FROM public.pageviews
GROUP BY 1, 2, 3;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_pageviews_diario ON public.mv_pageviews_diario(dia, imovel_id, imobiliaria_id);

-- Function to refresh materialized views (called by cron)
CREATE OR REPLACE FUNCTION public.refresh_analytics_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_leads_diario;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_pageviews_diario;
END;
$$;
