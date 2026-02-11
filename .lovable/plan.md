

## Dashboard de Visitas -- Construtora

Transformar a pagina atual "Visitas Agendadas" (`/dashboard/construtora/agendamentos`) em um "Dashboard de Visitas" completo, seguindo o layout do print de referencia.

---

### Mudancas Principais

**1. Renomear e reestruturar a pagina**
- Titulo: "Visitas Agendadas" passa a ser "Dashboard de Visitas"
- Subtitulo: "Acompanhe metricas e gerencie visitas"
- Atualizar o link no sidebar (`DashboardSidebar.tsx`) de "Visitas Agendadas" para "Dashboard de Visitas"

**2. KPI Cards (6 cards, conforme o print)**

| Card | Valor | Subtexto | Icone |
|---|---|---|---|
| AGENDADAS | contagem de pendentes + confirmados | "aguardando" | Calendar |
| REALIZADAS | contagem realizados | "X este mes" + trend vs mes anterior | CheckCircle |
| CANCELADAS | contagem cancelados | "total" | XCircle |
| CONVERSAO | % realizados que geraram feedback com interesse_compra = muito_interessado ou interessado | "compraria o imovel" | TrendingUp |
| AVALIACAO | NPS medio dos feedbacks completos | "media geral" (formato X.X/5) | Star |
| FEEDBACKS | contagem de feedbacks recebidos | "recebidos" | MessageSquare |

Para calcular Conversao e Avaliacao, a pagina vai carregar tambem os feedbacks da construtora (query na tabela `feedbacks_visitas`).

**3. Sistema de 5 Abas**

| Aba | Conteudo |
|---|---|
| Dashboard | Grafico "Evolucao Mensal de Visitas" (BarChart com agendados vs realizados por mes) + "Ranking de Corretores" (tabela com posicao, nome, visitas, realizadas, avaliacao media) |
| Agendamentos | Lista atual de cards de agendamentos com filtros (busca, imovel, imobiliaria) e sub-tabs por status |
| Fichas | Lista de feedbacks com status `aguardando_corretor` ou `aguardando_cliente` -- fichas pendentes de preenchimento |
| Feedbacks | Lista de feedbacks completos com detalhes (NPS, interesse, avaliacao por categoria) |
| Ranking | Ranking detalhado de corretores e imobiliarias com metricas de performance |

**4. Aba Dashboard -- Detalhes**

- **Evolucao Mensal de Visitas:** BarChart (Recharts) agrupado por mes, com 2 barras: "Agendadas" (cor vermelha/coral) e "Realizadas" (cor azul escuro). Eixo X = mes/ano, Eixo Y = quantidade.
- **Ranking de Corretores:** Tabela com colunas: #, Corretor, Visitas (total agendamentos), Realizadas (badge com contagem), Avaliacao (estrela + nota media). Ordenado por numero de visitas. Posicao com badge colorido (1o dourado, 2o prata, 3o bronze).

**5. Aba Fichas**
- Cards dos feedbacks pendentes (aguardando_cliente ou aguardando_corretor)
- Mostra nome do cliente, imovel, data da visita, status do feedback
- Sem acoes de gestao (a construtora so visualiza)

**6. Aba Feedbacks**
- Cards dos feedbacks completos
- Mostra NPS, interesse de compra, avaliacao por categoria, nome do cliente
- Botao para ver detalhes em modal

**7. Aba Ranking**
- Ranking de corretores expandido (mesma tabela do Dashboard mas com mais detalhes)
- Ranking de imobiliarias por volume de visitas e NPS medio

---

### Detalhes Tecnicos

**Arquivos modificados:**
- `src/pages/dashboard/construtora/Agendamentos.tsx` -- reescrever completamente com as 5 abas
- `src/components/dashboard/DashboardSidebar.tsx` -- renomear "Visitas Agendadas" para "Dashboard de Visitas"

**Queries adicionais necessarias:**
- Feedbacks da construtora: `feedbacks_visitas` filtrado por `construtora_id`
- Dados ja disponiveis: agendamentos, imoveis, imobiliarias (queries existentes)

**Componentes reutilizados:**
- `KPICard` de `src/components/analytics/KPICard.tsx` para os 6 cards
- `BarChart` do Recharts (ja instalado) para evolucao mensal
- `Badge`, `Card`, `Tabs` do Shadcn UI
- `Star` icon do lucide para avaliacao

**Calculo do Ranking de Corretores:**
- Agrupa agendamentos por `corretor_nome`
- Conta total de visitas e realizadas por corretor
- Cruza com feedbacks para calcular avaliacao media (NPS)
- Ordena por numero de visitas (descendente)

**Calculo da Evolucao Mensal:**
- Agrupa agendamentos por mes (`created_at`)
- Conta agendados (todos) e realizados (status = 'realizado') por mes
- Ultimos 6 meses

**Trend de "Realizadas":**
- Compara realizadas do mes atual vs mes anterior
- Exibe percentual de variacao (ex: "-100% vs mes ant.")
