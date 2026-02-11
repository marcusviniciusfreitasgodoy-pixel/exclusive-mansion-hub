

## Segundo Lembrete Automatico de Follow-up (48h)

### Situacao Atual

- Existe apenas 1 lembrete (24h) controlado pelas flags `followup_enviado_cliente` e `followup_enviado_corretor`
- Cliente recebe Email + WhatsApp; Corretor recebe apenas Email
- Apos o primeiro envio, as flags sao marcadas como `true` e nenhum outro lembrete e disparado

### Alteracoes Necessarias

#### 1. Migracao de Banco de Dados

Adicionar duas novas colunas na tabela `feedbacks_visitas`:

- `followup_2_enviado_cliente` (boolean, default false)
- `followup_2_enviado_corretor` (boolean, default false)

Essas colunas controlam o segundo lembrete de 48h, separado do primeiro de 24h.

#### 2. Edge Function `send-feedback-followup/index.ts`

Adicionar dois novos blocos de busca e envio apos os existentes:

**Cliente (48h) - Tom cordial:**
- Buscar feedbacks com `status = 'aguardando_cliente'`, `followup_enviado_cliente = true`, `followup_2_enviado_cliente = false`, e `created_at` menor que 48h atras
- Enviar Email com tom cordial: "Sabemos que a rotina e corrida... sua opiniao nos ajuda muito"
- Enviar WhatsApp com mensagem gentil
- Marcar `followup_2_enviado_cliente = true`

**Corretor (48h) - Tom urgente:**
- Buscar feedbacks com `status = 'aguardando_corretor'`, `followup_enviado_corretor = true`, `followup_2_enviado_corretor = false`, e `feedback_cliente_em` menor que 48h atras
- Enviar Email com tom mais urgente: destaque vermelho, "URGENTE", "O cliente ja avaliou ha mais de 48h"
- Enviar WhatsApp com mensagem de urgencia (novo - nao existia para corretor)
- Para o WhatsApp do corretor, buscar o telefone via join com a tabela de imobiliarias ou usar o campo `corretor_email` para localizar
- Marcar `followup_2_enviado_corretor = true`

**Nota sobre telefone do corretor:** O campo `corretor_telefone` nao existe na tabela `feedbacks_visitas`. Para enviar WhatsApp ao corretor, sera necessario adicionar uma coluna `corretor_telefone` na tabela ou buscar o telefone da imobiliaria associada. A abordagem mais simples e adicionar a coluna `corretor_telefone` na tabela.

#### 3. Resumo dos Arquivos

| Arquivo | Acao |
|---------|------|
| Migracao SQL | Adicionar 3 colunas: `followup_2_enviado_cliente`, `followup_2_enviado_corretor`, `corretor_telefone` |
| `supabase/functions/send-feedback-followup/index.ts` | Adicionar blocos 5 e 6 para segundo lembrete (48h) com tons diferenciados e WhatsApp para corretor |

Nenhuma alteracao no frontend e necessaria. O cron job existente (a cada 2h) ja cobrira os novos lembretes automaticamente.

