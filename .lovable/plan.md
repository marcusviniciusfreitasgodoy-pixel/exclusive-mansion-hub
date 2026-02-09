
## Incluir Dominio Customizado no Manual e Tour Guiado

### O que sera feito

Duas alteracoes simples para documentar a nova funcionalidade de dominio customizado:

### 1. Manual (`src/pages/Manual.tsx`)

**Construtora** -- Adicionar novo topico ao array `construtoraTopics`:
- Icone: `Globe` (importar de lucide-react)
- Titulo: "Dominio Customizado"
- Conteudo explicando os 3 passos: salvar dominio, configurar CNAME apontando para `whitelabel.godoyprime.com.br`, e verificar/ativar. Mencionar que visitantes verao o portfolio com branding proprio.

**Imobiliaria** -- Adicionar novo topico ao array `imobiliariaTopics`:
- Mesmo icone e estrutura, adaptado para o contexto de imobiliaria (exibir imoveis vinculados com marca propria).

Posicao: logo apos o topico de "Cadastro e Configuracao" em ambos os arrays, pois e uma configuracao do perfil.

### 2. Tour Guiado (`src/components/dashboard/GuidedTour.tsx`)

**TOUR_CONSTRUTORA** -- Adicionar novo step antes do step "Manual":
- `targetSelector`: `'[data-tour="configuracoes"]'`
- `title`: "Dominio Customizado"
- `description`: "Em Configuracoes, conecte seu proprio dominio para exibir imoveis com sua marca."
- `position`: "right"

**TOUR_IMOBILIARIA** -- Adicionar novo step no final (antes de um eventual "Manual", se existir):
- Mesmo seletor e estrutura adaptada para imobiliaria.

Nota: O sidebar ja atribui `data-tour` dinamicamente via `tourId` nos links. Sera necessario verificar se o link de "Configuracoes" ja tem um `tourId` definido; caso contrario, adicionar `tourId: 'configuracoes'` na definicao do link no `DashboardSidebar.tsx`.

### Detalhes Tecnicos

**Arquivos modificados:**
- `src/pages/Manual.tsx` -- adicionar 1 topico em `construtoraTopics` e 1 em `imobiliariaTopics`, importar icone `Globe`
- `src/components/dashboard/GuidedTour.tsx` -- adicionar 1 step em `TOUR_CONSTRUTORA` e 1 em `TOUR_IMOBILIARIA`
- `src/components/dashboard/DashboardSidebar.tsx` -- garantir que o link de Configuracoes tenha `tourId: 'configuracoes'`

Nenhum arquivo novo. Nenhuma dependencia adicional.
