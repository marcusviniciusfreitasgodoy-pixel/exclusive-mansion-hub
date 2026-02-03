
# Plano: Adicionar Favicon Customizado por Imobiliária

## Objetivo
Permitir que imobiliárias façam upload de um favicon personalizado que será exibido dinamicamente nas páginas white-label dos imóveis, completando a experiência de personalização visual junto com logo e cores.

---

## Arquitetura do Recurso

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FLUXO DO FAVICON                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  DASHBOARD IMOBILIÁRIA                       PÁGINA DO IMÓVEL               │
│  ─────────────────────                       ─────────────────              │
│                                                                             │
│  Configurações                                                              │
│  ┌─────────────────────────┐                                                │
│  │ Logo da Imobiliária     │                                                │
│  │ ┌─────┐                 │                                                │
│  │ │ IMG │  [Alterar]      │                                                │
│  │ └─────┘                 │                                                │
│  ├─────────────────────────┤                                                │
│  │ Favicon (NOVO!)         │                                                │
│  │ ┌───┐                   │                                                │
│  │ │ICO│  [Alterar]        │  ─────────────────────────────────────────▶    │
│  │ └───┘                   │       Renderizado no <head> da página          │
│  │ 32x32 ou 64x64 pixels   │       via react-helmet                         │
│  └─────────────────────────┘                                                │
│                                                                             │
│                                              ┌──────────────────────────┐   │
│                                              │ 🌐 Tab do Navegador      │   │
│                                              │ ┌───┐ Cobertura Barra... │   │
│                                              │ │ICO│                    │   │
│                                              │ └───┘                    │   │
│                                              └──────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Parte 1: Alteração no Banco de Dados

### Nova coluna na tabela `imobiliarias`

```sql
ALTER TABLE imobiliarias 
ADD COLUMN favicon_url TEXT;
```

**Justificativa:**
- Apenas imobiliárias precisam de favicon customizado (são elas que geram os links white-label)
- Construtoras não possuem páginas públicas próprias neste contexto

---

## Parte 2: Interface - Dashboard da Imobiliária

### Modificar `ConfiguracoesImobiliaria.tsx`

Adicionar seção de upload de favicon reutilizando padrão do `LogoUpload`:

- Campo separado para favicon (abaixo do logo)
- Formatos aceitos: ICO, PNG, SVG, WebP
- Tamanho máximo: 256KB (favicons são pequenos)
- Recomendação visual: 32x32 ou 64x64 pixels
- Preview quadrado pequeno (32x32 ou 48x48)

**UI proposta:**
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 🖼️ Logo da Imobiliária                                                   │
│ O logo será exibido nas páginas white-label dos imóveis.                │
│                                                                          │
│ ┌──────┐                                                                 │
│ │ Logo │  [Alterar Logo]  [Remover]                                      │
│ └──────┘                                                                 │
│ Formatos: JPG, PNG, WebP ou SVG. Tamanho máximo: 2MB.                   │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ 🔖 Favicon (ícone da aba do navegador)         <- NOVA SEÇÃO             │
│ Aparece na aba do navegador quando visitantes acessam seu link.          │
│                                                                          │
│ ┌────┐                                                                   │
│ │ 🌐 │  [Alterar Favicon]  [Remover]                                     │
│ └────┘                                                                   │
│ Formatos: ICO, PNG, SVG ou WebP. Tamanho ideal: 32x32 ou 64x64 pixels.  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Parte 3: Componente de Upload de Favicon

### Novo componente `FaviconUpload.tsx`

Similar ao `LogoUpload`, mas com:
- Validações específicas para favicon (tamanho menor, formatos ICO permitidos)
- Preview em tamanho pequeno (32x32)
- Bucket de storage: reutilizar `logos` ou criar `favicons`

---

## Parte 4: Tipos e Branding

### Atualizar `PropertyBranding` em `property-page.ts`

```typescript
export interface PropertyBranding {
  imobiliariaLogo: string | null;
  imobiliariaNome: string;
  corPrimaria: string;
  telefone: string | null;
  emailContato: string | null;
  faviconUrl: string | null;  // <- NOVO
}
```

### Atualizar `usePropertyPage.ts`

Buscar `favicon_url` na query de `imobiliarias` e mapear para o branding.

---

## Parte 5: Renderização Dinâmica do Favicon

### Modificar `TemplateWrapper.tsx`

Adicionar tag `<link rel="icon">` dinâmica usando react-helmet:

```tsx
<Helmet>
  <title>{title}</title>
  {/* Favicon dinâmico */}
  {branding.faviconUrl && (
    <link rel="icon" type="image/x-icon" href={branding.faviconUrl} />
  )}
  {/* Fallback se não houver favicon customizado - usa o padrão do projeto */}
  {!branding.faviconUrl && (
    <link rel="icon" href="/favicon.ico" />
  )}
  {/* ... demais meta tags */}
</Helmet>
```

### Modificar `PropertyPage.tsx` (DefaultTemplate)

Aplicar a mesma lógica para o template legado.

---

## Arquivos a Modificar/Criar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `supabase/migrations/...` | Criar | ADD COLUMN `favicon_url` em `imobiliarias` |
| `src/types/property-page.ts` | Modificar | Adicionar `faviconUrl` ao `PropertyBranding` |
| `src/hooks/usePropertyPage.ts` | Modificar | Buscar e mapear `favicon_url` |
| `src/components/dashboard/FaviconUpload.tsx` | Criar | Componente de upload de favicon |
| `src/pages/dashboard/imobiliaria/Configuracoes.tsx` | Modificar | Adicionar seção de favicon |
| `src/components/templates/TemplateWrapper.tsx` | Modificar | Injetar favicon via Helmet |
| `src/pages/imovel/PropertyPage.tsx` | Modificar | Injetar favicon no DefaultTemplate |

---

## Comportamento Esperado

### Para a Imobiliária (Dashboard)
1. Acessa Configurações
2. Vê nova seção "Favicon"
3. Faz upload de um ícone pequeno (ICO, PNG, SVG ou WebP)
4. Salva configurações
5. O favicon aparece nas abas do navegador dos visitantes

### Para Visitantes (Página do Imóvel)
1. Acessa link white-label (ex: `/i/abc123`)
2. O navegador carrega o favicon da imobiliária
3. A aba do navegador mostra o ícone personalizado + título do imóvel

### Fallback
- Se a imobiliária não tiver favicon customizado, usa o favicon padrão do projeto (`/favicon.ico`)

---

## Validações de Segurança

- Upload apenas para usuários autenticados da imobiliária
- Tipos de arquivo restritos: `.ico`, `.png`, `.svg`, `.webp`
- Tamanho máximo: 256KB
- Storage com políticas RLS apropriadas

---

## Considerações Técnicas

### React-Helmet e Favicon Dinâmico
O react-helmet-async permite alterar o `<link rel="icon">` dinamicamente. Isso funciona bem em SPAs, mas:
- O navegador pode cachear favicons agressivamente
- Recomenda-se adicionar um parâmetro de cache-busting se necessário (ex: `?v=${timestamp}`)

### Formatos de Favicon Recomendados
- **ICO**: Formato clássico, suporte universal
- **PNG 32x32**: Formato moderno, boa qualidade
- **SVG**: Escalável, ideal para ícones vetoriais
- **WebP**: Boa compressão, suporte crescente

---

## Resumo Visual

```text
ANTES                                   DEPOIS
──────                                  ──────

Tab do navegador:                       Tab do navegador:
┌─────────────────────────────┐         ┌─────────────────────────────┐
│ 🏠 Cobertura Duplex - ...   │         │ 🏢 Cobertura Duplex - ...   │
└─────────────────────────────┘         └─────────────────────────────┘
   ↑                                       ↑
   Favicon padrão                          Favicon da imobiliária
   (Godoy Prime)                           (customizado!)
```

Este recurso complementa perfeitamente o conjunto de personalização já existente (logo + cores), oferecendo uma experiência white-label completa.
