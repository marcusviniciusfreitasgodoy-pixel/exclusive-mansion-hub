-- Create security definer function to check if user owns the imovel's construtora
-- This avoids RLS recursion by bypassing RLS when checking
CREATE OR REPLACE FUNCTION public.user_owns_imovel(_imovel_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.imoveis i
    WHERE i.id = _imovel_id 
    AND i.construtora_id = get_construtora_id(auth.uid())
  )
$$;

-- Create function to check if imobiliaria has access to imovel
CREATE OR REPLACE FUNCTION public.imobiliaria_has_access(_imovel_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.imobiliaria_imovel_access a
    WHERE a.imovel_id = _imovel_id 
    AND a.imobiliaria_id = get_imobiliaria_id(auth.uid())
    AND a.status = 'active'
  )
$$;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Construtoras can manage access" ON public.imobiliaria_imovel_access;
DROP POLICY IF EXISTS "Imobiliarias can view authorized imoveis" ON public.imoveis;

-- Recreate policies using the security definer functions
CREATE POLICY "Construtoras can manage access" 
ON public.imobiliaria_imovel_access 
FOR ALL 
USING (user_owns_imovel(imovel_id));

CREATE POLICY "Imobiliarias can view authorized imoveis" 
ON public.imoveis 
FOR SELECT 
USING (imobiliaria_has_access(id));