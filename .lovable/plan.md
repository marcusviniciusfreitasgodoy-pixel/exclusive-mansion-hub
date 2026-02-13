

## Plano: Implementar MFA/2FA Opcional com TOTP

### Visao Geral

Adicionar autenticacao de dois fatores (2FA) opcional usando TOTP (Google Authenticator, Authy, etc.) para usuarios com role `construtora` e `admin`. O recurso sera opcional -- o usuario ativa nas configuracoes e, a partir dai, o login exige o codigo TOTP alem da senha.

### Arquitetura

O Supabase Auth ja possui suporte nativo a MFA/TOTP via as APIs `auth.mfa.enroll()`, `auth.mfa.challenge()` e `auth.mfa.verify()`. Nao e necessario criar tabelas extras -- o estado dos fatores fica gerenciado internamente pelo Supabase Auth.

O fluxo se divide em duas partes:

**1. Ativacao (Configuracoes)**
- Usuario acessa a pagina de configuracoes
- Clica em "Ativar 2FA"
- Sistema gera QR Code via `supabase.auth.mfa.enroll({ factorType: 'totp' })`
- Usuario escaneia com o app autenticador
- Usuario digita o codigo de 6 digitos para confirmar
- Sistema verifica via `supabase.auth.mfa.challengeAndVerify()`
- Fator fica ativo

**2. Verificacao (Login)**
- Usuario faz login normalmente com email/senha
- Sistema verifica o AAL (Assurance Level) da sessao
- Se o usuario tem fator TOTP ativo mas AAL e `aal1`, redireciona para tela de verificacao
- Usuario digita o codigo de 6 digitos
- Sistema verifica via `supabase.auth.mfa.challenge()` + `supabase.auth.mfa.verify()`
- Sessao sobe para `aal2`, usuario segue para o dashboard

### Etapas de Implementacao

**Etapa 1 -- Pagina de verificacao TOTP no login**

Criar `src/pages/auth/MFAVerify.tsx`:
- Input de 6 digitos usando o componente `InputOTP` ja existente
- Ao submeter, chama `supabase.auth.mfa.challenge()` e depois `supabase.auth.mfa.verify()`
- Botao de "Voltar" que faz logout
- Visual consistente com a pagina de login (mesma imagem de fundo, logo)

**Etapa 2 -- Atualizar fluxo de login para detectar MFA**

Modificar `src/contexts/AuthContext.tsx`:
- Adicionar estado `mfaRequired: boolean` ao contexto
- Apos login com sucesso, verificar `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`
- Se `currentLevel === 'aal1'` e `nextLevel === 'aal2'`, setar `mfaRequired = true`
- Expor funcao `completeMFA()` que limpa o flag apos verificacao

Modificar `src/pages/auth/Login.tsx`:
- Apos login bem-sucedido, se `mfaRequired === true`, redirecionar para `/auth/mfa-verify` em vez do dashboard

**Etapa 3 -- Proteger rotas com verificacao de AAL**

Modificar `src/components/auth/ProtectedRoute.tsx`:
- Verificar se o usuario tem MFA ativo mas sessao `aal1`
- Se sim, redirecionar para `/auth/mfa-verify`

**Etapa 4 -- Componente de ativacao/desativacao do MFA**

Criar `src/components/mfa/MFASetup.tsx`:
- Mostra status atual (ativo/inativo)
- Botao "Ativar 2FA" que chama `supabase.auth.mfa.enroll({ factorType: 'totp' })`
- Exibe QR Code retornado pela API (campo `totp.qr_code` -- ja vem como data URI SVG)
- Exibe o secret em texto para entrada manual
- Input de 6 digitos para confirmar a ativacao
- Botao "Desativar 2FA" que chama `supabase.auth.mfa.unenroll({ factorId })`

**Etapa 5 -- Integrar nas paginas de configuracoes**

Adicionar o componente `MFASetup` como um novo Card em:
- `src/pages/dashboard/construtora/Configuracoes.tsx`
- (Futuramente em admin, quando a pagina de configuracoes admin existir)

**Etapa 6 -- Rota no App.tsx**

Adicionar rota `/auth/mfa-verify` apontando para `MFAVerify.tsx` (sem ProtectedRoute, pois o usuario esta parcialmente autenticado).

### Detalhes Tecnicos

**APIs Supabase utilizadas (todas nativas, sem tabelas extras):**

```text
supabase.auth.mfa.enroll({ factorType: 'totp' })
supabase.auth.mfa.challenge({ factorId })
supabase.auth.mfa.verify({ factorId, challengeId, code })
supabase.auth.mfa.unenroll({ factorId })
supabase.auth.mfa.getAuthenticatorAssuranceLevel()
supabase.auth.mfa.listFactors()
```

**Arquivos novos:**
- `src/pages/auth/MFAVerify.tsx` -- Pagina de verificacao do codigo TOTP
- `src/components/mfa/MFASetup.tsx` -- Componente de ativacao/desativacao

**Arquivos modificados:**
- `src/contexts/AuthContext.tsx` -- Adicionar deteccao de MFA pendente
- `src/components/auth/ProtectedRoute.tsx` -- Verificar AAL antes de liberar acesso
- `src/pages/auth/Login.tsx` -- Redirecionar para MFA quando necessario
- `src/pages/dashboard/construtora/Configuracoes.tsx` -- Adicionar card de MFA
- `src/App.tsx` -- Adicionar rota `/auth/mfa-verify`

**Nenhuma migracao SQL necessaria** -- o Supabase Auth gerencia os fatores internamente.

### Experiencia do Usuario

1. **Ativacao**: Configuracoes -> Card "Autenticacao em Dois Fatores" -> "Ativar" -> QR Code -> Digitar codigo -> Confirmado
2. **Login com MFA**: Email + Senha -> Tela de codigo TOTP -> Dashboard
3. **Desativacao**: Configuracoes -> "Desativar 2FA" -> Confirmacao -> Removido

