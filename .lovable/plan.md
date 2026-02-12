

## Implementar Visualizacoes Lista e Tabela no Pipeline

### Arquivo a modificar
`src/components/crm/PipelineKanban.tsx`

### Modo Lista

Cards empilhados verticalmente, agrupados por estagio do pipeline. Cada card mostra numa unica linha horizontal:
- Badge colorido com nome do estagio
- Nome do lead
- Imovel de interesse
- Telefone / email (com links clicaveis)
- Score de qualificacao
- Ultimo contato (tempo relativo)
- Botao "Ver detalhes"

Cada grupo tera um header com o nome do estagio, icone e contagem de leads.

### Modo Tabela

Tabela completa usando os componentes `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableCell`, `TableBody` ja existentes em `src/components/ui/table.tsx`. Colunas:

| Nome | Email | Telefone | Imovel | Estagio | Score | Origem | Ultimo Contato | Acoes |

Funcionalidades:
- Badge colorido na coluna Estagio
- Score com icone visual (fogo/termometro/gelo)
- Coluna Acoes com botoes de WhatsApp, email, telefone e ver detalhes
- Select inline na coluna Estagio para alterar o estagio diretamente da tabela (usa a mesma `updateStageMutation` do Kanban)

### Secao tecnica

O placeholder nas linhas 377-381 sera substituido por dois blocos condicionais (`viewMode === 'list'` e `viewMode === 'table'`). Ambos reutilizam:
- `filteredLeads` para os dados
- `leadsByStage` para agrupamento (modo lista)
- `PIPELINE_COLUMNS` para cores e titulos dos estagios
- `setSelectedLead` para abrir o modal de detalhes
- `updateStageMutation` para alterar estagio inline (modo tabela)
- `formatTimeAgo`, `getScoreIcon`, `getScoreColor` de `@/types/crm`
- `formatCurrency` ja definido no componente

Imports adicionais necessarios: `Table, TableHeader, TableBody, TableRow, TableHead, TableCell` de `@/components/ui/table`.

