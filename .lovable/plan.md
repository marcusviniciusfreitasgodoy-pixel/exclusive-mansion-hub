
# Plano: Criar Tabela "Empreendimentos" no Supabase

## Objetivo
Criar uma nova tabela `empreendimentos` no banco de dados Supabase para armazenar dados de empreendimentos imobiliários de alto padrão, com estrutura otimizada usando JSONB para objetos complexos.

---

## Estrutura da Tabela

### Colunas Principais

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | uuid | No | gen_random_uuid() | Chave primária |
| construtora_id | uuid | No | - | FK para construtoras (owner) |
| titulo | text | No | - | Nome do empreendimento |
| descricao_curta | text | No | - | Descrição resumida |
| slug | text | No | - | URL amigável (UNIQUE) |
| status | enum | No | 'em_lancamento' | Status do empreendimento |
| localizacao | jsonb | No | '{}' | Cidade, bairro, endereço |
| caracteristicas_principais | jsonb | No | '[]' | Array de destaques |
| imagens | jsonb | No | '[]' | Array de {url, alt} |
| precos | jsonb | No | '{}' | {minValor, maxValor, unidade} |
| detalhes | jsonb | No | '{}' | {areaUtil, quartos, banheiros, vagasGaragem} |
| link_visita_virtual | text | Yes | null | URL tour virtual |
| cores_design_system | jsonb | Yes | '{}' | Tokens de cor customizados |
| componentes_ui | jsonb | Yes | '{}' | Mapeamento de componentes |
| created_at | timestamptz | Yes | now() | Data criação |
| updated_at | timestamptz | Yes | now() | Data atualização |

### Enum de Status

```sql
CREATE TYPE empreendimento_status AS ENUM (
  'em_lancamento',
  'em_construcao', 
  'pronto_para_morar'
);
```

---

## Políticas RLS (Row Level Security)

| Política | Comando | Condição |
|----------|---------|----------|
| Construtoras podem criar | INSERT | construtora_id = get_construtora_id(auth.uid()) |
| Construtoras podem ver seus empreendimentos | SELECT | construtora_id = get_construtora_id(auth.uid()) |
| Construtoras podem atualizar | UPDATE | construtora_id = get_construtora_id(auth.uid()) |
| Construtoras podem deletar | DELETE | construtora_id = get_construtora_id(auth.uid()) |
| Público pode ver empreendimentos ativos | SELECT | status IS NOT NULL |

---

## Índices

1. **slug** - UNIQUE para URLs amigáveis
2. **status** - Filtros por status
3. **construtora_id** - Queries por construtora
4. **GIN em localizacao** - Busca em campos JSONB

---

## Dados de Exemplo: Oceana Golf

```json
{
  "titulo": "Oceana Golf",
  "descricao_curta": "Residencial de luxo com vista panorâmica para o oceano e acesso exclusivo ao campo de golf",
  "slug": "oceana-golf",
  "status": "em_lancamento",
  "localizacao": {
    "cidade": "Rio de Janeiro",
    "bairro": "Barra da Tijuca",
    "endereco": "Av. Lúcio Costa, 3500"
  },
  "caracteristicas_principais": [
    "4 suítes com varanda",
    "Vista panorâmica para o mar",
    "Acesso exclusivo ao Golf Club",
    "Piscina privativa",
    "4 vagas de garagem",
    "Área de lazer completa"
  ],
  "imagens": [
    { "url": "/assets/gallery/ocean-front.jpg", "alt": "Fachada Oceana Golf" },
    { "url": "/assets/gallery/principal.jpg", "alt": "Vista da varanda" }
  ],
  "precos": {
    "minValor": 4500000,
    "maxValor": 12000000,
    "unidade": "R$"
  },
  "detalhes": {
    "areaUtil": 380,
    "quartos": 4,
    "banheiros": 5,
    "vagasGaragem": 4
  },
  "link_visita_virtual": "https://tour360.oceana-golf.com.br",
  "cores_design_system": {
    "primary": "#0284c7",
    "secondary": "#22c55e"
  },
  "componentes_ui": {
    "cardImovel": true,
    "botaoCTA": true,
    "formularioContato": true
  }
}
```

---

## SQL da Migration

```sql
-- 1. Criar enum de status
CREATE TYPE empreendimento_status AS ENUM (
  'em_lancamento',
  'em_construcao',
  'pronto_para_morar'
);

-- 2. Criar tabela empreendimentos
CREATE TABLE public.empreendimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  construtora_id uuid NOT NULL REFERENCES public.construtoras(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao_curta text NOT NULL,
  slug text NOT NULL UNIQUE,
  status empreendimento_status NOT NULL DEFAULT 'em_lancamento',
  localizacao jsonb NOT NULL DEFAULT '{}',
  caracteristicas_principais jsonb NOT NULL DEFAULT '[]',
  imagens jsonb NOT NULL DEFAULT '[]',
  precos jsonb NOT NULL DEFAULT '{}',
  detalhes jsonb NOT NULL DEFAULT '{}',
  link_visita_virtual text,
  cores_design_system jsonb DEFAULT '{}',
  componentes_ui jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Índices para performance
CREATE INDEX idx_empreendimentos_status ON public.empreendimentos(status);
CREATE INDEX idx_empreendimentos_construtora ON public.empreendimentos(construtora_id);
CREATE INDEX idx_empreendimentos_localizacao ON public.empreendimentos USING GIN (localizacao);

-- 4. Trigger para updated_at
CREATE TRIGGER update_empreendimentos_updated_at
  BEFORE UPDATE ON public.empreendimentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 5. Habilitar RLS
ALTER TABLE public.empreendimentos ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS
CREATE POLICY "Construtoras podem criar empreendimentos"
  ON public.empreendimentos FOR INSERT
  WITH CHECK (construtora_id = get_construtora_id(auth.uid()));

CREATE POLICY "Construtoras podem ver seus empreendimentos"
  ON public.empreendimentos FOR SELECT
  USING (construtora_id = get_construtora_id(auth.uid()));

CREATE POLICY "Construtoras podem atualizar seus empreendimentos"
  ON public.empreendimentos FOR UPDATE
  USING (construtora_id = get_construtora_id(auth.uid()));

CREATE POLICY "Construtoras podem deletar seus empreendimentos"
  ON public.empreendimentos FOR DELETE
  USING (construtora_id = get_construtora_id(auth.uid()));

CREATE POLICY "Publico pode ver empreendimentos"
  ON public.empreendimentos FOR SELECT
  USING (true);
```

---

## Inserção de Dados de Exemplo

Após a criação da tabela, será inserido o empreendimento "Oceana Golf" vinculado a uma construtora existente no banco (usando service role para bypass de RLS durante seed).

---

## Resultado Esperado

- Nova tabela `empreendimentos` criada com estrutura JSONB otimizada
- RLS configurado para isolamento por construtora
- Índices para queries performáticas
- Dados de exemplo "Oceana Golf" inseridos
- Pronto para integração com o template Alto Padrão

Quando aprovar, executarei a migration e inserirei os dados de exemplo. Depois podemos seguir para a próxima etapa!
