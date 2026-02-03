-- Add documents column to imoveis table for storing PDFs and promotional materials
ALTER TABLE public.imoveis 
ADD COLUMN IF NOT EXISTS documentos JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.imoveis.documentos IS 'Array of document objects with url, nome, tipo (pdf, documento), and tamanho_bytes';