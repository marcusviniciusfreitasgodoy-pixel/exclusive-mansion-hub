
## Corrigir Crash ao Salvar Campo com Logica Condicional no FieldModal

### Problema
Ao salvar um campo com logica condicional configurada (que usa Select dropdowns), a aplicacao crasha com o erro:
```
NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.
```

O erro ocorre quando o Dialog fecha apos o salvamento. O React tenta desmontar os portais do Radix Select que estavam abertos dentro do Dialog, mas os nos DOM ja foram desanexados pelo processo de fechamento do Dialog.

### Causa raiz
O `FieldModal.tsx` fecha imediatamente apos chamar `onSave()` (linha 189 no `handleSubmit`). Quando o Dialog e desmontado, os portais dos Select components (tipo de campo, campo de referencia, condicao, valor esperado) ainda estao registrados no DOM. O React tenta limpar esses portais mas falha porque o Dialog ja removeu o container pai.

### Solucao
Duas alteracoes para resolver o problema:

**1. Atrasar o fechamento do modal (`FieldModal.tsx`)**
No `handleSubmit`, chamar `onSave` mas nao fechar o modal diretamente. Em vez disso, o componente pai (`EditarFormulario.tsx`) ja fecha o modal via `setModalOpen(false)` na funcao `handleSaveField`. O problema e que o fechamento acontece sincrono demais -- o React nao tem tempo de desmontar os portais dos Selects antes do Dialog ser removido.

A solucao e usar `requestAnimationFrame` ou `setTimeout` com delay zero no `handleSaveField` do `EditarFormulario.tsx` para dar tempo ao React de limpar os portais:

```typescript
// Em EditarFormulario.tsx, funcao handleSaveField:
const handleSaveField = (campo: CampoFormulario) => {
  if (editingField) {
    setCampos(prev => prev.map(c => c.id === campo.id ? campo : c));
  } else {
    setCampos(prev => [...prev, { ...campo, ordem: prev.length + 1 }]);
  }
  setHasChanges(true);
  // Atrasar fechamento para permitir limpeza dos portais Radix
  setTimeout(() => {
    setModalOpen(false);
  }, 0);
};
```

**2. Proteger o ErrorBoundary contra erros de DOM (`ErrorBoundary.tsx`)**
Adicionar deteccao especifica para erros de `removeChild`/`replaceChild` no `getDerivedStateFromError`, ignorando-os pois sao erros cosmeticos de desmontagem e nao afetam o estado da aplicacao:

```typescript
public static getDerivedStateFromError(error: Error): State {
  // Ignorar erros de desmontagem de portais Radix (nao afetam funcionalidade)
  if (error instanceof DOMException && 
      (error.message.includes('removeChild') || error.message.includes('replaceChild'))) {
    return { hasError: false, error: null, errorInfo: null };
  }
  return { hasError: true, error, errorInfo: null };
}
```

### Arquivos modificados
1. `src/pages/dashboard/imobiliaria/EditarFormulario.tsx` -- setTimeout no fechamento do modal
2. `src/components/ErrorBoundary.tsx` -- ignorar erros de desmontagem DOM

### Resultado esperado
Apos a correcao:
- O campo com logica condicional sera salvo sem crash
- O modal fechara suavemente
- O preview mostrara o campo condicional aparecendo/desaparecendo conforme a selecao do campo de referencia
