

## Modulo de Proposta Formal -- Plano de Implementacao

### Resumo

Adicionar um modulo de **Proposta Formal de Compra** que se integra ao fluxo existente de feedback. Apos o cliente preencher o feedback (ou a qualquer momento via link direto), ele pode formalizar uma proposta com valor, condicoes de pagamento, upload de CNH e assinatura digital.

### Analise do Sistema Atual

O sistema ja possui:
- Tabela `feedbacks_visitas` com campos `interesse_compra`, `orcamento_cliente`, `forma_pagamento_cliente` (intencao basica)
- Pagina publica `FeedbackClientePublico.tsx` em `/feedback-visita/:token` com secao "Tem interesse em fazer uma proposta?"
- Componente `SignaturePad` reutilizavel com `react-signature-canvas`
- Bucket `documentos-privados` para arquivos sensíveis
- RPC `submit_client_feedback` para submissao segura

### O que sera alterado na estrutura atual

| Item | Impacto |
|---|---|
| `feedbacks_visitas` | **Nenhuma alteracao** -- a tabela existente nao sera modificada |
| `FeedbackClientePublico.tsx` | **Modificacao** -- adicionar botao/secao condicional para abrir formulario de proposta apos feedback completo |
| `App.tsx` | **Modificacao** -- adicionar rota `/proposta/:token` |
| Dashboard Imobiliaria | **Modificacao** -- adicionar aba "Propostas" na pagina de Feedbacks |
| Bucket de storage | **Novo** -- criar bucket `documentos-proposta` para upload de CNH |

**Nenhuma estrutura importante sera quebrada.** O modulo e aditivo: cria uma nova tabela, novos componentes e se conecta ao fluxo existente via `feedback_id`.

### Arquitetura do Fluxo

```text
Fluxo Atual (mantido):
  /feedback-visita/:token --> FeedbackClientePublico.tsx --> submit_client_feedback RPC

Novo Fluxo (adicionado):
  Apos feedback enviado com interesse "muito_interessado" ou "interessado":
    --> Exibe botao "Formalizar Proposta de Compra"
    --> Abre ProposalForm inline (mesmo token)
    --> Dados salvos em propostas_compra (nova tabela)
    --> Notificacao no dashboard da imobiliaria

  Rota alternativa (link direto):
    /proposta/:token --> PropostaPage.tsx (formulario autonomo)
```

### Etapas de Implementacao

**Etapa 1 -- Banco de Dados**

Criar tabela `propostas_compra` com migration SQL:
- `id`, `feedback_id` (FK para `feedbacks_visitas`), `codigo` (unico)
- Dados do proponente: `nome_completo`, `cpf_cnpj`, `telefone`, `email`
- Dados do imovel: `endereco_resumido`, `unidade`, `matricula`
- Condicoes: `valor_ofertado`, `sinal_entrada`, `parcelas`, `financiamento`, `outras_condicoes`
- Aceite: `assinatura_proponente`, `cnh_url`, `validade_proposta`
- Controle: `status` (pendente/aceita/recusada/expirada), `construtora_id`, `imobiliaria_id`, `imovel_id`
- RLS: INSERT publico (sem auth, como leads), SELECT restrito a imobiliaria/construtora dona
- Criar bucket `documentos-proposta` (privado) para upload de CNH

**Etapa 2 -- RPC Segura**

Criar funcao `submit_proposta_compra` (SECURITY DEFINER) que:
- Valida o token do feedback
- Insere a proposta vinculada ao feedback
- Retorna o ID da proposta criada

**Etapa 3 -- Componentes Novos**

- `src/components/proposta/ProposalForm.tsx` -- Formulario completo com:
  - Identificacao do proponente (nome, CPF/CNPJ, telefone, email)
  - Identificacao do imovel (pre-preenchido do feedback)
  - Valor e condicoes (valor ofertado com mascara BRL, sinal, parcelas, financiamento)
  - Upload de CNH (`CNHUpload.tsx`)
  - Assinatura digital (reutiliza `SignaturePad` existente)
  - Clausula informativa de documento posterior

- `src/components/proposta/CNHUpload.tsx` -- Upload com preview (JPG/PNG/PDF, max 5MB)

- `src/components/ui/currency-input.tsx` -- Input com mascara R$ para valores monetarios

**Etapa 4 -- Integracao no Feedback Publico**

Modificar `FeedbackClientePublico.tsx`:
- Apos o envio do feedback com sucesso, se `interesse_compra` for "muito_interessado" ou "interessado":
  - Exibir secao com botao "Deseja formalizar uma proposta de compra?"
  - Ao clicar, renderizar `ProposalForm` inline com dados pre-preenchidos (nome, telefone, endereco do imovel)
- Se interesse for baixo/sem_interesse, manter fluxo atual sem alteracao

**Etapa 5 -- Pagina Publica de Proposta**

Criar `src/pages/proposta/PropostaPage.tsx` em rota `/proposta/:token`:
- Carrega dados do feedback pelo token
- Renderiza `ProposalForm` de forma autonoma
- Permite envio de proposta sem necessidade de refazer o feedback

**Etapa 6 -- Dashboard da Imobiliaria**

Modificar `src/pages/dashboard/imobiliaria/Feedbacks.tsx`:
- Adicionar aba "Propostas" no TabsList
- Listar propostas recebidas com status, valor, cliente
- Acoes: visualizar detalhes, aceitar/recusar proposta
- Badge de contagem de propostas pendentes

**Etapa 7 -- Rota no App.tsx**

Adicionar:
- `/proposta/:token` -- pagina publica de proposta autonoma

### Detalhes Tecnicos

**Tabela SQL `propostas_compra`:**
```text
- id UUID PK
- feedback_id UUID FK feedbacks_visitas(id)
- construtora_id UUID
- imobiliaria_id UUID
- imovel_id UUID
- codigo TEXT UNIQUE
- nome_completo TEXT NOT NULL
- cpf_cnpj TEXT NOT NULL
- telefone TEXT NOT NULL
- email TEXT
- endereco_resumido TEXT
- unidade TEXT
- matricula TEXT
- valor_ofertado NUMERIC
- moeda TEXT DEFAULT 'BRL'
- sinal_entrada TEXT
- parcelas TEXT
- financiamento TEXT
- outras_condicoes TEXT
- validade_proposta TIMESTAMPTZ
- forma_aceite TEXT DEFAULT 'assinatura'
- assinatura_proponente TEXT
- cnh_url TEXT
- status TEXT DEFAULT 'pendente'
- created_at TIMESTAMPTZ DEFAULT now()
- updated_at TIMESTAMPTZ DEFAULT now()
```

**RLS Policies:**
- INSERT: `WITH CHECK (true)` -- publico, como leads
- SELECT: restrito a `imobiliaria_id = get_imobiliaria_id(auth.uid())` OR `construtora_id = get_construtora_id(auth.uid())`
- UPDATE: restrito a imobiliaria/construtora dona (para aceitar/recusar)

**Dependencias:** Todas ja instaladas no projeto (react-hook-form, zod, react-signature-canvas, lucide-react, sonner, etc). Nenhuma nova dependencia necessaria.

**Arquivos novos (5):**
1. `src/components/proposta/ProposalForm.tsx`
2. `src/components/proposta/CNHUpload.tsx`
3. `src/components/ui/currency-input.tsx`
4. `src/pages/proposta/PropostaPage.tsx`
5. `src/types/proposta.ts`

**Arquivos modificados (2):**
1. `src/pages/feedback/FeedbackClientePublico.tsx` -- adicionar secao de proposta pos-feedback
2. `src/App.tsx` -- adicionar rota `/proposta/:token`

**Arquivos opcionalmente modificados (1):**
1. `src/pages/dashboard/imobiliaria/Feedbacks.tsx` -- adicionar aba Propostas

