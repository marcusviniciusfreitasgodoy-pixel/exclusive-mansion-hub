

# Ajustes no Agendamento de Visitas e Feedback

## Resumo das Alteracoes

### 1. Agendamento - Permitir Domingos
Remover o bloqueio de domingos no calendario do modal de agendamento.

### 2. Agendamento - Intervalos de 1h30
Alterar os horarios disponiveis de intervalos de 30 minutos para intervalos de 1 hora e 30 minutos:
- Horarios: 09:00, 10:30, 12:00, 13:30, 15:00, 16:30, 18:00

### 3. Agendamento - Notificacoes WhatsApp
Atualmente, ao agendar uma visita, o sistema envia e-mails para cliente, imobiliaria e construtora. A edge function `send-visit-notification` ja gera links wa.me nos e-mails, mas nao envia mensagens diretas pelo WhatsApp.

Adicionar envio de notificacao WhatsApp (via link wa.me ou API oficial, conforme configuracao da imobiliaria) para todos os envolvidos ao criar o agendamento:
- Cliente: mensagem confirmando a visita
- Imobiliaria: mensagem notificando nova solicitacao
- Construtora: mensagem informativa

Implementacao: Usar o hook `useWhatsApp` existente no frontend apos o agendamento ser criado, ou adicionar logica na edge function `send-visit-notification` para gerar e registrar as mensagens WhatsApp.

### 4. Feedback Cliente - Novas Perguntas
Alterar o formulario do cliente (`FeedbackClientePublico.tsx`) para incluir:

**a) Prazo de compra** (novo campo no formulario do cliente, atualmente so existe no formulario do corretor):
- Opcoes: 0-3 meses / 3-6 meses / 6-12 meses / +12 meses / Indefinido

**b) Interesse em fazer proposta** (reformular o campo "interesse_compra" existente):
- Pergunta: "Tem interesse em fazer uma proposta?"
- Se resposta for negativa ("pouco_interessado" ou "sem_interesse"), pedir gentilmente que justifique com as opcoes de objecoes ja existentes (preco, localizacao, tamanho, etc.)
- Isso ja existe parcialmente - ajustar o texto para ser mais direto e gentil

**c) Orcamento disponivel e forma de pagamento** (novos campos no formulario do cliente):
- Campo numerico para orcamento
- Campo texto para forma de pagamento preferida (financiamento, a vista, consorcio, etc.)

**d) Comentarios livres e proximos passos** (ajustar campos existentes):
- Renomear/reorganizar "sugestoes" para "Comentarios livres"
- Adicionar campo "Proximos passos" para o cliente indicar o que deseja como proximo passo

### 5. Feedback - Disparo e Follow-up

**Momento atual do disparo:**
O feedback e solicitado quando a imobiliaria marca a visita como "realizada" no painel de agendamentos. Nesse momento:
1. Status do agendamento muda para "realizado"
2. Um registro de feedback e criado com status "aguardando_cliente"
3. Um e-mail e enviado ao cliente com link para avaliar

**O corretor da seu feedback** somente apos o cliente responder (status muda para "aguardando_corretor"). O corretor ve a notificacao no dashboard de feedbacks e completa com dados de qualificacao.

**Follow-up automatico em 24h (NOVO):**
Atualmente NAO existe follow-up se o cliente ou corretor nao responder. Implementar:
- Criar edge function `send-feedback-followup` que verifica feedbacks com status "aguardando_cliente" ou "aguardando_corretor" criados ha mais de 24 horas sem resposta
- Enviar e-mail de lembrete para quem nao respondeu
- Enviar WhatsApp de lembrete (via wa.me link)
- Agendar via pg_cron a cada 2 horas
- Marcar flag `followup_enviado_cliente` / `followup_enviado_corretor` para nao repetir

### 6. Notificacoes WhatsApp no Feedback
Alem do e-mail, enviar WhatsApp quando:
- O feedback e solicitado ao cliente (apos visita "realizada")
- O follow-up de 24h e disparado

---

## Detalhes Tecnicos

### Arquivos a modificar

1. **`src/components/property/AgendarVisitaModal.tsx`**
   - Remover bloqueio de domingos (linha 134)
   - Alterar array `HORARIOS_DISPONIVEIS` para intervalos de 1h30
   - Apos submit bem-sucedido, enviar WhatsApp para o cliente via `useWhatsApp`

2. **`src/pages/feedback/FeedbackClientePublico.tsx`**
   - Adicionar campos: prazo_compra, orcamento_disponivel, forma_pagamento
   - Reformular secao de interesse com texto mais gentil
   - Reorganizar campos textuais (comentarios livres + proximos passos)
   - Atualizar schema zod com novos campos
   - Atualizar o submit para salvar os novos campos

3. **`supabase/functions/send-visit-notification/index.ts`**
   - Adicionar envio de WhatsApp (registrar na tabela whatsapp_messages) para cliente, imobiliaria e construtora

4. **`supabase/functions/send-feedback-request/index.ts`**
   - Adicionar envio de WhatsApp para o cliente junto com o e-mail

### Arquivos a criar

5. **`supabase/functions/send-feedback-followup/index.ts`**
   - Nova edge function que busca feedbacks pendentes ha mais de 24h
   - Envia e-mail + WhatsApp de lembrete
   - Marca flags de followup enviado

### Migracao SQL

6. Adicionar colunas na tabela `feedbacks_visitas`:
   - `followup_enviado_cliente` (boolean, default false)
   - `followup_enviado_corretor` (boolean, default false)
   - `prazo_compra_cliente` (text, nullable) - para separar do campo do corretor
   - `orcamento_cliente` (numeric, nullable)
   - `forma_pagamento_cliente` (text, nullable)
   - `proximos_passos_cliente` (text, nullable)

7. Configurar cron job para `send-feedback-followup` (a cada 2 horas)

8. Registrar a nova funcao em `supabase/config.toml`

