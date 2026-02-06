

# Incluir Funcionalidades Novas no Demo e Destacar Beneficios para Imobiliarias

## Resumo
Atualizar o modo demo e a pagina de apresentacao para (1) exibir as novas funcionalidades de analytics (Efeito UAU, graficos de satisfacao, exportacao PDF) em ambos os dashboards demo e (2) destacar explicitamente os beneficios para imobiliarias na pagina de apresentacao e na landing do demo.

## O que sera feito

### 1. Enriquecer dados mockados (`src/data/demo-data.ts`)
Adicionar aos registros de `DEMO_FEEDBACKS` os campos necessarios para o componente `VisitFeedbackAnalytics`:
- `efeito_uau`: arrays de categorias UAU por feedback (ex: `['vista', 'acabamento', 'varanda']`)
- `objecoes`: arrays de objecoes (ex: `['preco']`)
- `feedback_cliente_em`: timestamps ISO para calculo de tempo de resposta
- Padronizar `interesse_compra` para valores aceitos pelo componente (`muito_interessado`, `interessado`, `pouco_interessado`, `sem_interesse`, `indeciso`)

### 2. Adicionar VisitFeedbackAnalytics ao demo Construtora (`src/pages/demo/DemoConstrutora.tsx`)
- Importar `VisitFeedbackAnalytics` de `@/components/analytics/VisitFeedbackAnalytics`
- Na funcao `DemoAnalyticsContent`, apos os graficos existentes, mapear `DEMO_FEEDBACKS` e `DEMO_AGENDAMENTOS` para as interfaces esperadas e renderizar o componente
- Incluindo botao de exportacao PDF funcional

### 3. Adicionar VisitFeedbackAnalytics ao demo Imobiliaria (`src/pages/demo/DemoImobiliaria.tsx`)
- Importar `VisitFeedbackAnalytics`
- Na funcao `DemoAnalyticsImob`, apos os KPIs existentes, filtrar feedbacks e agendamentos pela imobiliaria demo e renderizar o componente

### 4. Atualizar landing do demo (`src/pages/demo/DemoLanding.tsx`)
Adicionar funcionalidades novas na lista de features de cada perfil:
- **Construtora**: adicionar "Efeito UAU e satisfacao" e "Relatorios em PDF"
- **Imobiliaria**: adicionar "Analytics de satisfacao", "Relatorios em PDF" e "Feedback pos-visita"

Atualizar a descricao da imobiliaria para destacar melhor os beneficios:
- "Divulgue imoveis com sua marca, capture leads, acompanhe satisfacao dos visitantes e exporte relatorios de performance."

### 5. Atualizar pagina de apresentacao (`src/pages/Apresentacao.tsx`)
Adicionar uma nova secao "Para cada perfil" entre Features e Benefits strip, com dois blocos lado a lado:

**Para Construtoras:**
- Visao consolidada de todos os imoveis e parceiros
- Pipeline visual com 8 etapas de venda
- Analytics com Efeito UAU e NPS
- Relatorios em PDF para proprietarios

**Para Imobiliarias:**
- Links personalizados com sua marca
- Metricas individuais de cada imovel
- Feedback pos-visita com graficos de satisfacao
- Exportacao de relatorios para seus clientes
- Gestao autonoma de leads e agendamentos

Tambem adicionar a feature "Efeito UAU" na lista FEATURES existente:
```typescript
{
  icon: Star,
  title: 'Efeito UAU',
  desc: 'Identifique quais aspectos do imovel mais impressionam os visitantes e use esses dados para direcionar campanhas.',
}
```

---

## Detalhes Tecnicos

### Arquivos a modificar
1. **`src/data/demo-data.ts`** - Enriquecer DEMO_FEEDBACKS com efeito_uau, objecoes, feedback_cliente_em e corrigir interesse_compra
2. **`src/pages/demo/DemoConstrutora.tsx`** - Importar e renderizar VisitFeedbackAnalytics no DemoAnalyticsContent
3. **`src/pages/demo/DemoImobiliaria.tsx`** - Importar e renderizar VisitFeedbackAnalytics no DemoAnalyticsImob
4. **`src/pages/demo/DemoLanding.tsx`** - Expandir features listadas para ambos os perfis
5. **`src/pages/Apresentacao.tsx`** - Adicionar secao de beneficios por perfil e feature Efeito UAU

### Mapeamento de dados para o componente

O `VisitFeedbackAnalytics` espera:
```typescript
interface Feedback {
  id: string;
  nps_cliente: number | null;
  avaliacao_localizacao: number | null;
  avaliacao_acabamento: number | null;
  avaliacao_layout: number | null;
  avaliacao_custo_beneficio: number | null;
  avaliacao_atendimento: number | null;
  interesse_compra: string | null;
  objecoes: any;
  efeito_uau: string[] | null;
  created_at: string | null;
  feedback_cliente_em: string | null;
  status: string;
}
```

Os DEMO_FEEDBACKS existentes ja possuem a maioria dos campos; basta adicionar `efeito_uau`, `objecoes`, `feedback_cliente_em` e ajustar `interesse_compra` para os valores corretos.

### Nenhum arquivo novo necessario
Toda a implementacao se encaixa nos componentes e estruturas existentes.

