

## Plano: Protecao contra Brute Force em OTP/MFA

### Problema

As telas de verificacao MFA (`MFAVerify.tsx`) e ativacao (`MFASetup.tsx`) permitem tentativas ilimitadas de codigo OTP no lado do cliente. Um atacante pode tentar codigos repetidamente sem nenhum bloqueio visual ou atraso.

### Solucao

Adicionar protecao client-side em camadas:

1. **Contador de tentativas com lockout temporario** -- Apos 5 tentativas falhas, bloquear o formulario por 60 segundos (com timer regressivo visivel)
2. **Delay progressivo** -- Cada tentativa falha adiciona um delay crescente antes de permitir nova tentativa (1s, 2s, 4s...)
3. **Logout automatico** -- Apos 10 tentativas falhas totais, fazer logout e redirecionar para login

### Etapas

**Etapa 1 -- Criar hook `useOTPBruteForceProtection`**

Novo arquivo: `src/hooks/useOTPBruteForceProtection.ts`

Funcionalidades:
- Rastreia numero de tentativas falhas
- Calcula tempo de lockout (60s apos 5 falhas, 120s apos 10)
- Exibe timer regressivo durante lockout
- Retorna `{ isLocked, remainingSeconds, failedAttempts, registerFailedAttempt, reset }`
- Persiste contagem em `sessionStorage` para evitar bypass por refresh

**Etapa 2 -- Aplicar protecao em `MFAVerify.tsx`**

Modificar a pagina de verificacao no login:
- Integrar o hook de protecao
- Desabilitar o botao "Verificar" e o input durante lockout
- Mostrar mensagem com timer regressivo: "Muitas tentativas. Tente novamente em XXs"
- Apos 10 tentativas falhas, fazer logout automatico com toast explicativo
- Limpar contagem apos verificacao bem-sucedida

**Etapa 3 -- Aplicar protecao em `MFASetup.tsx`**

Modificar o componente de ativacao:
- Mesma logica de lockout na etapa de confirmacao do codigo
- Desabilitar input e botao durante lockout
- Limpar contagem apos ativacao bem-sucedida

### Detalhes Tecnicos

**Arquivos novos:**
- `src/hooks/useOTPBruteForceProtection.ts`

**Arquivos modificados:**
- `src/pages/auth/MFAVerify.tsx` -- Integrar hook + UI de lockout
- `src/components/mfa/MFASetup.tsx` -- Integrar hook + UI de lockout

**Nenhuma migracao SQL necessaria** -- protecao puramente client-side complementando o rate limiting server-side do Supabase Auth.

**Logica do hook:**

```text
tentativas 1-4: delay progressivo (1s, 2s, 4s, 8s)
tentativas 5-9: lockout de 60 segundos
tentativas 10+: logout automatico
```

