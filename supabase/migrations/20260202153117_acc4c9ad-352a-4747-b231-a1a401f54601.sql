-- Drop the overly permissive pageviews INSERT policy
DROP POLICY IF EXISTS "Anyone can insert pageviews" ON public.pageviews;

-- Create a more restrictive INSERT policy that validates the imovel_id and optional access_id
CREATE POLICY "Valid pageviews can be inserted"
ON public.pageviews
FOR INSERT
WITH CHECK (
  -- The imovel must exist and be active
  EXISTS (
    SELECT 1 FROM public.imoveis
    WHERE imoveis.id = pageviews.imovel_id
    AND imoveis.status = 'ativo'::imovel_status
  )
  -- If access_id is provided, it must be valid and active
  AND (
    pageviews.access_id IS NULL 
    OR EXISTS (
      SELECT 1 FROM public.imobiliaria_imovel_access
      WHERE imobiliaria_imovel_access.id = pageviews.access_id
      AND imobiliaria_imovel_access.imovel_id = pageviews.imovel_id
      AND imobiliaria_imovel_access.status = 'active'::access_status
    )
  )
  -- If imobiliaria_id is provided, it must match the access record
  AND (
    pageviews.imobiliaria_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.imobiliaria_imovel_access
      WHERE imobiliaria_imovel_access.imobiliaria_id = pageviews.imobiliaria_id
      AND imobiliaria_imovel_access.imovel_id = pageviews.imovel_id
      AND imobiliaria_imovel_access.status = 'active'::access_status
    )
  )
);