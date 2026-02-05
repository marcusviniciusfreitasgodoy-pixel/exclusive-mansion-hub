-- 1. Add DELETE policies for atividades_lead table
CREATE POLICY "Construtoras podem deletar atividades de seus leads"
ON public.atividades_lead
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM leads l
  JOIN imoveis i ON l.imovel_id = i.id
  WHERE l.id = atividades_lead.lead_id
  AND i.construtora_id = get_construtora_id(auth.uid())
));

CREATE POLICY "Imobiliarias podem deletar atividades de seus leads"
ON public.atividades_lead
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM leads l
  WHERE l.id = atividades_lead.lead_id
  AND l.imobiliaria_id = get_imobiliaria_id(auth.uid())
));