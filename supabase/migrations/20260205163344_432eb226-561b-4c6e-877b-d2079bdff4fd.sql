-- Criar tabela de rate limits
CREATE TABLE public.rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,
  function_name text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(identifier, function_name)
);

-- Índice para consultas rápidas
CREATE INDEX idx_rate_limits_lookup ON public.rate_limits(identifier, function_name, window_start);

-- Função para limpar registros antigos
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - interval '1 hour';
$$;

-- Função para verificação atômica de rate limit
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_identifier text,
  p_function_name text,
  p_window_seconds integer,
  p_max_requests integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamptz;
  v_current_count integer;
  v_allowed boolean;
  v_remaining integer;
  v_reset_at timestamptz;
BEGIN
  v_window_start := now() - (p_window_seconds || ' seconds')::interval;
  v_reset_at := now() + (p_window_seconds || ' seconds')::interval;
  
  -- Inserir ou atualizar atomicamente
  INSERT INTO public.rate_limits (identifier, function_name, request_count, window_start)
  VALUES (p_identifier, p_function_name, 1, now())
  ON CONFLICT (identifier, function_name) DO UPDATE
  SET 
    request_count = CASE 
      WHEN rate_limits.window_start < v_window_start THEN 1
      ELSE rate_limits.request_count + 1
    END,
    window_start = CASE 
      WHEN rate_limits.window_start < v_window_start THEN now()
      ELSE rate_limits.window_start
    END
  RETURNING request_count, window_start + (p_window_seconds || ' seconds')::interval
  INTO v_current_count, v_reset_at;
  
  v_allowed := v_current_count <= p_max_requests;
  v_remaining := GREATEST(0, p_max_requests - v_current_count);
  
  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'remaining', v_remaining,
    'reset_at', v_reset_at,
    'current_count', v_current_count
  );
END;
$$;