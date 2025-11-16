import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Gallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    // Vista Externa e Terraço
    { url: new URL('@/assets/gallery/01.jpg', import.meta.url).href, alt: "Terraço gourmet com vista panorâmica do mar" },
    { url: new URL('@/assets/gallery/ocean-front.jpg', import.meta.url).href, alt: "Vista frontal para o oceano Atlântico" },
    { url: new URL('@/assets/gallery/02.jpg', import.meta.url).href, alt: "Vista panorâmica da praia e orla da Barra" },
    
    // Áreas Sociais
    { url: new URL('@/assets/gallery/principal.jpg', import.meta.url).href, alt: "Sala de estar principal com vista panorâmica" },
    { url: new URL('@/assets/gallery/05.jpg', import.meta.url).href, alt: "Sala de estar elegante com varanda integrada" },
    { url: new URL('@/assets/gallery/10.jpg', import.meta.url).href, alt: "Sala de jantar integrada à área social" },
    { url: new URL('@/assets/gallery/12.jpg', import.meta.url).href, alt: "Área social com decoração contemporânea" },
    { url: new URL('@/assets/gallery/03.jpg', import.meta.url).href, alt: "Living com pé direito alto e iluminação natural" },
    { url: new URL('@/assets/gallery/04.jpg', import.meta.url).href, alt: "Sala de estar com móveis de designer" },
    { url: new URL('@/assets/gallery/06.jpg', import.meta.url).href, alt: "Ambiente integrado sala e varanda" },
    { url: new URL('@/assets/gallery/29.jpg', import.meta.url).href, alt: "Área social com vista panorâmica" },
    { url: new URL('@/assets/gallery/31.jpg', import.meta.url).href, alt: "Living integrado com varanda" },
    { url: new URL('@/assets/gallery/32.jpg', import.meta.url).href, alt: "Sala de estar com decoração contemporânea" },
    
    // Cinema Privativo
    { url: new URL('@/assets/gallery/47.jpg', import.meta.url).href, alt: "Cinema privativo com projetor e poltronas reclináveis" },
    { url: new URL('@/assets/gallery/07.jpg', import.meta.url).href, alt: "Home theater equipado" },
    { url: new URL('@/assets/gallery/46.jpg', import.meta.url).href, alt: "Cinema com sistema de som premium" },
    
    // Cozinha e Área Gourmet
    { url: new URL('@/assets/gallery/08.jpg', import.meta.url).href, alt: "Cozinha gourmet totalmente equipada" },
    { url: new URL('@/assets/gallery/09.jpg', import.meta.url).href, alt: "Área gourmet com eletrodomésticos de última geração" },
    { url: new URL('@/assets/gallery/33.jpg', import.meta.url).href, alt: "Cozinha integrada com área de serviço" },
    { url: new URL('@/assets/gallery/34.jpg', import.meta.url).href, alt: "Área gourmet com vista" },
    
    // Suítes e Quartos
    { url: new URL('@/assets/gallery/11.jpg', import.meta.url).href, alt: "Suíte master com closet e vista panorâmica" },
    { url: new URL('@/assets/gallery/13.jpg', import.meta.url).href, alt: "Suíte com iluminação cênica e acabamentos premium" },
    { url: new URL('@/assets/gallery/14.jpg', import.meta.url).href, alt: "Quarto espaçoso com móveis planejados" },
    { url: new URL('@/assets/gallery/15.jpg', import.meta.url).href, alt: "Suíte com decoração elegante" },
    { url: new URL('@/assets/gallery/16.jpg', import.meta.url).href, alt: "Quarto com iluminação LED e espelhos" },
    { url: new URL('@/assets/gallery/17.jpg', import.meta.url).href, alt: "Suíte com closet integrado" },
    { url: new URL('@/assets/gallery/19.jpg', import.meta.url).href, alt: "Quarto com vista privilegiada" },
    { url: new URL('@/assets/gallery/20.jpg', import.meta.url).href, alt: "Suíte com decoração contemporânea" },
    { url: new URL('@/assets/gallery/21.jpg', import.meta.url).href, alt: "Ambiente íntimo com iluminação diferenciada" },
    { url: new URL('@/assets/gallery/23.jpg', import.meta.url).href, alt: "Quarto com móveis espelhados" },
    { url: new URL('@/assets/gallery/26.jpg', import.meta.url).href, alt: "Suíte com acabamentos de luxo" },
    { url: new URL('@/assets/gallery/28.jpg', import.meta.url).href, alt: "Quarto espaçoso e aconchegante" },
    { url: new URL('@/assets/gallery/35.jpg', import.meta.url).href, alt: "Suíte com closet planejado" },
    { url: new URL('@/assets/gallery/36.jpg', import.meta.url).href, alt: "Quarto com iluminação ambiente" },
    { url: new URL('@/assets/gallery/37.jpg', import.meta.url).href, alt: "Suíte com varanda privativa" },
    { url: new URL('@/assets/gallery/38.jpg', import.meta.url).href, alt: "Quarto com decoração moderna" },
    { url: new URL('@/assets/gallery/39.jpg', import.meta.url).href, alt: "Suíte master secundária" },
    { url: new URL('@/assets/gallery/40.jpg', import.meta.url).href, alt: "Quarto com móveis de designer" },
    { url: new URL('@/assets/gallery/41.jpg', import.meta.url).href, alt: "Suíte com acabamentos premium" },
    { url: new URL('@/assets/gallery/43.jpg', import.meta.url).href, alt: "Quarto com iluminação LED" },
    { url: new URL('@/assets/gallery/44.jpg', import.meta.url).href, alt: "Suíte com vista panorâmica" },
    { url: new URL('@/assets/gallery/45.jpg', import.meta.url).href, alt: "Quarto espaçoso e confortável" },
    
    // Banheiros
    { url: new URL('@/assets/gallery/24.jpg', import.meta.url).href, alt: "Banheiro moderno com acabamento em mármore" },
  ];

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="relative py-24 bg-primary">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center animate-fade-in">
          <span className="mb-4 inline-block text-sm uppercase tracking-[0.3em] text-accent">
            Galeria de Imagens
          </span>
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Conheça Cada Ambiente
          </h2>
        </div>

        <div className="relative mx-auto max-w-6xl">
          {/* Main Image */}
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-elegant animate-scale-in">
            <img
              src={images[currentIndex].url}
              alt={images[currentIndex].alt}
              className="h-full w-full object-cover transition-elegant"
            />
            
            {/* Navigation Buttons */}
            <div className="absolute inset-0 flex items-center justify-between p-4">
              <Button
                variant="outline"
                size="icon"
                onClick={prev}
                className="h-12 w-12 rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-smooth"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={next}
                className="h-12 w-12 rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-smooth"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
