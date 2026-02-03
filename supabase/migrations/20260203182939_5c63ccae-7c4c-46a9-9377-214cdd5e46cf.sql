-- Fix: Remove any potential public SELECT access to agendamentos_visitas
-- The table should only be readable by authenticated construtoras and imobiliarias

-- First, let's ensure we drop any policies that might allow public read access
-- and recreate them with proper restrictions

-- Drop existing SELECT policies for agendamentos_visitas
DROP POLICY IF EXISTS "Construtoras podem ver agendamentos de seus imoveis" ON public.agendamentos_visitas;
DROP POLICY IF EXISTS "Imobiliarias podem ver seus agendamentos" ON public.agendamentos_visitas;

-- Recreate SELECT policies with authenticated requirement
CREATE POLICY "Construtoras podem ver agendamentos de seus imoveis" 
ON public.agendamentos_visitas 
FOR SELECT 
TO authenticated
USING (construtora_id = get_construtora_id(auth.uid()));

CREATE POLICY "Imobiliarias podem ver seus agendamentos" 
ON public.agendamentos_visitas 
FOR SELECT 
TO authenticated
USING (imobiliaria_id = get_imobiliaria_id(auth.uid()));

-- Fix: Remove any potential public SELECT access to conversas_chatbot
-- The table should only be readable by authenticated construtoras and imobiliarias

-- Drop existing SELECT policies for conversas_chatbot
DROP POLICY IF EXISTS "Construtoras can view conversations" ON public.conversas_chatbot;
DROP POLICY IF EXISTS "Imobiliarias can view conversations" ON public.conversas_chatbot;

-- Recreate SELECT policies with authenticated requirement
CREATE POLICY "Construtoras can view conversations" 
ON public.conversas_chatbot 
FOR SELECT 
TO authenticated
USING (construtora_id = get_construtora_id(auth.uid()));

CREATE POLICY "Imobiliarias can view conversations" 
ON public.conversas_chatbot 
FOR SELECT 
TO authenticated
USING (imobiliaria_id = get_imobiliaria_id(auth.uid()));