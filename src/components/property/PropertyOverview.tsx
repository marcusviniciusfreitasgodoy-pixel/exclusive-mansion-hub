import { Check, ChevronDown, ChevronUp, FileText, CreditCard } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PropertyData } from "@/types/property-page";

interface PropertyOverviewProps {
  property: PropertyData;
}

export function PropertyOverview({ property }: PropertyOverviewProps) {
  const [memorialOpen, setMemorialOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const hasMemorial = !!property.memorialDescritivo;
  const hasPaymentConditions = !!property.condicoesPagamento;
  const hasDiferenciais = property.diferenciais && property.diferenciais.length > 0;

  return (
    <section id="section-overview" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8">
          Visão Geral
        </h2>

        {/* Description */}
        {property.descricao && (
          <div className="prose prose-lg max-w-none mb-10">
            {property.descricao.split('\n').map((paragraph, index) => (
              <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {/* Diferenciais */}
        {hasDiferenciais && (
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Diferenciais
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {property.diferenciais.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accordions */}
        <div className="space-y-4">
          {/* Memorial Descritivo */}
          {hasMemorial && (
            <div className="border rounded-xl overflow-hidden">
              <button
                onClick={() => setMemorialOpen(!memorialOpen)}
                className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">Memorial Descritivo</span>
                </div>
                {memorialOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  memorialOpen ? "max-h-[2000px]" : "max-h-0"
                )}
              >
                <div className="p-4 bg-white">
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    {property.memorialDescritivo?.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Condições de Pagamento */}
          {hasPaymentConditions && (
            <div className="border rounded-xl overflow-hidden">
              <button
                onClick={() => setPaymentOpen(!paymentOpen)}
                className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">Condições de Pagamento</span>
                </div>
                {paymentOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  paymentOpen ? "max-h-[2000px]" : "max-h-0"
                )}
              >
                <div className="p-4 bg-white">
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    {property.condicoesPagamento?.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
