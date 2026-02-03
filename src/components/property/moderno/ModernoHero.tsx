import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Camera, Play, View } from "lucide-react";
import type { PropertyData, PropertyBranding } from "@/types/property-page";
import { Button } from "@/components/ui/button";

interface ModernoHeroProps {
  property: PropertyData;
  branding: PropertyBranding;
  onContactClick: () => void;
  onGalleryOpen: () => void;
}

export function ModernoHero({ property, branding, onContactClick, onGalleryOpen }: ModernoHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = property.imagens || [];

  // Auto-advance carousel
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
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
    <section className="relative h-[60vh] w-full overflow-hidden">
      {/* Background Image with Minimal White Overlay */}
      <div className="absolute inset-0">
        {images.length > 0 ? (
          <img
            src={images[currentIndex]?.url}
            alt={images[currentIndex]?.alt || property.titulo}
            className="h-full w-full object-cover transition-opacity duration-500"
          />
        ) : (
          <div className="h-full w-full bg-gray-100" />
        )}
        {/* White overlay 30% */}
        <div className="absolute inset-0 bg-white/30" />
      </div>

      {/* Media Counters - Top Left */}
      <div className="absolute left-6 top-6 flex gap-3 z-10">
        {photoCount > 0 && (
          <button
            onClick={onGalleryOpen}
            className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm text-gray-700 backdrop-blur-sm transition-colors hover:bg-white"
          >
            <Camera className="h-4 w-4" />
            <span>{photoCount}</span>
          </button>
        )}
        {videoCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm text-gray-700 backdrop-blur-sm">
            <Play className="h-4 w-4" />
            <span>{videoCount}</span>
          </div>
        )}
        {has360 && (
          <div className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm text-gray-700 backdrop-blur-sm">
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
            className="h-10 w-auto object-contain"
          />
        </div>
      )}

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/70 p-3 text-gray-800 backdrop-blur-sm transition-all hover:bg-white"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/70 p-3 text-gray-800 backdrop-blur-sm transition-all hover:bg-white"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Left-aligned Content */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-8 pb-12 pt-24 md:px-12 lg:px-20">
        {/* Property Title - Blue, Lowercase, Sans-serif */}
        <h1
          className="mb-3 text-3xl font-bold capitalize md:text-4xl lg:text-5xl"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            color: "#1E3A8A",
            textShadow: "0 2px 8px rgba(255,255,255,0.8)",
          }}
        >
          {property.headline || property.titulo}
        </h1>

        {/* Location */}
        {(property.bairro || property.cidade) && (
          <p
            className="mb-4 text-base text-white/90 md:text-lg"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {[property.bairro, property.cidade, property.estado].filter(Boolean).join(", ")}
          </p>
        )}

        {/* Price - Green */}
        <h2
          className="mb-6 text-2xl font-semibold md:text-3xl"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            color: "#10B981",
          }}
        >
          {property.priceOnRequest ? "Preço sob Consulta" : formatPrice(property.valor)}
        </h2>

        {/* CTA Button - Rounded, Blue */}
        <Button
          onClick={onContactClick}
          className="px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: "#1E3A8A",
            borderRadius: "12px",
          }}
        >
          Request Info
        </Button>
      </div>

      {/* Dots Navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-6 right-8 z-10 flex gap-2 md:right-12 lg:right-20">
          {images.slice(0, 8).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentIndex ? "w-6 bg-[#1E3A8A]" : "bg-white/60"
              }`}
              aria-label={`Ir para imagem ${index + 1}`}
            />
          ))}
          {images.length > 8 && (
            <span className="text-xs text-white/80">+{images.length - 8}</span>
          )}
        </div>
      )}
    </section>
  );
}
