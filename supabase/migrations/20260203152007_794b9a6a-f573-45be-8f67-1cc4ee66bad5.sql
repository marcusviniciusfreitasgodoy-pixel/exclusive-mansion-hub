-- Drop existing insert policies that are causing the issue
DROP POLICY IF EXISTS "Allow self role insert" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

-- Create a more permissive insert policy that allows authenticated users to insert their own role
-- Note: During signup, the user is technically authenticated with the new session even before email confirmation
CREATE POLICY "Allow role insert during signup"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also allow anon users to insert during the signup flow (when the session is being created)
-- This is needed because immediately after signUp, the user may not be fully authenticated yet
CREATE POLICY "Allow role insert for new signups"
ON public.user_roles FOR INSERT
TO anon
WITH CHECK (true);

-- For construtoras table - ensure same pattern
DROP POLICY IF EXISTS "Users can insert own construtora" ON public.construtoras;

CREATE POLICY "Allow construtora insert during signup"
ON public.construtoras FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow construtora insert for new signups"
ON public.construtoras FOR INSERT
TO anon
WITH CHECK (true);

-- For imobiliarias table - ensure same pattern  
DROP POLICY IF EXISTS "Users can insert own imobiliaria" ON public.imobiliarias;

CREATE POLICY "Allow imobiliaria insert during signup"
ON public.imobiliarias FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow imobiliaria insert for new signups"
ON public.imobiliarias FOR INSERT
TO anon
WITH CHECK (true);