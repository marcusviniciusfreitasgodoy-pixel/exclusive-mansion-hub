import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingUp, Palette, Bot, BarChart3,
  Users, Calendar, FileCheck, ClipboardCheck,
  Share2, Layout, Globe, Shield,
  MessageSquare, Star, Eye, Zap
} from 'lucide-react';

type Audience = 'construtora' | 'imobiliaria' | 'corretor' | 'cliente';

interface Feature {
  name: string;
  desc: string;
  audience: Audience[];
}

interface FeatureCategory {
  icon: typeof TrendingUp;
  title: string;
  features: Feature[];
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    icon: TrendingUp,
    title: 'Vendas e Gestão de Clientes',
    features: [
      { name: 'Funil Visual (Kanban)', desc: 'Gestão visual de 8 estágios de contatos', audience: ['construtora', 'imobiliaria'] },
      { name: 'Propostas Formais', desc: 'Documentos com validação e assinatura', audience: ['imobiliaria', 'corretor'] },
      { name: 'Fichas de Visita', desc: 'Registro com código de verificação e geolocalização (validade jurídica)', audience: ['construtora', 'imobiliaria', 'corretor'] },
      { name: 'Agendamento Inteligente', desc: 'Calendário integrado com envio de documentos', audience: ['construtora', 'imobiliaria', 'cliente'] },
    ],
  },
  {
    icon: Palette,
    title: 'Marketing e Marca',
    features: [
      { name: 'Sites com Marca Própria', desc: 'Cada parceiro com sua marca automaticamente', audience: ['imobiliaria'] },
      { name: 'Modelos Exclusivos', desc: '4 estilos: Luxo, Moderno, Clássico, Alto Padrão', audience: ['construtora'] },
      { name: 'Domínio Personalizado', desc: 'URL própria para cada construtora', audience: ['construtora'] },
      { name: 'Aprovação de Mídias', desc: 'Fluxo de aprovação e controle de marca e materiais', audience: ['construtora', 'imobiliaria'] },
    ],
  },
  {
    icon: Bot,
    title: 'IA e Atendimento',
    features: [
      { name: 'Sofia IA 24/7', desc: 'Assistente virtual com voz e base de conhecimento do imóvel', audience: ['construtora', 'cliente'] },
      { name: 'Base de Conhecimento', desc: 'Alimentada por PDFs técnicos e dados do empreendimento', audience: ['construtora', 'corretor'] },
      { name: 'Resposta Instantânea', desc: 'Atendimento em menos de 1 minuto via IA', audience: ['cliente'] },
    ],
  },
  {
    icon: BarChart3,
    title: 'Dados e Gestão',
    features: [
      { name: 'Pesquisa de Satisfação (NPS)', desc: 'Pesquisa pós-visita com assinatura digital', audience: ['construtora', 'imobiliaria'] },
      { name: 'Painel de Indicadores', desc: 'Mapa de calor, funil, retorno e métricas por parceiro', audience: ['construtora', 'imobiliaria'] },
      { name: 'Multiempresa', desc: 'Gestão separada construtora/imobiliária', audience: ['construtora', 'imobiliaria'] },
      { name: 'Central de Integrações', desc: 'GA4, Pixel, automações externas e APIs', audience: ['construtora'] },
      { name: 'Efeito UAU', desc: 'Ranking dos aspectos que mais impressionam visitantes', audience: ['construtora', 'imobiliaria'] },
      { name: 'Gestão de Parceiros', desc: 'Visão consolidada de todas as imobiliárias parceiras', audience: ['construtora'] },
    ],
  },
];

const AUDIENCE_STYLES: Record<Audience, { label: string; className: string }> = {
  construtora: { label: 'Construtora', className: 'bg-primary text-primary-foreground' },
  imobiliaria: { label: 'Imobiliária', className: 'bg-secondary text-secondary-foreground' },
  corretor: { label: 'Corretor', className: 'bg-emerald-600 text-white' },
  cliente: { label: 'Cliente', className: 'bg-blue-500 text-white' },
};

export function FeatureCategoriesSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          17 funcionalidades em uma única plataforma
        </h2>
        <p className="text-muted-foreground text-center mb-4 max-w-2xl mx-auto">
          Organizadas por categoria de valor — cada uma resolve uma dor real do mercado imobiliário.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-12 text-sm">
          {Object.entries(AUDIENCE_STYLES).map(([key, { label, className }]) => (
            <span key={key} className="inline-flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded-full ${className}`} />
              {label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {FEATURE_CATEGORIES.map((cat) => (
            <Card key={cat.title} className="border border-l-[3px] border-l-secondary hover:shadow-xl transition-all duration-300">
              <CardContent className="p-5 md:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
                    <cat.icon className="h-5 w-5 text-secondary" />
                  </div>
                  <h3 className="font-bold text-lg">{cat.title}</h3>
                </div>
                <ul className="space-y-3">
                  {cat.features.map((feat) => (
                    <li key={feat.name} className="flex flex-col gap-1">
                      <div className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                        <div className="flex-1">
                          <span className="font-semibold text-sm">{feat.name}</span>
                          <span className="text-muted-foreground text-sm"> — {feat.desc}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 ml-3.5">
                        {feat.audience.map((a) => (
                          <span
                            key={a}
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${AUDIENCE_STYLES[a].className}`}
                          >
                            {AUDIENCE_STYLES[a].label}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
