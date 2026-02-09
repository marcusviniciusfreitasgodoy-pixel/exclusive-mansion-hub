

## Adicionar Favicon Customizado para Construtora

### O que sera feito

Replicar a funcionalidade de upload de favicon que ja existe para imobiliarias, agora tambem para construtoras. Isso envolve uma alteracao no banco de dados e uma atualizacao na pagina de configuracoes.

### Alteracoes

#### 1. Banco de dados -- Adicionar coluna `favicon_url`

A tabela `construtoras` nao possui a coluna `favicon_url`. Sera criada uma migration para adiciona-la:

```sql
ALTER TABLE public.construtoras ADD COLUMN favicon_url text;
```

#### 2. Pagina de Configuracoes da Construtora (`src/pages/dashboard/construtora/Configuracoes.tsx`)

- Importar o componente `FaviconUpload` (ja existente em `src/components/dashboard/FaviconUpload.tsx`)
- Adicionar estado `faviconUrl` (igual ao padrao da imobiliaria)
- Carregar o valor de `favicon_url` no `useEffect` ao receber dados da construtora
- Adicionar um novo `Card` de "Favicon" logo abaixo do card de Logo, contendo o componente `FaviconUpload`
- Incluir `favicon_url: faviconUrl` no objeto de update enviado ao banco na funcao `onSubmit`

O componente `FaviconUpload` ja lida com upload para o bucket `logos`, validacao de formato (ICO, PNG, SVG, WebP) e limite de 256KB -- nenhuma alteracao necessaria nele.

### Arquivos modificados
- **Migration SQL** -- nova coluna `favicon_url` na tabela `construtoras`
- **`src/pages/dashboard/construtora/Configuracoes.tsx`** -- importar FaviconUpload, adicionar estado, card e salvar no update

Nenhum arquivo novo. Nenhuma dependencia adicional.
