-- Fix function search_path for update_updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Drop the overly permissive leads insert policy and create a more restrictive one
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

-- Create a new policy that validates leads have valid references
CREATE POLICY "Valid leads can be inserted" ON public.leads
  FOR INSERT WITH CHECK (
    -- Lead must reference a valid active imovel
    EXISTS (
      SELECT 1 FROM public.imoveis 
      WHERE id = imovel_id AND status = 'ativo'
    )
    AND
    -- If imobiliaria_id is provided, it must have active access to the imovel
    (
      imobiliaria_id IS NULL 
      OR 
      EXISTS (
        SELECT 1 FROM public.imobiliaria_imovel_access
        WHERE imobiliaria_id = leads.imobiliaria_id 
        AND imovel_id = leads.imovel_id
        AND status = 'active'
      )
    )
  );