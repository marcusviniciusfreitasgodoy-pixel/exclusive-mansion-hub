

# Modo Demonstracao para Apresentacao Comercial

## Objetivo
Permitir que visitantes explorem os paineis da construtora e da imobiliaria sem precisar criar conta, usando dados ficticios realistas.

## Como vai funcionar

1. Uma pagina publica `/demo` apresenta duas opcoes: "Explorar como Construtora" e "Explorar como Imobiliaria"
2. Ao escolher, o visitante entra no painel correspondente com dados ficticios ja carregados
3. Uma faixa no topo indica que esta no modo demonstracao, com botao para criar conta real
4. A navegacao lateral (menu) funciona normalmente, todas as paginas mostram dados ficticios
5. Acoes destrutivas (excluir, editar, salvar) sao bloqueadas com aviso amigavel

## Estrutura de Implementacao

### 1. Contexto de Demonstracao (`src/contexts/DemoContext.tsx`)
- Fornece a flag `isDemo` e dados ficticios de construtora/imobiliaria
- Sobrepoe o contexto de autenticacao para que os paineis funcionem sem login real

### 2. Dados Ficticios (`src/data/demo-data.ts`)
- Construtora ficticia: "Construtora Exemplo Premium"
- Imobiliaria ficticia: "Imobiliaria Modelo & Associados"
- 4 imoveis com imagens, precos e detalhes realistas
- 12 leads com status variados e datas recentes
- 8 agendamentos de visitas
- Dados de analytics: visualizacoes, funil de conversao, mapa de horarios
- 5 feedbacks de satisfacao com notas e comentarios
- 3 imobiliarias parceiras com metricas

### 3. Gancho Personalizado (`src/hooks/useDemoQuery.ts`)
- Substitui as chamadas ao banco de dados quando em modo demonstracao
- Retorna os dados ficticios no mesmo formato que o banco real
- As paginas existentes precisam de ajuste minimo

### 4. Pagina de Entrada (`src/pages/demo/DemoLanding.tsx`)
- Design atraente com logo e descricao da plataforma
- Dois cartoes grandes: "Construtora" e "Imobiliaria"
- Sem necessidade de login

### 5. Faixa de Demonstracao (`src/components/demo/DemoBanner.tsx`)
- Barra fixa no topo: "Voce esta no modo demonstracao"
- Botoes: "Criar Conta" e "Trocar Perfil"

### 6. Rotas de Demonstracao (em `App.tsx`)
- `/demo` - pagina de escolha
- `/demo/construtora` - painel da construtora com dados ficticios
- `/demo/construtora/leads` - leads ficticios
- `/demo/construtora/analytics` - graficos com dados ficticios
- `/demo/construtora/pipeline` - quadro visual com leads ficticios
- `/demo/imobiliaria` - painel da imobiliaria com dados ficticios
- `/demo/imobiliaria/leads` - leads da imobiliaria
- `/demo/imobiliaria/meus-links` - links personalizados ficticios

## Paginas incluidas na demonstracao

### Construtora (6 paginas)
- Meus Imoveis (pagina principal)
- Leads
- Analytics (graficos e metricas)
- Pipeline de vendas (quadro visual)
- Imobiliarias parceiras
- Agendamentos

### Imobiliaria (5 paginas)
- Imoveis Disponiveis (pagina principal)
- Meus Links
- Meus Leads
- Analytics
- Agendamentos

## Secao Tecnica

### Arquivos a criar (7 arquivos)
- `src/contexts/DemoContext.tsx` - contexto React com Provider
- `src/data/demo-data.ts` - todos os dados ficticios centralizados
- `src/hooks/useDemoQuery.ts` - gancho que intercepta consultas
- `src/pages/demo/DemoLanding.tsx` - pagina de entrada
- `src/pages/demo/DemoConstrutora.tsx` - wrapper das paginas da construtora
- `src/pages/demo/DemoImobiliaria.tsx` - wrapper das paginas da imobiliaria
- `src/components/demo/DemoBanner.tsx` - faixa superior de aviso

### Arquivos a modificar (4 arquivos)
- `src/App.tsx` - adicionar rotas `/demo/*`
- `src/contexts/AuthContext.tsx` - exportar tipo do contexto para reutilizar
- `src/components/dashboard/DashboardSidebar.tsx` - ajustar links em modo demo
- `src/components/dashboard/DashboardLayout.tsx` - incluir DemoBanner quando em modo demo

### Abordagem tecnica para as queries
Cada pagina do dashboard faz consultas proprias ao banco. Em vez de modificar cada pagina individualmente, o `DemoContext` vai:
1. Fornecer os mesmos campos que o `AuthContext` (user, role, construtora, imobiliaria)
2. O `useDemoQuery` vai interceptar chamadas do `useQuery` retornando dados ficticios baseados na `queryKey`
3. As mutacoes (salvar, excluir) serao interceptadas para mostrar um aviso: "Esta funcao nao esta disponivel no modo demonstracao"

### Dados ficticios realistas
Os imoveis ficticios serao baseados no mercado imobiliario de alto padrao:
- "Residencial Vista Mar" - R$ 2.800.000 - Riviera de Sao Lourenco
- "Condominio Jardins do Lago" - R$ 1.950.000 - Alphaville
- "Edifício Horizon Tower" - R$ 3.200.000 - Vila Olimpia
- "Casa Térrea Premium" - R$ 1.450.000 - Granja Viana

Os leads terao nomes, telefones e emails ficticios com status variados para popular o pipeline visual.

