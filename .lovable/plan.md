

## Adaptar o Sistema para Corretor Autonomo e Imobiliaria

### Contexto
Atualmente o sistema usa o termo "Imobiliaria" em todas as telas (cadastro, sidebar, configuracoes). Um corretor autonomo tambem precisa usar o sistema, mas com terminologia e experiencia adaptadas.

### Abordagem
A estrategia mais simples e eficiente: reutilizar a mesma tabela `imobiliarias` adicionando um campo `tipo` para diferenciar. Um corretor autonomo e, na pratica, uma "imobiliaria de um" -- usa as mesmas funcionalidades (links, leads, pipeline, agendamentos). A diferenca e apenas na experiencia visual e nos labels.

### O que sera feito

**1. Nova coluna no banco de dados**

Adicionar `tipo` na tabela `imobiliarias` com valores `'imobiliaria'` ou `'corretor_autonomo'`, default `'imobiliaria'` para manter compatibilidade com dados existentes.

**2. Tela de Cadastro (RegisterImobiliaria.tsx)**

- Adicionar um seletor no topo: "Sou Imobiliaria" / "Sou Corretor Autonomo"
- Labels adaptaveis conforme selecao:
  - Imobiliaria: "Nome da Imobiliaria", "CRECI da Imobiliaria"
  - Corretor: "Nome Completo", "CRECI"
- O campo `tipo` sera enviado junto com o cadastro

**3. Tela de Login (Login.tsx)**

- Link de registro: trocar "Sou Imobiliaria" por "Sou Imobiliaria / Corretor" ou adicionar uma terceira opcao

**4. Sidebar (DashboardSidebar.tsx)**

- O label do grupo muda conforme o tipo:
  - `imobiliaria` -> "Imobiliaria"
  - `corretor_autonomo` -> "Corretor"
- Para corretor autonomo, o link "Corretores" no menu de configuracoes pode ser ocultado ou mantido (para cadastrar assistentes)

**5. Configuracoes (Configuracoes.tsx)**

- Labels adaptativos:
  - "Nome da Imobiliaria" / "Seu Nome Profissional"
  - "Logo da Imobiliaria" / "Sua Logo"

**6. AuthContext**

- Expor o `tipo` da imobiliaria no contexto para uso em toda a aplicacao
- Tipo disponivel via `imobiliaria.tipo`

**7. Edge function signup-user**

- Aceitar o campo `tipo` no payload e gravar na tabela `imobiliarias`

### Secao tecnica

**Migracao SQL:**
```sql
ALTER TABLE public.imobiliarias 
ADD COLUMN tipo text NOT NULL DEFAULT 'imobiliaria' 
CHECK (tipo IN ('imobiliaria', 'corretor_autonomo'));
```

**Arquivos modificados:**
- `supabase/functions/signup-user/index.ts` -- aceitar campo `tipo`
- `src/pages/auth/RegisterImobiliaria.tsx` -- seletor de tipo + labels dinamicos
- `src/pages/auth/Login.tsx` -- ajustar texto do link de registro
- `src/components/dashboard/DashboardSidebar.tsx` -- label do grupo dinamico
- `src/pages/dashboard/imobiliaria/Configuracoes.tsx` -- labels adaptativos
- `src/types/database.ts` -- adicionar `tipo` ao type `Imobiliaria`

**Logica de labels (helper reutilizavel):**
```typescript
const isCorretor = imobiliaria?.tipo === 'corretor_autonomo';
const labelEmpresa = isCorretor ? 'Seu Nome Profissional' : 'Nome da Imobiliária';
```

Nenhuma alteracao de rotas, tabelas adicionais ou fluxos de autenticacao -- apenas adaptacao de labels e um novo campo na tabela existente.
