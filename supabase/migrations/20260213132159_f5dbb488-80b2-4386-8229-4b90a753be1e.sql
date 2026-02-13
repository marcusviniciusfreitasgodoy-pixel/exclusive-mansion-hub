-- Revoke direct API access to feedbacks_visitas_publico view
-- Access is only needed via the get_feedback_by_token RPC (SECURITY DEFINER)
REVOKE ALL ON public.feedbacks_visitas_publico FROM anon, authenticated;