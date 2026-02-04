
# Plano: Exibir Imagem Principal no Dashboard "Meus Imóveis"

## Problema Identificado

O dashboard "Meus Imóveis" sempre exibe a **primeira imagem do array** (`imagens[0]`), ignorando o campo `isPrimary` que indica qual imagem foi escolhida como principal pelo usuário.

### Evidência no Banco de Dados

```json
// Imóvel "Linda Cobertura Lucio Costa"
{
  "imagens": [
    {"url": "...temp/1770145127221-0.webp", "alt": "fachada 2", "isPrimary": false},
    {"url": "...temp/1770145127221-1.webp", "alt": "FAchada", "isPrimary": false},
    {"url": "...temp/1770145127221-2.webp", "alt": "Cob lucio Costa", "isPrimary": false},
    {"url": "...temp/1770145127221-3.webp", "alt": "Ocean Front -54", "isPrimary": true}, // ← ESTA deveria aparecer
    // ... mais imagens
  ]
}
```

## Problemas no Código

| Local | Problema |
|-------|----------|
| Parsing (linha 67-69) | `isPrimary` é ignorado no mapeamento |
| Renderização (linha 337) | Usa sempre `imagens[0]` |

## Solução

### 1. Atualizar o Parsing para Incluir `isPrimary`

```typescript
// ANTES (ignora isPrimary):
imagens: imagensArray.map((img: any) => 
  typeof img === 'string' ? { url: img } : { url: img?.url || '', alt: img?.alt }
),

// DEPOIS (preserva isPrimary):
imagens: imagensArray.map((img: any) => 
  typeof img === 'string' 
    ? { url: img } 
    : { url: img?.url || '', alt: img?.alt, isPrimary: img?.isPrimary }
),
```

### 2. Criar Função Helper para Encontrar Imagem Principal

```typescript
const getPrimaryImage = (imagens: { url: string; alt?: string; isPrimary?: boolean }[]) => {
  // Busca a imagem marcada como principal
  const primary = imagens.find(img => img.isPrimary);
  // Fallback para a primeira imagem se nenhuma for marcada
  return primary || imagens[0];
};
```

### 3. Usar a Imagem Principal na Renderização

```typescript
// ANTES:
{imovel.imagens?.[0]?.url ? (
  <img src={imovel.imagens[0].url} alt={imovel.titulo} ... />

// DEPOIS:
{(() => {
  const primaryImg = imovel.imagens?.find(img => img.isPrimary) || imovel.imagens?.[0];
  return primaryImg?.url ? (
    <img src={primaryImg.url} alt={primaryImg.alt || imovel.titulo} ... />
  ) : (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      <Building2 className="h-12 w-12" />
    </div>
  );
})()}
```

### 4. Atualizar o Type (Opcional mas Recomendado)

```typescript
// Em src/types/database.ts, linha 73:
imagens: { url: string; alt?: string; isPrimary?: boolean }[];
```

## Arquivos a Modificar

| Arquivo | Alterações |
|---------|------------|
| `src/pages/dashboard/construtora/index.tsx` | 1. Incluir `isPrimary` no parsing das imagens (linha 67-69)<br>2. Usar imagem principal na renderização (linhas 337-346) |
| `src/types/database.ts` | Adicionar `isPrimary?: boolean` ao tipo de imagens (linha 73) |

## Resultado Esperado

| Antes | Depois |
|-------|--------|
| Sempre mostra primeira imagem do array | Mostra imagem marcada com ⭐ (isPrimary) |
| "Ocean Front" fica escondido | "Ocean Front" aparece como capa |

## Fluxo Visual

```text
Banco de Dados:
┌────────────────────────────────────────────┐
│ imagens[0]: "fachada 2"     isPrimary=false│
│ imagens[1]: "FAchada"       isPrimary=false│
│ imagens[2]: "Cob lucio"     isPrimary=false│
│ imagens[3]: "Ocean Front"   isPrimary=true │ ← PRINCIPAL
└────────────────────────────────────────────┘

Dashboard Antes:              Dashboard Depois:
┌──────────────────┐          ┌──────────────────┐
│  [fachada 2]     │    →→→   │  [Ocean Front]   │
│                  │          │        ⭐        │
└──────────────────┘          └──────────────────┘
```
