
# Plano: Alterar Rota Raiz para Login

## Resumo
Modificar a rota raiz (`/`) para exibir a página de login diretamente, em vez de redirecionar para `/empreendimentos`.

## Alteração

### Arquivo: `src/App.tsx`

**Linha 93 - Antes:**
```tsx
<Route path="/" element={<Navigate to="/empreendimentos" replace />} />
```

**Depois:**
```tsx
<Route path="/" element={<Login />} />
```

## Detalhes Técnicos
- O componente `Login` já está importado de forma eager (carregamento imediato) na linha 14
- A página de empreendimentos continuará acessível via `/empreendimentos`
- Usuários já autenticados serão redirecionados automaticamente para seus dashboards ao acessar `/` (comportamento do AuthContext)
