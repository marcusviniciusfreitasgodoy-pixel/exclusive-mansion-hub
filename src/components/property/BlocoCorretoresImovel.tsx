import { Phone, Mail, MessageCircle, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Corretor, PropertyData, PropertyBranding } from "@/types/property-page";

interface BlocoCorretoresImovelProps {
  property: PropertyData;
  branding: PropertyBranding;
}

export function BlocoCorretoresImovel({ property, branding }: BlocoCorretoresImovelProps) {
  const corretores = property.corretores;
  
  // If no realtors configured, don't show the section
  if (!corretores || corretores.length === 0) return null;

  const getWhatsAppUrl = (telefone: string | undefined, propertyTitle: string) => {
    if (!telefone) return null;
    const phone = telefone.replace(/\D/g, "");
    const message = `Olá! Tenho interesse no imóvel: ${propertyTitle}`;
    return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <User className="h-6 w-6 text-accent" />
          <h2 className="text-2xl md:text-3xl font-bold text-primary">
            Apresentado Por
          </h2>
        </div>

        <div className={`grid gap-6 ${corretores.length === 1 ? 'max-w-xl' : 'md:grid-cols-2'}`}>
          {corretores.map((corretor, index) => {
            const whatsappUrl = getWhatsAppUrl(corretor.telefone, property.titulo);
            
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    {corretor.fotoUrl ? (
                      <img
                        src={corretor.fotoUrl}
                        alt={corretor.nome}
                        className="w-20 h-20 rounded-full object-cover ring-2 ring-accent/20"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-primary">
                      {corretor.nome}
                    </h3>
                    {corretor.cargo && (
                      <p className="text-sm text-accent font-medium">
                        {corretor.cargo}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {branding.imobiliariaNome}
                    </p>

                    {/* Contact Info */}
                    <div className="mt-3 space-y-1">
                      {corretor.telefone && (
                        <a
                          href={`tel:${corretor.telefone}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                          {corretor.telefone}
                        </a>
                      )}
                      {corretor.email && (
                        <a
                          href={`mailto:${corretor.email}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                          {corretor.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mini Bio */}
                {corretor.miniBio && (
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {corretor.miniBio}
                  </p>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  {whatsappUrl && (
                    <Button
                      size="sm"
                      className="bg-accent hover:bg-accent/90 text-primary flex-1"
                      onClick={() => window.open(whatsappUrl, "_blank")}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                  )}
                  {corretor.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(`mailto:${corretor.email}`, "_blank")}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      E-mail
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Partnership Badge */}
        {property.origemCadastro === "IHB" && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              🤝 Em parceria com <strong>IHB Brazil Imóveis Internacionais</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
