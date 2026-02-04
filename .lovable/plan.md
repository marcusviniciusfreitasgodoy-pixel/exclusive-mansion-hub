
# Plano: Corrigir Campos Vazios na Seção Descrição ao Editar Imóvel

## Problema Identificado

Na página de edição de imóvel (`EditarImovel.tsx`), alguns campos da seção "Descrição" (Step 3) aparecem vazios:

| Campo no Formulário | Coluna no Banco | Status |
|---------------------|-----------------|--------|
| `descricao` | `descricao` | OK |
| `diferenciais` | `diferenciais` | Possível problema com parsing |
| `memorial` | `memorial_descritivo` | OK |
| `condicoesPagamento` | `condicoes_pagamento` | **NÃO MAPEADO** |
| `contextoAdicionalIA` | `contexto_adicional_ia` | OK |

### Causa Raiz

1. **Campo `condicoesPagamento`**: A coluna `condicoes_pagamento` existe no banco de dados mas **não está sendo carregada** no mapeamento do `useEffect` e também **não está sendo salva** na mutação de update.

2. **Campo `diferenciais`**: Pode vir como string JSON do banco (JSONB) e o código atual não faz parsing robusto se vier como string em vez de array nativo.

## Solução

### 1. Adicionar Mapeamento do Campo `condicoesPagamento`

**Arquivo**: `src/pages/dashboard/construtora/EditarImovel.tsx`

**No `useEffect` (carregamento dos dados)** - adicionar:
```typescript
const mapped = {
  // ... campos existentes ...
  condicoesPagamento: imovel.condicoes_pagamento || '',
};
```

**No `updateMutation` (salvamento dos dados)** - adicionar:
```typescript
const updateData = {
  // ... campos existentes ...
  condicoes_pagamento: data.condicoesPagamento || null,
};
```

### 2. Adicionar Parsing Robusto para `diferenciais`

O campo `diferenciais` é JSONB e pode vir como:
- Array nativo do Postgres (quando parseado automaticamente)
- String JSON (quando há dupla serialização)

**Lógica de parsing**:
```typescript
// Parsing robusto para diferenciais
let diferenciaisArray: string[] = [];
if (Array.isArray(imovel.diferenciais)) {
  diferenciaisArray = imovel.diferenciais as string[];
} else if (typeof imovel.diferenciais === 'string') {
  try {
    const parsed = JSON.parse(imovel.diferenciais);
    diferenciaisArray = Array.isArray(parsed) ? parsed : [];
  } catch {
    diferenciaisArray = [];
  }
}
```

---

## Detalhes Técnicos

### Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/dashboard/construtora/EditarImovel.tsx` | Adicionar mapeamento de `condicoesPagamento` e parsing robusto para `diferenciais` |

### Localização das Alterações

1. **Linhas 63-91** (useEffect): Adicionar `condicoesPagamento` ao objeto `mapped` e corrigir parsing de `diferenciais`
2. **Linhas 101-123** (updateMutation): Adicionar `condicoes_pagamento` ao objeto `updateData`

### Código Resumido das Alterações

```text
// No useEffect (carregamento)
Antes:
  diferenciais: Array.isArray(imovel.diferenciais) ? imovel.diferenciais as string[] : [],

Depois:
  diferenciais: parseDiferenciais(imovel.diferenciais),
  condicoesPagamento: imovel.condicoes_pagamento || '',

// No updateMutation (salvamento)
Adicionar:
  condicoes_pagamento: data.condicoesPagamento || null,
```

## Resultado Esperado

Após a implementação:
- O campo "Condições de Pagamento" será carregado corretamente ao editar
- O campo "Diferenciais Exclusivos" será parseado corretamente em todos os cenários
- Todas as alterações nesses campos serão salvas no banco de dados
