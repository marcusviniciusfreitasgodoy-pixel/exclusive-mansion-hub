import { Palette, Check, X } from 'lucide-react';
import type { PersonalizacaoItem } from '@/types/materiais-promocionais';

interface PropertyCustomizationSectionProps {
  items: PersonalizacaoItem[];
}

export function PropertyCustomizationSection({ items }: PropertyCustomizationSectionProps) {
  if (!items || items.length === 0) return null;

  const availableItems = items.filter(item => item.disponivel);
  const unavailableItems = items.filter(item => !item.disponivel);

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Palette className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Personalização Disponível
              </h2>
              <p className="text-muted-foreground">Deixe sua unidade com a sua cara</p>
            </div>
          </div>

          <div className="bg-background rounded-xl border p-6">
            {availableItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Opções disponíveis para personalização:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-foreground">{item.titulo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {unavailableItems.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                  <X className="h-4 w-4 text-muted-foreground" />
                  Não disponível para alteração:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {unavailableItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-muted-foreground/20"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center shrink-0">
                        <X className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-muted-foreground">{item.titulo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            * Consulte seu corretor sobre prazos e condições para personalização
          </p>
        </div>
      </div>
    </section>
  );
}
