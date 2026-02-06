import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Building2, Users, BarChart3, Calendar, MessageSquare, Share2,
  Shield, Zap, TrendingUp, Eye, ClipboardCheck, Star,
  ArrowRight, Play, CheckCircle2, Phone, Mail
} from 'lucide-react';
import logoPrincipal from '@/assets/logo-principal.png';
import { supabase } from '@/integrations/supabase/client';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';

const FEATURES = [
  {
    icon: Share2,
    title: 'Links White-Label',
    desc: 'Páginas personalizadas por imobiliária com rastreamento individual de performance.',
  },
  {
    icon: BarChart3,
    title: 'Analytics em Tempo Real',
    desc: 'Visualizações, leads, funil de conversão e heatmap de horários por imóvel e parceiro.',
  },
  {
    icon: Users,
    title: 'CRM & Pipeline Visual',
    desc: 'Kanban de 8 estágios com drag-and-drop, scoring automático e timeline de atividades.',
  },
  {
    icon: Calendar,
    title: 'Agendamento Inteligente',
    desc: 'Validação de disponibilidade, lembretes automáticos e confirmação digital.',
  },
  {
    icon: ClipboardCheck,
    title: 'Feedback Digital de Visitas',
    desc: 'Formulários com NPS, assinatura digital e geração automática de PDF com validade jurídica.',
  },
  {
    icon: MessageSquare,
    title: 'Chatbot com IA',
    desc: 'Assistente virtual treinado na base de conhecimento do imóvel para qualificação 24/7.',
  },
];

const PAIN_POINTS = [
  'Leads demoram horas para receber resposta e esfriam',
  'Sem visibilidade sobre a performance das imobiliárias parceiras',
  'Materiais de marketing despadronizados e desatualizados',
  'Visitas sem registro, feedback perdido em anotações de papel',
  'Decisões comerciais tomadas sem dados concretos',
  'Edite este texto com sua informação',
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
      <section className="relative overflow-hidden" style={{ background: 'var(--gradient-luxury)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-secondary/30 blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <img src={logoPrincipal} alt="Godoy Prime" className="h-14 mx-auto mb-8 brightness-0 invert" />
          <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground leading-tight max-w-4xl mx-auto">
            A plataforma que conecta construtoras e imobiliárias em um ecossistema digital inteligente
          </h1>
          <p className="mt-6 text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Reduza o tempo de resposta a leads, tenha visibilidade total sobre seus parceiros e tome decisões baseadas em dados reais — tudo em um único ambiente.
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
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Problemas que eliminamos do seu dia a dia
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            Se algum destes cenários parece familiar, a Godoy Prime foi feita para você.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PAIN_POINTS.map((pain, i) => (
              <div key={i} className="flex items-start gap-3 bg-card rounded-lg p-5 border shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                <span className="text-sm font-medium">{pain}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Funcionalidades que transformam resultados
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Cada módulo foi projetado para acelerar vendas e dar transparência total ao processo.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Card key={i} className="group hover:shadow-lg transition-shadow border">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
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

      {/* CTA Demo */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Veja na prática</h2>
          <p className="text-muted-foreground mb-8">
            Explore os painéis da construtora e da imobiliária com dados fictícios — sem precisar criar conta.
          </p>
          <Button size="lg" className="gap-2 text-base px-10" onClick={() => navigate('/demo')}>
            <Play className="h-5 w-5" /> Acessar Demonstração Interativa
          </Button>
        </div>
      </section>

      {/* Form */}
      <section id="agendar" className="py-16 md:py-20">
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
