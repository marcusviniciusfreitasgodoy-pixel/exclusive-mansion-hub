-- Add social media and website fields to construtoras table
ALTER TABLE public.construtoras
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS site_url TEXT;

-- Add social media and website fields to imobiliarias table
ALTER TABLE public.imobiliarias
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS site_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.construtoras.instagram_url IS 'URL do perfil do Instagram da construtora';
COMMENT ON COLUMN public.construtoras.site_url IS 'URL do site institucional da construtora';
COMMENT ON COLUMN public.imobiliarias.instagram_url IS 'URL do perfil do Instagram da imobiliária';
COMMENT ON COLUMN public.imobiliarias.site_url IS 'URL do site institucional da imobiliária';