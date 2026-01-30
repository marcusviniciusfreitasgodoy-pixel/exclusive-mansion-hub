import { useState } from "react";
import { CalendarCheck, Clock, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgendarVisitaModal } from "./AgendarVisitaModal";
import type { PropertyData, PropertyBranding } from "@/types/property-page";

interface AgendarVisitaSectionProps {
  property: PropertyData;
  branding: PropertyBranding;
  imobiliariaId: string | null;
  accessId: string | null;
}

export function AgendarVisitaSection({
  property,
  branding,
  imobiliariaId,
  accessId,
}: AgendarVisitaSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section id="agendar" className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Card Principal */}
            <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                  {/* Conteúdo */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-accent" />
                      <span className="text-sm font-medium text-accent uppercase tracking-wider">
                        Visita Exclusiva
                      </span>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                      Agende uma Visita
                    </h2>
                    
                    <p className="text-primary-foreground/80 text-lg mb-6 max-w-xl">
                      Conheça pessoalmente este imóvel incrível. Escolha duas opções de 
                      horário que funcionem para você e nossa equipe entrará em contato 
                      para confirmar.
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                        <Clock className="h-4 w-4" />
                        <span>Atendimento personalizado</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                        <MapPin className="h-4 w-4" />
                        <span>Tour completo pelo imóvel</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex-shrink-0">
                    <Button
                      size="lg"
                      onClick={() => setIsModalOpen(true)}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <CalendarCheck className="mr-2 h-5 w-5" />
                      Agendar Agora
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Adicional */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                📅 Disponibilidade de Segunda a Sábado, das 9h às 18h
              </p>
            </div>
          </div>
        </div>
      </section>

      <AgendarVisitaModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        property={property}
        branding={branding}
        imobiliariaId={imobiliariaId}
        accessId={accessId}
      />
    </>
  );
}
