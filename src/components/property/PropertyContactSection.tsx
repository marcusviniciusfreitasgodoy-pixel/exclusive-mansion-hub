import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Mail, Calendar, MessageCircle, Send } from "lucide-react";
import { AgendarVisitaModal } from "./AgendarVisitaModal";
import { useAnalyticsTracking } from "@/components/integrations/AnalyticsScripts";
import type { PropertyData, PropertyBranding } from "@/types/property-page";

interface PropertyContactSectionProps {
  property: PropertyData;
  branding: PropertyBranding;
  imobiliariaId: string;
  accessId: string;
}

export function PropertyContactSection({
  property,
  branding,
  imobiliariaId,
  accessId,
}: PropertyContactSectionProps) {
  const { toast } = useToast();
  const { trackEvent } = useAnalyticsTracking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agendarModalOpen, setAgendarModalOpen] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check - se preenchido, é um bot
    if (honeypot) {
      // Simula sucesso para não alertar o bot
      toast({
        title: "Mensagem enviada!",
        description: "Entraremos em contato em breve.",
      });
      return;
    }
    
    if (!formData.nome || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome e e-mail.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert lead into database
      const { data: leadData, error } = await supabase.from("leads").insert({
        imovel_id: property.id,
        imobiliaria_id: imobiliariaId,
        access_id: accessId,
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone || null,
        mensagem: formData.mensagem || null,
        origem: "formulario",
        status: "novo",
      }).select("id").single();

      if (error) throw error;

      // Track lead generation event for GA4
      trackEvent('generate_lead', {
        currency: 'BRL',
        value: property.valor,
        imovel_id: property.id,
        imovel_titulo: property.titulo,
        origem: 'formulario'
      });

      toast({
        title: "Mensagem enviada!",
        description: "Entraremos em contato em breve.",
      });

      // Send notification with all required fields
      try {
        await supabase.functions.invoke("send-lead-notification", {
          body: {
            leadId: leadData.id,
            propertyTitle: property.titulo,
            propertyAddress: property.endereco || `${property.bairro}, ${property.cidade}`,
            propertyValue: property.valor,
            leadName: formData.nome,
            leadEmail: formData.email,
            leadPhone: formData.telefone || "",
            leadMessage: formData.mensagem || "",
            imobiliariaEmail: branding.emailContato,
            imobiliariaNome: branding.imobiliariaNome,
            construtoraId: property.construtoraId,
          },
        });
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
        // Don't show error to user since lead was saved successfully
      }

      setFormData({ nome: "", email: "", telefone: "", mensagem: "" });
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappNumber = branding.telefone?.replace(/\D/g, "") || "";
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(`Olá! Tenho interesse no imóvel: ${property.titulo}`)}`
    : "";

  return (
    <>
      <section id="section-contact" className="py-12 md:py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left Column - Contact Info */}
            <div className="text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Fale Conosco
              </h2>
              <p className="text-white/70 mb-8 text-lg">
                Estamos prontos para atender você. Entre em contato para mais informações 
                sobre este imóvel ou agende uma visita.
              </p>

              {/* Contact Options */}
              <div className="space-y-4 mb-8">
                {branding.telefone && (
                  <a
                    href={`tel:${branding.telefone}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Telefone</p>
                      <p className="font-semibold">{branding.telefone}</p>
                    </div>
                  </a>
                )}

                {branding.emailContato && (
                  <a
                    href={`mailto:${branding.emailContato}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">E-mail</p>
                      <p className="font-semibold">{branding.emailContato}</p>
                    </div>
                  </a>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-primary font-semibold flex-1"
                  onClick={() => setAgendarModalOpen(true)}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Agendar Visita
                </Button>
                {whatsappUrl && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20 flex-1"
                    onClick={() => window.open(whatsappUrl, "_blank")}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    WhatsApp
                  </Button>
                )}
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl">
              <h3 className="text-xl font-semibold text-primary mb-6">
                Envie sua mensagem
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field - invisível para usuários, bots preenchem automaticamente */}
                <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="nome">Nome completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Seu nome"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(21) 99999-9999"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mensagem">Mensagem</Label>
                  <Textarea
                    id="mensagem"
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    placeholder="Gostaria de mais informações sobre o imóvel..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Enviar Mensagem
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Agendar Visita Modal */}
      <AgendarVisitaModal
        open={agendarModalOpen}
        onOpenChange={setAgendarModalOpen}
        property={property}
        branding={branding}
        imobiliariaId={imobiliariaId}
        accessId={accessId}
      />
    </>
  );
}
