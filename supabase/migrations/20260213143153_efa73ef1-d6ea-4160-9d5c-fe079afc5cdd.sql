
-- Fix feedbacks_visitas SELECT policies: restrict from {public} to {authenticated} only
-- This prevents anon role from even evaluating the policy

DROP POLICY IF EXISTS "Construtoras podem ver feedbacks de seus imoveis" ON public.feedbacks_visitas;
CREATE POLICY "Construtoras podem ver feedbacks de seus imoveis"
  ON public.feedbacks_visitas
  FOR SELECT
  TO authenticated
  USING (construtora_id = get_construtora_id(auth.uid()));

DROP POLICY IF EXISTS "Imobiliarias podem ver seus feedbacks" ON public.feedbacks_visitas;
CREATE POLICY "Imobiliarias podem ver seus feedbacks"
  ON public.feedbacks_visitas
  FOR SELECT
  TO authenticated
  USING (imobiliaria_id = get_imobiliaria_id(auth.uid()));

-- Also tighten INSERT/UPDATE policies to authenticated only
DROP POLICY IF EXISTS "Construtoras podem criar feedbacks" ON public.feedbacks_visitas;
CREATE POLICY "Construtoras podem criar feedbacks"
  ON public.feedbacks_visitas
  FOR INSERT
  TO authenticated
  WITH CHECK (construtora_id = get_construtora_id(auth.uid()));

DROP POLICY IF EXISTS "Imobiliarias podem criar feedbacks" ON public.feedbacks_visitas;
CREATE POLICY "Imobiliarias podem criar feedbacks"
  ON public.feedbacks_visitas
  FOR INSERT
  TO authenticated
  WITH CHECK (imobiliaria_id = get_imobiliaria_id(auth.uid()));

DROP POLICY IF EXISTS "Construtoras podem atualizar feedbacks" ON public.feedbacks_visitas;
CREATE POLICY "Construtoras podem atualizar feedbacks"
  ON public.feedbacks_visitas
  FOR UPDATE
  TO authenticated
  USING (construtora_id = get_construtora_id(auth.uid()));

DROP POLICY IF EXISTS "Imobiliarias podem atualizar feedbacks" ON public.feedbacks_visitas;
CREATE POLICY "Imobiliarias podem atualizar feedbacks"
  ON public.feedbacks_visitas
  FOR UPDATE
  TO authenticated
  USING (imobiliaria_id = get_imobiliaria_id(auth.uid()));

-- Also tighten agendamentos_visitas UPDATE policies to authenticated
DROP POLICY IF EXISTS "Construtoras podem atualizar agendamentos de seus imoveis" ON public.agendamentos_visitas;
CREATE POLICY "Construtoras podem atualizar agendamentos de seus imoveis"
  ON public.agendamentos_visitas
  FOR UPDATE
  TO authenticated
  USING (construtora_id = get_construtora_id(auth.uid()));

DROP POLICY IF EXISTS "Imobiliarias podem atualizar seus agendamentos" ON public.agendamentos_visitas;
CREATE POLICY "Imobiliarias podem atualizar seus agendamentos"
  ON public.agendamentos_visitas
  FOR UPDATE
  TO authenticated
  USING (imobiliaria_id = get_imobiliaria_id(auth.uid()));
