
-- Tornar imobiliaria_id nullable para suportar links diretos da construtora
ALTER TABLE public.imobiliaria_imovel_access 
  ALTER COLUMN imobiliaria_id DROP NOT NULL;
