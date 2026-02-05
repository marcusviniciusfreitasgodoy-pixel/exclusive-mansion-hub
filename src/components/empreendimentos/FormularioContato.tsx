import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

interface FormularioContatoProps {
  empreendimentoTitulo?: string;
  className?: string;
}

export function FormularioContato({ empreendimentoTitulo, className = "" }: FormularioContatoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
    setFormData({ nome: "", email: "", telefone: "", mensagem: "" });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="contato" className={`py-20 bg-[#0c4a6e] ${className}`}>
      <div className="container mx-auto px-5 md:px-10 lg:px-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="text-white">
            <h2
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Entre em Contato
            </h2>
            <p
              className="text-white/80 text-lg mb-8"
              style={{ fontFamily: "'Roboto', sans-serif" }}
            >
              {empreendimentoTitulo
                ? `Interessado no ${empreendimentoTitulo}? Nossa equipe está pronta para atendê-lo.`
                : "Descubra os melhores empreendimentos de alto padrão. Nossa equipe está pronta para atendê-lo."}
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#22c55e] flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Telefone</p>
                  <p className="text-white font-medium">(21) 99999-9999</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#22c55e] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">E-mail</p>
                  <p className="text-white font-medium">contato@oceanagolf.com.br</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#22c55e] flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Endereço</p>
                  <p className="text-white font-medium">Av. Lúcio Costa, 3500 - Barra da Tijuca</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h3
              className="text-2xl font-semibold text-[#0c4a6e] mb-6"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Agende sua Visita
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="nome" className="text-[#525252]">
                  Nome completo
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  required
                  className="mt-1.5 border-gray-200 focus:border-[#0284c7] focus:ring-[#0284c7]"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-[#525252]">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                    className="mt-1.5 border-gray-200 focus:border-[#0284c7] focus:ring-[#0284c7]"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone" className="text-[#525252]">
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(21) 99999-9999"
                    required
                    className="mt-1.5 border-gray-200 focus:border-[#0284c7] focus:ring-[#0284c7]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="mensagem" className="text-[#525252]">
                  Mensagem
                </Label>
                <Textarea
                  id="mensagem"
                  name="mensagem"
                  value={formData.mensagem}
                  onChange={handleChange}
                  placeholder="Conte-nos mais sobre o que procura..."
                  rows={4}
                  className="mt-1.5 border-gray-200 focus:border-[#0284c7] focus:ring-[#0284c7] resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 text-sm font-semibold uppercase tracking-wide transition-all duration-300"
                style={{
                  backgroundColor: "#22c55e",
                  color: "#ffffff",
                  borderRadius: "12px",
                }}
              >
                {isSubmitting ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
