

## Cadastro de Corretores da Imobiliaria

### Objetivo
Criar uma seção completa de cadastro de corretores vinculados à imobiliária, com os campos: Nome Completo, WhatsApp, E-mail e CRECI. Os corretores cadastrados ficam disponíveis para serem associados aos imóveis.

### O que será feito

**1. Nova tabela no banco de dados: `corretores`**

| Coluna | Tipo | Obrigatório |
|---|---|---|
| id | uuid (PK) | sim |
| imobiliaria_id | uuid (FK -> imobiliarias) | sim |
| nome_completo | text | sim |
| whatsapp | text | não |
| email | text | não |
| creci | text | não |
| foto_url | text | não |
| cargo | text | não |
| mini_bio | text | não |
| ativo | boolean (default true) | sim |
| created_at | timestamptz | sim |

- RLS habilitado: apenas o usuário dono da imobiliária pode ler/criar/editar/excluir seus corretores.

**2. Nova página/seção em Configurações**

Na página de configurações da imobiliária (`/dashboard/imobiliaria/configuracoes`), será adicionado um card "Corretores" com link para uma sub-rota `/dashboard/imobiliaria/configuracoes/corretores`, contendo:

- Lista dos corretores cadastrados (nome, WhatsApp, email, CRECI, status ativo/inativo)
- Botão "Adicionar Corretor" que abre um modal/dialog com formulário
- Ações de editar e excluir em cada corretor
- Validação de campos (nome obrigatório, email válido, formato WhatsApp)

**3. Componentes criados**

- `src/pages/dashboard/imobiliaria/Corretores.tsx` -- página de listagem e gestão
- `src/components/corretores/CorretorFormModal.tsx` -- modal com formulário de criação/edição
- Rota adicionada em `App.tsx`

**4. Link na página de Configurações**

Um novo card será adicionado na seção "Configurações Avançadas", ao lado do link existente de "Formulários Customizáveis", levando à nova página de corretores.

### Seção técnica

- Migração SQL: `CREATE TABLE corretores` com `ENABLE ROW LEVEL SECURITY` e policies para SELECT/INSERT/UPDATE/DELETE baseadas em `auth.uid()` via join com `imobiliarias.user_id`
- Query com `@tanstack/react-query` para CRUD dos corretores
- Formulário com `react-hook-form` + `zod` seguindo o padrão já usado na página de configurações
- Componentes UI existentes: `Dialog`, `Table`, `Button`, `Input`, `Switch` (para ativo/inativo), `Badge`

