

## Atualizar Cards da Demo com Todas as Funcionalidades

Os cards da pagina `/demo` (DemoLanding) listam funcionalidades desatualizadas. Vou atualizar as listas para refletir todas as funcionalidades realmente disponíveis nos dashboards de Construtora e Imobiliária.

### Alteracao

**Arquivo:** `src/pages/demo/DemoLanding.tsx`

Atualizar o array `options` com as listas completas de features:

**Construtora** (atual: 6 itens, novo: 9 itens):
- Portfolio de imoveis
- Sites e Templates personalizados
- Pipeline CRM (Kanban)
- Visitas agendadas
- Gestao de leads
- Analytics avancado
- Feedbacks e Efeito UAU
- Imobiliarias parceiras
- Relatorios em PDF

**Imobiliaria** (atual: 6 itens, novo: 8 itens):
- Links white-label personalizados
- Gestao de leads
- Meus imoveis disponiveis
- Analytics de performance
- Agendamento de visitas
- Feedbacks pos-visita
- Relatorios em PDF
- Exportacao CSV

As descricoes dos cards tambem serao ajustadas para mencionar as novas funcionalidades como sites/templates e feedbacks.

### Detalhes Tecnicos

- Apenas o arquivo `src/pages/demo/DemoLanding.tsx` sera modificado
- Atualizacao dos arrays `features` dentro do objeto `options`
- Atualizacao dos textos de `description` para cobrir melhor o escopo
- Nenhuma dependencia nova necessaria

