

# Plano: Opção de Escolha Entre Descrição Atual e Sugerida pela IA

## Problema Identificado

Atualmente, ao clicar em "Usar Este Texto" no assistente de copywriting, a descrição existente é **sobrescrita imediatamente**, sem oferecer ao usuário a possibilidade de comparar ou escolher entre manter sua descrição original ou usar a sugerida pela IA.

## Solução Proposta

Adicionar um modal de comparação que exiba lado a lado:
- A descrição atual (escrita pelo usuário)
- A descrição sugerida pela IA

O usuário poderá escolher qual usar ou cancelar a operação.

## Fluxo de UX Proposto

```text
1. Usuário gera texto com IA
2. Clica em "Usar Este Texto"
3. SE já existir descrição:
   ┌─────────────────────────────────────────────────────────────┐
   │              Escolha a Descrição                            │
   ├─────────────────────────────────────────────────────────────┤
   │  ┌─────────────────────┐  ┌─────────────────────┐          │
   │  │  📝 Descrição Atual │  │  ✨ Sugestão da IA  │          │
   │  ├─────────────────────┤  ├─────────────────────┤          │
   │  │ "Texto atual do     │  │ "Novo texto gerado  │          │
   │  │  usuário..."        │  │  pela IA..."        │          │
   │  │                     │  │                     │          │
   │  └─────────────────────┘  └─────────────────────┘          │
   │                                                             │
   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
   │  │ Manter Atual│  │ Usar IA     │  │ Cancelar    │         │
   │  └─────────────┘  └─────────────┘  └─────────────┘         │
   └─────────────────────────────────────────────────────────────┘

   SE não existir descrição:
   → Insere diretamente (comportamento atual)
```

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/wizard/CopywriterAssistant.tsx` | Adicionar callback que passa a descrição atual para comparação |
| `src/components/wizard/Step3Description.tsx` | Implementar modal de comparação e lógica de escolha |

## Implementação Detalhada

### 1. Modificar CopywriterAssistant.tsx

Adicionar prop `currentDescription` para saber se já existe texto:

```typescript
interface CopywriterAssistantProps {
  propertyData: PropertyData;
  diferenciais: string[];
  currentDescription?: string; // Nova prop
  onUseDescription: (text: string) => void;
  onUseHeadline?: (text: string) => void;
}
```

A função `handleUseText` passa a chamar o callback com o texto gerado, e o componente pai decide se mostra modal ou insere diretamente.

### 2. Modificar Step3Description.tsx

Adicionar estados e modal de comparação:

```typescript
// Estados
const [showCompareModal, setShowCompareModal] = useState(false);
const [aiSuggestedText, setAiSuggestedText] = useState('');

// Handler atualizado
const handleUseAIDescription = (text: string) => {
  const currentText = form.getValues('descricao');
  
  if (currentText && currentText.trim().length > 0) {
    // Já existe descrição - mostrar modal de comparação
    setAiSuggestedText(text);
    setShowCompareModal(true);
  } else {
    // Não existe descrição - inserir diretamente
    form.setValue('descricao', text, { shouldValidate: true });
  }
};

// Ações do modal
const handleKeepCurrent = () => {
  setShowCompareModal(false);
  setAiSuggestedText('');
};

const handleUseAI = () => {
  form.setValue('descricao', aiSuggestedText, { shouldValidate: true });
  setShowCompareModal(false);
  setAiSuggestedText('');
};
```

### 3. UI do Modal de Comparação

```tsx
<Dialog open={showCompareModal} onOpenChange={setShowCompareModal}>
  <DialogContent className="max-w-4xl max-h-[80vh]">
    <DialogHeader>
      <DialogTitle>Escolha a Descrição</DialogTitle>
      <DialogDescription>
        Compare sua descrição atual com a sugestão da IA
      </DialogDescription>
    </DialogHeader>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Descrição Atual */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Edit2 className="h-4 w-4" />
          Sua Descrição Atual
        </Label>
        <ScrollArea className="h-[300px] border rounded-lg p-3">
          <p className="text-sm whitespace-pre-wrap">
            {form.getValues('descricao')}
          </p>
        </ScrollArea>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleKeepCurrent}
        >
          Manter Esta
        </Button>
      </div>
      
      {/* Sugestão IA */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Sugestão da IA
        </Label>
        <ScrollArea className="h-[300px] border rounded-lg p-3 border-primary/30 bg-primary/5">
          <p className="text-sm whitespace-pre-wrap">
            {aiSuggestedText}
          </p>
        </ScrollArea>
        <Button 
          className="w-full"
          onClick={handleUseAI}
        >
          Usar Esta
        </Button>
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="ghost" onClick={() => setShowCompareModal(false)}>
        Cancelar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Componentes Utilizados

| Componente | Uso |
|------------|-----|
| `Dialog` | Modal de comparação |
| `ScrollArea` | Para textos longos com scroll |
| `Button` | Ações de escolha |
| `Sparkles`, `Edit2` | Ícones visuais |

## Resultado Esperado

1. Se o campo de descrição estiver **vazio**: texto da IA é inserido diretamente
2. Se o campo de descrição **já tiver texto**: abre modal lado a lado para o usuário escolher
3. Usuário pode:
   - **Manter Atual**: fecha o modal sem alterações
   - **Usar IA**: substitui pela sugestão
   - **Cancelar**: fecha o modal sem alterações

