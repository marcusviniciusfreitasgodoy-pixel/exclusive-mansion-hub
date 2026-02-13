

## Plano: Desabilitar Signup Publico do Auth

### Problema

O endpoint padrao `/auth/v1/signup` do Supabase Auth esta aberto, permitindo criacao de contas sem passar pela edge function customizada `signup-user`. Isso significa que um atacante pode criar contas diretamente via API, sem fornecer CNPJ, CRECI ou qualquer dado de perfil obrigatorio.

### Por que e seguro desabilitar

O projeto ja usa `supabaseAdmin.auth.admin.createUser()` na edge function `signup-user` (linha 154). Essa chamada utiliza a **service role key** e funciona independentemente da configuracao de signup publico. Portanto, desabilitar o signup publico **nao quebra nada** -- apenas bloqueia o endpoint padrao que nao deveria estar sendo usado.

### Correcao

**Etapa unica -- Desabilitar signup publico via configure-auth**

Usar a ferramenta de configuracao de autenticacao para definir `disable_signup = true`. Isso bloqueia o endpoint `/auth/v1/signup` enquanto mantem o `admin.createUser()` da edge function funcionando normalmente.

### Verificacao

Apos a correcao:
- Cadastro via formularios do app (RegisterConstrutora / RegisterImobiliaria) continua funcionando normalmente (usa edge function)
- Chamadas diretas a `/auth/v1/signup` retornam erro
- Login, reset de senha e MFA nao sao afetados

### Detalhes Tecnicos

**Nenhum arquivo modificado** -- apenas configuracao de autenticacao.

**Nenhuma migracao SQL necessaria.**

