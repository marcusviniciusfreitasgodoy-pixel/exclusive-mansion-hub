import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
  steps: TourStep[];
  storageKey: string;
  onComplete?: () => void;
}

export function GuidedTour({ steps, storageKey, onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Check localStorage on mount
  useEffect(() => {
    const done = localStorage.getItem(storageKey);
    if (!done) {
      // Small delay to let sidebar render
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, [storageKey]);

  const positionTooltip = useCallback(() => {
    if (!visible || !steps[currentStep]) return;

    const el = document.querySelector(steps[currentStep].targetSelector);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const pos = steps[currentStep].position || 'right';
    const pad = 12;

    // Highlight
    setHighlightStyle({
      top: rect.top - 4,
      left: rect.left - 4,
      width: rect.width + 8,
      height: rect.height + 8,
    });

    // Tooltip positioning
    const style: React.CSSProperties = { position: 'fixed', zIndex: 10002 };

    if (pos === 'right') {
      style.top = rect.top;
      style.left = rect.right + pad;
    } else if (pos === 'left') {
      style.top = rect.top;
      style.right = window.innerWidth - rect.left + pad;
    } else if (pos === 'bottom') {
      style.top = rect.bottom + pad;
      style.left = rect.left;
    } else {
      style.bottom = window.innerHeight - rect.top + pad;
      style.left = rect.left;
    }

    setTooltipStyle(style);
  }, [visible, currentStep, steps]);

  useEffect(() => {
    positionTooltip();
    window.addEventListener('resize', positionTooltip);
    return () => window.removeEventListener('resize', positionTooltip);
  }, [positionTooltip]);

  const finish = useCallback(() => {
    localStorage.setItem(storageKey, 'true');
    setVisible(false);
    onComplete?.();
  }, [storageKey, onComplete]);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      finish();
    }
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  if (!visible || !steps.length) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[10000] bg-black/50" onClick={finish} />

      {/* Highlight cutout */}
      <div
        className="fixed z-[10001] rounded-md ring-2 ring-primary ring-offset-2 pointer-events-none"
        style={highlightStyle}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className={cn(
          'w-72 rounded-lg border bg-card p-4 shadow-lg',
          'animate-in fade-in-0 zoom-in-95'
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-sm text-card-foreground">{step.title}</h4>
          <button onClick={finish} className="text-muted-foreground hover:text-foreground -mt-1 -mr-1 p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          {step.description}
        </p>

        {/* Progress */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {currentStep + 1} de {steps.length}
          </span>
          <div className="flex gap-1.5">
            {currentStep > 0 && (
              <Button variant="ghost" size="sm" onClick={prev} className="h-7 px-2 text-xs">
                <ChevronLeft className="h-3 w-3 mr-0.5" /> Anterior
              </Button>
            )}
            <Button size="sm" onClick={next} className="h-7 px-3 text-xs">
              {currentStep < steps.length - 1 ? (
                <>Próximo <ChevronRight className="h-3 w-3 ml-0.5" /></>
              ) : (
                'Concluir'
              )}
            </Button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === currentStep ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Pre-defined tour steps                                             */
/* ------------------------------------------------------------------ */

export const TOUR_CONSTRUTORA: TourStep[] = [
  {
    targetSelector: '[data-tour="imoveis"]',
    title: 'Seus Imóveis',
    description: 'Seus imóveis cadastrados aparecem aqui. Cada card mostra status, leads e visualizações.',
    position: 'right',
  },
  {
    targetSelector: '[data-tour="pipeline"]',
    title: 'Pipeline CRM',
    description: 'O Pipeline organiza seus leads em 8 etapas visuais com arrastar-e-soltar.',
    position: 'right',
  },
  {
    targetSelector: '[data-tour="analytics"]',
    title: 'Analytics',
    description: 'Veja funil de conversão, Efeito UAU, gráficos de satisfação e exporte relatórios em PDF.',
    position: 'right',
  },
  {
    targetSelector: '[data-tour="agendamentos"]',
    title: 'Visitas Agendadas',
    description: 'Gerencie visitas agendadas, confirmações e lembretes automáticos.',
    position: 'right',
  },
  {
    targetSelector: '[data-tour="imobiliarias"]',
    title: 'Imobiliárias Parceiras',
    description: 'Veja a performance de cada imobiliária parceira com métricas detalhadas.',
    position: 'right',
  },
  {
    targetSelector: '[data-tour="manual"]',
    title: 'Manual Completo',
    description: 'Acesse o manual completo da plataforma a qualquer momento pelo menu.',
    position: 'right',
  },
];

export const TOUR_IMOBILIARIA: TourStep[] = [
  {
    targetSelector: '[data-tour="imoveis"]',
    title: 'Imóveis Disponíveis',
    description: 'Veja os imóveis disponíveis para divulgação com sua marca.',
    position: 'right',
  },
  {
    targetSelector: '[data-tour="meus-links"]',
    title: 'Meus Links',
    description: 'Copie seus links personalizados e acompanhe métricas de cada um.',
    position: 'right',
  },
  {
    targetSelector: '[data-tour="leads"]',
    title: 'Meus Leads',
    description: 'Gerencie seus leads capturados com filtros e contato rápido via WhatsApp.',
    position: 'right',
  },
  {
    targetSelector: '[data-tour="analytics"]',
    title: 'Analytics',
    description: 'Veja NPS, Efeito UAU, gráficos de satisfação e exporte relatórios em PDF.',
    position: 'right',
  },
  {
    targetSelector: '[data-tour="agendamentos"]',
    title: 'Agendamentos',
    description: 'Acompanhe e gerencie visitas agendadas pelos seus clientes.',
    position: 'right',
  },
];
