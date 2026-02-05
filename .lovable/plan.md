
# Plano: Garantir Salvamento da Base de Conhecimento na Edição

## Problema Identificado
A página **EditarImovel** (`src/pages/dashboard/construtora/EditarImovel.tsx`) não gerencia a base de conhecimento do imóvel:
1. Não carrega as entradas existentes da tabela `imovel_knowledge_base`
2. Não passa `knowledgeBaseEntries`, `onKnowledgeBaseChange` nem `imovelId` ao componente `Step4Media`
3. Não salva as alterações da base de conhecimento ao clicar "Salvar Alterações"

A criação de novos imóveis (`NovoImovel`) já funciona corretamente.

## Alterações Necessárias

### Arquivo: `src/pages/dashboard/construtora/EditarImovel.tsx`

**1. Importar tipo e adicionar estado**
- Importar `KnowledgeBaseEntry` de `@/types/knowledge-base`
- Adicionar estado `knowledgeBaseEntries` com `useState`

**2. Carregar entradas existentes do banco**
- Adicionar query para buscar entradas da tabela `imovel_knowledge_base` filtradas pelo `id` do imóvel
- Popular o estado com os dados carregados

**3. Passar props ao Step4Media**
- Adicionar `imovelId={id}`, `knowledgeBaseEntries` e `onKnowledgeBaseChange` na renderização do Step4Media

**4. Salvar alterações na mutation de update**
- Ao salvar, deletar entradas antigas da `imovel_knowledge_base` para o imóvel
- Inserir as entradas atuais (novas + editadas)
- Tratar erros sem bloquear o salvamento principal

## Resumo

| Arquivo | Ação |
|---------|------|
| `src/pages/dashboard/construtora/EditarImovel.tsx` | Editar - carregar, passar e salvar KB entries |

## Detalhes Técnicos

```text
Fluxo atual (EditarImovel):
  Carrega imovel -> Popula form -> Salva form
  (KB ignorada completamente)

Fluxo corrigido:
  Carrega imovel + KB entries -> Popula form + KB state
  -> Passa KB ao Step4Media -> Salva form + KB entries
```

A estrategia de salvamento sera "delete + re-insert": ao salvar, todas as entradas antigas do imovel sao removidas e as entradas atuais (do estado) sao inseridas. Isso simplifica o gerenciamento de entradas editadas, removidas e adicionadas.
