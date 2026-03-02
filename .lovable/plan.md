
## Criar usuario admin diretamente no banco

### Abordagem

Vou criar uma edge function temporaria `create-admin-user` que usa a API administrativa para criar o usuario `dev@godoyrealty.com` com senha, perfil de construtora e role `admin`. Depois de executada com sucesso, a funcao pode ser removida.

### Passos

1. **Criar edge function `create-admin-user`**
   - Usa `supabase.auth.admin.createUser()` com `email_confirm: true` (ja confirmado, sem necessidade de verificar e-mail)
   - Insere role `admin` na tabela `user_roles`
   - Insere role `construtora` na tabela `user_roles` (para o sidebar funcionar corretamente com os menus de construtora)
   - Cria perfil na tabela `construtoras` com nome "Godoy Realty" e CNPJ placeholder

2. **Invocar a funcao uma vez para criar o usuario**

3. **Remover a edge function apos uso** (por seguranca)

### Detalhes tecnicos

A funcao tera uma senha fixa que voce devera alterar apos o primeiro login. A senha inicial sera informada no chat para voce anotar.

O usuario tera duas roles: `admin` (para acesso administrativo) e `construtora` (para que o sidebar exiba os menus corretos, ja que o `AuthContext` usa a role para decidir quais links mostrar).

### Seguranca

- A edge function sera protegida por verificacao de service role key
- Sera removida imediatamente apos o uso
- A senha devera ser alterada no primeiro acesso
