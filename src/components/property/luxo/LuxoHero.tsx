import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Camera, Play, View } from "lucide-react";
import type { PropertyData, PropertyBranding } from "@/types/property-page";
import { Button } from "@/components/ui/button";

interface LuxoHeroProps {
  property: PropertyData;
  branding: PropertyBranding;
  onContactClick: () => void;
  onGalleryOpen: () => void;
}

export function LuxoHero({ property, branding, onContactClick, onGalleryOpen }: LuxoHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = property.imagens || [];

  // Auto-advance carousel
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const formatPrice = (value: number | null) => {
    if (!value) return "Sob Consulta";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const photoCount = images.length;
  const videoCount = property.videos?.length || 0;
  const has360 = !!property.tour360Url;

  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {images.length > 0 ? (
          <img
            src={images[currentIndex]?.url}
            alt={images[currentIndex]?.alt || property.titulo}
            className="h-full w-full object-cover transition-opacity duration-700"
          />
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}
        {/* Black overlay 50% */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Media Counters - Top Left */}
      <div className="absolute left-6 top-6 flex gap-3 z-10">
        {photoCount > 0 && (
          <button
            onClick={onGalleryOpen}
            className="flex items-center gap-2 rounded bg-black/60 px-3 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-black/80"
          >
            <Camera className="h-4 w-4" />
            <span>{photoCount}</span>
          </button>
        )}
        {videoCount > 0 && (
          <div className="flex items-center gap-2 rounded bg-black/60 px-3 py-2 text-sm text-white backdrop-blur-sm">
            <Play className="h-4 w-4" />
            <span>{videoCount}</span>
          </div>
        )}
        {has360 && (
          <div className="flex items-center gap-2 rounded bg-black/60 px-3 py-2 text-sm text-white backdrop-blur-sm">
            <View className="h-4 w-4" />
            <span>360°</span>
          </div>
        )}
      </div>

      {/* Branding Logo - Top Right */}
      {branding.imobiliariaLogo && (
        <div className="absolute right-6 top-6 z-10">
          <img
            src={branding.imobiliariaLogo}
            alt={branding.imobiliariaNome}
            className="h-12 w-auto object-contain brightness-0 invert"
          />
        </div>
      )}

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/40"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/40"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        {/* Property Title - Gold, Uppercase, Serif */}
        <h1
          className="mb-4 text-4xl font-bold uppercase tracking-wider md:text-5xl lg:text-6xl"
          style={{
            fontFamily: "'Times New Roman', 'Georgia', serif",
            color: "#D4AF37",
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          {property.headline || property.titulo}
        </h1>

        {/* Location */}
        {(property.bairro || property.cidade) && (
          <p
            className="mb-6 text-lg text-white/90 md:text-xl"
            style={{ fontFamily: "'Helvetica', 'Arial', sans-serif" }}
          >
            {[property.bairro, property.cidade, property.estado].filter(Boolean).join(", ")}
          </p>
        )}

        {/* Price - White, Large */}
        <h2
          className="mb-8 text-3xl font-medium text-white md:text-4xl"
          style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}
        >
          {property.priceOnRequest ? "Preço sob Consulta" : formatPrice(property.valor)}
        </h2>

        {/* CTA Button - Gold, Rectangular */}
        <Button
          onClick={onContactClick}
          className="rounded-lg px-8 py-3 text-sm font-semibold uppercase tracking-wide transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: "#D4AF37",
            color: "#000000",
            borderRadius: "8px",
          }}
        >
          Contact Agent
        </Button>
      </div>

      {/* Dots Navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentIndex ? "w-6 bg-[#D4AF37]" : "bg-white/50"
              }`}
              aria-label={`Ir para imagem ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
