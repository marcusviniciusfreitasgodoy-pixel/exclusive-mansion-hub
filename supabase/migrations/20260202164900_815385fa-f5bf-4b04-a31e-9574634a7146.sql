-- Atualizar política RLS para permitir update público via token quando status é aguardando_cliente
-- E permitir corretor atualizar quando status é aguardando_corretor

-- Drop a política existente de update público
DROP POLICY IF EXISTS "Update publico via token" ON public.feedbacks_visitas;

-- Recriar com lógica correta: cliente pode atualizar apenas quando aguardando_cliente
CREATE POLICY "Update publico via token cliente" 
ON public.feedbacks_visitas 
FOR UPDATE 
USING (
  token_acesso_cliente IS NOT NULL 
  AND status = 'aguardando_cliente'::feedback_status
)
WITH CHECK (
  token_acesso_cliente IS NOT NULL 
  AND status = 'aguardando_corretor'::feedback_status -- Pode mudar para aguardando_corretor
);