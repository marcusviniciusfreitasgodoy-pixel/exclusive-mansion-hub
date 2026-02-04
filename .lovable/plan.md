

# Plano: Popular Base com Dados de Demonstração Completos

## Objetivo

Criar um ambiente de demonstração rico e realista para apresentação da plataforma a construtoras e imobiliárias, cobrindo todas as funcionalidades disponíveis.

## Análise do Estado Atual

| Área | Status Atual | Necessidade |
|------|--------------|-------------|
| **Imóveis** | 5 imóveis cadastrados | OK, usar os existentes |
| **Leads** | 5 leads, todos em estágio "novo" | Distribuir em todos os estágios do pipeline |
| **Pageviews** | 4 registros apenas | Aumentar para gerar gráficos realistas |
| **Agendamentos** | 2 (pendente e confirmado) | Adicionar realizados e cancelados |
| **Feedbacks** | 2 completos | Adicionar mais para métricas robustas |
| **Atividades CRM** | 0 registros | Criar histórico de atividades |
| **Tarefas CRM** | 0 registros | Criar tarefas com diferentes prioridades |
| **Imobiliárias** | 3 imobiliárias | Adicionar mais para ranking |

## Dados a Serem Inseridos

### 1. Leads Distribuídos no Pipeline (20 novos leads)

Distribuição por estágio para visualização completa do Kanban:

| Estágio | Quantidade | Score Range |
|---------|------------|-------------|
| `novo` | 3 | 10-30 (frio) |
| `contatado` | 4 | 30-50 (morno) |
| `qualificado` | 3 | 50-70 (quente) |
| `visita_agendada` | 3 | 60-80 |
| `proposta_enviada` | 2 | 70-90 |
| `negociacao` | 2 | 80-95 |
| `ganho` | 2 | 95-100 |
| `perdido` | 1 | 20 |

Origens variadas: `formulario`, `whatsapp`, `chat_ia`

Tags incluídas: `["investidor"]`, `["primeiro_imovel"]`, `["permuta"]`, `["urgente"]`

### 2. Atividades do CRM (30+ registros)

Criar histórico para os leads existentes:

| Tipo | Descrição |
|------|-----------|
| `email_enviado` | "Enviado e-mail de boas-vindas" |
| `whatsapp_enviado` | "Primeiro contato via WhatsApp" |
| `ligacao_realizada` | "Ligação de qualificação - 15min" |
| `reuniao` | "Reunião online de apresentação" |
| `visita_agendada` | "Agendada visita ao GRID Residencial" |
| `proposta_enviada` | "Proposta comercial enviada" |
| `nota` | "Cliente solicitou mais fotos" |
| `status_alterado` | "Alterado de Novo para Contatado" |

### 3. Tarefas do CRM (10 tarefas)

| Prioridade | Status | Exemplo |
|------------|--------|---------|
| `urgente` | `pendente` | "Retornar ligação - cliente muito interessado" |
| `alta` | `em_andamento` | "Preparar proposta personalizada" |
| `media` | `pendente` | "Enviar material adicional" |
| `baixa` | `concluida` | "Atualizar CRM" |
| `alta` | `cancelada` | "Agendar segunda visita" (cliente desistiu) |

### 4. Pageviews Realistas (100+ registros)

Distribuição temporal e por horário para gerar:
- Gráfico de evolução diária
- Heatmap de horários de acesso
- Métricas comparativas por período

Horários concentrados: 9-12h e 18-22h (padrão de acesso real)

### 5. Mais Agendamentos (6 novos)

| Status | Data | Cliente |
|--------|------|---------|
| `realizado` | Passado | 3 visitas |
| `confirmado` | Futuro próximo | 2 visitas |
| `cancelado` | Passado | 1 visita |

### 6. Mais Feedbacks (4 novos)

Variação de NPS para demonstrar analytics:

| NPS | Interesse | Qualificação |
|-----|-----------|--------------|
| 10 | muito_interessado | quente |
| 8 | interessado | morno |
| 5 | pouco_interessado | frio |
| 3 | sem_interesse | frio |

Objeções variadas: `preco`, `localizacao`, `tamanho`, `financiamento`

### 7. Imobiliárias Adicionais (2 novas)

Para enriquecer o ranking e comparativos:

| Nome | CRECI | Leads | Visitas |
|------|-------|-------|---------|
| "Prime Imóveis RJ" | "CRECI-RJ 54321" | 8 | 4 |
| "Zona Sul Imobiliária" | "CRECI-RJ 98765" | 5 | 2 |

## Funcionalidades Demonstráveis Após Implementação

### Dashboard Construtora

| Página | O que será mostrado |
|--------|---------------------|
| **Pipeline** | Kanban com leads distribuídos em 8 colunas, drag-and-drop, métricas |
| **Leads** | Tabela com filtros, status variados, exportação CSV |
| **Analytics** | Gráficos de evolução, funil, heatmap, origens, ranking imobiliárias |
| **Agendamentos** | Cards com todos os status, filtros por imobiliária |
| **Feedbacks** | NPS médio, gráficos de satisfação, objeções, desempenho por imobiliária |
| **Imobiliárias** | Cards com estatísticas, leads e visitas por parceiro |

### Dashboard Imobiliária

| Página | O que será mostrado |
|--------|---------------------|
| **Pipeline** | Mesmo Kanban filtrado para a imobiliária |
| **Leads** | Leads captados pela imobiliária |
| **Analytics** | Métricas da imobiliária |
| **Agendamentos** | Visitas agendadas pela imobiliária |
| **Feedbacks** | Feedbacks das visitas realizadas |

## Estrutura dos Dados SQL

### Leads (exemplo de um registro)

```sql
INSERT INTO leads (
  imovel_id, imobiliaria_id, construtora_id,
  nome, email, telefone, mensagem, origem,
  status, estagio_pipeline, score_qualificacao,
  tags, orcamento, prazo_compra, ultimo_contato,
  responsavel_nome, created_at
) VALUES (
  'ea860551-1750-4b08-9043-1f7233ccf67b',
  '0808cf71-aa0c-4531-94f3-a3741a2efea0',
  '8de22a19-9ce7-41a6-a1dc-deab3ad6d275',
  'Ricardo Mendes', 'ricardo@email.com', '(21) 99111-2222',
  'Interessado na unidade 201', 'whatsapp',
  'contatado', 'negociacao', 85,
  '["investidor", "urgente"]', 1500000, '0-3_meses',
  NOW() - INTERVAL '2 hours', 'João Corretor',
  NOW() - INTERVAL '5 days'
);
```

### Atividades (exemplo)

```sql
INSERT INTO atividades_lead (
  lead_id, tipo, titulo, descricao,
  usuario_nome, created_at
) VALUES (
  '[lead_id]', 'ligacao_realizada',
  'Ligação de qualificação',
  'Conversa de 15 minutos. Cliente tem aprovação de crédito.',
  'Ana Corretora', NOW() - INTERVAL '3 days'
);
```

### Pageviews (exemplo com distribuição temporal)

```sql
INSERT INTO pageviews (
  imovel_id, imobiliaria_id, access_id,
  user_agent, referrer, created_at
) VALUES (
  'ea860551-1750-4b08-9043-1f7233ccf67b',
  '0808cf71-aa0c-4531-94f3-a3741a2efea0',
  '28b77434-16e7-47cb-9210-f0f5123bbc2e',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
  'https://instagram.com',
  NOW() - INTERVAL '3 days' + INTERVAL '10 hours'
);
```

## Ordem de Execução

1. **Criar novas imobiliárias** (para ranking)
2. **Criar acessos** para novas imobiliárias
3. **Inserir leads** com distribuição por pipeline
4. **Inserir atividades** para histórico do CRM
5. **Inserir tarefas** com diferentes status/prioridades
6. **Inserir pageviews** distribuídos temporalmente
7. **Inserir agendamentos** com status variados
8. **Inserir feedbacks** com NPS diversificado

## Resultado Esperado

Após a implementação, todos os dashboards terão:

- **Métricas significativas** (não zeradas)
- **Gráficos com dados reais** (evolução, funil, pizza, barras)
- **Ranking de imobiliárias** com performance comparativa
- **Pipeline Kanban** populado em todas as colunas
- **Heatmap** mostrando horários de pico
- **Insights automáticos** gerados pelos dados

