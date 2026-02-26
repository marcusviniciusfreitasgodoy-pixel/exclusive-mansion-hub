import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

type Audience = 'construtora' | 'imobiliaria' | 'corretor' | 'cliente';

const AUDIENCE_STYLES: Record<Audience, { label: string; className: string }> = {
  construtora: { label: 'Construtora', className: 'bg-primary text-primary-foreground' },
  imobiliaria: { label: 'Imobiliária', className: 'bg-secondary text-secondary-foreground' },
  corretor: { label: 'Corretor', className: 'bg-emerald-600 text-white' },
  cliente: { label: 'Cliente', className: 'bg-blue-500 text-white' },
};

const FAQ_ITEMS: { question: string; answer: string; audience: Audience[] }[] = [
  {
    question: 'O que é a plataforma Godoy Prime e para quem ela foi feita?',
    answer: 'É uma plataforma que conecta construtoras, imobiliárias, corretores e clientes em um único ambiente digital. Construtoras cadastram imóveis e distribuem para parceiros com rastreamento completo; imobiliárias recebem páginas white-label com sua marca; corretores têm ferramentas de atendimento com IA; e clientes vivem uma experiência digital premium.',
    audience: ['construtora', 'imobiliaria', 'corretor', 'cliente'],
  },
  {
    question: 'Preciso de uma imobiliária parceira para usar a plataforma?',
    answer: 'Não. Construtoras podem gerar links diretos dos imóveis com seu próprio branding (logo, cores e favicon), sem depender de uma imobiliária intermediária. Corretores autônomos também podem utilizar as ferramentas de agendamento e feedback diretamente.',
    audience: ['construtora', 'corretor'],
  },
  {
    question: 'Como funciona o link white-label para imobiliárias?',
    answer: 'A construtora concede acesso ao imóvel para a imobiliária, que recebe um link exclusivo com sua marca (logo, cor primária e favicon). Cada acesso, lead e visita é rastreado individualmente, permitindo medir a performance de cada parceiro.',
    audience: ['imobiliaria', 'construtora'],
  },
  {
    question: 'Os leads gerados ficam visíveis para quem?',
    answer: 'Os leads ficam visíveis tanto para a construtora quanto para a imobiliária parceira que gerou o contato. Cada parte vê apenas os dados relevantes ao seu escopo, respeitando a privacidade e o isolamento de dados entre parceiros.',
    audience: ['construtora', 'imobiliaria'],
  },
  {
    question: 'Como a plataforma ajuda o corretor no dia a dia?',
    answer: 'O corretor conta com a assistente Sofia AI para responder dúvidas de clientes 24/7, base de conhecimento completa de cada imóvel para se preparar antes das visitas, fichas de visita digitais com validade jurídica e agendamento inteligente com confirmação automática.',
    audience: ['corretor'],
  },
  {
    question: 'O cliente final precisa criar conta na plataforma?',
    answer: 'Não. O cliente acessa as páginas dos imóveis diretamente pelo link compartilhado, interage com o chatbot Sofia, agenda visitas e envia propostas sem precisar criar nenhuma conta. A experiência é 100% digital e sem fricção.',
    audience: ['cliente'],
  },
  {
    question: 'Como funciona o agendamento de visitas pela plataforma?',
    answer: 'O visitante escolhe duas opções de data/horário, faz upload de um documento de identificação (RG/CNH) e envia a solicitação. A construtora e a imobiliária recebem notificações automáticas por e-mail e WhatsApp, com links diretos para confirmar ou reagendar.',
    audience: ['construtora', 'imobiliaria', 'cliente'],
  },
  {
    question: 'O que é o chatbot Sofia e como ela ajuda na conversão?',
    answer: 'A Sofia é uma assistente virtual com IA treinada na base de conhecimento de cada imóvel. Ela responde dúvidas 24/7, qualifica leads automaticamente e pode agendar visitas — tudo sem intervenção humana. Suporta texto e voz.',
    audience: ['construtora', 'cliente'],
  },
  {
    question: 'O feedback de visita tem validade jurídica?',
    answer: 'Sim. O relatório de feedback inclui assinatura digital do cliente e do corretor, com registro de data, dispositivo e geolocalização. O PDF gerado automaticamente possui hash de integridade, conferindo rastreabilidade e validade legal.',
    audience: ['construtora', 'imobiliaria', 'corretor'],
  },
  {
    question: 'Quais métricas e relatórios estão disponíveis?',
    answer: 'O dashboard inclui funil de conversão, heatmap de horários, NPS de visitas, ranking de "Efeito UAU", performance por imobiliária parceira, evolução temporal de leads e exportação de relatórios em PDF e CSV.',
    audience: ['construtora', 'imobiliaria'],
  },
  {
    question: 'Quanto custa a plataforma?',
    answer: 'Oferecemos planos personalizados de acordo com o porte da operação. Agende uma demonstração gratuita para conhecer todas as funcionalidades e receber uma proposta sob medida para sua empresa.',
    audience: ['construtora', 'imobiliaria'],
  },
  {
    question: 'Como faço para começar a usar?',
    answer: 'Basta solicitar uma demonstração pelo formulário abaixo ou pelo WhatsApp. Nossa equipe fará uma apresentação personalizada, criará sua conta e ajudará na configuração inicial dos seus imóveis e parceiros.',
    audience: ['construtora', 'imobiliaria'],
  },
];

export function FAQSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HelpCircle className="h-7 w-7 text-secondary" />
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            Perguntas Frequentes
          </h2>
        </div>
        <p className="text-muted-foreground text-center mb-4 max-w-2xl mx-auto">
          Tire suas dúvidas sobre a plataforma — para todos os perfis de usuário.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-8 text-sm">
          {Object.entries(AUDIENCE_STYLES).map(([key, { label, className }]) => (
            <span key={key} className="inline-flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded-full ${className}`} />
              {label}
            </span>
          ))}
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {FAQ_ITEMS.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border rounded-lg px-5 shadow-sm">
              <AccordionTrigger className="text-left text-sm md:text-base font-medium py-4 hover:no-underline gap-3">
                <div className="flex-1">
                  {faq.question}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {faq.audience.map((a) => (
                      <span
                        key={a}
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${AUDIENCE_STYLES[a].className}`}
                      >
                        {AUDIENCE_STYLES[a].label}
                      </span>
                    ))}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
