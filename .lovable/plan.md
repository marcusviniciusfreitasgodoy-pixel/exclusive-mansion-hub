

## Adicionar "Performance por Corretor" na pagina de Feedbacks da Imobiliaria

### Problema
A pagina de Feedbacks da imobiliaria (`src/pages/dashboard/imobiliaria/Feedbacks.tsx`) nao possui uma secao de Performance. A construtora tem "Performance por Imobiliaria", mas para a imobiliaria o agrupamento correto e por **Corretor**.

### O que sera feito

**Arquivo:** `src/pages/dashboard/imobiliaria/Feedbacks.tsx`

1. **Calcular performance por corretor** -- Agrupar os feedbacks completos pelo campo `corretor_nome` (ja disponivel na tabela `feedbacks_visitas`), calculando:
   - Quantidade de feedbacks por corretor
   - NPS medio por corretor

2. **Adicionar secao "Performance por Corretor"** -- Tabela com colunas:
   - Corretor (nome)
   - Feedbacks (contagem)
   - NPS Medio (valor formatado em negrito)

   A tabela sera adicionada apos os cards de KPI e antes da area de filtros/tabs de feedbacks, seguindo o mesmo estilo visual da tabela da construtora (com `<table>` dentro de um `<Card>`).

### Detalhes Tecnicos

- O campo `corretor_nome` ja e retornado na query existente (`select *` da tabela `feedbacks_visitas`)
- Nenhuma query adicional e necessaria
- A logica de agrupamento sera feita no frontend com `useMemo` ou calculo direto a partir de `completeFeedbacks`
- A secao so aparece se houver feedbacks completos com `corretor_nome` preenchido
- Sera posicionada logo apos os 3 cards de KPI (NPS Medio, Muito Interessados, Total de Feedbacks)
