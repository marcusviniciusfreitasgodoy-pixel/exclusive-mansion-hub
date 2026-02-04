

# Plano: Remover Descrição Duplicada no Step 5

## Problema Identificado

Atualmente a descrição aparece em **dois locais** no Step 5 (Revisão):

| Local | Comportamento | Problema |
|-------|---------------|----------|
| Preview Card (topo) | Truncada em 3 linhas | Exibe descrição "antiga" sem contexto |
| Resumo das Informações | Expandível com "Mostrar mais" | Exibe descrição completa ✓ |

Isso causa confusão pois o usuário vê duas versões da mesma informação.

## Solução

Remover a descrição do Preview Card e manter apenas a seção de descrição expandível no "Resumo das Informações".

## Alteração

### Arquivo: `src/components/wizard/Step5Review.tsx`

**Remover linhas 116-120:**

```tsx
// REMOVER ESTE BLOCO:
{data.descricao && (
  <p className="text-muted-foreground line-clamp-3 mb-4">
    {data.descricao}
  </p>
)}
```

## Resultado Visual

```text
┌─────────────────────────────────────────────┐
│ [PREVIEW CARD - IMAGEM COM OVERLAY]         │
│                                             │
│ R$ 12.000.000                               │
│ 📏 980m² • 🛏️ 5 suítes • 🚿 7 banheiros     │
│                                             │  ← Descrição REMOVIDA daqui
│ Diferenciais: [badges...]                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Resumo das Informações                      │
│ Área Total: 1250m²  │  Área Privativa: 980m²│
│ Condomínio: R$ 5000 │  IPTU: R$ 5000        │
│ ...                                         │
├─────────────────────────────────────────────┤
│ 📝 Descrição                                │  ← Descrição ÚNICA aqui
│ Porteira Fechada                            │
│ Exclusividade e Sofisticação em Cada Detalhe│
│ Apresentamos esta exclusiva cobertura...    │
│ [Mostrar mais ▼]                            │
└─────────────────────────────────────────────┘
```

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/wizard/Step5Review.tsx` | Remover bloco de descrição do Preview Card (linhas 116-120) |

