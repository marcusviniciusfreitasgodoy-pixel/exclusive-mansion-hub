
# Manual, Onboarding e Tour Guiado

## Resumo
Criar (1) uma pagina publica de Manual com guias completos para Construtoras e Imobiliarias, (2) um tour guiado interativo que aparece no primeiro acesso ao dashboard real apos o cadastro, (3) uma secao "Como Funciona" na pagina de Apresentacao, e (4) links para o manual nos sidebars.

---

## 1. Pagina de Manual (`/manual`)

**Novo arquivo:** `src/pages/Manual.tsx`

Pagina publica com duas abas (Tabs) — "Construtora" e "Imobiliaria". Cada aba usa Accordion para organizar topicos:

**Aba Construtora:**
- Cadastro e Configuracao Inicial
- Cadastrar um Imovel (wizard passo a passo)
- Escolher Template Visual
- Conceder Acesso a Imobiliarias
- Pipeline de Vendas (8 etapas)
- Analytics Consolidado
- Efeito UAU e Satisfacao
- Exportar Relatorios em PDF
- Gerenciar Imobiliarias Parceiras
- Base de Conhecimento e Chatbot IA

**Aba Imobiliaria:**
- Cadastro e Configuracao
- Meus Links — Divulgacao Personalizada
- Gestao de Leads
- Pipeline de Vendas
- Agendamento de Visitas
- Feedback Pos-Visita
- Analytics de Satisfacao
- Exportar Relatorios em PDF
- Configurar Formularios Personalizados
- Enviar Midias para Aprovacao

---

## 2. Tour Guiado nos Dashboards Reais (primeiro acesso)

**Novo arquivo:** `src/components/dashboard/GuidedTour.tsx`

Componente leve com overlay + tooltip posicionado sobre elementos do sidebar. Persiste no `localStorage` para exibir apenas uma vez. Inclui botoes Proximo/Anterior/Pular e indicador de progresso.

```text
interface TourStep {
  targetSelector: string;  // CSS selector do elemento alvo
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}
```

**Tour Construtora (6 passos):**
1. "Seus imoveis cadastrados aparecem aqui."
2. "O Pipeline CRM organiza seus leads em 8 etapas visuais."
3. "Em Analytics, veja funil de conversao, Efeito UAU e exporte PDF."
4. "Gerencie visitas agendadas e confirmacoes."
5. "Veja a performance de cada imobiliaria parceira."
6. "Acesse o Manual completo pelo menu a qualquer momento."

**Tour Imobiliaria (5 passos):**
1. "Veja os imoveis disponiveis para divulgacao com sua marca."
2. "Em Meus Links, copie links personalizados e acompanhe metricas."
3. "Gerencie seus leads com filtros e contato rapido."
4. "Em Analytics, veja NPS, Efeito UAU e exporte PDF."
5. "Acompanhe visitas agendadas pelos seus clientes."

**Integracao:** O componente sera adicionado dentro do `DashboardLayout.tsx`, usando o `role` do `useAuth()` para determinar qual tour exibir. A chave do localStorage sera `tour-completed-{userId}` para garantir que cada usuario veja o tour apenas uma vez.

---

## 3. Secao "Como Funciona" na Apresentacao

**Arquivo modificado:** `src/pages/Apresentacao.tsx`

Nova secao entre "Funcionalidades" e "Para cada perfil" com 4 passos visuais numerados:
1. Cadastre seu imovel — Fotos, videos e template visual
2. Compartilhe com parceiros — Links white-label rastreados
3. Acompanhe em tempo real — Leads, NPS e Efeito UAU
4. Exporte e apresente — Relatorios em PDF prontos

Tambem adicionar link para o Manual na secao "Veja na pratica" e no footer.

---

## 4. Link "Manual" nos Sidebars

**Arquivos modificados:**
- `src/components/dashboard/DashboardSidebar.tsx` — Adicionar item "Manual" (icone BookOpen) em ambos os perfis, abrindo `/manual` em nova aba
- `src/components/demo/DemoDashboardSidebar.tsx` — Idem para o sidebar do demo
- `src/pages/demo/DemoLanding.tsx` — Adicionar link para o manual e mencao ao tour guiado

---

## 5. Rota no App.tsx

**Arquivo modificado:** `src/App.tsx`

Adicionar rota lazy para `/manual`:
```typescript
const Manual = lazy(() => import("./pages/Manual"));
// ...
<Route path="/manual" element={<LazyRoute><Manual /></LazyRoute>} />
```

---

## Detalhes Tecnicos

### Arquivos novos
1. `src/pages/Manual.tsx` — Tabs + Accordion, icones Lucide, responsivo
2. `src/components/dashboard/GuidedTour.tsx` — Overlay, tooltip, localStorage, progresso

### Arquivos modificados
1. `src/App.tsx` — Rota /manual
2. `src/components/dashboard/DashboardLayout.tsx` — Integrar GuidedTour com role do useAuth
3. `src/components/dashboard/DashboardSidebar.tsx` — Item "Manual" (BookOpen)
4. `src/components/demo/DemoDashboardSidebar.tsx` — Item "Manual" (BookOpen)
5. `src/pages/demo/DemoLanding.tsx` — Link para manual
6. `src/pages/Apresentacao.tsx` — Secao "Como Funciona" e link para manual

### Nenhuma dependencia nova necessaria
Tudo construido com Tabs, Accordion, Tooltip e Tailwind ja disponiveis.
