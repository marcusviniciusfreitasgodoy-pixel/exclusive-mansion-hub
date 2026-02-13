

## Plano: Protecao contra Abuso de Reset de Senha

### Problema Identificado

A pagina `ForgotPassword.tsx` permite enviar solicitacoes ilimitadas de reset de senha sem nenhum controle client-side. Um atacante pode:

1. **Flood de e-mails**: Enviar centenas de e-mails de reset para um mesmo usuario, causando spam na caixa de entrada
2. **Enumeracao de e-mails**: Testar e-mails em massa para descobrir quais estao cadastrados (embora o Supabase retorne sucesso para ambos os casos por padrao)
3. **Abuso de recursos**: Sobrecarregar o servico de e-mail do projeto

### Protecoes Existentes

- O Supabase tem rate limiting nativo no endpoint `/auth/v1/recover` (padrao: 60 req/hora por IP)
- A resposta generica ("E-mail enviado") nao revela se o e-mail existe -- isso ja esta correto

### Correcoes Planejadas

**Etapa 1 -- Rate limiting client-side no ForgotPassword**

Adicionar controles diretamente em `src/pages/auth/ForgotPassword.tsx`:

- **Cooldown de 60 segundos** entre solicitacoes: apos enviar um reset, o botao fica desabilitado com timer regressivo
- **Limite de 3 tentativas por sessao**: apos 3 envios, bloquear por 5 minutos com mensagem explicativa
- Persistir contagem em `sessionStorage` para evitar bypass via refresh
- Desabilitar o botao "Enviar para outro e-mail" durante o cooldown

**Etapa 2 -- Fortalecer validacao na ResetPassword**

Melhorias em `src/pages/auth/ResetPassword.tsx`:

- Politica de senha mais forte: minimo 8 caracteres, exigir pelo menos 1 numero e 1 letra maiuscula
- Fazer sign-out apos atualizar a senha (forcar re-autenticacao limpa)
- Limpar a sessao antes do redirect ao login

**Etapa 3 -- Rate limiting no Login (bonus)**

Adicionar protecao similar em `src/pages/auth/Login.tsx`:

- Lockout progressivo apos 5 tentativas falhas de login (30s, 60s, 120s)
- Persistir em `sessionStorage`
- Reutilizar o padrao do hook `useOTPBruteForceProtection` adaptado

### Detalhes Tecnicos

**Arquivos modificados:**
- `src/pages/auth/ForgotPassword.tsx` -- Cooldown de 60s + limite de 3 tentativas/sessao
- `src/pages/auth/ResetPassword.tsx` -- Politica de senha forte + sign-out pos-reset

**Nenhum arquivo novo necessario** -- a logica de rate limiting sera implementada inline com `sessionStorage` e `useState`/`useEffect`, seguindo o mesmo padrao do hook OTP existente.

**Nenhuma migracao SQL necessaria.**

### Logica do Rate Limiting (ForgotPassword)

```text
Envio 1: Sucesso + cooldown 60s (botao desabilitado com timer)
Envio 2: Sucesso + cooldown 60s
Envio 3: Sucesso + bloqueio de 5 minutos
Apos 5 min: Contador reseta, permite novas tentativas
```

### Politica de Senha (ResetPassword)

```text
Atual:  min 6 caracteres
Nova:   min 8 caracteres + 1 maiuscula + 1 numero
```

