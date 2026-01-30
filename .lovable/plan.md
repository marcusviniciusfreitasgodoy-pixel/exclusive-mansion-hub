

# REDESIGN DEFINITIVO: Pagina de Imovel
## Template Sotheby's + The Agency + Sistema White-Label

---

## Analise do Estado Atual

Apos explorar os arquivos existentes, identifiquei que o projeto ja possui uma base solida com os seguintes componentes implementados:

### Componentes Existentes (Funcionais)
- `PropertyPage.tsx` - Pagina principal com estrutura base
- `PropertyHeroNew.tsx` - Carrossel com lightbox (usando embla-carousel)
- `PropertyHeaderInfo.tsx` - Grid de metricas basico
- `PropertyTabs.tsx` - Navegacao sticky
- `PropertyOverview.tsx` - Descricao + diferenciais + accordions
- `PropertyLocation.tsx` - Mapa Google Maps integrado
- `PropertyDetailsNew.tsx` - Detalhes estruturados
- `PropertyRecommendations.tsx` - Imoveis relacionados
- `PropertyContactSection.tsx` - Formulario + integracao agendamento
- `AgendarVisitaModal.tsx` - Modal completo de agendamento
- `DynamicNavbar.tsx` - Navbar white-label
- `DynamicFooter.tsx` - Footer white-label + Godoy Prime

### Modelo de Dados Atual (tabela `imoveis`)
Ja possui 41 campos incluindo os novos campos Sotheby's:
- `listing_code`, `property_type`, `year_built`, `lot_size`
- `features_interior`, `features_exterior`, `amenities` (JSONB)
- `headline`, `price_secondary`, `price_on_request`
- `latitude`, `longitude`

---

## O Que Sera Alterado

### 1. Expansao do Modelo de Dados (Migracao SQL)

Adicionar campos novos inspirados no template The Agency:

```text
NOVOS CAMPOS A ADICIONAR:
- flag_destaque (boolean) - Selo "DESTAQUE"
- flag_novo_anuncio (boolean) - Selo "NOVO"
- flag_exclusividade (boolean) - Selo "EXCLUSIVIDADE"
- flag_off_market (boolean) - Selo "OFF MARKET"
- flag_lancamento (boolean) - Selo "LANCAMENTO"
- flag_alto_padrao (boolean) - Selo "ALTO PADRAO"
- data_publicacao (timestamp) - Data de publicacao
- regiao (text) - Regiao (ex: Zona Sul)
- distrito (text) - Distrito
- estilo_arquitetonico (text) - Estilo (Contemporaneo, Classico)
- estrutura_construcao (text) - Tipo de construcao
- tipo_piso (jsonb) - Array de tipos de piso
- caracteristicas_terreno (jsonb) - Array (Jardim, Privacidade)
- vista (jsonb) - Array (Mar, Montanha, Lago)
- aquecimento (jsonb) - Array (Central, Eletrico)
- sistema_esgoto (text)
- abastecimento_agua (text)
- vagas_descricao (text) - Descricao detalhada das vagas
- impostos_anuais (numeric) - Valor de impostos
- seo_titulo (text)
- seo_descricao (text)
- tags (jsonb) - Array para busca
- origem_cadastro (text) - Interno, Parceria, IHB
- corretores (jsonb) - Array de corretores vinculados
```

### 2. Redesign de Componentes

#### PropertyHeroNew.tsx (ATUALIZAR)
**Mudancas:**
- Adicionar badges dinamicos (NOVO, DESTAQUE, EXCLUSIVIDADE, etc.)
- Mover Info Box com endereco e preco para overlay inferior esquerdo
- Manter logo white-label inferior direito
- Adicionar precos primario e secundario no overlay
- Manter carrossel e lightbox existentes

```text
+--------------------------------------------------+
| [BADGES: NOVO | DESTAQUE | EXCLUSIVIDADE]        |
| [VIDEO] [35 FOTOS] [360 TOUR]                    |
|                                                  |
|                                                  |
|        [CARROSSEL FULLSCREEN]                   |
|                                                  |
|                                                  |
| +- INFO BOX ----------------+  +- LOGO --------+ |
| | BARRA DA TIJUCA           |  | [Imobiliaria] | |
| | Av. Lucio Costa, 2360     |  +---------------+ |
| | R$ 12.000.000             |                    |
| | USD $2,500,000            |                    |
| | [Galeria] [Contato]       |                    |
| +---------------------------+                    |
+--------------------------------------------------+
```

#### BarraAcoesImovel.tsx (NOVO COMPONENTE)
**Inspirado The Agency:**
- Barra fixa sticky que aparece apos scroll
- Botoes: Informacoes, Mapa, Fotos, Imprimir, Salvar, Compartilhar
- Modal de compartilhamento (WhatsApp, Facebook, Email, Copiar Link)

#### ResumoMetricasImovel.tsx (NOVO COMPONENTE)
**Substituir PropertyHeaderInfo:**
- Grid de 5-6 cards de metricas
- Suites, Banheiros, Area Total, Tipo de Imovel, Codigo
- Badge de status colorido
- Layout mais compacto e profissional

#### PropertyOverview.tsx (ATUALIZAR)
**Melhorias:**
- Renderizar headline com destaque maior
- Melhorar grid de diferenciais (2 colunas, icones check)
- Manter accordions Memorial e Condicoes

#### PropertyDetails.tsx (REDESIGN COMPLETO)
**Inspirado The Agency - categorias estruturadas:**

```text
+- GERAL ---------------+  +- DIMENSOES/TERRENO --+
| Data: XX/XX/XXXX      |  | Area: 1.250 m2       |
| Regiao: Barra         |  | Lote: 500 m2         |
| Tipo: Casa            |  | Vista: Mar, Montanha |
| Status: Disponivel    |  | Terreno: Jardim      |
+-----------------------+  +----------------------+

+- INTERNAS ------------+  +- EXTERNAS -----------+
| - Pe-direito alto     |  | - Piscina aquecida   |
| - Closet              |  | - Jardim             |
| - Home theater        |  | - Churrasqueira      |
+-----------------------+  +----------------------+

+- ESTRUTURA -----------+  +- UTILIDADES ---------+
| Estilo: Contemporaneo |  | Aquecimento: Central |
| Construcao: Alvenaria |  | Esgoto: Rede publica |
+-----------------------+  +----------------------+
```

#### BlocoCorretoresImovel.tsx (NOVO COMPONENTE)
**Inspirado The Agency:**
- Card do corretor com foto, nome, cargo
- Telefone e email clicaveis
- Botao WhatsApp direto
- Mini-bio opcional
- Selo de parceria (IHB Brazil) se aplicavel

#### PropertyContactSection.tsx (ATUALIZAR)
**Melhorias:**
- Adicionar checkboxes: "Ja estou com corretor" e "Desejo agendar visita"
- Mensagem pre-preenchida com endereco do imovel
- Manter integracao com AgendarVisitaModal

#### PropertyRecommendations.tsx (ATUALIZAR)
**Melhorias:**
- Query melhorada: filtrar por tags, bairro, faixa de preco
- Exibir badges (NOVO, DESTAQUE) nos cards
- Carrossel horizontal em mobile
- Limite de 8 imoveis

#### DynamicNavbar.tsx (ATUALIZAR)
**Melhorias:**
- Sincronizar navegacao com novas secoes
- Links: Visao Geral, Detalhes, Localizacao, Contato

---

## Estrutura Final da Pagina

```text
1. DynamicNavbar (white-label)
2. BarraAcoesImovel (sticky apos scroll) [NOVO]
3. PropertyHeroNew (fullscreen + badges + info box)
4. ResumoMetricasImovel [NOVO - substitui PropertyHeaderInfo]
5. PropertyTabs (navegacao interna sticky)
6. PropertyOverview (descricao + diferenciais + accordions)
7. PropertyMedia (videos + tour 360) [existente: DynamicVideoSection]
8. PropertyDetails (detalhes estruturados) [REDESIGN]
9. BlocoCorretoresImovel [NOVO]
10. PropertyContactSection (formulario + agendamento)
11. PropertyLocation (mapa Google)
12. PropertyRecommendations (imoveis similares)
13. DynamicFooter (white-label + Godoy Prime)
```

---

## Arquivos a Criar/Modificar

### Criar Novos:
1. `src/components/property/BarraAcoesImovel.tsx`
2. `src/components/property/ResumoMetricasImovel.tsx`
3. `src/components/property/BlocoCorretoresImovel.tsx`

### Modificar Existentes:
1. `src/types/property-page.ts` - Adicionar novos campos ao tipo PropertyData
2. `src/hooks/usePropertyPage.ts` - Buscar novos campos do banco
3. `src/pages/imovel/PropertyPage.tsx` - Reorganizar estrutura com novos componentes
4. `src/components/property/PropertyHeroNew.tsx` - Adicionar badges e info box
5. `src/components/property/PropertyDetailsNew.tsx` - Redesign com categorias
6. `src/components/property/PropertyOverview.tsx` - Melhorias de layout
7. `src/components/property/PropertyContactSection.tsx` - Adicionar checkboxes
8. `src/components/property/PropertyRecommendations.tsx` - Query melhorada + badges
9. `src/components/property/DynamicNavbar.tsx` - Atualizar links

### Migracao SQL:
- Adicionar ~23 novos campos a tabela `imoveis`

---

## Secao Tecnica

### Migracao do Banco de Dados

```sql
-- Flags e Selos
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS flag_destaque BOOLEAN DEFAULT FALSE;
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS flag_novo_anuncio BOOLEAN DEFAULT FALSE;
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS flag_exclusividade BOOLEAN DEFAULT FALSE;
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS flag_off_market BOOLEAN DEFAULT FALSE;
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS flag_lancamento BOOLEAN DEFAULT FALSE;
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS flag_alto_padrao BOOLEAN DEFAULT FALSE;

-- Datas e Origem
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS data_publicacao TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS origem_cadastro TEXT;

-- Localizacao Detalhada
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS regiao TEXT;
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS distrito TEXT;

-- Caracteristicas Estruturadas
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS estilo_arquitetonico TEXT;
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS estrutura_construcao TEXT;
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS tipo_piso JSONB DEFAULT '[]';
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS caracteristicas_terreno JSONB DEFAULT '[]';
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS vista JSONB DEFAULT '[]';
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS aquecimento JSONB DEFAULT '[]';
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS sistema_esgoto TEXT;
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS abastecimento_agua TEXT;
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS vagas_descricao TEXT;

-- Financeiro
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS impostos_anuais NUMERIC(15,2);

-- SEO e Marketing
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS seo_titulo TEXT;
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS seo_descricao TEXT;
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

-- Corretores
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS corretores JSONB DEFAULT '[]';
```

### Tipo PropertyData Atualizado

```typescript
export interface PropertyData {
  // Campos existentes...
  
  // Novos campos - Flags
  flagDestaque: boolean;
  flagNovoAnuncio: boolean;
  flagExclusividade: boolean;
  flagOffMarket: boolean;
  flagLancamento: boolean;
  flagAltoPadrao: boolean;
  
  // Novos campos - Localizacao
  regiao: string | null;
  distrito: string | null;
  
  // Novos campos - Caracteristicas
  estiloArquitetonico: string | null;
  estruturaConstrucao: string | null;
  tipoPiso: string[];
  caracteristicasTerreno: string[];
  vista: string[];
  aquecimento: string[];
  sistemaEsgoto: string | null;
  abastecimentoAgua: string | null;
  vagasDescricao: string | null;
  
  // Novos campos - Financeiro
  impostosAnuais: number | null;
  
  // Novos campos - SEO
  seoTitulo: string | null;
  seoDescricao: string | null;
  tags: string[];
  
  // Novos campos - Corretores
  origemCadastro: string | null;
  corretores: Corretor[];
}

interface Corretor {
  nome: string;
  cargo?: string;
  fotoUrl?: string;
  telefone?: string;
  email?: string;
  miniBio?: string;
}
```

---

## Resultados Esperados

- Layout profissional nivel Sotheby's + The Agency
- Sistema white-label 100% funcional
- Badges dinamicos (NOVO, DESTAQUE, EXCLUSIVIDADE)
- Info Box overlay no hero com preco em destaque
- Barra de acoes sticky (compartilhar, salvar, imprimir)
- Detalhes estruturados por categoria
- Bloco de corretores com contato direto
- SEO otimizado com meta tags dinamicas
- Totalmente responsivo (mobile-first)
- Integracoes existentes mantidas (agendamento, leads, feedback)

