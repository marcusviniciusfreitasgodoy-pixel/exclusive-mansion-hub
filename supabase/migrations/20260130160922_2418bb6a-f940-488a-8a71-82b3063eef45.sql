-- Enum para roles
CREATE TYPE app_role AS ENUM ('construtora', 'imobiliaria', 'admin');

-- Enum para status de imovel
CREATE TYPE imovel_status AS ENUM ('ativo', 'vendido', 'inativo');

-- Enum para status de acesso
CREATE TYPE access_status AS ENUM ('active', 'revoked');

-- Enum para plano de construtora
CREATE TYPE plano_construtora AS ENUM ('start', 'pro', 'enterprise');

-- Enum para status de construtora
CREATE TYPE construtora_status AS ENUM ('active', 'suspended', 'cancelled');

-- Enum para origem do lead
CREATE TYPE lead_origem AS ENUM ('formulario', 'whatsapp', 'chat_ia');

-- Enum para status do lead
CREATE TYPE lead_status AS ENUM ('novo', 'contatado', 'qualificado', 'visita_agendada', 'perdido');

-- Tabela user_roles (CRITICA para seguranca)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Tabela construtoras
CREATE TABLE public.construtoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nome_empresa TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  cor_primaria TEXT DEFAULT '#1e3a5f',
  cor_secundaria TEXT DEFAULT '#b8860b',
  dominio_customizado TEXT,
  plano plano_construtora DEFAULT 'start',
  status construtora_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela imobiliarias
CREATE TABLE public.imobiliarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nome_empresa TEXT NOT NULL,
  creci TEXT NOT NULL,
  logo_url TEXT,
  cor_primaria TEXT DEFAULT '#1e3a5f',
  telefone TEXT,
  email_contato TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela imoveis
CREATE TABLE public.imoveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  construtora_id UUID REFERENCES public.construtoras(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT DEFAULT 'RJ',
  valor DECIMAL(15,2),
  condominio DECIMAL(10,2),
  iptu DECIMAL(10,2),
  area_total DECIMAL(10,2),
  area_privativa DECIMAL(10,2),
  suites INTEGER,
  banheiros INTEGER,
  vagas INTEGER,
  descricao TEXT,
  diferenciais JSONB DEFAULT '[]',
  memorial_descritivo TEXT,
  imagens JSONB DEFAULT '[]',
  videos JSONB DEFAULT '[]',
  tour_360_url TEXT,
  status imovel_status DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela imobiliaria_imovel_access
CREATE TABLE public.imobiliaria_imovel_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imobiliaria_id UUID REFERENCES public.imobiliarias(id) ON DELETE CASCADE NOT NULL,
  imovel_id UUID REFERENCES public.imoveis(id) ON DELETE CASCADE NOT NULL,
  url_slug TEXT UNIQUE NOT NULL,
  acesso_concedido_em TIMESTAMPTZ DEFAULT now(),
  status access_status DEFAULT 'active',
  visitas INTEGER DEFAULT 0,
  UNIQUE (imobiliaria_id, imovel_id)
);

-- Tabela leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID REFERENCES public.imoveis(id) ON DELETE CASCADE NOT NULL,
  imobiliaria_id UUID REFERENCES public.imobiliarias(id) ON DELETE SET NULL,
  access_id UUID REFERENCES public.imobiliaria_imovel_access(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  mensagem TEXT,
  origem lead_origem DEFAULT 'formulario',
  status lead_status DEFAULT 'novo',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Funcao de seguranca para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Funcao para obter construtora_id do usuario
CREATE OR REPLACE FUNCTION public.get_construtora_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.construtoras WHERE user_id = _user_id LIMIT 1
$$;

-- Funcao para obter imobiliaria_id do usuario
CREATE OR REPLACE FUNCTION public.get_imobiliaria_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.imobiliarias WHERE user_id = _user_id LIMIT 1
$$;

-- Enable RLS em todas as tabelas
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construtoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imobiliarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imobiliaria_imovel_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Politicas RLS para user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Politicas RLS para construtoras
CREATE POLICY "Users can view own construtora" ON public.construtoras
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own construtora" ON public.construtoras
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own construtora" ON public.construtoras
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politicas RLS para imobiliarias
CREATE POLICY "Users can view own imobiliaria" ON public.imobiliarias
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Construtoras can view all imobiliarias" ON public.imobiliarias
  FOR SELECT USING (public.has_role(auth.uid(), 'construtora'));
CREATE POLICY "Users can update own imobiliaria" ON public.imobiliarias
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own imobiliaria" ON public.imobiliarias
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politicas RLS para imoveis
CREATE POLICY "Construtoras can view own imoveis" ON public.imoveis
  FOR SELECT USING (
    construtora_id = public.get_construtora_id(auth.uid())
  );
CREATE POLICY "Imobiliarias can view authorized imoveis" ON public.imoveis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.imobiliaria_imovel_access
      WHERE imovel_id = imoveis.id
      AND imobiliaria_id = public.get_imobiliaria_id(auth.uid())
      AND status = 'active'
    )
  );
CREATE POLICY "Public can view active imoveis via slug" ON public.imoveis
  FOR SELECT USING (status = 'ativo');
CREATE POLICY "Construtoras can insert imoveis" ON public.imoveis
  FOR INSERT WITH CHECK (
    construtora_id = public.get_construtora_id(auth.uid())
  );
CREATE POLICY "Construtoras can update own imoveis" ON public.imoveis
  FOR UPDATE USING (
    construtora_id = public.get_construtora_id(auth.uid())
  );
CREATE POLICY "Construtoras can delete own imoveis" ON public.imoveis
  FOR DELETE USING (
    construtora_id = public.get_construtora_id(auth.uid())
  );

-- Politicas RLS para imobiliaria_imovel_access
CREATE POLICY "Construtoras can manage access" ON public.imobiliaria_imovel_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.imoveis
      WHERE id = imobiliaria_imovel_access.imovel_id
      AND construtora_id = public.get_construtora_id(auth.uid())
    )
  );
CREATE POLICY "Imobiliarias can view own access" ON public.imobiliaria_imovel_access
  FOR SELECT USING (
    imobiliaria_id = public.get_imobiliaria_id(auth.uid())
  );
CREATE POLICY "Public can read active access by slug" ON public.imobiliaria_imovel_access
  FOR SELECT USING (status = 'active');

-- Politicas RLS para leads
CREATE POLICY "Construtoras can view leads of own imoveis" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.imoveis
      WHERE id = leads.imovel_id
      AND construtora_id = public.get_construtora_id(auth.uid())
    )
  );
CREATE POLICY "Imobiliarias can view own leads" ON public.leads
  FOR SELECT USING (
    imobiliaria_id = public.get_imobiliaria_id(auth.uid())
  );
CREATE POLICY "Anyone can insert leads" ON public.leads
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Construtoras can update leads status" ON public.leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.imoveis
      WHERE id = leads.imovel_id
      AND construtora_id = public.get_construtora_id(auth.uid())
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER imoveis_updated_at
  BEFORE UPDATE ON public.imoveis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('imoveis', 'imoveis', true);

-- Policies para storage - logos
CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own logos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'logos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own logos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- Policies para storage - imoveis
CREATE POLICY "Construtoras can upload imoveis media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'imoveis' AND
    public.has_role(auth.uid(), 'construtora')
  );

CREATE POLICY "Construtoras can update imoveis media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'imoveis' AND
    public.has_role(auth.uid(), 'construtora')
  );

CREATE POLICY "Construtoras can delete imoveis media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'imoveis' AND
    public.has_role(auth.uid(), 'construtora')
  );

-- Public read for all storage
CREATE POLICY "Public can view all storage files"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('logos', 'imoveis'));