-- Habilitar RLS na tabela rate_limits (acesso apenas via service role nas edge functions)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Política para permitir que service role acesse (as edge functions usam service role)
-- Não há políticas para usuários anônimos - apenas service role pode acessar
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
USING (true)
WITH CHECK (true);