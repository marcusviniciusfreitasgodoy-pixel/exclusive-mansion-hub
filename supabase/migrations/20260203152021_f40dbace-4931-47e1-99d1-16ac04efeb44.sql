-- Remove overly permissive anon policies
DROP POLICY IF EXISTS "Allow role insert for new signups" ON public.user_roles;
DROP POLICY IF EXISTS "Allow construtora insert for new signups" ON public.construtoras;
DROP POLICY IF EXISTS "Allow imobiliaria insert for new signups" ON public.imobiliarias;

-- Instead, we'll handle this by using service role in the signup process
-- But for now, let's make authenticated policies work properly

-- The issue is that after signUp(), the user IS authenticated with the returned session
-- We need to ensure the insert happens with the authenticated role

-- Keep the authenticated policies
-- DROP POLICY IF EXISTS "Allow role insert during signup" ON public.user_roles;
-- DROP POLICY IF EXISTS "Allow construtora insert during signup" ON public.construtoras;
-- DROP POLICY IF EXISTS "Allow imobiliaria insert during signup" ON public.imobiliarias;