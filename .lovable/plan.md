
## Correção do Texto na Seção Visão Geral

### Problema Identificado
O texto "Exclusividade e Sofisticação em Cada Detalhe" está quebrado em duas linhas no banco de dados, fazendo com que apareça separado na página.

### Solução
Atualizar o campo `descricao` no banco de dados removendo a quebra de linha entre "Sofisticação" e "em Cada Detalhe", mantendo todo o título na mesma linha.

### Texto Corrigido

**De:**
```
Negociação com Porteira Fechada

Exclusividade e Sofisticação
em Cada Detalhe
```

**Para:**
```
Negociação com Porteira Fechada

Exclusividade e Sofisticação em Cada Detalhe
```

### Detalhes Técnicos
- Será executado um comando `UPDATE` na tabela `imoveis` para o imóvel com slug `cobertura-lucio-costa-godoyprime`
- O campo `descricao` será atualizado com o texto corrigido mantendo o restante do conteúdo intacto
