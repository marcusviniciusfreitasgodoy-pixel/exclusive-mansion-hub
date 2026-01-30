-- Allow users to insert their own role during signup
CREATE POLICY "Users can insert own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also allow anon users to insert role right after signup (before email confirmation)
CREATE POLICY "Allow role insert during signup"
ON public.user_roles
FOR INSERT
TO anon
WITH CHECK (true);