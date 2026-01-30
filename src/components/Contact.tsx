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
import logo from "@/assets/logo-principal.png";

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
    .regex(/^[\d\s\-\(\)+]+$/, "Telefone deve conter apenas números, espaços e símbolos válidos"),
  message: z
    .string()
    .trim()
    .min(1, "Mensagem é obrigatória")
    .max(1000, "Mensagem muito longa (máximo 1000 caracteres)"),
});

type ContactFormData = z.infer<typeof contactSchema>;
export const Contact = () => {
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

  const handleSubmit = (data: ContactFormData) => {
    // Show success message - in a real app, this would send to an API
    toast({
      title: "Mensagem enviada com sucesso!",
      description: "Entraremos em contato em breve.",
    });
    
    form.reset();
  };
  return <section className="relative py-24 bg-luxury-cream">
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
              Descubra pessoalmente todos os detalhes desta propriedade excepcional
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-8 animate-fade-in">
              <div className="mb-8">
                <img src={logo} alt="Godoy Prime Realty" className="h-16 mb-6" />
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Nossa equipe especializada está pronta para apresentar esta exclusiva 
                  cobertura e responder todas as suas questões.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary mb-1">Telefone / WhatsApp</p>
                    <a href="tel:+5521964075124" className="text-muted-foreground hover:text-accent transition-smooth">
                      (21) 96407-5124
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary mb-1">E-mail</p>
                    <a href="mailto:contato@godoyprime.com.br" className="text-muted-foreground hover:text-accent transition-smooth">
                      contato@godoyprime.com.br
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary mb-1">Localização</p>
                    <p className="text-muted-foreground">
                      Avenida Lúcio Costa 2360
Barra da Tijuca, Rio de Janeiro<br />
                      Barra da Tijuca, Rio de Janeiro
                    </p>
                  </div>
                </div>
              </div>

              
            </div>

            {/* Contact Form */}
            <div className="animate-fade-in" style={{
            animationDelay: "0.2s"
          }}>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 rounded-2xl bg-white p-8 shadow-elegant">
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

                  <Button type="submit" className="w-full bg-accent text-primary hover:bg-accent/90 shadow-gold transition-elegant text-base font-semibold py-6">
                    Enviar Mensagem
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
    </section>;
};