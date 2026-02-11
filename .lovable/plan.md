

## Adicionar Aba de Propostas nos Dashboards de Feedbacks

### Objetivo
Adicionar uma aba "Propostas" nas paginas de Feedbacks tanto da construtora quanto da imobiliaria, permitindo visualizar todas as propostas de compra vinculadas aos feedbacks.

### Alteracoes

#### 1. Construtora - `src/pages/dashboard/construtora/Feedbacks.tsx`

- Adicionar nova aba "Propostas" ao TabsList existente (ao lado de "Analytics" e "Feedbacks")
- Criar query para buscar propostas da tabela `propostas_compra` filtradas por `construtora_id`, com join em `imoveis` e `imobiliarias`
- Criar `TabsContent` com listagem em tabela contendo:
  - Codigo da proposta
  - Nome do proponente
  - Imovel (titulo)
  - Valor ofertado (formatado BRL)
  - Sinal / Parcelas / Financiamento
  - Status (pendente/aceita/recusada/expirada) com badges coloridas
  - Data de criacao
  - Botao para ver detalhes em modal
- Modal de detalhes da proposta com todos os campos: dados pessoais, valores, condicoes de pagamento, assinatura digital (preview da imagem), CNH (link)
- Filtros: busca por nome, filtro por imovel (reutilizar os existentes), filtro por status da proposta

#### 2. Imobiliaria - `src/pages/dashboard/imobiliaria/Feedbacks.tsx`

- Adicionar nova aba "Propostas" ao TabsList existente (ao lado das abas de status)
- Criar query para buscar propostas da tabela `propostas_compra` filtradas por `imobiliaria_id`, com join em `imoveis`
- Criar `TabsContent` com listagem em cards (mesmo padrao visual dos feedback cards) contendo:
  - Codigo, nome, imovel, valor ofertado, status, data
  - Botao "Ver Detalhes" abrindo modal
- Modal de detalhes com mesma estrutura da construtora
- Reutilizar filtros existentes (busca e imovel)

#### 3. Detalhes Tecnicos

- Importar `DollarSign` ou `Receipt` do lucide-react para icone da aba
- Status badges:
  - `pendente`: amarelo
  - `aceita`: verde
  - `recusada`: vermelho
  - `expirada`: cinza
- Valores monetarios formatados com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
- Assinatura exibida como `<img src={assinatura_proponente} />` no modal de detalhes
- CNH exibida como link externo para download

#### 4. Arquivos Modificados

- `src/pages/dashboard/construtora/Feedbacks.tsx` - nova aba + query + modal
- `src/pages/dashboard/imobiliaria/Feedbacks.tsx` - nova aba + query + modal

Nenhuma tabela ou migracao necessaria -- a tabela `propostas_compra` ja existe com todos os campos.
