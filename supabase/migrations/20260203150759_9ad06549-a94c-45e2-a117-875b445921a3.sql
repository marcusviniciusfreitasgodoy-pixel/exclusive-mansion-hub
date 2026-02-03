-- Tabela de base de conhecimento para o chatbot Sofia
-- Acesso apenas via service role (edge functions)
CREATE TABLE public.chatbot_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria VARCHAR(100) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  prioridade INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_chatbot_knowledge_base_updated_at
  BEFORE UPDATE ON public.chatbot_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Habilitar RLS mas SEM policies públicas
-- Acesso apenas via service role key nas edge functions
ALTER TABLE public.chatbot_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Adicionar campo contexto_adicional_ia na tabela imoveis
ALTER TABLE public.imoveis 
ADD COLUMN IF NOT EXISTS contexto_adicional_ia TEXT DEFAULT NULL;

-- Comentários para documentação
COMMENT ON TABLE public.chatbot_knowledge_base IS 'Base de conhecimento global para o chatbot Sofia - gerenciada apenas pelo desenvolvedor';
COMMENT ON COLUMN public.chatbot_knowledge_base.categoria IS 'Categoria do conhecimento: FAQ, Financiamento, Materiais, Processos, Outros';
COMMENT ON COLUMN public.chatbot_knowledge_base.prioridade IS 'Ordem de prioridade (maior = mais importante)';
COMMENT ON COLUMN public.imoveis.contexto_adicional_ia IS 'Contexto adicional específico do imóvel para alimentar a IA';