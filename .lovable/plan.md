
## Adicionar link Admin no menu lateral

### O que sera feito
Adicionar um item "Gerenciar Usuarios" no menu lateral do dashboard, visivel apenas quando o usuario logado for o desenvolvedor (`dev@godoyrealty.com`).

### Alteracao

**Arquivo:** `src/components/dashboard/DashboardSidebar.tsx`

1. Importar o icone `Shield` do lucide-react
2. Obter o `user` do hook `useAuth()` (ja disponivel no contexto)
3. Adicionar uma secao condicional no sidebar (antes do grupo Apresentacao/Manual) que renderiza o link `/admin/usuarios` apenas quando `user?.email === 'dev@godoyrealty.com'`

O link tera:
- Icone: Shield
- Titulo: "Gerenciar Usuarios"
- Label do grupo: "Administracao"
- URL: `/admin/usuarios`

### Detalhes tecnicos
- A verificacao de e-mail segue o mesmo padrao ja usado em `GerenciarUsuarios.tsx` (constante `DEVELOPER_EMAIL`)
- O link usara o componente `Link` do react-router (navegacao interna, sem abrir em nova aba)
- Nenhuma alteracao de banco de dados ou RLS necessaria
