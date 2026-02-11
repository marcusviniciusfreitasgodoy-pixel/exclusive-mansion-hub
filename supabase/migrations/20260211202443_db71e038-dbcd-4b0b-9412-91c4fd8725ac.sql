-- Add missing foreign key from propostas_compra to imoveis
ALTER TABLE public.propostas_compra
  ADD CONSTRAINT propostas_compra_imovel_id_fkey
  FOREIGN KEY (imovel_id) REFERENCES public.imoveis(id);

-- Add missing foreign key from propostas_compra to imobiliarias
ALTER TABLE public.propostas_compra
  ADD CONSTRAINT propostas_compra_imobiliaria_id_fkey
  FOREIGN KEY (imobiliaria_id) REFERENCES public.imobiliarias(id);

-- Add missing foreign key from propostas_compra to construtoras
ALTER TABLE public.propostas_compra
  ADD CONSTRAINT propostas_compra_construtora_id_fkey
  FOREIGN KEY (construtora_id) REFERENCES public.construtoras(id);