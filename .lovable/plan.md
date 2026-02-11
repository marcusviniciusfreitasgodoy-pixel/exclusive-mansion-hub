

## Painel de Feedbacks Pendentes com Indicadores de Urgencia

### Objetivo

Adicionar um painel de alerta no topo da pagina de Feedbacks da Imobiliaria (`src/pages/dashboard/imobiliaria/Feedbacks.tsx`) mostrando feedbacks pendentes ha mais de 24h e 48h, com indicadores visuais de urgencia e botao para reenviar manualmente (email + WhatsApp via edge function existente).

### O que sera adicionado

Um componente `PendingFeedbacksPanel` inserido entre os cards de analytics e os filtros, contendo:

**Cards de resumo (2 colunas):**
- Card amarelo "Pendentes +24h": quantidade de feedbacks aguardando ha mais de 24 horas
- Card vermelho "Pendentes +48h": quantidade de feedbacks aguardando ha mais de 48 horas
- Cada card mostra contagem separada de "Aguardando Cliente" e "Aguardando Corretor"

**Lista de feedbacks urgentes (abaixo dos cards):**
- Feedbacks ordenados por tempo pendente (mais antigos primeiro)
- Cada item mostra: nome do cliente, imovel, tempo pendente (ex: "ha 3 dias"), status, e badges de urgencia
- Badge amarela para +24h, badge vermelha pulsante para +48h
- Indicadores de follow-up ja enviado (1o lembrete, 2o lembrete)
- Botao "Reenviar" em cada item que chama a edge function `send-feedback-request` existente (para clientes) ou `send-feedback-followup` (para disparo manual geral)
- O painel so aparece se houver pelo menos 1 feedback pendente ha mais de 24h

### Detalhes Tecnicos

**Arquivo a modificar:**
- `src/pages/dashboard/imobiliaria/Feedbacks.tsx`

Toda a logica sera adicionada inline neste arquivo (sem criar componente separado, seguindo o padrao existente da pagina):

1. Calcular a partir dos feedbacks ja carregados (`feedbacks` query existente) quais estao pendentes ha +24h e +48h usando `differenceInHours` do date-fns
2. Para `aguardando_cliente`: comparar `created_at` com `now()`
3. Para `aguardando_corretor`: comparar `feedback_cliente_em` com `now()`
4. Renderizar o painel entre a section de analytics cards (linha 313) e os filtros (linha 362)
5. Reutilizar a `resendMutation` ja existente (linha 72-91) para o botao de reenvio ao cliente
6. Adicionar uma segunda mutation para disparar `send-feedback-followup` manualmente (botao "Disparar Lembretes")

**Campos utilizados do banco (ja disponiveis no select existente):**
- `created_at`, `feedback_cliente_em`, `status`
- `followup_enviado_cliente`, `followup_2_enviado_cliente`
- `followup_enviado_corretor`, `followup_2_enviado_corretor`

**Imports adicionais:** `differenceInHours` do date-fns, `AlertTriangle` e `Zap` do lucide-react

**Nenhuma dependencia nova.** Nenhuma migracao de banco necessaria.

