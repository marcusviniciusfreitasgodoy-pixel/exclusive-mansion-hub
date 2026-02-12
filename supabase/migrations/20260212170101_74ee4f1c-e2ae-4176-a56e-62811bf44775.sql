
CREATE TABLE public.corretores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imobiliaria_id uuid NOT NULL REFERENCES public.imobiliarias(id) ON DELETE CASCADE,
  nome_completo text NOT NULL,
  whatsapp text,
  email text,
  creci text,
  foto_url text,
  cargo text,
  mini_bio text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.corretores ENABLE ROW LEVEL SECURITY;

-- Security definer function to get imobiliaria_id for current user
CREATE OR REPLACE FUNCTION public.get_user_imobiliaria_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.imobiliarias WHERE user_id = _user_id LIMIT 1
$$;

CREATE POLICY "Users can view their own corretores"
ON public.corretores FOR SELECT
TO authenticated
USING (imobiliaria_id = public.get_user_imobiliaria_id(auth.uid()));

CREATE POLICY "Users can insert their own corretores"
ON public.corretores FOR INSERT
TO authenticated
WITH CHECK (imobiliaria_id = public.get_user_imobiliaria_id(auth.uid()));

CREATE POLICY "Users can update their own corretores"
ON public.corretores FOR UPDATE
TO authenticated
USING (imobiliaria_id = public.get_user_imobiliaria_id(auth.uid()));

CREATE POLICY "Users can delete their own corretores"
ON public.corretores FOR DELETE
TO authenticated
USING (imobiliaria_id = public.get_user_imobiliaria_id(auth.uid()));
