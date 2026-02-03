
## O que o log mostrou (causa do erro)
O erro de cadastro **não foi RLS** desta vez. O log da função `signup-user` mostra claramente:

- **Erro 422 / code: `email_exists`**
- Mensagem: **“A user with this email address has already been registered”**

Ou seja: o usuário tentou cadastrar uma construtora com um **e-mail que já existe** no sistema (no seu print aparece `marcus@godoyprime.com.br`, que já foi usado antes).

O motivo de você ver apenas “Erro ao criar conta” (genérico) é que hoje o front não está conseguindo **extrair e exibir** a mensagem detalhada retornada pela função quando ela responde com status HTTP de erro.

---

## Objetivo da correção
1. **Continuar bloqueando cadastros com e-mail já existente** (correto).
2. Exibir para o usuário uma mensagem clara:  
   - “Este e-mail já está cadastrado. Faça login ou recupere sua senha.”
3. Fazer o mesmo para outros casos comuns:
   - CNPJ já cadastrado
   - Erros de validação (senha curta, e-mail inválido etc.)

---

## Mudanças planejadas (sem alterar regras de negócio)
### 1) Ajustar a função `supabase/functions/signup-user/index.ts`
**Problema atual:** quando a função retorna HTTP 409/400, o `supabase.functions.invoke` tende a preencher `response.error` e o front perde o payload amigável.

**Solução:** padronizar a resposta do endpoint para **sempre retornar HTTP 200** quando for erro “controlado” (erros esperados de negócio/validação), com um payload consistente, por exemplo:
```ts
{ success: false, code: "email_exists", message: "Este e-mail já está cadastrado" }
```
E reservar HTTP 500 apenas para falhas realmente inesperadas.

Isso garante que o front sempre receba `response.data` e consiga mostrar a mensagem correta.

**Códigos que vamos padronizar:**
- `email_exists`
- `cnpj_exists`
- `validation_error`
- `internal_error`

### 2) Ajustar `src/contexts/AuthContext.tsx` (função `signUp`)
- Ler `response.data` e checar `success`.
- Se `success === false`, retornar `new Error(message)` (ou retornar também `code` se quisermos mostrar ações específicas).

### 3) Ajustar `src/pages/auth/RegisterConstrutora.tsx`
- Atualizar a lógica que hoje só detecta `already registered` para também lidar com:
  - mensagem em PT (“já está cadastrado”)
  - `code: email_exists` (se decidirmos passar o code para o front)
- Melhorar UX do erro:
  - Se for e-mail existente: sugerir **Login** e (opcional) link “Esqueci minha senha”.

---

## Como vou validar (checklist rápido)
1. Tentar cadastrar com um e-mail já usado → deve aparecer “Este e-mail já está cadastrado…”.
2. Tentar cadastrar com um e-mail novo e CNPJ novo → deve cadastrar e redirecionar para `/auth/login`.
3. Tentar cadastrar com CNPJ repetido → deve aparecer “Este CNPJ já está cadastrado”.
4. Verificar logs da função para confirmar que erros controlados não estão “estourando” como erro genérico no client.

---

## Observação importante para você (operacional)
Para testar “cadastro funcionando” sem confundir com `email_exists`, use sempre:
- **um e-mail novo** (nunca usado) e
- **um CNPJ novo** (nunca usado)

Se você repetir qualquer um dos dois, o sistema deve mesmo bloquear — a correção aqui é principalmente de **mensagem e tratamento** no front.

---

## Arquivos que serão alterados
- `supabase/functions/signup-user/index.ts`
- `src/contexts/AuthContext.tsx`
- `src/pages/auth/RegisterConstrutora.tsx`

