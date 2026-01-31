-- Allow public read access to imobiliarias when accessed via an active access record
-- This is needed for the white-label property pages to load branding info
CREATE POLICY "Public can view imobiliarias via active access"
  ON public.imobiliarias
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM imobiliaria_imovel_access 
      WHERE imobiliaria_imovel_access.imobiliaria_id = imobiliarias.id 
      AND imobiliaria_imovel_access.status = 'active'
    )
  );