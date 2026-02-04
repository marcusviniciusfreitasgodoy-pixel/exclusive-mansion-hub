import { Leaf, Droplets, Sun, Recycle, Wind, Thermometer, Zap, TreePine } from 'lucide-react';

interface PropertySustainabilitySectionProps {
  items: string[];
}

// Map common sustainability terms to icons
function getIconForItem(item: string) {
  const lower = item.toLowerCase();
  if (lower.includes('água') || lower.includes('dual flush') || lower.includes('reuso')) return Droplets;
  if (lower.includes('solar') || lower.includes('fotovoltaic')) return Sun;
  if (lower.includes('reciclagem') || lower.includes('coleta seletiva')) return Recycle;
  if (lower.includes('ventilação') || lower.includes('ar')) return Wind;
  if (lower.includes('térmic') || lower.includes('isolamento')) return Thermometer;
  if (lower.includes('energia') || lower.includes('led') || lower.includes('elétric')) return Zap;
  if (lower.includes('jardim') || lower.includes('verde') || lower.includes('paisagismo')) return TreePine;
  return Leaf;
}

export function PropertySustainabilitySection({ items }: PropertySustainabilitySectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Sustentabilidade
              </h2>
              <p className="text-muted-foreground">Compromisso com o meio ambiente</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, index) => {
              const Icon = getIconForItem(item);
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-background rounded-lg border border-green-200 dark:border-green-900 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </div>
              );
            })}
          </div>

          {/* Eco Badge */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium">
              <Leaf className="h-4 w-4" />
              Empreendimento Sustentável
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
