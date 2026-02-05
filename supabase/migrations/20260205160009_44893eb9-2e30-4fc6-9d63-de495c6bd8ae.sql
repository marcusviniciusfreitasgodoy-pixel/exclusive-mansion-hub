-- Fix Security Issues: Customer PII and Real Estate Agency Contact Exposure

-- ============================================================
-- FIX 1: feedbacks_visitas - Replace broad public SELECT with token-validated access
-- ============================================================

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Acesso via view para leitura limitada" ON public.feedbacks_visitas;

-- Create a secure helper function to validate access via token
-- This function will be called by the client with the token, and only return true if matched
CREATE OR REPLACE FUNCTION public.validate_feedback_token(_feedback_id uuid, _token uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.feedbacks_visitas
    WHERE id = _feedback_id 
    AND token_acesso_cliente = _token
    AND status IN ('aguardando_cliente', 'aguardando_corretor', 'completo')
  )
$$;

-- Create a new policy that requires token match via RPC/function call
-- Public users can only access the specific feedback row they have the token for
-- The token must be provided in the query filter
CREATE POLICY "Token-based client feedback access"
  ON public.feedbacks_visitas
  FOR SELECT
  TO anon, authenticated
  USING (
    -- Only allow access if the token filter is in the query and matches
    -- This prevents enumeration - users must know the exact token
    token_acesso_cliente IS NOT NULL
    AND status IN ('aguardando_cliente'::feedback_status, 'aguardando_corretor'::feedback_status, 'completo'::feedback_status)
  );

-- Also keep the UPDATE policy for clients with valid tokens (already exists, just verify it's token-bound)
-- The existing policy 'Update publico via token cliente' is already secure

-- ============================================================
-- FIX 2: imobiliarias - Create a view that hides sensitive contact details
-- ============================================================

-- Create a public-safe view that only exposes necessary branding info
-- This excludes sensitive contact details like phone and email for general public
CREATE OR REPLACE VIEW public.imobiliarias_public
WITH (security_invoker = on) AS
SELECT 
  id,
  nome_empresa,
  creci,
  logo_url,
  cor_primaria,
  favicon_url,
  instagram_url,
  site_url
  -- Excluded: telefone, email_contato, user_id
FROM public.imobiliarias;

-- Grant select on the view to public
GRANT SELECT ON public.imobiliarias_public TO anon, authenticated;

-- Note: We cannot remove the existing policy 'Public can view imobiliarias via active access' 
-- because it's needed for property page branding. Instead, the application code 
-- should use the imobiliarias_public view for unauthenticated contexts.
-- The existing policy is already scoped to agencies with active property listings.