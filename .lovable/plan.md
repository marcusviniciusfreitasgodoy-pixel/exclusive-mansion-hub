

## Atualizar One-Pager com Funcionalidades Completas

### Objetivo
Enriquecer o one-pager existente com as 17 funcionalidades mapeadas, organizadas pela logica **Dor -> Solucao -> Beneficio**, mantendo o formato A4 exportavel em PDF.

### Nova Estrutura do One-Pager

```text
+------------------------------------------+
|  [Logo Godoy Prime]    ONE-PAGER COMERCIAL|
+------------------------------------------+
|  O PROBLEMA (5 dores - manter atual)     |
+------------------------------------------+
|  A SOLUCAO (texto resumido - manter)     |
+------------------------------------------+
|  FUNCIONALIDADES POR CATEGORIA           |
|                                          |
|  Vendas & CRM          | Marketing       |
|  - Pipeline Kanban     | - White-label   |
|  - Propostas formais   | - Templates     |
|  - Fichas de visita    | - Dominio custom|
|  - Agendamento         | - Aprovacao     |
|                        |   de midias     |
|------------------------+-----------------|
|  IA & Atendimento      | Dados & Gestao  |
|  - Sofia AI 24/7       | - Feedback NPS  |
|  - Base conhecimento   | - Analytics BI  |
|  - Voz (ElevenLabs)    | - Multi-tenant  |
|                        | - Integracoes   |
+------------------------------------------+
|  DIFERENCIAIS          | PUBLICO-ALVO    |
|  (5 itens - manter)    | (4 itens)       |
+------------------------------------------+
|  CTA + Contatos (manter)                 |
+------------------------------------------+
```

### Mudancas em `src/pages/OnePager.tsx`

**1. Nova secao "Funcionalidades" entre Solucao e Diferenciais**
- Grid 2x2 com 4 categorias: Vendas e CRM, Marketing e Branding, IA e Atendimento, Dados e Gestao
- Cada categoria com icone gold, titulo navy e 3-4 funcionalidades listadas com texto compacto
- Cada funcionalidade inclui nome + beneficio curto (1 linha)
- Fundo alternado para separacao visual

**2. Compactar textos existentes**
- Reduzir padding das secoes de `py-7` para `py-5` para caber tudo em uma pagina A4
- Reduzir espacamento dos problemas de `space-y-2` para `space-y-1.5`
- Usar `text-xs` nos itens de funcionalidades para densidade

**3. Adicionar icones para as categorias**
- Importar icones adicionais do lucide-react: `BarChart3`, `Shield`, `Bot`, `Palette`
- Vendas e CRM: `TrendingUp`
- Marketing: `Palette`
- IA: `Bot`
- Dados: `BarChart3`

### Conteudo das Funcionalidades

**Vendas e CRM**
- Pipeline Kanban: Gestao visual de 8 estagios de leads
- Propostas formais: Documentos com validacao e assinatura
- Fichas de visita: Registro com hash e geolocalizacao (validade juridica)
- Agendamento inteligente: Calendario integrado com upload de docs

**Marketing e Branding**
- Sites white-label: Cada parceiro com sua marca automaticamente
- Templates premium: 4 estilos (Luxo, Moderno, Classico, Alto Padrao)
- Dominio personalizado: URL propria para cada construtora
- Aprovacao de midias: Workflow de controle de marca

**IA e Atendimento**
- Sofia AI 24/7: Chatbot com voz e base de conhecimento
- Base de conhecimento: Alimentada por PDFs tecnicos
- Resposta instantanea: Atendimento em menos de 1 minuto

**Dados e Gestao**
- Feedback NPS: Pesquisa pos-visita com assinatura digital
- Analytics BI: Heatmap, funil, ROI e metricas por parceiro
- Multi-tenant: Gestao separada construtora/imobiliaria
- Hub de integracoes: GA4, Pixel, webhooks

### Resultado esperado
Um one-pager completo que apresenta todas as 17 funcionalidades organizadas em 4 categorias, mantendo o layout A4, as cores da marca e a exportacao em PDF funcional.
