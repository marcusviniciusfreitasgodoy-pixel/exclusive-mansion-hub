
-- Fix materialized views exposed via API: revoke public access
REVOKE ALL ON public.mv_leads_diario FROM anon, authenticated;
REVOKE ALL ON public.mv_pageviews_diario FROM anon, authenticated;

-- Grant only to authenticated users (dashboards require auth)
GRANT SELECT ON public.mv_leads_diario TO authenticated;
GRANT SELECT ON public.mv_pageviews_diario TO authenticated;
