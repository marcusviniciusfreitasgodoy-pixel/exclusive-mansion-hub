

## Corrigir Exibicao da Aba de Propostas na Imobiliaria

### Problema

A aba "Propostas" mostra "Nenhum feedback encontrado" em vez de exibir as propostas. Isso acontece porque existe um `TabsContent` generico (linha 415) com `value={activeTab}` que captura qualquer valor de aba -- incluindo "propostas". Assim, o `TabsContent` especifico de propostas (linha 448) nunca e exibido.

### Solucao

Alterar o `TabsContent` generico para que ele so renderize quando a aba ativa NAO for "propostas". Existem duas abordagens possiveis:

**Abordagem escolhida**: Substituir o `TabsContent` dinamico por `TabsContent` individuais para cada status de feedback (`all`, `aguardando_corretor`, `aguardando_cliente`, `completo`, `arquivado`), cada um renderizando a mesma lista filtrada. Porem, a forma mais simples e manter o `TabsContent` com `value={activeTab}` mas envolve-lo em uma condicao `{activeTab !== 'propostas' && ...}`.

### Alteracao

**`src/pages/dashboard/imobiliaria/Feedbacks.tsx`** (linha 415):

- De: `<TabsContent value={activeTab} className="mt-0">`
- Para: Envolver todo o bloco (linhas 415-445) em `{activeTab !== 'propostas' && (...)}`

Isso garante que quando a aba "Propostas" estiver ativa, somente o `TabsContent` dedicado (linha 448) sera renderizado, exibindo corretamente a lista de propostas.

Nenhuma outra alteracao e necessaria. Os dados ja existem no banco e a query do `PropostasTab` esta correta.
