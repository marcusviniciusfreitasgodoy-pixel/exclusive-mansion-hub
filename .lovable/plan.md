
# Plano: Base de Conhecimento por Imovel para Agente de IA

## Resumo
Criar um sistema de base de conhecimento especifica para cada imovel, permitindo upload de documentos PDF e textos que alimentarao o chatbot Sofia com informacoes detalhadas sobre aquele imovel especifico. A funcionalidade estara disponivel tanto no cadastro de novos imoveis quanto na edicao de imoveis existentes.

## Arquitetura

```text
+------------------+     +------------------------+     +-------------------+
|  Wizard Step 4   | --> |  imovel_knowledge_base | <-- | chatbot-message   |
|  (Upload + CRUD) |     |  (tabela por imovel)   |     | (Edge Function)   |
+------------------+     +------------------------+     +-------------------+
        |                          |
        v                          v
+------------------+     +------------------------+
| process-pdf-kb   |     | Storage: documentos_kb |
| (Edge Function)  |     | (bucket para PDFs)     |
+------------------+     +------------------------+
```

## Alteracoes

### 1. Migracao de Banco de Dados

**Nova tabela: `imovel_knowledge_base`**

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | Chave primaria |
| imovel_id | uuid | FK para imoveis |
| categoria | text | FAQ, Especificacao, Financiamento, Documentacao, Outros |
| titulo | text | Titulo da entrada |
| conteudo | text | Conteudo textual |
| fonte_tipo | text | 'manual', 'pdf_extraido' |
| fonte_arquivo_url | text | URL do PDF origem (se aplicavel) |
| fonte_arquivo_nome | text | Nome do arquivo origem |
| tags | text[] | Tags para busca |
| ativo | boolean | Se a entrada esta ativa |
| prioridade | integer | Prioridade de exibicao |
| created_at | timestamptz | Data de criacao |
| updated_at | timestamptz | Data de atualizacao |

**Indices e RLS:**
- Indice em `imovel_id` para consultas rapidas
- RLS: Construtora dona do imovel pode CRUD
- Leitura publica para Edge Functions via service role

### 2. Nova Edge Function: `process-knowledge-pdf`

Processa PDFs enviados para a base de conhecimento, extraindo texto usando Gemini Vision.

**Fluxo:**
1. Recebe URL do PDF e `imovel_id`
2. Baixa o PDF
3. Envia para Gemini Vision com prompt para extrair informacoes estruturadas
4. Cria entradas na tabela `imovel_knowledge_base` automaticamente
5. Retorna lista de entradas criadas

**Prompt de extracao:**
```
Analise este documento PDF sobre um imovel/empreendimento e extraia as informacoes mais relevantes.

Para cada informacao importante encontrada, retorne no formato JSON:
[
  {
    "categoria": "FAQ|Especificacao|Financiamento|Documentacao|Outros",
    "titulo": "Titulo curto e descritivo",
    "conteudo": "Conteudo detalhado da informacao",
    "tags": ["tag1", "tag2"]
  }
]

Extraia informacoes como:
- Especificacoes tecnicas (metragem, materiais, acabamentos)
- Condicoes de pagamento e financiamento
- Diferenciais do empreendimento
- Regras e normas do condominio
- Informacoes sobre entrega e cronograma
- FAQs comuns sobre o imovel
```

### 3. Novo Componente: `Step4KnowledgeBase.tsx`

Secao no wizard de cadastro para gerenciar a base de conhecimento do imovel.

**Funcionalidades:**
- Upload de PDFs com extracao automatica via IA
- Adicao manual de entradas (titulo + conteudo)
- Lista de entradas com edicao inline
- Toggle de ativo/inativo por entrada
- Exclusao de entradas
- Preview do conteudo

**UI:**
```text
+-----------------------------------------------+
| Base de Conhecimento da IA                    |
| Informacoes que a Sofia usara para responder  |
+-----------------------------------------------+
| [Upload PDF] [+ Adicionar Manual]             |
+-----------------------------------------------+
| Entradas (5):                                 |
| +-------------------------------------------+ |
| | [FAQ] Qual a metragem?                    | |
| | A unidade possui 85m2 privativos...       | |
| | [Editar] [Excluir] [Ativo: ON]            | |
| +-------------------------------------------+ |
| | [Especificacao] Materiais de acabamento   | |
| | Piso em porcelanato, bancadas em granito  | |
| | [Editar] [Excluir] [Ativo: ON]            | |
| +-------------------------------------------+ |
+-----------------------------------------------+
```

### 4. Integrar no Wizard de Cadastro

**Arquivo: `src/pages/dashboard/construtora/NovoImovel.tsx`**

Modificar o Step 4 (Midias) para incluir uma nova aba "Base de Conhecimento IA" ou criar um Step intermediario.

**Opcao escolhida:** Adicionar aba no Step 4 existente.

### 5. Atualizar Edge Function `chatbot-message`

**Arquivo: `supabase/functions/chatbot-message/index.ts`**

Adicionar busca na tabela `imovel_knowledge_base` alem da `chatbot_knowledge_base` global:

```typescript
// Buscar base de conhecimento especifica do imovel
const { data: imovelKnowledge } = await supabase
  .from("imovel_knowledge_base")
  .select("categoria, titulo, conteudo")
  .eq("imovel_id", imovel_id)
  .eq("ativo", true)
  .order("prioridade", { ascending: false })
  .limit(30);

// Formatar e adicionar ao prompt
let imovelKnowledgeSection = "";
if (imovelKnowledge && imovelKnowledge.length > 0) {
  imovelKnowledgeSection = "\n\nBASE DE CONHECIMENTO DO IMOVEL:";
  // ... formatar por categoria
}
```

### 6. Pagina de Gerenciamento (Edicao de Imovel)

**Arquivo: `src/pages/dashboard/construtora/EditarImovel.tsx`**

Adicionar secao para gerenciar base de conhecimento de imoveis ja cadastrados.

## Resumo de Arquivos

**Novos arquivos:**
- `src/components/wizard/Step4KnowledgeBase.tsx` - Componente de upload/gerenciamento
- `supabase/functions/process-knowledge-pdf/index.ts` - Edge function para processar PDFs

**Arquivos modificados:**
- `src/pages/dashboard/construtora/NovoImovel.tsx` - Integrar no wizard
- `src/pages/dashboard/construtora/EditarImovel.tsx` - Adicionar secao KB
- `src/components/wizard/Step4Media.tsx` - Adicionar aba KB
- `supabase/functions/chatbot-message/index.ts` - Buscar KB do imovel
- `src/types/materiais-promocionais.ts` - Adicionar tipo para KB entries

**Migracao SQL:**
- Criar tabela `imovel_knowledge_base`
- Criar indice em `imovel_id`
- Criar politicas RLS

## Fluxo do Usuario

1. Usuario cria novo imovel no wizard
2. No Step 4 (Midias), clica na aba "Base de Conhecimento"
3. Faz upload de PDFs (book digital, memorial descritivo, etc)
4. Sistema extrai informacoes automaticamente via IA
5. Usuario revisa, edita ou adiciona entradas manualmente
6. Ao publicar, a base de conhecimento fica associada ao imovel
7. Quando visitante conversa com Sofia, ela usa essa base para responder

## Beneficios

1. **IA mais precisa**: Sofia responde com informacoes especificas do imovel
2. **Automacao**: Extracao automatica de PDFs reduz trabalho manual
3. **Flexibilidade**: Cada imovel tem sua propria base de conhecimento
4. **Controle**: Construtora pode editar/desativar informacoes
5. **Escalabilidade**: Funciona independente para cada imovel
