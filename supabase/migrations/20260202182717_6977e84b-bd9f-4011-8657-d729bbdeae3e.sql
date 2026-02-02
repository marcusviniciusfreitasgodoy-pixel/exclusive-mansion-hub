-- Add template fields to imoveis table
ALTER TABLE public.imoveis 
  ADD COLUMN IF NOT EXISTS template_escolhido VARCHAR(50) DEFAULT 'moderno',
  ADD COLUMN IF NOT EXISTS customizacao_template JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.imoveis.template_escolhido IS 'Template visual: luxo, moderno, classico';
COMMENT ON COLUMN public.imoveis.customizacao_template IS 'JSON com cores, fontes e estilos customizados';