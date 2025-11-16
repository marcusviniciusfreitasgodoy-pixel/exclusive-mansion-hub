import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo-principal.png";
export const Contact = () => {
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // WhatsApp message
    const message = `Olá! Tenho interesse na Cobertura Duplex Frente-Mar.\n\nNome: ${formData.name}\nEmail: ${formData.email}\nTelefone: ${formData.phone}\nMensagem: ${formData.message}`;
    const whatsappUrl = `https://wa.me/5521964075124?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    toast({
      title: "Redirecionando para WhatsApp",
      description: "Você será direcionado para continuar a conversa."
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: ""
    });
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

              <div className="rounded-xl bg-primary p-8 shadow-elegant">
                
                
              </div>
            </div>

            {/* Contact Form */}
            <div className="animate-fade-in" style={{
            animationDelay: "0.2s"
          }}>
              <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-8 shadow-elegant">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-primary">
                    Nome Completo *
                  </label>
                  <Input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="border-border focus:border-accent transition-smooth" />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-primary">
                    E-mail *
                  </label>
                  <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="border-border focus:border-accent transition-smooth" />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-primary">
                    Telefone / WhatsApp *
                  </label>
                  <Input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="border-border focus:border-accent transition-smooth" />
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-primary">
                    Mensagem
                  </label>
                  <Textarea id="message" name="message" rows={4} value={formData.message} onChange={handleChange} className="border-border focus:border-accent transition-smooth resize-none" placeholder="Conte-nos mais sobre seu interesse..." />
                </div>

                <Button type="submit" className="w-full bg-accent text-primary hover:bg-accent/90 shadow-gold transition-elegant text-base font-semibold py-6">
                  Enviar Mensagem via WhatsApp
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Ao enviar, você concorda com nossa política de privacidade
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>;
};