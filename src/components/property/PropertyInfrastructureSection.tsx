import { Building2, Wifi, Truck, Users, Dumbbell, Coffee, Car, Package, Briefcase, Utensils } from 'lucide-react';

interface PropertyInfrastructureSectionProps {
  items: string[];
}

// Map common infrastructure terms to icons
function getIconForItem(item: string) {
  const lower = item.toLowerCase();
  if (lower.includes('delivery') || lower.includes('entrega')) return Package;
  if (lower.includes('coworking') || lower.includes('trabalho') || lower.includes('home office')) return Briefcase;
  if (lower.includes('academia') || lower.includes('fitness')) return Dumbbell;
  if (lower.includes('café') || lower.includes('lounge')) return Coffee;
  if (lower.includes('estacionamento') || lower.includes('vaga') || lower.includes('garagem')) return Car;
  if (lower.includes('reunião') || lower.includes('salão')) return Users;
  if (lower.includes('internet') || lower.includes('wifi') || lower.includes('fibra')) return Wifi;
  if (lower.includes('cozinha') || lower.includes('gourmet')) return Utensils;
  if (lower.includes('carga') || lower.includes('descarga')) return Truck;
  return Building2;
}

export function PropertyInfrastructureSection({ items }: PropertyInfrastructureSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Infraestrutura
              </h2>
              <p className="text-muted-foreground">Facilidades e comodidades do empreendimento</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, index) => {
              const Icon = getIconForItem(item);
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-background rounded-lg border hover:border-primary/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
