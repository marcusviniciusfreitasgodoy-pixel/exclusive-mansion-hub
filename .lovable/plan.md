
# Plano: Criar Novas Seções de Materiais para Imóveis

## Resumo dos Materiais Analisados

Baseado nos arquivos fornecidos, identifiquei **6 tipos de materiais** que as construtoras podem disponibilizar:

| Material | Arquivo Exemplo | Descrição |
|----------|-----------------|-----------|
| **Book Digital** | `book_grid_DIGITAL.pdf` | Apresentação completa do empreendimento com história, conceito, localização, arquitetos, plantas, renders e ficha técnica |
| **Estudo de Rentabilidade** | `Estudo_ROI_Grid.jpg` | Análise de retorno de investimento para short-stay, com tabelas de ocupação e projeções financeiras |
| **Tabela de Vendas** | `TABELA_DE_VENDAS_-_GRID_-_JANEIRO_26.pdf` | Preços, condições de pagamento e observações por unidade |
| **Planta da Unidade** | `GRID_UNIDADE_201.pdf` / `GRID_UNIDADE_206.pdf` | Planta baixa específica da unidade sendo vendida |
| **Memorial Descritivo** | (já existe no sistema) | Especificações técnicas de acabamentos |
| **Condições de Pagamento** | (já existe no sistema) | Formas de pagamento aceitas |

## Arquitetura da Solução

### 1. Novos Campos no Banco de Dados

Adicionar à tabela `imoveis` um novo campo JSONB para armazenar os materiais promocionais de forma estruturada:

```sql
ALTER TABLE imoveis ADD COLUMN materiais_promocionais JSONB DEFAULT '{}';
```

Estrutura do campo:
```json
{
  "bookDigital": { "url": "...", "nome": "...", "tipo": "pdf" },
  "estudoRentabilidade": { "url": "...", "nome": "...", "tipo": "image|pdf" },
  "tabelaVendas": { "url": "...", "nome": "...", "tipo": "pdf" },
  "plantaUnidade": { "url": "...", "nome": "...", "tipo": "pdf|image" },
  "personalizacao": [
    { "titulo": "Planta", "disponivel": true },
    { "titulo": "Revestimentos", "disponivel": true }
  ],
  "seguranca": [
    "Alarme e sensores perimetrais",
    "Circuito fechado de TV"
  ],
  "sustentabilidade": [
    "Sistema dual flush",
    "Medidor individual de água"
  ],
  "infraestrutura": [
    "Área de delivery com refrigerador",
    "Espaço de coworking"
  ]
}
```

### 2. Novas Seções na Página do Imóvel

#### Seção 1: Book Digital / Apresentação do Empreendimento
- **Componente**: `PropertyBookSection.tsx`
- **Condicional**: Só aparece se `materiais_promocionais.bookDigital` estiver preenchido
- **Layout**: Card com thumbnail do PDF, botão para abrir em nova aba ou modal com visualizador

#### Seção 2: Estudo de Rentabilidade / ROI
- **Componente**: `PropertyROISection.tsx`
- **Condicional**: Só aparece se `materiais_promocionais.estudoRentabilidade` existir
- **Layout**: 
  - Se imagem: exibe inline com zoom
  - Se PDF: botão para download/visualização
  - Destaque para métricas principais (se disponíveis)

#### Seção 3: Tabela de Vendas
- **Componente**: `PropertyPriceTableSection.tsx`
- **Condicional**: Só aparece se `materiais_promocionais.tabelaVendas` existir
- **Layout**: Card com botão de download e preview

#### Seção 4: Planta da Unidade
- **Componente**: `PropertyFloorPlanSection.tsx`
- **Condicional**: Só aparece se `materiais_promocionais.plantaUnidade` existir
- **Layout**: 
  - Imagem expandível com zoom
  - Legenda com cômodos identificados (se disponível)

#### Seção 5: Personalização Disponível
- **Componente**: `PropertyCustomizationSection.tsx`
- **Condicional**: Só aparece se houver opções de personalização
- **Layout**: Lista de checkboxes mostrando o que pode ser personalizado

#### Seção 6: Segurança e Tecnologia
- **Componente**: `PropertySecuritySection.tsx`
- **Condicional**: Só aparece se houver itens de segurança
- **Layout**: Grid com ícones e descrições

#### Seção 7: Sustentabilidade
- **Componente**: `PropertySustainabilitySection.tsx`
- **Condicional**: Só aparece se houver itens de sustentabilidade
- **Layout**: Grid com ícones verdes e badges ecológicos

### 3. Atualização do Wizard de Cadastro (Step 4: Mídias)

Adicionar uma nova aba ou seção no Step 4 para upload dos materiais promocionais:

```text
┌─────────────────────────────────────────────────────────┐
│ Etapa 4: Mídias                                         │
├─────────────────────────────────────────────────────────┤
│ [Imagens] [Vídeos] [Tour 360°] [Materiais Promocionais] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📕 Book Digital do Empreendimento (PDF)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Arraste ou clique para upload                     │   │
│  │ (Apresentação completa com renders, plantas, etc) │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  📊 Estudo de Rentabilidade/ROI (PDF ou Imagem)         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Arraste ou clique para upload                     │   │
│  │ (Análise de retorno para investidores)            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  💰 Tabela de Vendas/Preços (PDF)                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Arraste ou clique para upload                     │   │
│  │ (Valores e condições por unidade)                 │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  🏠 Planta da Unidade (PDF ou Imagem)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Arraste ou clique para upload                     │   │
│  │ (Planta baixa específica desta unidade)           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4. Atualização do Step 5: Revisão

Adicionar visualização dos materiais promocionais no resumo:

```text
┌─────────────────────────────────────────────────────────┐
│ Materiais Promocionais                                  │
├─────────────────────────────────────────────────────────┤
│ ✓ Book Digital: book_grid_DIGITAL.pdf                   │
│ ✓ Estudo ROI: Estudo_ROI_Grid.jpg                       │
│ ✓ Tabela de Vendas: TABELA_DE_VENDAS_GRID.pdf           │
│ ✓ Planta da Unidade: GRID_UNIDADE_201.pdf               │
└─────────────────────────────────────────────────────────┘
```

## Detalhes Técnicos

### Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/components/property/PropertyBookSection.tsx` | Seção de Book Digital |
| `src/components/property/PropertyROISection.tsx` | Seção de Estudo de Rentabilidade |
| `src/components/property/PropertyPriceTableSection.tsx` | Seção de Tabela de Vendas |
| `src/components/property/PropertyFloorPlanSection.tsx` | Seção de Planta da Unidade |
| `src/components/property/PropertyCustomizationSection.tsx` | Seção de Personalização |
| `src/components/property/PropertySecuritySection.tsx` | Seção de Segurança |
| `src/components/property/PropertySustainabilitySection.tsx` | Seção de Sustentabilidade |
| `src/components/wizard/Step4MaterialsUpload.tsx` | Sub-componente para upload de materiais |

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/types/property-page.ts` | Adicionar tipos para materiais promocionais |
| `src/types/database.ts` | Adicionar campo `materiais_promocionais` ao tipo `Imovel` |
| `src/hooks/usePropertyPage.ts` | Carregar e parsear materiais promocionais |
| `src/components/wizard/Step4Media.tsx` | Adicionar nova aba de Materiais Promocionais |
| `src/components/wizard/Step5Review.tsx` | Exibir materiais na revisão |
| `src/components/templates/TemplateModerno.tsx` | Adicionar novas seções condicionais |
| `src/components/templates/TemplateLuxo.tsx` | Adicionar novas seções condicionais |
| `src/components/templates/TemplateClassico.tsx` | Adicionar novas seções condicionais |
| `src/pages/dashboard/construtora/NovoImovel.tsx` | Salvar materiais promocionais |
| `src/pages/dashboard/construtora/EditarImovel.tsx` | Editar materiais promocionais |

### Migração de Banco de Dados

```sql
-- Adicionar campo para materiais promocionais
ALTER TABLE imoveis 
ADD COLUMN IF NOT EXISTS materiais_promocionais JSONB DEFAULT '{}';

-- Criar índice para performance em buscas
CREATE INDEX IF NOT EXISTS idx_imoveis_materiais 
ON imoveis USING GIN (materiais_promocionais);
```

## Layout Visual das Novas Seções

### Book Digital
```text
┌─────────────────────────────────────────────────────────────────┐
│                      📕 Apresentação do Empreendimento          │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────┐                                                 │
│  │            │  GRID Residencial - Gávea                       │
│  │  [Thumb]   │                                                 │
│  │   PDF      │  Conheça todos os detalhes do empreendimento:   │
│  │            │  • Conceito arquitetônico                       │
│  └────────────┘  • Plantas de todas as unidades                 │
│                  • Renders e perspectivas                       │
│                  • Especificações técnicas                      │
│                                                                 │
│                  [📖 Abrir Book Digital] [⬇️ Download PDF]      │
└─────────────────────────────────────────────────────────────────┘
```

### Estudo de Rentabilidade
```text
┌─────────────────────────────────────────────────────────────────┐
│                📊 Estudo de Rentabilidade                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Investimento Inteligente na Zona Sul do Rio                    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │   [Imagem/PDF do Estudo com Zoom]                        │   │
│  │                                                          │   │
│  │   • Análise de mercado short-stay                        │   │
│  │   • Projeção de rentabilidade mensal                     │   │
│  │   • Comparativo com concorrentes                         │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [🔍 Ver Estudo Completo]                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Planta da Unidade
```text
┌─────────────────────────────────────────────────────────────────┐
│                 🏠 Planta da Unidade 201                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌────────────────────────────────────────────────────────┐    │
│   │                                                        │    │
│   │    [Planta Baixa - Clique para ampliar]                │    │
│   │                                                        │    │
│   │    ┌─────────┬─────────┐                               │    │
│   │    │ VARANDA │  SALA   │                               │    │
│   │    ├─────────┼─────────┤                               │    │
│   │    │ QUARTO  │ COZINHA │                               │    │
│   │    │         ├─────────┤                               │    │
│   │    │         │  BANHO  │                               │    │
│   │    └─────────┴─────────┘                               │    │
│   │                                                        │    │
│   └────────────────────────────────────────────────────────┘    │
│                                                                 │
│   Área Privativa: 54,50 m²                                      │
│   [📥 Download Planta PDF]                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Ordem de Implementação

1. **Migração do banco** - Adicionar campo JSONB
2. **Atualizar tipos TypeScript** - `PropertyData`, `Imovel`
3. **Criar componentes de seção** - 7 novos componentes
4. **Atualizar Step 4** - Nova aba de materiais
5. **Atualizar Step 5** - Exibir materiais na revisão
6. **Atualizar templates** - Adicionar seções condicionais
7. **Atualizar hook usePropertyPage** - Carregar materiais
8. **Atualizar NovoImovel/EditarImovel** - Salvar materiais

## Comportamento Condicional

| Seção | Condição para Exibir |
|-------|---------------------|
| Book Digital | `materiais_promocionais?.bookDigital?.url` existe |
| Estudo ROI | `materiais_promocionais?.estudoRentabilidade?.url` existe |
| Tabela Vendas | `materiais_promocionais?.tabelaVendas?.url` existe |
| Planta Unidade | `materiais_promocionais?.plantaUnidade?.url` existe |
| Personalização | Array `materiais_promocionais?.personalizacao?.length > 0` |
| Segurança | Array `materiais_promocionais?.seguranca?.length > 0` |
| Sustentabilidade | Array `materiais_promocionais?.sustentabilidade?.length > 0` |

Se nenhum material for fornecido, a seção correspondente simplesmente não aparece no site.
