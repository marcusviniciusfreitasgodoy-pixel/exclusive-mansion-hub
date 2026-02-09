
-- Add dominio_customizado to imobiliarias
ALTER TABLE public.imobiliarias 
ADD COLUMN IF NOT EXISTS dominio_customizado text UNIQUE;

-- Create custom_domains table
CREATE TABLE public.custom_domains (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain text NOT NULL UNIQUE,
  entity_type text NOT NULL CHECK (entity_type IN ('construtora', 'imobiliaria')),
  entity_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'active', 'failed')),
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

-- Public read for domain resolution
CREATE POLICY "Anyone can read custom domains for resolution"
ON public.custom_domains FOR SELECT
USING (true);

-- Construtoras can manage their own domains
CREATE POLICY "Construtoras can insert their own domains"
ON public.custom_domains FOR INSERT
WITH CHECK (
  entity_type = 'construtora' 
  AND entity_id = get_construtora_id(auth.uid())
);

CREATE POLICY "Construtoras can update their own domains"
ON public.custom_domains FOR UPDATE
USING (
  entity_type = 'construtora' 
  AND entity_id = get_construtora_id(auth.uid())
);

CREATE POLICY "Construtoras can delete their own domains"
ON public.custom_domains FOR DELETE
USING (
  entity_type = 'construtora' 
  AND entity_id = get_construtora_id(auth.uid())
);

-- Imobiliarias can manage their own domains
CREATE POLICY "Imobiliarias can insert their own domains"
ON public.custom_domains FOR INSERT
WITH CHECK (
  entity_type = 'imobiliaria' 
  AND entity_id = get_imobiliaria_id(auth.uid())
);

CREATE POLICY "Imobiliarias can update their own domains"
ON public.custom_domains FOR UPDATE
USING (
  entity_type = 'imobiliaria' 
  AND entity_id = get_imobiliaria_id(auth.uid())
);

CREATE POLICY "Imobiliarias can delete their own domains"
ON public.custom_domains FOR DELETE
USING (
  entity_type = 'imobiliaria' 
  AND entity_id = get_imobiliaria_id(auth.uid())
);

-- Index for fast domain lookups
CREATE INDEX idx_custom_domains_domain ON public.custom_domains (domain);
CREATE INDEX idx_custom_domains_entity ON public.custom_domains (entity_type, entity_id);
