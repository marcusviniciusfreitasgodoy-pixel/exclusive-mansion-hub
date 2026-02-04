-- Tabela de disponibilidade semanal do corretor/imobiliária
CREATE TABLE public.disponibilidade_corretor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imobiliaria_id UUID NOT NULL REFERENCES public.imobiliarias(id) ON DELETE CASCADE,
  dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=domingo
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  duracao_slot_minutos INT NOT NULL DEFAULT 60,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(imobiliaria_id, dia_semana)
);

-- Tabela de bloqueios na agenda (feriados, férias, etc)
CREATE TABLE public.bloqueios_agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imobiliaria_id UUID NOT NULL REFERENCES public.imobiliarias(id) ON DELETE CASCADE,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  motivo TEXT,
  recorrente BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.disponibilidade_corretor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloqueios_agenda ENABLE ROW LEVEL SECURITY;

-- RLS Policies for disponibilidade_corretor
CREATE POLICY "Imobiliarias podem gerenciar sua disponibilidade"
ON public.disponibilidade_corretor
FOR ALL
USING (imobiliaria_id = get_imobiliaria_id(auth.uid()))
WITH CHECK (imobiliaria_id = get_imobiliaria_id(auth.uid()));

CREATE POLICY "Leitura publica de disponibilidade ativa"
ON public.disponibilidade_corretor
FOR SELECT
USING (ativo = true);

-- RLS Policies for bloqueios_agenda
CREATE POLICY "Imobiliarias podem gerenciar seus bloqueios"
ON public.bloqueios_agenda
FOR ALL
USING (imobiliaria_id = get_imobiliaria_id(auth.uid()))
WITH CHECK (imobiliaria_id = get_imobiliaria_id(auth.uid()));

CREATE POLICY "Leitura publica de bloqueios"
ON public.bloqueios_agenda
FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_disponibilidade_corretor_updated_at
BEFORE UPDATE ON public.disponibilidade_corretor
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();