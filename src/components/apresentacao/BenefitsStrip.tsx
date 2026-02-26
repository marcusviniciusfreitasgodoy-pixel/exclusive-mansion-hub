import { Eye, Share2, Zap, Star } from 'lucide-react';

const BENEFITS = [
  { icon: Eye, label: '100% visibilidade', sub: 'sobre parceiros', persona: 'Construtora' },
  { icon: Share2, label: 'Materiais prontos', sub: 'e contatos rastreados', persona: 'Imobiliária' },
  { icon: Zap, label: 'Resposta em < 1 min', sub: 'com assistente virtual IA', persona: 'Corretor' },
  { icon: Star, label: 'Experiência premium', sub: 'do primeiro contato à visita', persona: 'Cliente' },
];

export function BenefitsStrip() {
  return (
    <section className="py-12 bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {BENEFITS.map((b, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <b.icon className="h-8 w-8 text-secondary" />
            <span className="font-bold text-lg">{b.label}</span>
            <span className="text-sm text-primary-foreground/70">{b.sub}</span>
            <span className="text-xs text-secondary font-medium mt-1">{b.persona}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
