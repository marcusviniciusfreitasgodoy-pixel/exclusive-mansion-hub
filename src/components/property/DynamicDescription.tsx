import { Check } from "lucide-react";
import type { PropertyData } from "@/types/property-page";

interface DynamicDescriptionProps {
  property: PropertyData;
}

export const DynamicDescription = ({ property }: DynamicDescriptionProps) => {
  const hasContent = property.descricao || property.diferenciais.length > 0;

  if (!hasContent) return null;

  return (
    <section className="relative py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-5xl">
          {/* Main Description */}
          <div className="mb-16 text-center animate-fade-in">
            <span className="mb-4 inline-block text-sm uppercase tracking-[0.3em] text-accent">
              Sobre o Imóvel
            </span>
            <h2 className="mb-8 text-4xl font-bold text-primary md:text-5xl">
              Exclusividade e Sofisticação
              <br />
              em Cada Detalhe
            </h2>
            {property.descricao && (
              <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                {property.descricao.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>

          {/* Highlights Grid */}
          {property.diferenciais.length > 0 && (
            <div className="mb-16">
              <h3 className="mb-8 text-center text-2xl font-bold text-primary md:text-3xl">
                Diferenciais Exclusivos
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {property.diferenciais.map((diferencial, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-lg bg-luxury-cream p-6 transition-elegant hover:shadow-elegant animate-fade-in"
                    style={{
                      animationDelay: `${index * 0.05}s`,
                    }}
                  >
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <p className="text-base leading-relaxed text-primary">
                      {diferencial}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Memorial Descritivo */}
          {property.memorialDescritivo && (
            <div className="mt-16">
              <h3 className="mb-6 text-center text-2xl font-bold text-primary md:text-3xl">
                Memorial Descritivo
              </h3>
              <div className="rounded-2xl bg-luxury-cream p-8 text-base leading-relaxed text-muted-foreground">
                {property.memorialDescritivo.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
