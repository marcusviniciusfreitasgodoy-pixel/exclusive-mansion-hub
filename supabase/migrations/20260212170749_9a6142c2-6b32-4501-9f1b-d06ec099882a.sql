ALTER TABLE public.imobiliarias 
ADD COLUMN tipo text NOT NULL DEFAULT 'imobiliaria' 
CHECK (tipo IN ('imobiliaria', 'corretor_autonomo'));