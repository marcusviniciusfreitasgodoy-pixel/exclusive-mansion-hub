
# Painel Resumo de Agendamentos e Feedbacks com Analytics Detalhado

## Objetivo
Adicionar metricas de agendamentos e feedbacks (taxa de confirmacao, NPS medio, tempo medio de resposta) nos dashboards de Analytics existentes, tanto da Construtora quanto da Imobiliaria. Criar tambem graficos detalhados de satisfacao e tendencias de feedback.

## O que sera feito

### 1. Componente reutilizavel: VisitFeedbackAnalytics
Criar um componente compartilhado que exibe as metricas de agendamentos e feedbacks, recebendo os dados por props. Sera usado tanto pela Construtora quanto pela Imobiliaria.

**Metricas KPI:**
- Taxa de confirmacao de visitas (confirmados / total agendados)
- Taxa de realizacao (realizadas / confirmadas)
- NPS medio dos feedbacks completos
- Tempo medio de resposta do feedback (entre criacao e feedback_cliente_em)

**Graficos:**
- Evolucao do NPS ao longo do tempo (linha)
- Distribuicao das avaliacoes por categoria (radar ou barras: localizacao, acabamento, layout, custo-beneficio, atendimento)
- Tendencia de agendamentos por status (confirmado, cancelado, realizado)
- Distribuicao de interesse de compra (pie chart, reutilizando pattern existente)
- Principais objecoes (bar chart horizontal)

### 2. Construtora - Analytics (adicionar secao)
No arquivo `src/pages/dashboard/construtora/Analytics.tsx`, adicionar uma nova secao "Visitas e Satisfacao" apos os graficos existentes, com:
- Query para buscar agendamentos e feedbacks filtrados por periodo e construtora_id
- KPIs de agendamento (taxa confirmacao, realizacao)
- KPIs de feedback (NPS medio, tempo medio de resposta)
- Graficos de tendencia de NPS, avaliacoes por categoria, objecoes
- Isso complementa o NPS medio que ja existe nos KPIs principais

### 3. Imobiliaria - Analytics (adicionar secao)
No arquivo `src/pages/dashboard/imobiliaria/Analytics.tsx`, adicionar a mesma secao "Visitas e Satisfacao" com:
- Query filtrada por imobiliaria_id
- Mesmos KPIs e graficos, adaptados ao contexto da imobiliaria

---

## Detalhes Tecnicos

### Arquivos a criar

1. **`src/components/analytics/VisitFeedbackAnalytics.tsx`**
   - Componente que recebe como props: `agendamentos`, `feedbacks`, `period` e `isLoading`
   - Renderiza:
     - Grid de 4 KPICards (taxa confirmacao, taxa realizacao, NPS medio, tempo medio resposta)
     - TrendLineChart com evolucao de NPS ao longo do tempo
     - BarChart com avaliacoes medias por categoria (5 categorias de estrelas)
     - PieChart com distribuicao de interesse
     - BarChart horizontal com objecoes
   - Reutiliza os componentes existentes: KPICard, TrendLineChart do analytics/index

### Arquivos a modificar

2. **`src/components/analytics/index.ts`**
   - Exportar o novo componente VisitFeedbackAnalytics

3. **`src/pages/dashboard/construtora/Analytics.tsx`**
   - Adicionar query para buscar agendamentos (`agendamentos_visitas` onde `construtora_id = construtora.id` e no periodo)
   - Adicionar query para buscar feedbacks completos (`feedbacks_visitas` onde `construtora_id = construtora.id` e no periodo)
   - Renderizar `VisitFeedbackAnalytics` com os dados obtidos, apos a secao de PropertyImobiliariaBreakdown

4. **`src/pages/dashboard/imobiliaria/Analytics.tsx`**
   - Adicionar query para buscar agendamentos (`agendamentos_visitas` onde `imobiliaria_id = imobiliaria.id` e no periodo)
   - Adicionar query para buscar feedbacks completos (`feedbacks_visitas` onde `imobiliaria_id = imobiliaria.id` e no periodo)
   - Renderizar `VisitFeedbackAnalytics` com os dados obtidos, apos a secao de Performance Table

### Dados consultados (sem necessidade de migracoes SQL)
Todas as colunas necessarias ja existem:
- `agendamentos_visitas`: status, created_at, data_confirmada, realizado_em
- `feedbacks_visitas`: nps_cliente, avaliacao_*, interesse_compra, objecoes, feedback_cliente_em, created_at, status

### Calculo das metricas
- **Taxa de confirmacao**: `count(status in ['confirmado','realizado']) / count(total)` x 100
- **Taxa de realizacao**: `count(status = 'realizado') / count(status = 'confirmado' ou 'realizado')` x 100
- **NPS medio**: `sum(nps_cliente) / count(feedbacks completos)`
- **Tempo medio de resposta**: media de `feedback_cliente_em - created_at` em horas, para feedbacks completos
- **Evolucao NPS**: NPS medio agrupado por dia/semana
- **Avaliacoes por categoria**: media de cada campo avaliacao_* nos feedbacks completos
