

## Corrigir Erro de Assinatura Digital

### Problema

O erro `(0 , import_trim_canvas.default) is not a function` ocorre na biblioteca `react-signature-canvas` quando o metodo `getTrimmedCanvas()` e chamado. Esse e um bug conhecido de compatibilidade da biblioteca com bundlers modernos (Vite).

### Solucao

No arquivo `src/components/feedback/SignaturePad.tsx`, na linha 30, substituir `getTrimmedCanvas().toDataURL(...)` por `getCanvas().toDataURL(...)`.

O metodo `getCanvas()` retorna o canvas sem tentar usar a dependencia `trim-canvas` que esta quebrada. A diferenca e que a imagem gerada tera o fundo branco completo em vez de ser cortada, o que e perfeitamente aceitavel para uma assinatura.

### Arquivo alterado

**`src/components/feedback/SignaturePad.tsx`** (linha 30):
- De: `sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png")`
- Para: `sigCanvas.current?.getCanvas().toDataURL("image/png")`

Apenas uma linha de codigo precisa ser alterada.

