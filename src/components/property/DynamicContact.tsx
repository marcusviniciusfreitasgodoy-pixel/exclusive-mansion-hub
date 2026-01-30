import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import type { PropertyData, PropertyBranding } from "@/types/property-page";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome muito longo (máximo 100 caracteres)"),
  email: z
    .string()
    .trim()
    .email("Email inválido")
    .max(255, "Email muito longo (máximo 255 caracteres)"),
  phone: z
    .string()
    .trim()
    .min(10, "Telefone deve ter no mínimo 10 dígitos")
    .max(20, "Telefone muito longo (máximo 20 caracteres)")
    .regex(
      /^[\d\s\-\(\)+]+$/,
      "Telefone deve conter apenas números, espaços e símbolos válidos"
    ),
  message: z
    .string()
    .trim()
    .min(1, "Mensagem é obrigatória")
    .max(1000, "Mensagem muito longa (máximo 1000 caracteres)"),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface DynamicContactProps {
  property: PropertyData;
  branding: PropertyBranding;
  imobiliariaId: string;
  accessId: string;
}

export const DynamicContact = ({
  property,
  branding,
  imobiliariaId,
  accessId,
}: DynamicContactProps) => {
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const handleSubmit = async (data: ContactFormData) => {
    try {
      // Save lead to database
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .insert({
          imovel_id: property.id,
          imobiliaria_id: imobiliariaId,
          access_id: accessId,
          nome: data.name,
          email: data.email,
          telefone: data.phone,
          mensagem: data.message,
          origem: "formulario" as const,
          status: "novo" as const,
        })
        .select("id")
        .single();

      if (leadError) {
        console.error("Error saving lead:", leadError);
        toast({
          title: "Erro ao enviar",
          description: "Tente novamente ou entre em contato via WhatsApp.",
          variant: "destructive",
        });
        return;
      }

      // Send email notification via edge function
      const propertyAddress = [property.endereco, property.bairro, property.cidade]
        .filter(Boolean)
        .join(", ");

      try {
        const response = await supabase.functions.invoke("send-lead-notification", {
          body: {
            leadId: leadData.id,
            propertyTitle: property.titulo,
            propertyAddress,
            propertyValue: property.valor,
            leadName: data.name,
            leadEmail: data.email,
            leadPhone: data.phone,
            leadMessage: data.message,
            imobiliariaEmail: branding.emailContato,
            imobiliariaNome: branding.imobiliariaNome,
            construtoraId: property.construtoraId,
          },
        });

        if (response.error) {
          console.error("Email notification error:", response.error);
        } else {
          console.log("Email notification sent:", response.data);
        }
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the form submission if email fails
      }

      // WhatsApp message
      const whatsappNumber = branding.telefone?.replace(/\D/g, "") || "";
      if (whatsappNumber) {
        const message = `Olá! Tenho interesse no imóvel: ${property.titulo}\n\nNome: ${data.name}\nEmail: ${data.email}\nTelefone: ${data.phone}\nMensagem: ${data.message}`;
        const whatsappUrl = `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
      }

      toast({
        title: "Mensagem enviada com sucesso!",
        description: "Entraremos em contato em breve.",
      });

      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const location = [property.endereco, property.bairro, property.cidade]
    .filter(Boolean)
    .join(", ");

  return (
    <section id="contact" className="relative py-24 bg-luxury-cream">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center animate-fade-in">
            <span className="mb-4 inline-block text-sm uppercase tracking-[0.3em] text-accent">
              FALE CONOSCO AGORA
            </span>
            <h2 className="mb-4 text-4xl font-bold text-primary md:text-5xl">
              Agende sua Visita ou Entre em Contato
            </h2>
            <p className="text-xl text-muted-foreground">
              Descubra pessoalmente todos os detalhes desta propriedade
              excepcional
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-8 animate-fade-in">
              <div className="mb-8">
                {branding.imobiliariaLogo ? (
                  <img
                    src={branding.imobiliariaLogo}
                    alt={branding.imobiliariaNome}
                    className="h-16 mb-6 object-contain"
                  />
                ) : (
                  <h3 className="text-2xl font-bold text-primary mb-6">
                    {branding.imobiliariaNome}
                  </h3>
                )}
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Nossa equipe especializada está pronta para apresentar este
                  imóvel exclusivo e responder todas as suas questões.
                </p>
              </div>

              <div className="space-y-6">
                {branding.telefone && (
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary mb-1">
                        Telefone / WhatsApp
                      </p>
                      <a
                        href={`tel:${branding.telefone}`}
                        className="text-muted-foreground hover:text-accent transition-smooth"
                      >
                        {branding.telefone}
                      </a>
                    </div>
                  </div>
                )}

                {branding.emailContato && (
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary mb-1">E-mail</p>
                      <a
                        href={`mailto:${branding.emailContato}`}
                        className="text-muted-foreground hover:text-accent transition-smooth"
                      >
                        {branding.emailContato}
                      </a>
                    </div>
                  </div>
                )}

                {location && (
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary mb-1">
                        Localização
                      </p>
                      <p className="text-muted-foreground">{location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div
              className="animate-fade-in"
              style={{
                animationDelay: "0.2s",
              }}
            >
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-6 rounded-2xl bg-white p-8 shadow-elegant"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-primary">
                          Nome Completo *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="border-border focus:border-accent transition-smooth"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-primary">
                          E-mail *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="border-border focus:border-accent transition-smooth"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-primary">
                          Telefone / WhatsApp *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            className="border-border focus:border-accent transition-smooth"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-primary">
                          Mensagem *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            className="border-border focus:border-accent transition-smooth resize-none"
                            placeholder="Conte-nos mais sobre seu interesse..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-accent text-primary hover:bg-accent/90 shadow-gold transition-elegant text-base font-semibold py-6"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? "Enviando..."
                      : "Enviar Mensagem"}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Ao enviar, você concorda com nossa política de privacidade
                  </p>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
