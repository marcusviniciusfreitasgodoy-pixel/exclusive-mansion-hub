-- Fix 1: Ensure agendamentos_visitas has no public SELECT exposure
-- Drop any permissive public SELECT policies if they exist
DROP POLICY IF EXISTS "Public can view agendamentos" ON public.agendamentos_visitas;
DROP POLICY IF EXISTS "Publico pode ver agendamentos" ON public.agendamentos_visitas;
DROP POLICY IF EXISTS "Public read agendamentos" ON public.agendamentos_visitas;

-- Fix 2: Ensure whatsapp_messages has no public SELECT exposure
-- First check if RLS is enabled, then drop any public policies
DROP POLICY IF EXISTS "Public can view messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Publico pode ver mensagens" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Public read messages" ON public.whatsapp_messages;

-- Ensure RLS is properly enforced on whatsapp_messages
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages FORCE ROW LEVEL SECURITY;

-- Ensure RLS is properly enforced on agendamentos_visitas  
ALTER TABLE public.agendamentos_visitas FORCE ROW LEVEL SECURITY;