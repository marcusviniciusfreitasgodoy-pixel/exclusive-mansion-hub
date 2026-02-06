ALTER TABLE public.feedbacks_visitas
  ADD COLUMN efeito_uau text[] DEFAULT NULL,
  ADD COLUMN efeito_uau_detalhe text DEFAULT NULL;