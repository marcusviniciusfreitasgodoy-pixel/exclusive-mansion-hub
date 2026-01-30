-- Create pageviews table for tracking
CREATE TABLE public.pageviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID REFERENCES public.imoveis(id) ON DELETE CASCADE NOT NULL,
  imobiliaria_id UUID REFERENCES public.imobiliarias(id) ON DELETE SET NULL,
  access_id UUID REFERENCES public.imobiliaria_imovel_access(id) ON DELETE SET NULL,
  user_agent TEXT,
  referrer TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pageviews ENABLE ROW LEVEL SECURITY;

-- Anyone can insert pageviews (public tracking)
CREATE POLICY "Anyone can insert pageviews" ON public.pageviews
  FOR INSERT WITH CHECK (true);

-- Construtoras can view pageviews for their properties
CREATE POLICY "Construtoras can view pageviews of own imoveis" ON public.pageviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.imoveis
      WHERE id = pageviews.imovel_id
      AND construtora_id = get_construtora_id(auth.uid())
    )
  );

-- Imobiliarias can view their own pageviews
CREATE POLICY "Imobiliarias can view own pageviews" ON public.pageviews
  FOR SELECT USING (
    imobiliaria_id = get_imobiliaria_id(auth.uid())
  );

-- Update leads table to add better INSERT policy for public form submissions
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Valid leads can be inserted" ON public.leads;

CREATE POLICY "Valid leads can be inserted" ON public.leads
  FOR INSERT WITH CHECK (
    -- Must reference an active property
    EXISTS (
      SELECT 1 FROM public.imoveis
      WHERE id = leads.imovel_id
      AND status = 'ativo'
    )
    -- If imobiliaria_id is provided, it must have active access to the property
    AND (
      imobiliaria_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.imobiliaria_imovel_access
        WHERE imobiliaria_id = leads.imobiliaria_id
        AND imovel_id = leads.imovel_id
        AND status = 'active'
      )
    )
  );