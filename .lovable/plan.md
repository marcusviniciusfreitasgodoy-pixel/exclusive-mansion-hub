
# Plano: Corrigir Fluxo de Feedback - Cliente Primeiro + Assinatura Dupla

## Contexto do Problema

O fluxo atual está invertido: o corretor preenche primeiro e depois o cliente. O correto é:
1. Cliente avalia a visita primeiro (enquanto a experiencia esta fresca)
2. Corretor completa com dados de qualificacao do lead
3. Documento final tem AMBAS as assinaturas

---

## Mudancas Necessarias

### 1. Alterar Criacao do Feedback (Agendamentos.tsx)

**Arquivo:** `src/pages/dashboard/imobiliaria/Agendamentos.tsx`

Quando a visita e marcada como "Realizada":
- Mudar status inicial de `aguardando_corretor` para `aguardando_cliente`
- Disparar email para o cliente IMEDIATAMENTE (nao apos corretor preencher)
- Corretor NAO e redirecionado para formulario - aguarda cliente responder

```text
ANTES:
[Marcar Realizada] --> [Criar Feedback status: aguardando_corretor] --> [Redirecionar Corretor p/ Formulario]

DEPOIS:
[Marcar Realizada] --> [Criar Feedback status: aguardando_cliente] --> [Enviar Email Cliente] --> [Toast: "Cliente notificado"]
```

---

### 2. Inverter Logica do Formulario do Cliente (FeedbackClientePublico.tsx)

**Arquivo:** `src/pages/feedback/FeedbackClientePublico.tsx`

- Cliente acessa via token (ja funciona)
- Apos submissao, mudar status para `aguardando_corretor` (nao `completo`)
- Remover geracao de PDF neste momento (sera gerado apos corretor assinar)

---

### 3. Criar Acesso do Corretor ao Feedback Pendente

**Arquivo:** `src/pages/dashboard/imobiliaria/FeedbackCorretor.tsx`

Modificar para:
- Aceitar rota por `feedbackId` (nao `agendamentoId`)
- Carregar feedback existente (com dados do cliente ja preenchidos)
- Exibir avaliacao do cliente como "somente leitura" no topo
- Mostrar assinatura do cliente ja capturada
- Formulario do corretor adiciona seus campos + assinatura
- Ao submeter: status muda para `completo`, gera PDF com AMBAS assinaturas

---

### 4. Adicionar Notificacao para Corretor

Quando cliente submete o feedback:
- Enviar email/notificacao para o corretor informando que e sua vez
- Incluir link direto para o formulario do corretor

**Novo Edge Function:** Atualizar `send-feedback-request` ou criar `send-feedback-corretor-notification`

---

### 5. Atualizar Listagem de Feedbacks (Dashboard)

**Arquivo:** `src/pages/dashboard/imobiliaria/Feedbacks.tsx`

- Adicionar aba/filtro para "Aguardando Corretor"
- Mostrar botao "Preencher Feedback" para itens pendentes
- Link para `/dashboard/imobiliaria/feedback/:feedbackId`

---

### 6. Atualizar Geracao do PDF

**Arquivo:** `supabase/functions/generate-feedback-pdf/index.ts`

- Incluir AMBAS as assinaturas no documento
- Secao "Avaliacao do Cliente" com assinatura do cliente
- Secao "Avaliacao do Corretor" com assinatura do corretor
- Atualizar layout para comportar duas assinaturas

---

### 7. Atualizar Rotas

**Arquivo:** `src/App.tsx`

Adicionar rota:
```
/dashboard/imobiliaria/feedback/:feedbackId --> FeedbackCorretorPage
```

---

## Fluxo Corrigido (Diagrama)

```text
[Visita Confirmada]
       |
       v
[Marcar como Realizada]
       |
       v
[Criar Feedback: status = aguardando_cliente]
       |
       v
[Enviar Email para Cliente com Token]
       |
       v
[Cliente acessa /feedback-visita/:token]
       |
       v
[Cliente preenche: NPS, avaliacoes, pontos +/-, interesse, ASSINATURA]
       |
       v
[Submete --> status = aguardando_corretor]
       |
       v
[Notificar Corretor (email/dashboard)]
       |
       v
[Corretor acessa /dashboard/imobiliaria/feedback/:id]
       |
       v
[Ve dados do cliente (read-only) + preenche qualificacao + ASSINATURA]
       |
       v
[Submete --> status = completo]
       |
       v
[Gerar PDF com AMBAS assinaturas]
       |
       v
[Disponibilizar para download]
```

---

## Secao Tecnica

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/dashboard/imobiliaria/Agendamentos.tsx` | Mudar status inicial, enviar email cliente, remover redirect corretor |
| `src/pages/feedback/FeedbackClientePublico.tsx` | Mudar status final para `aguardando_corretor`, notificar corretor |
| `src/pages/dashboard/imobiliaria/FeedbackCorretor.tsx` | Refatorar para carregar feedback existente, exibir dados cliente, coletar assinatura corretor |
| `src/pages/dashboard/imobiliaria/Feedbacks.tsx` | Adicionar filtro e acoes para feedbacks pendentes |
| `src/App.tsx` | Adicionar rota `/dashboard/imobiliaria/feedback/:feedbackId` |
| `supabase/functions/generate-feedback-pdf/index.ts` | Incluir ambas assinaturas no PDF |
| `supabase/functions/send-feedback-request/index.ts` | Ajustar mensagem do email |

### Politicas RLS (ja configuradas)

- `aguardando_cliente`: cliente pode ler/atualizar via token (OK)
- `aguardando_corretor`: corretor autenticado pode ler/atualizar (OK)
- `completo`: todos podem ler para download do PDF (OK)

### Campos do Banco (ja existem)

- `assinatura_cliente` / `assinatura_cliente_data` / `assinatura_cliente_device`
- `assinatura_corretor` / `assinatura_corretor_data` / `assinatura_corretor_device`
- `feedback_cliente_em` / `feedback_corretor_em` / `completo_em`
- `status`: `aguardando_corretor | aguardando_cliente | completo | arquivado`

Nao sao necessarias migracoes de banco - a estrutura ja suporta o fluxo correto.

---

## Resultado Esperado

1. **Cliente responde primeiro** - feedback mais genuino e imediato
2. **Corretor completa depois** - com visao da avaliacao do cliente
3. **Documento juridico valido** - duas assinaturas digitais com timestamp
4. **Rastreabilidade completa** - IP, device, data de cada assinatura
