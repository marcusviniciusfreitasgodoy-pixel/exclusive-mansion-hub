
-- Revoke access to materialized views from anon and authenticated roles
-- to prevent them from being accessible via the Data API
REVOKE ALL ON public.mv_leads_diario FROM anon, authenticated;
REVOKE ALL ON public.mv_pageviews_diario FROM anon, authenticated;
