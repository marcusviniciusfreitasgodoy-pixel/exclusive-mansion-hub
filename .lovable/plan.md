

## Inserir Dados Simulados para Testes -- Imobiliaria

### Objetivo
Inserir dados simulados nas tabelas `agendamentos_visitas` e `feedbacks_visitas` vinculados a sua imobiliaria (`0808cf71-aa0c-4531-94f3-a3741a2efea0`) para popular as secoes de Dashboard de Visitas e Feedbacks com dados variados.

### Dados Atuais
- **Agendamentos:** 6 registros (2 pendentes, 2 confirmados, 1 realizado, 1 cancelado)
- **Feedbacks:** 3 registros (todos completos, com 2 corretores: Joao Corretor e Ana Corretora)

### O que sera inserido

**7 novos agendamentos** com variedade de status e corretores:

| Cliente | Imovel | Corretor | Status |
|---|---|---|---|
| Luciana Teixeira | GRID 201 | Carlos Vendedor | pendente |
| Marcos Almeida | Lucio Costa | Carlos Vendedor | confirmado |
| Beatriz Ferreira | GRID 201 | Joao Corretor | realizado |
| Gabriel Santos | Mansao Malibu | Ana Corretora | realizado |
| Patricia Monteiro | Lucio Costa | Carlos Vendedor | realizado |
| Roberto Dias | GRID 201 | Ana Corretora | cancelado |
| Juliana Ribeiro | Mansao Malibu | Joao Corretor | pendente |

**5 novos feedbacks** com diferentes corretores, NPS e niveis de interesse:

| Cliente | Corretor | NPS | Interesse | Status |
|---|---|---|---|---|
| Beatriz Ferreira | Joao Corretor | 10 | muito_interessado | completo |
| Gabriel Santos | Ana Corretora | 8 | interessado | completo |
| Patricia Monteiro | Carlos Vendedor | 9 | muito_interessado | completo |
| Roberto Dias | Ana Corretora | 5 | pouco_interessado | aguardando_cliente |
| Juliana Ribeiro | Carlos Vendedor | -- | -- | aguardando_corretor |

Isso vai permitir:
- **Performance por Corretor** com 3 corretores (Joao, Ana, Carlos)
- **KPIs variados** com NPS de 5 a 10
- **Fichas pendentes** (aguardando_corretor e aguardando_cliente)
- **Feedbacks completos** com diferentes avaliacoes

### Detalhes Tecnicos

**Metodo:** Migration SQL com INSERTs nas tabelas `agendamentos_visitas` e `feedbacks_visitas`

**IDs fixos usados:**
- Imobiliaria: `0808cf71-aa0c-4531-94f3-a3741a2efea0`
- Construtora: `8de22a19-9ce7-41a6-a1dc-deab3ad6d275`
- Imoveis: GRID 201 (`ea860551`), Lucio Costa (`96367cb7`), Mansao Malibu (`996ec17b`)

**Arquivo criado:**
- Nova migration SQL com os INSERTs (nenhum arquivo de codigo sera alterado)

