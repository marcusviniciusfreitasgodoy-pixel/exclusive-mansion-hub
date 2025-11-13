import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Gallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Placeholder images - user will need to upload actual photos
  const images = [
    { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80", alt: "Vista da sala de estar" },
    { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80", alt: "Cozinha gourmet" },
    { url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80", alt: "Suíte master" },
    { url: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&q=80", alt: "Vista do terraço" },
    { url: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=80", alt: "Piscina privativa" },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80", alt: "Cinema privativo" },
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

          {/* Thumbnails */}
          <div className="mt-6 grid grid-cols-6 gap-3">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`aspect-square overflow-hidden rounded-lg transition-elegant ${
                  index === currentIndex
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-primary"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Note about placeholder images */}
          <div className="mt-8 text-center">
            <p className="text-sm text-white/60 italic">
              Nota: Imagens ilustrativas. As fotos reais da cobertura serão adicionadas em breve.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
