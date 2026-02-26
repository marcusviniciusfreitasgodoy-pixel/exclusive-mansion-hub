

## Atualizar Pagina de Apresentacao com 17 Funcionalidades

### Objetivo
Substituir a lista atual de 10 funcionalidades genericas por uma estrutura organizada em 4 categorias tematicas com as 17 funcionalidades mapeadas, incluindo dor, solucao e beneficio para cada uma. Adicionar tambem as personas Corretor e Cliente.

### Mudancas em `src/pages/Apresentacao.tsx`

**1. Substituir `PLATFORM_FEATURES` por `FEATURE_CATEGORIES`**

Nova estrutura de dados com 4 categorias, cada uma contendo suas funcionalidades com dor e beneficio:

- **Vendas e CRM** (icone: TrendingUp)
  - Pipeline Kanban (8 estagios) - Dor: leads sem acompanhamento
  - Propostas formais com validacao - Dor: propostas informais sem controle
  - Fichas de visita com hash e geo - Dor: visitas sem registro legal
  - Agendamento inteligente com docs - Dor: agendamento manual e desorganizado

- **Marketing e Branding** (icone: Palette)
  - Sites white-label por parceiro - Dor: materiais despadronizados
  - Templates premium (4 estilos) - Dor: paginas amadoras
  - Dominio personalizado - Dor: URLs genericas sem credibilidade
  - Aprovacao de midias (workflow) - Dor: uso de materiais nao autorizados

- **IA e Atendimento** (icone: Bot)
  - Sofia AI 24/7 com voz - Dor: leads sem resposta rapida
  - Base de conhecimento (PDFs) - Dor: corretores sem informacao do imovel
  - Resposta em menos de 1 minuto - Dor: atendimento demorado

- **Dados e Gestao** (icone: BarChart3)
  - Feedback NPS com assinatura digital - Dor: feedback perdido em papel
  - Analytics BI (heatmap, funil) - Dor: decisoes sem dados
  - Multi-tenant (construtora/imobiliaria) - Dor: dados misturados entre parceiros
  - Hub de integracoes (GA4, Pixel, webhooks) - Dor: sistemas isolados
  - Efeito UAU (ranking de impressoes) - Dor: sem saber o que encanta o cliente
  - Gestao de parceiros consolidada - Dor: sem visibilidade das imobiliarias

**2. Nova secao visual: "Funcionalidades por Categoria"**

Substituir o grid simples de cards por uma secao com 4 blocos tematicos:
- Cada bloco com icone gold, titulo da categoria e lista de funcionalidades
- Cada funcionalidade mostra: nome em bold, descricao curta e tags de persona
- Layout em grid 2x2 para desktop, empilhado no mobile
- Cards com borda lateral gold e hover com sombra

**3. Expandir personas no Benefits Strip**

Atualizar a secao de metricas para incluir beneficios para as 4 personas:
- Construtora: 100% visibilidade sobre parceiros
- Imobiliaria: Materiais prontos e leads rastreados
- Corretor: Resposta em menos de 1 min com IA
- Cliente: Experiencia digital premium

**4. Adicionar tags de persona expandidas**

Incluir `corretor` e `cliente` no type `Audience`:
```text
type Audience = 'construtora' | 'imobiliaria' | 'corretor' | 'cliente';
```

Legenda visual com 4 cores:
- Construtora: bg-primary (navy)
- Imobiliaria: bg-secondary (gold)
- Corretor: bg-emerald-600
- Cliente: bg-blue-500

**5. Atualizar FAQ**

Adicionar 3 novas perguntas ao FAQ:
- "Como a plataforma ajuda o corretor no dia a dia?" (persona: corretor)
- "O cliente final precisa criar conta?" (persona: cliente)
- "Posso usar a plataforma sem imobiliaria parceira?" (ja existe, adicionar tag corretor)

**6. Icones adicionais a importar**

Adicionar ao import do lucide-react: `Bot`, `Palette`, `Layout`, `Globe`, `FileCheck`, `Megaphone`

### Secoes que permanecem inalteradas
- Hero (titulo, subtitulo, botoes)
- Pain Points (6 dores)
- Como Funciona (4 passos)
- CTA Demo
- Formulario de contato
- Footer
- FloatingWhatsApp

### Resultado esperado
Pagina de apresentacao comercial completa com todas as 17 funcionalidades organizadas por categoria, cada uma conectada a uma dor especifica e com tags de persona (Construtora, Imobiliaria, Corretor, Cliente).
