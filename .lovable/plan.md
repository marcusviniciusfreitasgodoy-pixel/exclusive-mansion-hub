## Remover Assinatura Duplicada da Proposta

### Problema

Existem dois campos de assinatura digital no formulario:

1. Um ao lado do Upload CNH, dentro da secao da proposta (linha 1162-1172) -- **sera removido**
2. Um no final do formulario, "Assinatura Digital" do feedback (linha 1223-1233) -- **sera mantido e usado para ambos**

### Alteracoes em `src/pages/feedback/FeedbackClientePublico.tsx`

1. **Remover** o `SignaturePad` da proposta (o que esta ao lado da CNH, linhas 1156-1173):
  - Remover o grid `md:grid-cols-2` que colocava CNH e assinatura lado a lado
  - Manter apenas o `CNHUpload` ocupando largura total
2. **Remover** o ref `proposalSignatureRef` (linha 155) -- nao sera mais necessario
3. **Atualizar logica de submit** (linha 286-289): remover a validacao separada de `proposalSignatureRef.current?.isEmpty()`, pois a assinatura final (`signatureRef`) ja e validada
4. **Atualizar dados da proposta** (linha 329): usar `signatureRef.current?.getSignatureData()` em vez de `proposalSignatureRef.current?.getSignatureData()` ao chamar `submit_proposta_compra`

inclua a confirmaçao por e-mail e whatsapp para o cliente e a imobiliaria/corretor   
  
Resultado: apenas um campo de assinatura no final do formulario, servindo tanto para o feedback quanto para a proposta.