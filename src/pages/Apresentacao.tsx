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
  ArrowRight, Play, CheckCircle2, Phone, Mail, HelpCircle,
  Bot, Palette, Globe, FileCheck, Layout, Megaphone
} from 'lucide-react';
import logoPrincipal from '@/assets/logo-principal.png';
import authBackground from '@/assets/auth-background.jpg';
import { supabase } from '@/integrations/supabase/client';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { FeatureCategoriesSection } from '@/components/apresentacao/FeatureCategoriesSection';
import { BenefitsStrip } from '@/components/apresentacao/BenefitsStrip';
import { FAQSection } from '@/components/apresentacao/FAQSection';

const PAIN_POINTS = [
  'Contatos demoram horas para receber resposta e esfriam',
  'Sem visibilidade sobre a performance das imobiliárias parceiras',
  'Materiais de marketing despadronizados e desatualizados',
  'Visitas sem registro, avaliação perdida em anotações de papel',
  'Decisões comerciais tomadas sem dados concretos',
  'Profissionais que visitam o imóvel sem conhecer seus detalhes e diferenciais',
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
            Se algum destes cenários parece familiar, essa ferramenta foi feita para você.
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

      {/* Funcionalidades por Categoria */}
      <FeatureCategoriesSection />

      {/* Benefits strip */}
      <BenefitsStrip />

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
              { num: '2', title: 'Compartilhe com parceiros', desc: 'Links com marca própria rastreados individualmente.' },
              { num: '3', title: 'Acompanhe em tempo real', desc: 'Contatos, visitas, satisfação e Efeito UAU no painel.' },
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
      <FAQSection />

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
