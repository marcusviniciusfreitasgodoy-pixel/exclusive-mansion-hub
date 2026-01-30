
# Plano de Transformacao SaaS Multi-Tenant

## Visao Geral

Transformar a landing page atual de imovel unico em uma plataforma SaaS completa onde construtoras cadastram imoveis e imobiliarias geram URLs white label personalizadas para divulgacao.

## Arquitetura do Sistema

```text
+------------------+     +------------------+     +------------------+
|   Construtora    |     |   Imobiliaria    |     |   Cliente Final  |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------------------------------------------------------+
|                        Frontend (React)                           |
|  /auth/*  |  /dashboard/*  |  /imovel/[slug]  |  /admin/*        |
+------------------------------------------------------------------+
         |                        |                        |
         v                        v                        v
+------------------------------------------------------------------+
|                    Supabase Backend                               |
|  Auth  |  Database (PostgreSQL)  |  Storage  |  Edge Functions   |
+------------------------------------------------------------------+
```

---

## Fase 1: Configuracao do Supabase e Banco de Dados

### 1.1 Habilitar Supabase (Cloud ou Externo)

Antes de iniciar a implementacao, sera necessario conectar o projeto ao Supabase para ter acesso a autenticacao, banco de dados e storage.

### 1.2 Estrutura do Banco de Dados

**Tabela: user_roles** (Seguranca - Roles separados do perfil)
- id (UUID, PK)
- user_id (UUID, FK -> auth.users.id, NOT NULL)
- role (ENUM: 'construtora', 'imobiliaria', 'admin')
- created_at (TIMESTAMP)
- UNIQUE (user_id, role)

**Tabela: construtoras**
- id (UUID, PK)
- user_id (UUID, FK -> auth.users.id, UNIQUE, NOT NULL)
- nome_empresa (TEXT, NOT NULL)
- cnpj (TEXT, UNIQUE, NOT NULL)
- logo_url (TEXT)
- cor_primaria (TEXT, default '#1e3a5f')
- cor_secundaria (TEXT, default '#b8860b')
- dominio_customizado (TEXT)
- plano (ENUM: 'start', 'pro', 'enterprise', default 'start')
- status (ENUM: 'active', 'suspended', 'cancelled', default 'active')
- created_at (TIMESTAMP)

**Tabela: imobiliarias**
- id (UUID, PK)
- user_id (UUID, FK -> auth.users.id, UNIQUE, NOT NULL)
- nome_empresa (TEXT, NOT NULL)
- creci (TEXT, NOT NULL)
- logo_url (TEXT)
- cor_primaria (TEXT, default '#1e3a5f')
- telefone (TEXT)
- email_contato (TEXT)
- created_at (TIMESTAMP)

**Tabela: imoveis**
- id (UUID, PK)
- construtora_id (UUID, FK -> construtoras.id, NOT NULL)
- titulo (TEXT, NOT NULL)
- endereco (TEXT)
- bairro (TEXT)
- cidade (TEXT)
- estado (TEXT, default 'RJ')
- valor (DECIMAL)
- condominio (DECIMAL)
- iptu (DECIMAL)
- area_total (DECIMAL)
- area_privativa (DECIMAL)
- suites (INTEGER)
- banheiros (INTEGER)
- vagas (INTEGER)
- descricao (TEXT)
- diferenciais (JSONB, array de strings)
- memorial_descritivo (TEXT)
- imagens (JSONB, array de objetos {url, alt})
- videos (JSONB, array de objetos {url, tipo})
- tour_360_url (TEXT)
- status (ENUM: 'ativo', 'vendido', 'inativo', default 'ativo')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**Tabela: imobiliaria_imovel_access**
- id (UUID, PK)
- imobiliaria_id (UUID, FK -> imobiliarias.id, NOT NULL)
- imovel_id (UUID, FK -> imoveis.id, NOT NULL)
- url_slug (TEXT, UNIQUE, NOT NULL)
- acesso_concedido_em (TIMESTAMP, default now())
- status (ENUM: 'active', 'revoked', default 'active')
- visitas (INTEGER, default 0)
- UNIQUE (imobiliaria_id, imovel_id)

**Tabela: leads**
- id (UUID, PK)
- imovel_id (UUID, FK -> imoveis.id, NOT NULL)
- imobiliaria_id (UUID, FK -> imobiliarias.id)
- access_id (UUID, FK -> imobiliaria_imovel_access.id)
- nome (TEXT, NOT NULL)
- email (TEXT, NOT NULL)
- telefone (TEXT)
- mensagem (TEXT)
- origem (ENUM: 'formulario', 'whatsapp', 'chat_ia')
- status (ENUM: 'novo', 'contatado', 'qualificado', 'visita_agendada', 'perdido', default 'novo')
- created_at (TIMESTAMP)

### 1.3 Funcao de Seguranca para Roles

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

### 1.4 Politicas RLS (Row Level Security)

- **construtoras**: usuarios so veem sua propria construtora
- **imobiliarias**: usuarios so veem sua propria imobiliaria
- **imoveis**: construtoras veem seus imoveis; imobiliarias veem imoveis com acesso ativo
- **leads**: construtoras veem todos os leads de seus imoveis; imobiliarias veem apenas seus leads
- **imobiliaria_imovel_access**: construtoras podem gerenciar; imobiliarias veem seus acessos

---

## Fase 2: Sistema de Autenticacao

### 2.1 Estrutura de Arquivos

```text
src/
  contexts/
    AuthContext.tsx        # Context global de autenticacao
  hooks/
    useAuth.ts             # Hook customizado para auth
  pages/
    auth/
      Login.tsx            # Pagina de login unificada
      RegisterConstrutora.tsx
      RegisterImobiliaria.tsx
```

### 2.2 AuthContext

- Gerencia estado de sessao e usuario
- Listener `onAuthStateChange` para atualizacoes em tempo real
- Funcoes: signIn, signUp, signOut
- Fetch automatico do tipo de usuario (role) apos login
- Redirect automatico baseado no role

### 2.3 Fluxo de Registro

1. Usuario escolhe tipo (Construtora ou Imobiliaria)
2. Preenche formulario com dados especificos do tipo
3. Supabase Auth cria conta
4. Trigger no banco cria registro na tabela apropriada
5. Insere role na tabela user_roles
6. Redirect para dashboard correspondente

### 2.4 Componentes de Auth

- **ProtectedRoute**: HOC para rotas protegidas
- **RoleGuard**: Verifica se usuario tem role necessario
- Validacao com Zod para todos os formularios

---

## Fase 3: Dashboard da Construtora

### 3.1 Estrutura de Arquivos

```text
src/
  pages/
    dashboard/
      construtora/
        index.tsx              # Layout principal
        Imoveis.tsx            # Lista de imoveis
        NovoImovel.tsx         # Wizard multi-step
        EditarImovel.tsx       # Edicao de imovel
        Imobiliarias.tsx       # Gerenciar parceiros
        Leads.tsx              # Visualizar leads
        Configuracoes.tsx      # Config da conta
  components/
    dashboard/
      Sidebar.tsx              # Navegacao lateral
      ImovelCard.tsx           # Card de imovel
      ImovelWizard/
        Step1Basico.tsx
        Step2Especificacoes.tsx
        Step3Descricao.tsx
        Step4Midia.tsx
        Step5Revisao.tsx
      LeadsTable.tsx
      AccessModal.tsx          # Modal conceder acesso
```

### 3.2 Funcionalidades

**Sidebar com navegacao:**
- Meus Imoveis
- Novo Imovel
- Imobiliarias Parceiras
- Leads
- Configuracoes
- Sair

**Lista de Imoveis:**
- Cards com imagem, titulo, endereco, valor, status
- Contador de imobiliarias com acesso
- Contador de leads
- Botoes: Editar, Ver Pagina, Gerenciar Acessos

**Wizard Novo Imovel (5 etapas):**
1. Informacoes Basicas: titulo, endereco, valor, condominio, IPTU
2. Especificacoes: areas, suites, banheiros, vagas
3. Descricao: texto geral, diferenciais (lista dinamica), memorial
4. Midia: upload imagens (drag & drop), videos, tour 360
5. Revisao: preview da landing page, botao publicar

**Gerenciar Imobiliarias:**
- Lista de imobiliarias cadastradas
- Modal para conceder/revogar acesso a imoveis

**Leads:**
- Tabela com filtros e exportacao CSV
- Status: novo, contatado, qualificado, visita agendada, perdido

---

## Fase 4: Dashboard da Imobiliaria

### 4.1 Estrutura de Arquivos

```text
src/
  pages/
    dashboard/
      imobiliaria/
        index.tsx              # Layout principal
        ImoveisDisponiveis.tsx # Imoveis com acesso
        MeusLinks.tsx          # Links gerados
        MeusLeads.tsx          # Leads da imobiliaria
        Configuracoes.tsx      # Branding
```

### 4.2 Funcionalidades

**Sidebar com navegacao:**
- Imoveis Disponiveis
- Meus Links
- Meus Leads
- Configuracoes
- Sair

**Imoveis Disponiveis:**
- Cards dos imoveis autorizados pela construtora
- Botao "Gerar Meu Link"
- Modal com campo para slug customizado
- Preview da URL gerada

**Meus Links:**
- Lista de links criados
- Metricas: visitas, leads gerados
- Botoes: Copiar Link, Ver Pagina, Analytics basico

**Meus Leads:**
- Tabela apenas com leads da imobiliaria
- Export CSV

**Configuracoes:**
- Upload de logo (Supabase Storage)
- Color picker para cor primaria
- Telefone/WhatsApp de contato
- Email de contato

---

## Fase 5: Landing Page Dinamica White Label

### 5.1 Estrutura

```text
src/
  pages/
    imovel/
      [slug].tsx               # Pagina dinamica
  components/
    property/
      DynamicHero.tsx
      DynamicPropertyDetails.tsx
      DynamicDescription.tsx
      DynamicGallery.tsx
      DynamicVideoSection.tsx
      DynamicContact.tsx
      DynamicNavbar.tsx
      DynamicFooter.tsx
```

### 5.2 Logica de Carregamento

1. Extrair slug da URL via React Router (`/imovel/:slug`)
2. Query no banco buscando:
   - Dados do imovel
   - Dados da construtora
   - Dados da imobiliaria (branding)
3. Aplicar cores da imobiliaria via CSS variables
4. Renderizar componentes dinamicos
5. Incrementar contador de visitas

### 5.3 Componentes Dinamicos

Todos os componentes atuais serao convertidos para versoes dinamicas que recebem dados via props:

- **DynamicHero**: imagem principal, titulo, endereco
- **DynamicPropertyDetails**: valor, area, suites, banheiros, vagas
- **DynamicDescription**: descricao, diferenciais, memorial
- **DynamicGallery**: array de imagens
- **DynamicVideoSection**: array de videos
- **DynamicContact**: dados de contato da imobiliaria (white label)
- **DynamicNavbar**: logo da imobiliaria
- **DynamicFooter**: branding da imobiliaria + construtora

### 5.4 Formulario de Lead

- Ao submeter, salva lead no banco vinculando:
  - imovel_id
  - imobiliaria_id
  - access_id (para analytics)
- Envia para WhatsApp da imobiliaria (se configurado)
- Notificacao para construtora (opcional, via edge function)

---

## Fase 6: Storage e Upload de Arquivos

### 6.1 Buckets no Supabase Storage

- **logos**: logos de construtoras e imobiliarias (publico)
- **imoveis**: imagens e videos dos imoveis (publico)

### 6.2 Politicas de Storage

- Construtoras podem fazer upload em `imoveis/{construtora_id}/*`
- Imobiliarias podem fazer upload em `logos/{imobiliaria_id}/*`
- Leitura publica para ambos

### 6.3 Componente de Upload

- Drag & drop com preview
- Reordenacao de imagens
- Compressao no cliente antes do upload
- Progress bar

---

## Fase 7: Rotas e Navegacao

### 7.1 Estrutura de Rotas

```text
/                           # Home (redireciona baseado no estado)
/auth/login                 # Login unificado
/auth/register/construtora  # Registro construtora
/auth/register/imobiliaria  # Registro imobiliaria

/dashboard/construtora      # Dashboard construtora
/dashboard/construtora/novo-imovel
/dashboard/construtora/imovel/:id
/dashboard/construtora/imobiliarias
/dashboard/construtora/leads
/dashboard/construtora/configuracoes

/dashboard/imobiliaria      # Dashboard imobiliaria
/dashboard/imobiliaria/meus-links
/dashboard/imobiliaria/leads
/dashboard/imobiliaria/configuracoes

/imovel/:slug               # Landing page dinamica (publica)
```

### 7.2 Guards e Redirects

- Usuario nao autenticado -> /auth/login
- Construtora acessando /dashboard/imobiliaria -> redirect
- Imobiliaria acessando /dashboard/construtora -> redirect
- Usuario autenticado em /auth/* -> redirect para dashboard

---

## Secao Tecnica

### Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, React Router, TanStack Query
- **Estilizacao**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Validacao**: Zod + React Hook Form
- **Estado**: React Context + TanStack Query para cache

### Migracao SQL Principal

```sql
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

-- Policies para storage
CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

CREATE POLICY "Construtoras can upload imoveis media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'imoveis' AND
    public.has_role(auth.uid(), 'construtora')
  );

CREATE POLICY "Public can view all storage files"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('logos', 'imoveis'));
```

### Ordem de Implementacao

1. Conectar Supabase ao projeto
2. Executar migracao SQL para criar tabelas e RLS
3. Criar AuthContext e hooks de autenticacao
4. Criar paginas de auth (login, registro)
5. Criar layout base do dashboard com Sidebar
6. Implementar dashboard construtora (imoveis, wizard, leads)
7. Implementar dashboard imobiliaria
8. Converter componentes atuais para versoes dinamicas
9. Criar rota /imovel/:slug com carregamento de dados
10. Implementar upload de arquivos
11. Testes e refinamentos

### Estimativa de Arquivos a Criar

- ~15 novas paginas
- ~25 novos componentes
- ~5 hooks customizados
- 1 contexto de autenticacao
- 1 migracao SQL grande
- ~10 tipos TypeScript

---

## Proximo Passo

Para iniciar a implementacao, e necessario primeiro **conectar o projeto ao Supabase** (Cloud ou instancia externa). Posso ajudar com isso antes de prosseguir com a criacao das tabelas e codigo.
