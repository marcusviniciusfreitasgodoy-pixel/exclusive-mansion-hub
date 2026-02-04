import { Shield, Camera, Lock, Wifi, Bell, Eye, Fingerprint, Key } from 'lucide-react';

interface PropertySecuritySectionProps {
  items: string[];
}

// Map common security terms to icons
function getIconForItem(item: string) {
  const lower = item.toLowerCase();
  if (lower.includes('câmera') || lower.includes('cftv') || lower.includes('circuito')) return Camera;
  if (lower.includes('alarme') || lower.includes('sensor')) return Bell;
  if (lower.includes('portaria') || lower.includes('concierge')) return Eye;
  if (lower.includes('biometria') || lower.includes('digital')) return Fingerprint;
  if (lower.includes('wifi') || lower.includes('internet') || lower.includes('fibra')) return Wifi;
  if (lower.includes('fechadura') || lower.includes('smart')) return Key;
  if (lower.includes('tranca') || lower.includes('blindad')) return Lock;
  return Shield;
}

export function PropertySecuritySection({ items }: PropertySecuritySectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-16 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Segurança e Tecnologia
              </h2>
              <p className="text-white/70">Proteção e inovação para seu dia a dia</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, index) => {
              const Icon = getIconForItem(item);
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-white/90">{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
