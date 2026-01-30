-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow role insert during signup" ON public.user_roles;

-- Create a more secure policy that allows insert only if the user_id matches the newly created user
-- This relies on the fact that during signup, the user gets their own id
CREATE POLICY "Allow self role insert"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);