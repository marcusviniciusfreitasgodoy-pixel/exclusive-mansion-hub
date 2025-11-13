import { Hero } from "@/components/Hero";
import { PropertyDetails } from "@/components/PropertyDetails";
import { Description } from "@/components/Description";
import { Gallery } from "@/components/Gallery";
import { VideoSection } from "@/components/VideoSection";
import { Contact } from "@/components/Contact";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <PropertyDetails />
      <Description />
      <Gallery />
      <VideoSection />
      <Contact />
      
      {/* Footer */}
      <footer className="bg-primary py-8 text-center text-white/60">
        <p className="text-sm">
          © 2024 Godoy Prime Realty. Todos os direitos reservados.
        </p>
        <p className="mt-2 text-xs">
          CRECI: [Número do CRECI] | Código do Imóvel: 172850
        </p>
      </footer>
    </main>
  );
};

export default Index;
