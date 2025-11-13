import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import heroImage from "@/assets/hero-ocean-view.jpg";

export const Hero = () => {
  const scrollToDetails = () => {
    document.getElementById("details")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image with overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Vista panorâmica do mar da Barra da Tijuca" 
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 py-8">
        {/* Main Content */}
        <div className="text-center animate-fade-in mt-20">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-accent md:text-base">
            Exclusividade Godoy Prime Realty
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
            Cobertura Duplex<br />Frente-Mar
          </h1>
          <p className="mb-8 text-xl text-white/90 md:text-2xl">
            980m² de Sofisticação na Barra da Tijuca
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button 
              size="lg" 
              className="bg-accent text-primary hover:bg-accent/90 shadow-gold transition-elegant text-base font-semibold px-8"
              onClick={scrollToDetails}
            >
              Conhecer o Imóvel
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-elegant text-base font-semibold px-8"
              onClick={() => window.open("https://wa.me/5521999999999", "_blank")}
            >
              Agendar Visita
            </Button>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button 
            onClick={scrollToDetails}
            className="animate-fade-in flex flex-col items-center text-white/80 hover:text-white transition-smooth"
            style={{ animationDelay: "0.4s" }}
            aria-label="Scroll para mais informações"
          >
            <span className="mb-2 text-xs uppercase tracking-widest">Descubra</span>
            <ArrowDown className="h-6 w-6 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};
