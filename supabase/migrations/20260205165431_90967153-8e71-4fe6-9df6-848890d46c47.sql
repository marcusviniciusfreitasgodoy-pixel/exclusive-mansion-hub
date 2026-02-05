-- Create table for property-specific knowledge base entries
CREATE TABLE public.imovel_knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  imovel_id UUID NOT NULL REFERENCES public.imoveis(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL CHECK (categoria IN ('FAQ', 'Especificacao', 'Financiamento', 'Documentacao', 'Outros')),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  fonte_tipo TEXT NOT NULL CHECK (fonte_tipo IN ('manual', 'pdf_extraido')),
  fonte_arquivo_url TEXT,
  fonte_arquivo_nome TEXT,
  tags TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  prioridade INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for fast lookups by imovel_id
CREATE INDEX idx_imovel_knowledge_base_imovel_id ON public.imovel_knowledge_base(imovel_id);

-- Create index for active entries
CREATE INDEX idx_imovel_knowledge_base_active ON public.imovel_knowledge_base(imovel_id, ativo) WHERE ativo = true;

-- Enable RLS
ALTER TABLE public.imovel_knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Construtoras can manage knowledge base for their properties
CREATE POLICY "Construtoras can manage knowledge base entries"
ON public.imovel_knowledge_base
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.imoveis i
    WHERE i.id = imovel_knowledge_base.imovel_id
    AND i.construtora_id = get_construtora_id(auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.imoveis i
    WHERE i.id = imovel_knowledge_base.imovel_id
    AND i.construtora_id = get_construtora_id(auth.uid())
  )
);

-- RLS Policy: Public read for edge functions via service role (implicit with service role key)
-- Edge functions use service_role which bypasses RLS

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_imovel_knowledge_base_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_imovel_knowledge_base_updated_at
BEFORE UPDATE ON public.imovel_knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_imovel_knowledge_base_updated_at();