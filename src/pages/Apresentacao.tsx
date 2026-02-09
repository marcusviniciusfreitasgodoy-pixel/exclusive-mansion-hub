import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import {
  Building2, Users, BarChart3, Calendar, MessageSquare, Share2,
  Shield, Zap, TrendingUp, Eye, ClipboardCheck, Star,
  ArrowRight, Play, CheckCircle2, Phone, Mail, HelpCircle
} from 'lucide-react';
import logoPrincipal from '@/assets/logo-principal.png';
import authBackground from '@/assets/auth-background.jpg';
import { supabase } from '@/integrations/supabase/client';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';

type Audience = 'construtora' | 'imobiliaria';

const PLATFORM_FEATURES: { icon: typeof Share2; title: string; desc: string; audience: Audience[] }[] = [
  {
    icon: Share2,
    title: 'Links White-Label',
    desc: 'Páginas personalizadas por imobiliária com rastreamento individual de performance.',
    audience: ['imobiliaria'],
  },
  {
    icon: BarChart3,
    title: 'Analytics em Tempo Real',
    desc: 'Funil de conversão, heatmap de horários e métricas individuais por imóvel e parceiro.',
    audience: ['construtora', 'imobiliaria'],
  },
  {
    icon: Users,
    title: 'CRM e Pipeline Visual',
    desc: '8 etapas de venda, pontuação automática de leads e histórico completo de interações.',
    audience: ['construtora', 'imobiliaria'],
  },
  {
    icon: Calendar,
    title: 'Agendamento Inteligente',
    desc: 'Validação de disponibilidade, identificação por CNH, lembretes automáticos e confirmação digital.',
    audience: ['construtora', 'imobiliaria'],
  },
  {
    icon: ClipboardCheck,
    title: 'Feedback Digital de Visitas',
    desc: 'NPS, assinatura digital e geração automática de PDF com validade jurídica.',
    audience: ['construtora', 'imobiliaria'],
  },
  {
    icon: MessageSquare,
    title: 'Chatbot com IA',
    desc: 'Assistente virtual treinado na base de conhecimento do imóvel para qualificação 24/7.',
    audience: ['construtora'],
  },
  {
    icon: Star,
    title: 'Efeito UAU',
    desc: 'Ranking dos aspectos que mais impressionam visitantes, com gráficos de satisfação.',
    audience: ['construtora', 'imobiliaria'],
  },
  {
    icon: Building2,
    title: 'Gestão de Parceiros',
    desc: 'Visão consolidada de todas as imobiliárias e suas métricas de performance.',
    audience: ['construtora'],
  },
  {
    icon: Eye,
    title: 'Relatórios e Exportação',
    desc: 'PDF profissional com dados de visitas, leads e satisfação para proprietários e clientes.',
    audience: ['construtora', 'imobiliaria'],
  },
  {
    icon: Shield,
    title: 'Segurança Jurídica',
    desc: 'Relatório de visita com assinatura digital, rastreabilidade e validade legal.',
    audience: ['imobiliaria'],
  },
];

const PAIN_POINTS = [
  'Leads demoram horas para receber resposta e esfriam',
  'Sem visibilidade sobre a performance das imobiliárias parceiras',
  'Materiais de marketing despadronizados e desatualizados',
  'Visitas sem registro, feedback perdido em anotações de papel',
  'Decisões comerciais tomadas sem dados concretos',
  'Profissionais que visitam o imóvel sem conhecer seus detalhes e diferenciais',
];

const FAQ_ITEMS: { question: string; answer: string; audience: Audience[] }[] = [
  {
    question: 'O que é a plataforma Godoy Prime e para quem ela foi feita?',
    answer: 'É uma plataforma que conecta construtoras e imobiliárias em um único ambiente digital. Construtoras cadastram imóveis e distribuem para parceiros com rastreamento completo; imobiliárias recebem páginas white-label com sua marca e acompanham seus leads e visitas.',
    audience: ['construtora', 'imobiliaria'],
  },
  {
    question: 'Preciso de uma imobiliária parceira para usar a plataforma?',
    answer: 'Não. Construtoras podem gerar links diretos dos imóveis com seu próprio branding (logo, cores e favicon), sem depender de uma imobiliária intermediária. Leads e métricas de links diretos aparecem normalmente no dashboard.',
    audience: ['construtora'],
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
    question: 'Como funciona o agendamento de visitas pela plataforma?',
    answer: 'O visitante escolhe duas opções de data/horário, faz upload de um documento de identificação (RG/CNH) e envia a solicitação. A construtora e a imobiliária recebem notificações automáticas por e-mail e WhatsApp, com links diretos para confirmar ou reagendar.',
    audience: ['construtora', 'imobiliaria'],
  },
  {
    question: 'O que é o chatbot Sofia e como ela ajuda na conversão?',
    answer: 'A Sofia é uma assistente virtual com IA treinada na base de conhecimento de cada imóvel. Ela responde dúvidas 24/7, qualifica leads automaticamente e pode agendar visitas — tudo sem intervenção humana. Suporta texto e voz.',
    audience: ['construtora'],
  },
  {
    question: 'O feedback de visita tem validade jurídica?',
    answer: 'Sim. O relatório de feedback inclui assinatura digital do cliente e do corretor, com registro de data, dispositivo e geolocalização. O PDF gerado automaticamente possui hash de integridade, conferindo rastreabilidade e validade legal.',
    audience: ['construtora', 'imobiliaria'],
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

export default function Apresentacao() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', empresa: '', email: '', telefone: '', mensagem: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.empresa) {
      toast.error('Preencha nome, empresa e e-mail.');
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-demo-request', {
        body: form,
      });
      if (error) throw error;
      toast.success('Solicitação enviada! Entraremos em contato em breve.');
      setForm({ nome: '', empresa: '', email: '', telefone: '', mensagem: '' });
    } catch (err) {
      console.error('Erro ao enviar solicitação:', err);
      toast.error('Erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={authBackground} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-primary/85" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <img src={logoPrincipal} alt="Godoy Prime" className="h-14 mx-auto mb-8 brightness-0 invert" />
          <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground leading-tight max-w-4xl mx-auto">
            Construtoras e imobiliárias. Conectadas. Transparentes. Lucrativas.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Cadastre imóveis uma vez. Distribua para parceiros com sua marca. Acompanhe resultados em tempo real. Simples assim.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-base px-8"
              onClick={() => navigate('/demo')}
            >
              <Play className="h-5 w-5" /> Explorar Demonstração
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-base px-8 border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-secondary-foreground"
              onClick={() => document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Calendar className="h-5 w-5" /> Agendar Apresentação
            </Button>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
            Problemas que eliminamos<br />do seu dia a dia
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Se algum destes cenários parece familiar, essa ferramenta foi feita para você. Nossa plataforma resolve cada um deles de forma integrada — sem planilhas, sem retrabalho, sem perda de informação.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PAIN_POINTS.map((pain, i) => (
              <div key={i} className="flex items-start gap-3 bg-card rounded-lg p-5 border border-l-[3px] border-l-secondary shadow-sm hover:shadow-md transition-shadow">
                <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">{pain}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plataforma Consolidada */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Tudo o que você precisa em uma única plataforma
          </h2>
          <p className="text-muted-foreground text-center mb-4 max-w-2xl mx-auto">
            Funcionalidades para Construtoras e Imobiliárias — sem repetição, sem lacunas.
          </p>
          <div className="flex justify-center gap-4 mb-12 text-sm">
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-primary" /> Construtora</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-secondary" /> Imobiliária</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {PLATFORM_FEATURES.map((f, i) => (
              <Card key={i} className="group hover:shadow-xl transition-all duration-300 border border-l-[3px] border-l-secondary">
                <CardContent className="p-4 md:p-6 flex flex-col h-full">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors shrink-0">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base md:text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">{f.desc}</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {f.audience.includes('construtora') && (
                      <span className="inline-flex items-center rounded-full bg-primary text-primary-foreground px-2.5 py-0.5 text-[11px] md:text-xs font-semibold">Construtora</span>
                    )}
                    {f.audience.includes('imobiliaria') && (
                      <span className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-[11px] md:text-xs font-semibold">Imobiliária</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits strip */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: Zap, label: 'Resposta em < 1 min', sub: 'com chatbot IA' },
            { icon: Eye, label: '100% visibilidade', sub: 'sobre parceiros' },
            { icon: TrendingUp, label: '+40% conversão', sub: 'de leads qualificados' },
            { icon: Shield, label: 'Feedback digital', sub: 'com validade jurídica' },
          ].map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <b.icon className="h-8 w-8 text-secondary" />
              <span className="font-bold text-lg">{b.label}</span>
              <span className="text-sm text-primary-foreground/70">{b.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Como funciona
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Em quatro passos simples, você transforma a gestão dos seus imóveis.
          </p>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { num: '1', title: 'Cadastre seu imóvel', desc: 'Fotos, vídeos, descrição e escolha do template visual.' },
              { num: '2', title: 'Compartilhe com parceiros', desc: 'Links white-label rastreados individualmente.' },
              { num: '3', title: 'Acompanhe em tempo real', desc: 'Leads, visitas, NPS e Efeito UAU no dashboard.' },
              { num: '4', title: 'Exporte e apresente', desc: 'Relatórios em PDF prontos para proprietários e clientes.' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                  {step.num}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Demo */}
      <section className="py-16 bg-card">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Veja na prática</h2>
          <p className="text-muted-foreground mb-8">
            Explore os painéis da construtora e da imobiliária com dados fictícios — sem precisar criar conta.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="gap-2 text-base px-10" onClick={() => navigate('/demo')}>
              <Play className="h-5 w-5" /> Acessar Demonstração Interativa
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="h-7 w-7 text-secondary" />
            <h2 className="text-2xl md:text-3xl font-bold text-center">
              Perguntas Frequentes
            </h2>
          </div>
          <p className="text-muted-foreground text-center mb-4 max-w-2xl mx-auto">
            Tire suas dúvidas sobre a plataforma — para construtoras e imobiliárias.
          </p>
          <div className="flex justify-center gap-4 mb-8 text-sm">
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-primary" /> Construtora</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-secondary" /> Imobiliária</span>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border rounded-lg px-5 shadow-sm">
                <AccordionTrigger className="text-left text-sm md:text-base font-medium py-4 hover:no-underline gap-3">
                  <div className="flex-1">
                    {faq.question}
                    <div className="flex gap-1.5 mt-1.5">
                      {faq.audience.includes('construtora') && (
                        <span className="inline-flex items-center rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-semibold">Construtora</span>
                      )}
                      {faq.audience.includes('imobiliaria') && (
                        <span className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-2 py-0.5 text-[10px] font-semibold">Imobiliária</span>
                      )}
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

      {/* Form */}
      <section id="agendar" className="py-16 md:py-20 bg-muted/50">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Agende uma demonstração personalizada
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Preencha o formulário e nossa equipe entrará em contato para uma apresentação exclusiva.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nome completo *</label>
                <Input
                  value={form.nome}
                  onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                  placeholder="Seu nome"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Empresa *</label>
                <Input
                  value={form.empresa}
                  onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))}
                  placeholder="Nome da empresa"
                  maxLength={100}
                />
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">E-mail *</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="email@empresa.com"
                  maxLength={255}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Telefone</label>
                <Input
                  value={form.telefone}
                  onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))}
                  placeholder="(11) 99999-0000"
                  maxLength={20}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Mensagem</label>
              <Textarea
                value={form.mensagem}
                onChange={e => setForm(p => ({ ...p, mensagem: e.target.value }))}
                placeholder="Conte-nos sobre sua operação e o que gostaria de ver na demonstração..."
                rows={4}
                maxLength={1000}
              />
            </div>
            <Button type="submit" size="lg" className="w-full gap-2" disabled={sending}>
              {sending ? 'Enviando...' : (
                <><ArrowRight className="h-5 w-5" /> Solicitar Demonstração</>
              )}
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Godoy Prime Realty — Tecnologia para o mercado imobiliário de alto padrão</p>
      </footer>

      <FloatingWhatsApp
        phoneNumber="5521964075124"
        message="Olá! Gostaria de agendar uma demonstração da plataforma Godoy Prime."
      />
    </div>
  );
}
