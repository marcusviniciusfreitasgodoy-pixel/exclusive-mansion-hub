
## Link Direto da Construtora (sem imobiliaria parceira)

### Resumo

Permitir que a construtora gere um link publico do imovel usando seu proprio branding (logo, cores, favicon), sem depender de uma imobiliaria intermediaria. O visitante vera a pagina com a marca da construtora.

### Alteracoes Necessarias

#### 1. Banco de dados

**Tornar `imobiliaria_id` nullable na tabela `imobiliaria_imovel_access`:**

```sql
ALTER TABLE public.imobiliaria_imovel_access 
  ALTER COLUMN imobiliaria_id DROP NOT NULL;
```

Quando `imobiliaria_id` for NULL, o registro representa um link direto da construtora. O `url_slug` continua funcionando normalmente.

**Atualizar RLS:** Adicionar policy para que a construtora consiga inserir registros com `imobiliaria_id = NULL` (a policy existente ja cobre isso via `user_owns_imovel`).

#### 2. Hook `usePropertyPage.ts` -- Suportar branding da construtora

Quando o access record nao tiver `imobiliaria_id` (link direto), o branding sera montado a partir dos dados da construtora ao inves da imobiliaria:

- `imobiliariaLogo` = construtora.logo_url
- `imobiliariaNome` = construtora.nome_empresa
- `corPrimaria` = construtora.cor_primaria
- `telefone` = construtora.telefone
- `faviconUrl` = construtora.favicon_url
- `imobiliariaId` = "" (vazio, sem imobiliaria)

Tambem ajustar a query do Supabase para incluir `cor_primaria`, `cor_secundaria`, `telefone`, `email_contato`, `favicon_url` no select de `construtoras`.

#### 3. Dashboard da Construtora -- Botao "Gerar Link Direto"

**`src/pages/dashboard/construtora/index.tsx`:**
- Na funcao `copyLink`, quando nao houver access slug de imobiliaria, oferecer a opcao de gerar um link direto
- Adicionar funcao `generateDirectLink(imovelId)` que cria um registro em `imobiliaria_imovel_access` com `imobiliaria_id = NULL` e um slug baseado no titulo do imovel

**`src/pages/dashboard/construtora/GerenciarAcessos.tsx`:**
- Na secao de links, mostrar o "Link Direto (Construtora)" quando existir um access com `imobiliaria_id = NULL`
- Adicionar botao "Gerar Link Direto" caso ainda nao exista

#### 4. Ajustes menores

- **`PropertyContactSection`**: Quando `imobiliariaId` for vazio, enviar lead com `imobiliaria_id = null`
- **`SofiaAssistentSection`**: Tratar `imobiliariaId` vazio
- **Pageviews**: Inserir com `imobiliaria_id = null` quando for link direto

### Detalhes Tecnicos

**Arquivos modificados:**
- Migration SQL -- `ALTER COLUMN imobiliaria_id DROP NOT NULL`
- `src/hooks/usePropertyPage.ts` -- fallback para branding da construtora, incluir campos extras no select de construtoras
- `src/pages/dashboard/construtora/index.tsx` -- funcao `generateDirectLink` e ajuste em `copyLink`
- `src/pages/dashboard/construtora/GerenciarAcessos.tsx` -- exibir/gerar link direto
- `src/components/property/PropertyContactSection.tsx` -- tratar imobiliariaId vazio

**Nenhum arquivo novo. Nenhuma dependencia adicional.**

### Fluxo do usuario

```text
Construtora cadastra imovel
        |
        v
Dashboard "Meus Imoveis"
        |
        +-- Clica "Compartilhar" no card do imovel
        |       |
        |       v
        |   Se ja tem link direto: copia o link
        |   Se nao tem: gera automaticamente e copia
        |
        v
Visitante acessa /imovel/slug-direto
        |
        v
usePropertyPage detecta imobiliaria_id = NULL
        |
        v
Monta branding com dados da construtora
(logo, cores, favicon da construtora)
        |
        v
Pagina renderiza com marca da construtora
```
