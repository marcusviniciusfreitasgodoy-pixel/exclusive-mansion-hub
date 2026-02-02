-- Remover a política restritiva existente de acesso público
DROP POLICY IF EXISTS "Acesso publico via token para leitura" ON public.feedbacks_visitas;

-- Criar política PERMISSIVE para acesso público via token
CREATE POLICY "Acesso publico via token para leitura" 
ON public.feedbacks_visitas 
FOR SELECT 
TO public
USING (
  token_acesso_cliente IS NOT NULL 
  AND status IN ('aguardando_cliente', 'aguardando_corretor')
);

-- Remover a política restritiva de update público
DROP POLICY IF EXISTS "Update publico via token" ON public.feedbacks_visitas;

-- Criar política PERMISSIVE para update público via token
CREATE POLICY "Update publico via token" 
ON public.feedbacks_visitas 
FOR UPDATE 
TO public
USING (
  token_acesso_cliente IS NOT NULL 
  AND status = 'aguardando_cliente'
)
WITH CHECK (
  token_acesso_cliente IS NOT NULL 
  AND status IN ('aguardando_cliente', 'completo')
);