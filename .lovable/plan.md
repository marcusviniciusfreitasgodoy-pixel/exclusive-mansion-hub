

## Traduzir Termos em Ingles para Portugues

### Objetivo
Substituir todos os termos em ingles por equivalentes em portugues nas paginas de Apresentacao e One-Pager PDF, tornando o conteudo mais acessivel para o publico-alvo.

### Mapeamento de Traducoes

| Termo em Ingles | Traducao em Portugues |
|---|---|
| One-Pager Comercial | Resumo Comercial |
| Leads | Contatos |
| Feedback | Avaliacao / Retorno |
| White-label | Marca propria |
| Pipeline Kanban | Funil Visual (Kanban) |
| Templates premium | Modelos exclusivos |
| Workflow | Fluxo de aprovacao |
| Landing pages | Paginas de apresentacao |
| Analytics completo | Painel analitico completo |
| Analytics BI | Painel de Indicadores |
| Heatmap | Mapa de calor |
| ROI | Retorno sobre investimento |
| Hub de integracoes | Central de integracoes |
| Multi-tenant | Multiempresa |
| Sofia AI 24/7 | Sofia IA 24/7 |
| Chatbot | Assistente virtual |
| Hash | Codigo de verificacao |
| Upload | Envio |
| SaaS | Plataforma digital |
| Vendas & CRM | Vendas e Gestao de Clientes |
| Marketing & Branding | Marketing e Marca |
| IA & Atendimento | IA e Atendimento |
| Dados & Gestao | Dados e Gestao |
| Feedback NPS | Pesquisa de Satisfacao (NPS) |
| Efeito UAU | Efeito UAU (manter - ja e portugues) |
| Dashboard | Painel de controle |
| Webhooks | Automacoes externas |

### Arquivos a Alterar

**1. `src/pages/OnePager.tsx`** (~25 substituicoes)
- Header: "One-Pager Comercial" → "Resumo Comercial"
- Problemas: "Leads esfriam" → "Contatos esfriam", "feedback" → "avaliacao"
- Diferenciais: "White-label dinamico" → "Marca propria dinamica", "Analytics completo" → "Painel analitico", "Heatmap, funil e ROI" → "Mapa de calor, funil e retorno", "Landing pages" → "Paginas de apresentacao"
- Publico-alvo: "pipeline de vendas" → "funil de vendas", "leads qualificados" → "contatos qualificados"
- Funcionalidades: todas as categorias e itens conforme tabela acima
- Solucao: "SaaS" → "plataforma digital", "white-label" → "marca propria", "analytics" → "indicadores"

**2. `src/components/apresentacao/FeatureCategoriesSection.tsx`** (~20 substituicoes)
- Titulos das categorias: "Vendas & CRM" → "Vendas e Gestao de Clientes", etc.
- Nomes das funcionalidades: "Pipeline Kanban" → "Funil Visual (Kanban)", "Sites White-Label" → "Sites com Marca Propria", "Templates Premium" → "Modelos Exclusivos", "Sofia AI 24/7" → "Sofia IA 24/7"
- Descricoes: "leads" → "contatos", "upload" → "envio", "Workflow" → "Fluxo de aprovacao", "Chatbot" → "Assistente virtual", "Heatmap" → "Mapa de calor", "ROI" → "Retorno", "webhooks" → "automacoes externas", "Multi-tenant" → "Multiempresa", "Analytics BI" → "Painel de Indicadores"

**3. `src/components/apresentacao/BenefitsStrip.tsx`** (~2 substituicoes)
- "leads rastreados" → "contatos rastreados"
- "chatbot IA" → "assistente virtual IA"

**4. `src/components/apresentacao/FAQSection.tsx`** (~15 substituicoes)
- "white-label" → "marca propria" em todas as perguntas e respostas
- "leads" → "contatos"
- "chatbot Sofia" → "assistente virtual Sofia"
- "hash de integridade" → "codigo de verificacao de integridade"
- "heatmap" → "mapa de calor"
- "dashboard" → "painel de controle"
- "feedback" → "avaliacao" (quando aplicavel)
- "Efeito UAU" → manter (ja e portugues)
- "NPS" → manter com contexto "(Pesquisa de Satisfacao)"

**5. `src/pages/Apresentacao.tsx`** (~3 substituicoes)
- "white-label" na secao Como Funciona → "marca propria"
- "NPS e Efeito UAU no dashboard" → "satisfacao e Efeito UAU no painel"
- "Links white-label rastreados" → "Links com marca propria rastreados"

### Termos mantidos em ingles (justificativa tecnica)
- **NPS**: sigla universalmente conhecida, mantida com explicacao "(Pesquisa de Satisfacao)"
- **Kanban**: termo japones universalmente adotado, mantido entre parenteses
- **PDF/CSV**: siglas tecnicas universais
- **GA4, Pixel**: nomes proprios de produtos (Google Analytics 4, Meta Pixel)
- **WhatsApp, E-mail**: nomes proprios / ja incorporados ao portugues

### Detalhes tecnicos
- Apenas conteudo textual sera alterado (strings, labels, descricoes)
- Nenhuma alteracao em logica, layout ou estilos
- Nome do arquivo PDF exportado sera alterado para "godoy-prime-resumo-comercial.pdf"
