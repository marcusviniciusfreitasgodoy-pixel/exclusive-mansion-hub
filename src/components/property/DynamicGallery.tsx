import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DynamicGalleryProps {
  images: { url: string; alt?: string }[];
}

export const DynamicGallery = ({ images }: DynamicGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

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
              alt={images[currentIndex].alt || `Imagem ${currentIndex + 1}`}
              className="h-full w-full object-cover transition-elegant"
            />

            {/* Navigation Buttons */}
            {images.length > 1 && (
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
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                    index === currentIndex
                      ? "ring-2 ring-accent ring-offset-2 ring-offset-primary"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `Miniatura ${index + 1}`}
                    className="h-16 w-24 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
