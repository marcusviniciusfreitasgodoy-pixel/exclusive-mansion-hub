

# Formulario de Agendamento Funcional + WhatsApp Direto

## Problema
O formulario da pagina `/apresentacao` apenas simula o envio (usa um `setTimeout`). Nenhum e-mail e realmente enviado. Alem disso, nao ha botao de WhatsApp direto na pagina.

## Solucao

### 1. Criar edge function `send-demo-request` 
Nova funcao em `supabase/functions/send-demo-request/index.ts` que:
- Recebe os dados do formulario (nome, empresa, email, telefone, mensagem)
- Envia e-mail para a Godoy Prime (`contato@godoyprime.com.br`) notificando a solicitacao
- Envia e-mail de confirmacao para quem preencheu o formulario (copia para o solicitante)
- Usa Resend com o dominio ja verificado `godoyprime.com.br`
- Inclui rate limiting e validacao de inputs

### 2. Atualizar `src/pages/Apresentacao.tsx`
- Substituir o `setTimeout` simulado por chamada real ao edge function `send-demo-request`
- Adicionar botao flutuante de WhatsApp direto para o numero `5521964075124` com mensagem padrao "Ola! Gostaria de agendar uma demonstracao da plataforma Godoy Prime."
- Importar e usar o componente `FloatingWhatsApp` ja existente no projeto

### 3. Tabela no banco (opcional mas recomendado)
Criar tabela `demo_requests` para registrar as solicitacoes de demonstracao:
- id, nome, empresa, email, telefone, mensagem, created_at
- Sem RLS (pagina publica, funcao usa service role)

## Detalhes tecnicos

### Edge function `send-demo-request`
- Remetente: `Contato <noreply@godoyprime.com.br>`
- Destinatario 1: `contato@godoyprime.com.br` (notificacao interna)
- Destinatario 2: e-mail do solicitante (confirmacao)
- Rate limit: 3 solicitacoes por IP a cada 10 minutos
- Validacoes: email valido, campos obrigatorios, tamanho maximo

### Pagina Apresentacao
- `handleSubmit` chama `supabase.functions.invoke("send-demo-request", { body: form })`
- Componente `FloatingWhatsApp` adicionado com `phoneNumber="5521964075124"` e `message="Ola! Gostaria de agendar uma demonstracao da plataforma Godoy Prime."`

### Arquivos a criar
- `supabase/functions/send-demo-request/index.ts`

### Arquivos a modificar
- `src/pages/Apresentacao.tsx` (chamada real + WhatsApp flutuante)

### Migracao SQL
- Criar tabela `demo_requests` para historico das solicitacoes
