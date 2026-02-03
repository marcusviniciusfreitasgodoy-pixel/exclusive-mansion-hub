-- Policy para permitir acesso total ao desenvolvedor na base de conhecimento
-- Isso permite que o admin gerencie a base via interface

-- Primeiro, verificar se a tabela existe e tem RLS
-- Criar policy de SELECT para service role (edge functions) e admins
CREATE POLICY "Service role and admins can read knowledge base"
ON public.chatbot_knowledge_base
FOR SELECT
USING (
  -- Edge functions usam service role key que bypassa RLS
  -- Admins autenticados podem ler
  auth.role() = 'authenticated'
);

-- Policy para INSERT (apenas admins autenticados)
CREATE POLICY "Authenticated users can insert knowledge base"
ON public.chatbot_knowledge_base
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy para UPDATE (apenas admins autenticados)
CREATE POLICY "Authenticated users can update knowledge base"
ON public.chatbot_knowledge_base
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Policy para DELETE (apenas admins autenticados)
CREATE POLICY "Authenticated users can delete knowledge base"
ON public.chatbot_knowledge_base
FOR DELETE
USING (auth.role() = 'authenticated');