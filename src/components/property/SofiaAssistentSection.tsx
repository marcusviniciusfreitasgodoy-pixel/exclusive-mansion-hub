import { useState, useCallback } from "react";
import { MessageSquare, Sparkles, HelpCircle, MapPin, Home, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { HeyGenAvatar } from "./HeyGenAvatar";

// ID do imóvel Casa Malibu que terá o avatar HeyGen
const MALIBU_PROPERTY_ID = "996ec17b-a35c-4070-b74e-63194b5096a8";

interface SofiaAssistentSectionProps {
  propertyTitle: string;
  imovelId: string;
  imobiliariaId?: string;
  construtorId: string;
  imobiliariaNome?: string;
  onStartChat?: () => void;
}

export function SofiaAssistentSection({ 
  propertyTitle, 
  imovelId,
  imobiliariaId,
  construtorId,
  imobiliariaNome,
  onStartChat 
}: SofiaAssistentSectionProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleStartChat = useCallback(() => {
    setIsChatOpen(true);
    onStartChat?.();
  }, [onStartChat]);

  const topics = [
    {
      icon: Home,
      title: "Detalhes do Imóvel",
      description: "Metragem, quartos, vagas e diferenciais",
    },
    {
      icon: Palette,
      title: "Acabamentos & Materiais",
      description: "Pisos, revestimentos e qualidade construtiva",
    },
    {
      icon: MapPin,
      title: "Localização & Entorno",
      description: "Comércios, escolas e infraestrutura",
    },
    {
      icon: HelpCircle,
      title: "Condições de Pagamento",
      description: "Financiamento e formas de aquisição",
    },
  ];

  return (
    <>
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary via-primary to-primary/95 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left - Text Content */}
            <div className="text-white order-2 lg:order-1">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-accent" />
                <span className="text-sm font-semibold tracking-widest text-accent uppercase">
                  Assistente Virtual
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                Tire suas dúvidas com a <span className="text-accent">Sofia</span>
              </h2>

              <p className="text-white/80 text-base md:text-lg mb-6 leading-relaxed">
                Nossa assistente virtual está pronta para responder suas perguntas sobre 
                este imóvel. Converse por texto ou voz em tempo real sobre localização, 
                materiais, acabamentos e muito mais.
              </p>

              {/* Topics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {topics.map((topic, index) => {
                  const Icon = topic.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 hover:bg-white/15 transition-colors"
                    >
                      <Icon className="h-5 w-5 text-accent mb-2" />
                      <h4 className="font-semibold text-sm md:text-base mb-1">
                        {topic.title}
                      </h4>
                      <p className="text-xs text-white/60 leading-snug">
                        {topic.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-primary font-semibold w-full sm:w-auto"
                onClick={handleStartChat}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Conversar com Sofia
              </Button>
            </div>

            {/* Right - Sofia Avatar */}
            {imovelId === MALIBU_PROPERTY_ID ? (
              <div className="order-1 lg:order-2 flex justify-center">
                <div className="relative w-full max-w-md lg:max-w-lg">
                  <HeyGenAvatar className="w-full" />
                  <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Online
                  </div>
                </div>
              </div>
            ) : (
              <div className="order-1 lg:order-2 flex justify-center">
                <div className="relative">
                  {/* Decorative circles */}
                  <div className="absolute inset-0 -m-3 md:-m-4 rounded-full bg-accent/10 animate-pulse" />
                  <div className="absolute inset-0 -m-6 md:-m-8 rounded-full bg-accent/5" />
                  
                  {/* Avatar Container */}
                  <div className="relative w-32 h-32 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-accent/20">
                    {/* Sofia Avatar */}
                    <div className="text-center">
                      <div className="w-16 h-16 md:w-28 md:h-28 lg:w-32 lg:h-32 mx-auto rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg">
                        <span className="text-2xl md:text-5xl lg:text-6xl font-bold text-primary">
                          S
                        </span>
                      </div>
                      <p className="mt-2 md:mt-3 text-white font-semibold text-xs md:text-base">Sofia</p>
                      <p className="text-accent/80 text-[10px] md:text-xs">Assistente IA • Texto & Voz</p>
                    </div>
                  </div>

                  {/* Floating badges */}
                  <div className="absolute -top-2 -right-2 md:top-0 md:right-0 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Online
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom note */}
          <div className="mt-8 text-center">
            <p className="text-white/50 text-sm">
              Respostas em tempo real • Texto ou voz • Disponível 24h • Totalmente gratuito
            </p>
          </div>
        </div>
      </section>

      {/* Embedded Chatbot Widget */}
      <ChatbotWidget
        imovelId={imovelId}
        imobiliariaId={imobiliariaId}
        construtorId={construtorId}
        imovelTitulo={propertyTitle}
        imobiliariaNome={imobiliariaNome}
        isOpenExternal={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}
