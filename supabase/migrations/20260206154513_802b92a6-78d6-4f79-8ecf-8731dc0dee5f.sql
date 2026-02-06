
CREATE TABLE public.demo_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  empresa TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  mensagem TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS enabled but with permissive insert policy for public access
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Allow inserts from service role only (edge function uses service role)
-- No public SELECT/UPDATE/DELETE policies needed
