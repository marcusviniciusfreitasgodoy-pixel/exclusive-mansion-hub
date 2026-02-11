
ALTER TABLE public.feedbacks_visitas
ADD COLUMN IF NOT EXISTS followup_2_enviado_cliente boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS followup_2_enviado_corretor boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS corretor_telefone text;
