

## Automacoes de Pipeline: Tarefas Automaticas por Estagio

### Objetivo

Criar um sistema de automacoes que dispara tarefas automaticas quando um lead muda de estagio no pipeline. A logica sera centralizada em um utilitario reutilizavel, chamado tanto pelo drag-and-drop do Kanban quanto pelo select no modal de detalhes.

### O que sera feito

**1. Novo arquivo: `src/utils/pipelineAutomations.ts`**

Funcao `runStageAutomations()` com logica centralizada via switch/case:

| Estagio destino | Tarefa criada | Prioridade | Vencimento |
|---|---|---|---|
| `qualificado` | "Follow-up: Contatar lead qualificado" | alta | 24h |
| `visita_agendada` | "Preparar material para visita" | media | 48h |
| `proposta_enviada` | "Acompanhar resposta da proposta" | alta | 72h |

Cada automacao tambem registra uma atividade na timeline do lead indicando que a tarefa foi criada automaticamente. Execucao "fire-and-forget" -- erros sao capturados silenciosamente para nao bloquear o fluxo principal.

**2. Editar: `src/components/crm/PipelineKanban.tsx`**

Na `updateStageMutation.mutationFn` (apos o insert de atividade na linha 131), adicionar chamada a `runStageAutomations()` passando leadId, newStage, userId, userName e organizationIds.

Adicionar toast especifico no `onSuccess` quando automacao foi disparada (ex: "Tarefa de follow-up criada automaticamente").

**3. Editar: `src/components/crm/LeadDetailModal.tsx`**

Na `updateStageMutation.mutationFn` (apos o insert de atividade na linha 184), adicionar mesma chamada a `runStageAutomations()`.

### Secao Tecnica

**Estrutura da funcao utilitaria:**

```text
runStageAutomations(params) {
  switch (newStage) {
    case 'qualificado':
      -> INSERT tarefas (titulo, prioridade='alta', vencimento=+24h, lead_id, responsavel_id, org_ids)
      -> INSERT atividades_lead (tipo='nota', titulo='Tarefa automatica criada')
    case 'visita_agendada':
      -> INSERT tarefas (prioridade='media', vencimento=+48h)
      -> INSERT atividades_lead
    case 'proposta_enviada':
      -> INSERT tarefas (prioridade='alta', vencimento=+72h)
      -> INSERT atividades_lead
  }
}
```

**Parametros recebidos:**
- `leadId`, `newStage`, `userId`, `userName`
- `imobiliariaId` (opcional), `construtoraId` (opcional)

**Nenhuma dependencia nova. Nenhuma migracao de banco necessaria.** As tabelas `tarefas` e `atividades_lead` ja existem com os campos necessarios.

