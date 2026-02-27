

## Sincronizar Manual, Tour Guiado, Apresentacao e One-Pager

### Contexto

A auditoria cruzada revelou 4 desalinhamentos entre os materiais. Todas as correcoes sao aditivas (nenhum conteudo existente sera removido).

---

### Correcao 1 — Tour Imobiliaria: adicionar Pipeline CRM

**Arquivo:** `src/components/dashboard/DashboardSidebar.tsx`
- Adicionar `tourId: 'pipeline'` ao item "Pipeline CRM" na lista `imobiliariaLinks`

**Arquivo:** `src/components/dashboard/GuidedTour.tsx`
- Adicionar novo passo ao `TOUR_IMOBILIARIA` (apos "Meus Links"):

```text
Titulo: Pipeline CRM
Descricao: Organize seus leads em 8 etapas visuais. Arraste cards entre colunas para atualizar o progresso.
Selector: [data-tour="pipeline"]
```

---

### Correcao 2 — Tour Construtora: adicionar Feedbacks

**Arquivo:** `src/components/dashboard/DashboardSidebar.tsx`
- Adicionar `tourId: 'feedbacks'` ao item "Feedbacks e Satisfacao" na lista `construtoraLinks`

**Arquivo:** `src/components/dashboard/GuidedTour.tsx`
- Adicionar novo passo ao `TOUR_CONSTRUTORA` (apos "Agendamentos"):

```text
Titulo: Feedbacks e Satisfacao
Descricao: Colete NPS, Efeito UAU e avaliacoes pos-visita. Exporte relatorios em PDF.
Selector: [data-tour="feedbacks"]
```

---

### Correcao 3 — Manual Construtora: adicionar topico Fichas de Visita

**Arquivo:** `src/pages/Manual.tsx`
- Adicionar novo topico ao array `construtoraTopics` (apos "Efeito UAU e Satisfacao"):

```text
Titulo: Fichas de Visita com Validade Juridica
Icone: ClipboardCheck
Conteudo: Cada visita registrada gera uma ficha digital com:
  - Codigo de verificacao unico
  - Geolocalizacao automatica
  - Assinatura digital do corretor e do cliente
  - Data e horario registrados
  Essas fichas servem como comprovante oficial da visita e alimentam os relatorios de analytics.
```

---

### Correcao 4 — Manual Imobiliaria: adicionar topico Gestao de Corretores

**Arquivo:** `src/pages/Manual.tsx`
- Adicionar novo topico ao array `imobiliariaTopics` (apos "Configurar Formularios"):

```text
Titulo: Gestao de Corretores
Icone: Users
Conteudo: No menu Corretores, voce pode:
  - Cadastrar corretores vinculados a sua imobiliaria
  - Atribuir imoveis e leads a cada corretor
  - Acompanhar metricas individuais de performance
  - Gerenciar permissoes de acesso
  Cada corretor pode acessar a plataforma com login proprio e ver apenas os dados pertinentes.
```

---

### Resumo de arquivos alterados

| Arquivo | Alteracao |
|---|---|
| `src/components/dashboard/DashboardSidebar.tsx` | 2 tourIds adicionados |
| `src/components/dashboard/GuidedTour.tsx` | 2 passos adicionados (1 construtora, 1 imobiliaria) |
| `src/pages/Manual.tsx` | 2 topicos adicionados (1 construtora, 1 imobiliaria) |

Nenhuma alteracao na Apresentacao ou no One-Pager (ja estao completos).

