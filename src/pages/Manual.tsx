import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Building2, Users, Home, Plus, Kanban, BarChart3, Calendar,
  ClipboardCheck, FileText, MessageSquare, Settings, Star, Share2,
  Link as LinkIcon, Images, Clock, ImagePlus, BookOpen, ArrowLeft,
  Play, Brain,
} from 'lucide-react';
import logoPrincipal from '@/assets/logo-principal.png';

/* ------------------------------------------------------------------ */
/*  Content data                                                       */
/* ------------------------------------------------------------------ */

const construtoraTopics = [
  {
    icon: Settings,
    title: 'Cadastro e Configuração Inicial',
    content: `Após criar sua conta como construtora, acesse **Configurações** no menu lateral para completar seu perfil:\n\n• **Logo da empresa** — será exibido nas páginas dos imóveis e nos relatórios em PDF.\n• **Cores da marca** — personalize a identidade visual da plataforma.\n• **Dados de contato** — e-mail, telefone e site para que imobiliárias e clientes possam entrar em contato.\n\nEssas informações são utilizadas automaticamente em todo o ecossistema.`,
  },
  {
    icon: Plus,
    title: 'Cadastrar um Imóvel (Wizard Passo a Passo)',
    content: `Clique em **Novo Imóvel** no menu lateral para iniciar o assistente de cadastro:\n\n1. **Informações Básicas** — título, endereço, preço, área, quartos e vagas.\n2. **Especificações** — detalhes técnicos como acabamento, infraestrutura e diferenciais.\n3. **Descrição** — texto comercial do imóvel. Use o assistente de IA para gerar sugestões.\n4. **Mídia** — faça upload de fotos (arraste para reordenar), vídeos e tour virtual 360°.\n5. **Revisão** — confira todas as informações antes de publicar.\n6. **Template Visual** — escolha entre Luxo, Moderno, Clássico ou Alto Padrão para a página do imóvel.\n\nApós publicar, o imóvel ganha uma página própria com URL amigável.`,
  },
  {
    icon: Star,
    title: 'Escolher Template Visual',
    content: `Cada imóvel pode usar um dos quatro estilos visuais:\n\n• **Luxo** — paleta dourada, tipografia serifada, ideal para empreendimentos exclusivos.\n• **Moderno** — tons azul/verde, fonte Montserrat, visual limpo e contemporâneo.\n• **Clássico** — estilo inspirado na identidade Godoy Prime.\n• **Alto Padrão** — azul oceânico com verde natureza, Montserrat e Roboto.\n\nVocê pode trocar o template a qualquer momento em **Editar Imóvel > Template**.`,
  },
  {
    icon: Users,
    title: 'Conceder Acesso a Imobiliárias',
    content: `Na página do imóvel, clique em **Gerenciar Acessos** para:\n\n• Convidar imobiliárias parceiras pelo nome ou e-mail.\n• Gerar links white-label exclusivos para cada parceiro — cada link tem um slug único que rastreia visitas e leads.\n• Ativar ou revogar acessos a qualquer momento.\n\nAs imobiliárias verão o imóvel em seu painel e poderão divulgar com sua própria marca.`,
  },
  {
    icon: Kanban,
    title: 'Pipeline de Vendas (8 Etapas)',
    content: `O Pipeline CRM organiza leads em 8 colunas visuais com arrastar-e-soltar:\n\n1. **Novo Lead** — acabou de chegar.\n2. **Contato Realizado** — primeiro contato feito.\n3. **Qualificado** — perfil financeiro confirmado.\n4. **Visita Agendada** — data marcada.\n5. **Visita Realizada** — feedback coletado.\n6. **Proposta Enviada** — negociação em andamento.\n7. **Em Negociação** — contrapropostas e ajustes.\n8. **Fechado** — venda concluída.\n\nCada card exibe score, dados de contato e histórico de atividades.`,
  },
  {
    icon: BarChart3,
    title: 'Analytics Consolidado',
    content: `O painel de Analytics oferece:\n\n• **Funil de Conversão** — visualize a taxa de progresso entre cada etapa do pipeline.\n• **Heatmap de Horários** — descubra quando seus leads estão mais ativos.\n• **Evolução por Imobiliária** — compare a performance de cada parceiro ao longo do tempo.\n• **Origem dos Leads** — identifique quais canais geram mais resultados.\n• **Tabela de Performance** — ranking das imobiliárias com métricas detalhadas.\n\nTodos os dados podem ser filtrados por imóvel e período.`,
  },
  {
    icon: Star,
    title: 'Efeito UAU e Satisfação',
    content: `Após cada visita, o sistema coleta feedback estruturado que alimenta os gráficos de satisfação:\n\n• **Efeito UAU** — descubra quais aspectos do imóvel mais impressionam: vista, acabamento, varanda, áreas comuns, etc.\n• **NPS (Net Promoter Score)** — meça a probabilidade de recomendação.\n• **Avaliações por Categoria** — localização, acabamento, layout, custo-benefício e atendimento.\n• **Nível de Interesse** — porcentagem de visitantes muito interessados vs. indecisos.\n• **Objeções** — entenda os motivos de resistência mais comuns.\n\nUse esses dados para ajustar a comunicação e direcionar campanhas.`,
  },
  {
    icon: FileText,
    title: 'Exportar Relatórios em PDF',
    content: `Na seção de Analytics e Feedbacks, clique em **Exportar PDF** para gerar relatórios prontos para apresentação:\n\n• Inclui gráficos de NPS, Efeito UAU, avaliações e evolução temporal.\n• Formato profissional com logo da construtora.\n• Ideal para reuniões com proprietários e investidores.\n• Os relatórios de feedback individual também podem ser exportados com assinatura digital.`,
  },
  {
    icon: Users,
    title: 'Gerenciar Imobiliárias Parceiras',
    content: `No menu **Imobiliárias**, você tem:\n\n• Lista completa de parceiros com status de acesso.\n• Métricas por imobiliária: leads gerados, visitas agendadas, conversão.\n• Gráficos de evolução comparativa.\n• Possibilidade de aprovar ou bloquear acessos.\n• Visualização das mídias enviadas por parceiros (com fluxo de aprovação).`,
  },
  {
    icon: Brain,
    title: 'Base de Conhecimento e Chatbot IA',
    content: `A assistente virtual **Sofia** utiliza inteligência artificial para atender visitantes 24/7:\n\n• Responde perguntas sobre o imóvel com base em dados cadastrados.\n• Qualifica leads automaticamente e coleta dados de contato.\n• Pode agendar visitas diretamente pela conversa.\n\nPara enriquecer as respostas, cadastre documentos na **Base de Conhecimento** do imóvel (PDFs, memoriais descritivos, FAQs). A IA extrai o conteúdo e utiliza nas conversas.`,
  },
];

const imobiliariaTopics = [
  {
    icon: Settings,
    title: 'Cadastro e Configuração',
    content: `Ao criar sua conta como imobiliária, preencha:\n\n• **Nome da empresa** e **CRECI**.\n• **Logo** — será exibido nas páginas white-label dos imóveis.\n• **Dados de contato** — telefone, e-mail e Instagram.\n• **Cor da marca** — personaliza elementos visuais nas suas páginas.\n• **Favicon** — ícone que aparece na aba do navegador.\n\nAcesse **Configurações** a qualquer momento para atualizar.`,
  },
  {
    icon: LinkIcon,
    title: 'Meus Links — Divulgação Personalizada',
    content: `Cada imóvel que a construtora libera para você ganha um **link exclusivo** com slug personalizado:\n\n• O link exibe o imóvel com **sua marca** (logo e cores).\n• Todas as visitas e leads capturados por esse link são rastreados automaticamente.\n• Copie o link e compartilhe em redes sociais, WhatsApp, e-mail marketing.\n• Acompanhe métricas em tempo real: visualizações, leads e conversão.`,
  },
  {
    icon: MessageSquare,
    title: 'Gestão de Leads',
    content: `No menu **Meus Leads** você encontra:\n\n• Lista de todos os leads capturados pelos seus links.\n• Filtros por imóvel, data, score e etapa do pipeline.\n• Contato rápido via WhatsApp com mensagem pré-formatada.\n• Detalhes completos: nome, e-mail, telefone, orçamento e prazo de compra.\n• Histórico de atividades de cada lead.`,
  },
  {
    icon: Kanban,
    title: 'Pipeline de Vendas',
    content: `O Pipeline CRM da imobiliária funciona com as mesmas 8 etapas do pipeline da construtora:\n\n• Visualize apenas seus leads (filtrados pela sua imobiliária).\n• Arraste cards entre colunas para atualizar o estágio.\n• Cada card mostra score de qualificação e dados de contato.\n• O pipeline alimenta os relatórios de analytics automaticamente.`,
  },
  {
    icon: Calendar,
    title: 'Agendamento de Visitas',
    content: `O sistema de agendamento oferece:\n\n• **Configurar Agenda** — defina seus horários disponíveis por dia da semana.\n• **Bloqueios** — marque períodos indisponíveis (férias, feriados).\n• Clientes podem solicitar visitas diretamente pela página do imóvel.\n• Lembretes automáticos por e-mail 24h e 1h antes da visita.\n• Fluxo de confirmação digital para ambas as partes.`,
  },
  {
    icon: ClipboardCheck,
    title: 'Feedback Pós-Visita',
    content: `Após cada visita realizada, o corretor preenche um formulário estruturado:\n\n• **Interesse de compra** — nível de interesse do cliente.\n• **Avaliações** — localização, acabamento, layout, custo-benefício e atendimento (1 a 5 estrelas).\n• **Efeito UAU** — quais aspectos mais impressionaram o visitante.\n• **Objeções** — motivos de resistência identificados.\n• **Poder de decisão** e **prazo de compra** estimados.\n• **Assinatura digital** — tanto do corretor quanto do cliente, com registro de data/hora.\n\nO cliente também recebe um link para preencher sua avaliação independente.`,
  },
  {
    icon: BarChart3,
    title: 'Analytics de Satisfação',
    content: `O painel de Analytics da imobiliária inclui:\n\n• **NPS consolidado** — média de satisfação dos seus clientes.\n• **Gráficos de avaliação** — radar com notas por categoria.\n• **Efeito UAU** — ranking dos aspectos mais impactantes.\n• **Taxa de resposta** — porcentagem de feedbacks completados.\n• **Evolução temporal** — acompanhe tendências ao longo do tempo.\n\nFiltre por imóvel e período para análises mais específicas.`,
  },
  {
    icon: FileText,
    title: 'Exportar Relatórios em PDF',
    content: `Gere relatórios profissionais para apresentar aos seus clientes:\n\n• Clique em **Exportar PDF** na seção de Analytics ou Feedbacks.\n• O relatório inclui gráficos de NPS, Efeito UAU, avaliações e nível de interesse.\n• Formato com sua logo e identidade visual.\n• Ideal para relatórios de acompanhamento e prestação de contas.`,
  },
  {
    icon: Settings,
    title: 'Configurar Formulários Personalizados',
    content: `Em **Configurações > Formulários**, você pode personalizar os formulários de:\n\n• **Agendamento de visita** — adicione campos extras como tipo de documento, preferências de horário.\n• **Feedback do corretor** — inclua perguntas específicas da sua operação.\n• **Feedback do cliente** — adapte o questionário pós-visita.\n\nUse o editor visual para arrastar, reordenar e configurar campos (texto, seleção, múltipla escolha, etc.).`,
  },
  {
    icon: ImagePlus,
    title: 'Enviar Mídias para Aprovação',
    content: `Na seção **Minhas Mídias**, você pode:\n\n• Enviar fotos e vídeos adicionais para os imóveis que você divulga.\n• As mídias ficam com status "Pendente" até a construtora aprovar.\n• Após aprovação, as mídias são adicionadas à galeria do imóvel.\n• Isso permite que a imobiliária contribua com conteúdo atualizado mantendo o controle de qualidade da construtora.`,
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function TopicList({ topics }: { topics: typeof construtoraTopics }) {
  return (
    <Accordion type="multiple" className="w-full">
      {topics.map((topic, i) => (
        <AccordionItem key={i} value={`item-${i}`}>
          <AccordionTrigger className="text-left">
            <span className="flex items-center gap-3">
              <topic.icon className="h-5 w-5 text-primary shrink-0" />
              <span className="font-medium">{topic.title}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line pl-8">
              {topic.content}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default function Manual() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/apresentacao">
              <img src={logoPrincipal} alt="Godoy Prime" className="h-10" />
            </Link>
            <div className="hidden sm:block h-8 w-px bg-border" />
            <div className="hidden sm:flex items-center gap-2 text-lg font-semibold">
              <BookOpen className="h-5 w-5 text-primary" />
              Manual do Usuário
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/demo">
                <Play className="h-4 w-4 mr-1" /> Demo
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/apresentacao">
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-3">Guia Completo da Plataforma</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Aprenda a utilizar todas as funcionalidades. Selecione seu perfil abaixo para ver o guia específico.
          </p>
        </div>

        <Tabs defaultValue="construtora" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="construtora" className="gap-2">
              <Building2 className="h-4 w-4" /> Construtora
            </TabsTrigger>
            <TabsTrigger value="imobiliaria" className="gap-2">
              <Home className="h-4 w-4" /> Imobiliária
            </TabsTrigger>
          </TabsList>

          <TabsContent value="construtora">
            <TopicList topics={construtoraTopics} />
          </TabsContent>

          <TabsContent value="imobiliaria">
            <TopicList topics={imobiliariaTopics} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Godoy Prime Realty — Tecnologia para o mercado imobiliário de alto padrão</p>
      </footer>
    </div>
  );
}
