

# Plano: Corrigir Exibição da Descrição no Step 5 (Revisão)

## Problema Identificado

No Step 5 (Revisão), a descrição editada:
1. **Aparece apenas no card de preview** com `line-clamp-3` (truncada em 3 linhas)
2. **NÃO aparece no card de "Resumo das Informações"** - esse card lista área, condomínio, IPTU, imagens, vídeos, documentos, mas **não inclui a descrição**

Isso faz parecer que a descrição não foi atualizada.

## Solução Proposta

Adicionar a descrição completa ao card de "Resumo das Informações" com possibilidade de expansão, e melhorar a visualização no card de preview.

## Alterações Necessárias

### Arquivo: `src/components/wizard/Step5Review.tsx`

| Seção | Alteração |
|-------|-----------|
| Preview Card | Remover `line-clamp-3` ou adicionar botão "ver mais" |
| Resumo Card | Adicionar seção dedicada para "Descrição" com texto completo |

### Implementação Detalhada

```text
┌─────────────────────────────────────────────┐
│           RESUMO DAS INFORMAÇÕES            │
├─────────────────────────────────────────────┤
│  Área Total: 450m²     │  Área Priv: 380m²  │
│  Condomínio: R$ 2.500  │  IPTU: R$ 800      │
│  Imagens: 12 fotos     │  Vídeos: 2         │
│  Documentos: 3         │  Tour 360°: ✓      │
├─────────────────────────────────────────────┤
│  📝 DESCRIÇÃO                               │  ← NOVA SEÇÃO
│  ─────────────────────────────────────────  │
│  Linda cobertura duplex com vista frontal   │
│  para o mar, localizada na Avenida Lúcio    │
│  Costa, Barra da Tijuca...                  │
│                                             │
│  [Mostrar mais ▼]  (se muito longo)         │
└─────────────────────────────────────────────┘
```

### Código a Adicionar

No card de Resumo (após a seção de Documentos):

```tsx
{/* Description Section */}
{data.descricao && (
  <div className="mt-4 pt-4 border-t">
    <Label className="text-muted-foreground flex items-center gap-2 mb-2">
      <FileText className="h-4 w-4" />
      Descrição
    </Label>
    <div className="prose prose-sm max-w-none">
      {data.descricao.split('\n').map((paragraph, index) => (
        <p key={index} className="text-sm text-muted-foreground mb-2">
          {paragraph}
        </p>
      ))}
    </div>
  </div>
)}
```

### Opção Avançada: Expansão/Colapso

Se a descrição for muito longa, adicionar estado para expandir/colapsar:

```tsx
const [showFullDescription, setShowFullDescription] = useState(false);

// Na renderização:
{data.descricao && (
  <div className="mt-4 pt-4 border-t">
    <Label className="text-muted-foreground flex items-center gap-2 mb-2">
      <FileText className="h-4 w-4" />
      Descrição
    </Label>
    <div className={cn(
      "prose prose-sm max-w-none transition-all",
      !showFullDescription && data.descricao.length > 300 && "line-clamp-4"
    )}>
      {data.descricao.split('\n').map((paragraph, index) => (
        <p key={index} className="text-sm text-muted-foreground mb-2">
          {paragraph}
        </p>
      ))}
    </div>
    {data.descricao.length > 300 && (
      <Button 
        variant="link" 
        className="p-0 h-auto text-xs"
        onClick={() => setShowFullDescription(!showFullDescription)}
      >
        {showFullDescription ? 'Mostrar menos ▲' : 'Mostrar mais ▼'}
      </Button>
    )}
  </div>
)}
```

## Resultado Esperado

| Antes | Depois |
|-------|--------|
| Descrição truncada em 3 linhas no preview | Descrição mostrada por completo no resumo |
| Não há seção de descrição no resumo | Nova seção "Descrição" com texto completo |
| Usuário não vê a descrição atualizada | Descrição claramente visível e expansível |

## Arquivos a Modificar

| Arquivo | Alterações |
|---------|------------|
| `src/components/wizard/Step5Review.tsx` | Adicionar seção de Descrição no card de Resumo; Adicionar estado para expansão |

