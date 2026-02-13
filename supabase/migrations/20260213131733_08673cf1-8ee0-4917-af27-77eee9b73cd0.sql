-- Remove the overly permissive INSERT policy on propostas_compra
-- Inserts are handled securely via the submit_proposta_compra RPC (SECURITY DEFINER)
DROP POLICY IF EXISTS "Permitir insert publico propostas" ON public.propostas_compra;