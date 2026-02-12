

## Seed Completo: Dados para Teste de Todas as Funcionalidades

### Situacao Atual do Banco

| Tabela | Registros | Observacao |
|---|---|---|
| construtoras | 2 | OK |
| imobiliarias | 3 | OK |
| imoveis | 6 | Todos da construtora "Godoy Prime Realty Construtora Teste" |
| imobiliaria_imovel_access | 6 | Cada imobiliaria tem acesso a apenas 3 imoveis (de 6) |
| leads | 25 | Distribuidos, com pipeline stages variados |
| agendamentos_visitas | 23 | OK |
| feedbacks_visitas | 17 | OK |
| tarefas | 10 | Existem mas podem precisar de mais variedade |
| notas_lead | 0 | VAZIO - precisa popular |
| atividades_lead | 34 | OK |
| propostas_compra | 0 registros verificados | Precisa popular |

### Contas de Acesso Existentes

| Email | Role | Entidade |
|---|---|---|
| marcusviniciusfreitasgodoy@gmail.com | construtora | Godoy Prime Realty Construtora Teste |
| contato@godoyprime.com.br | imobiliaria | Marcus v F Godoy Assessoria Imobiliaria |
| marcus@godoyprime.com.br | imobiliaria | Marcus v F Godoy Assessoria Imobiliaria (outra) |

### O que sera feito

**Arquivo a modificar: `src/pages/admin/SeedData.tsx`**

O seed existente sera expandido com um segundo botao "Seed Completo" que executa todas as etapas abaixo de uma vez:

**1. Conceder acesso a TODOS os 6 imoveis para AMBAS as imobiliarias**
- Inserir registros em `imobiliaria_imovel_access` para os 3 imoveis faltantes de cada imobiliaria
- Gerar url_slugs unicos para cada combinacao

**2. Popular `notas_lead` (atualmente vazio)**
- Inserir 10-15 notas distribuidas entre os leads existentes
- Conteudos variados: observacoes de visita, preferencias do cliente, historico de negociacao

**3. Popular `propostas_compra`**
- Inserir 3-5 propostas vinculadas a leads em estagios avancados (proposta_enviada, negociacao)
- Com valores, condicoes de pagamento, status variados (pendente, aceita, rejeitada)

**4. Complementar `tarefas`**
- Inserir tarefas com variedade de prioridades (alta, media, baixa), status (pendente, em_andamento, concluida) e datas de vencimento (passadas, hoje, futuras)
- Vincular a leads existentes

**5. Complementar `atividades_lead`**
- Inserir atividades de tipos variados (email, ligacao, nota, visita) para leads que tenham poucas

### Secao Tecnica

A funcao `seedCompleto()` sera adicionada ao componente `SeedData.tsx`. Ela:

1. Busca todos os imoveis da construtora logada
2. Busca todas as imobiliarias que ja tem algum acesso
3. Para cada imobiliaria, insere access para imoveis faltantes (com verificacao de duplicidade)
4. Busca leads existentes e distribui notas, tarefas e atividades
5. Insere propostas para leads em estagios avancados
6. Usa `try/catch` por etapa para nao interromper o fluxo em caso de erro parcial

**Queries principais:**
- `SELECT id FROM imoveis WHERE construtora_id = ?` para listar imoveis
- `SELECT id FROM imobiliaria_imovel_access WHERE imobiliaria_id = ? AND imovel_id = ?` para evitar duplicatas
- `INSERT INTO notas_lead` com lead_ids reais
- `INSERT INTO propostas_compra` com imovel_ids e construtora_id reais
- `INSERT INTO tarefas` com lead_ids e responsavel_ids reais

**Nenhuma migracao de banco necessaria.** Todas as tabelas e colunas ja existem.

