-- Atualizar política para permitir visualização de feedbacks completos também
DROP POLICY IF EXISTS "Acesso publico via token para leitura" ON public.feedbacks_visitas;

CREATE POLICY "Acesso publico via token para leitura" 
ON public.feedbacks_visitas 
FOR SELECT 
TO public
USING (
  token_acesso_cliente IS NOT NULL 
  AND status IN ('aguardando_cliente', 'aguardando_corretor', 'completo')
);