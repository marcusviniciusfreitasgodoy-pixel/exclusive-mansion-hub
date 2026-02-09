
-- Fix rate_limits: replace overly permissive ALL policy with restricted one
-- Rate limits are only managed by the DB function check_and_increment_rate_limit (SECURITY DEFINER)
-- No direct user access needed
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

-- Only allow service_role via RPC (SECURITY DEFINER functions handle this)
-- Block all direct access from anon/authenticated
CREATE POLICY "No direct access to rate limits"
ON public.rate_limits
FOR ALL
USING (false)
WITH CHECK (false);

-- Fix demo_requests: add INSERT policy for public submissions + SELECT for admin
CREATE POLICY "Anyone can submit demo request"
ON public.demo_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated can read demo requests"
ON public.demo_requests
FOR SELECT
USING (auth.role() = 'authenticated');
