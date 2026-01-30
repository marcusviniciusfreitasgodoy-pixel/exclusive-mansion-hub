import { Navbar } from "@/components/Navbar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { Hero } from "@/components/Hero";
import { PropertyDetails } from "@/components/PropertyDetails";
import { Description } from "@/components/Description";
import { Gallery } from "@/components/Gallery";
import { VideoSection } from "@/components/VideoSection";
import { Contact } from "@/components/Contact";
import { Link } from "react-router-dom";
import logoWhite from "@/assets/logo-negativo.png";

const Index = () => {
  return <main className="min-h-screen">
      <Navbar />
      <ScrollToTop />
      <FloatingWhatsApp />
      <div id="hero">
        <Hero />
      </div>
      <div id="details">
        <PropertyDetails />
      </div>
      <div id="description">
        <Description />
      </div>
      <div id="gallery">
        <Gallery />
      </div>
      <div id="video">
        <VideoSection />
      </div>
      <div id="contact">
        <Contact />
      </div>
      
      {/* Footer */}
      <footer className="bg-primary py-12 text-center">
        <div className="container mx-auto px-6">
          <img src={logoWhite} alt="Godoy Prime Realty" className="mx-auto mb-6 h-12" />
          <p className="text-sm text-white/60">
            © 2025 Godoy Prime Realty. Todos os direitos reservados.
          </p>
          <p className="mt-2 text-xs text-white/40">
            CRECI: 11841 | Código do Imóvel: 172850
          </p>
          <div className="mt-6 flex justify-center gap-4 text-xs text-white/40">
            <Link to="/imovel/cobertura-lucio-costa-godoyprime" className="hover:text-accent transition-smooth">Ver Imóvel (Layout Novo)</Link>
            <span>•</span>
            <a href="https://docs.google.com/document/d/1WKh-v-HKJz5rHLhqzaPRlj34YzSe78NhhiQgTnRShls/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-smooth">Política de Privacidade</a>
            <span>•</span>
            <a href="https://docs.google.com/document/d/1JqColkt5uzQnajZDWVPTdy423kJlVDEpQepGRGlGFp8/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-smooth">Termos de Uso</a>
            <span>•</span>
            <Link to="/admin/diagnostico" className="hover:text-accent transition-smooth">Diagnóstico</Link>
          </div>
        </div>
      </footer>
    </main>;
};
export default Index;