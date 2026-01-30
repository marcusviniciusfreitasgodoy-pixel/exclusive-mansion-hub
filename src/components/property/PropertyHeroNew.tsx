import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, Camera, Video, View, Images } from "lucide-react";
import type { PropertyData, PropertyBranding } from "@/types/property-page";
import useEmblaCarousel from "embla-carousel-react";

interface PropertyHeroNewProps {
  property: PropertyData;
  branding: PropertyBranding;
  onContactClick: () => void;
}

export function PropertyHeroNew({ property, branding, onContactClick }: PropertyHeroNewProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const images = property.imagens?.length > 0 
    ? property.imagens 
    : [{ url: "/placeholder.svg", alt: "Imagem do imóvel" }];

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Listen to embla events
  useState(() => {
    if (emblaApi) {
      emblaApi.on("select", onSelect);
      onSelect();
    }
  });

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const hasVideos = property.videos && property.videos.length > 0;
  const hasTour = !!property.tour360Url;
  const photoCount = images.length;

  return (
    <>
      <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden bg-primary">
        {/* Carousel */}
        <div className="embla h-full" ref={emblaRef}>
          <div className="embla__container flex h-full">
            {images.map((image, index) => (
              <div 
                key={index} 
                className="embla__slide flex-[0_0_100%] min-w-0 relative cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.url}
                  alt={image.alt || `Foto ${index + 1} do imóvel`}
                  className="h-full w-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-6 w-6 text-primary" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
              aria-label="Próxima foto"
            >
              <ChevronRight className="h-6 w-6 text-primary" />
            </button>
          </>
        )}

        {/* Top Left Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {hasVideos && (
            <Badge className="bg-primary/90 text-white hover:bg-primary flex items-center gap-1.5 px-3 py-1.5">
              <Video className="h-4 w-4" />
              VÍDEO
            </Badge>
          )}
          <Badge className="bg-primary/90 text-white hover:bg-primary flex items-center gap-1.5 px-3 py-1.5">
            <Camera className="h-4 w-4" />
            {photoCount} FOTOS
          </Badge>
          {hasTour && (
            <Badge className="bg-primary/90 text-white hover:bg-primary flex items-center gap-1.5 px-3 py-1.5">
              <View className="h-4 w-4" />
              TOUR 360°
            </Badge>
          )}
        </div>

        {/* Bottom Right Section */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-3">
          {/* Logo */}
          {branding.imobiliariaLogo && (
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg">
              <img
                src={branding.imobiliariaLogo}
                alt={branding.imobiliariaNome}
                className="h-10 md:h-12 w-auto max-w-[150px] object-contain"
              />
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-white/95 backdrop-blur-sm border-0 hover:bg-white text-primary font-semibold"
              onClick={() => openLightbox(0)}
            >
              <Images className="mr-2 h-4 w-4" />
              Ver Galeria
            </Button>
            <Button
              className="bg-accent hover:bg-accent/90 text-primary font-semibold shadow-lg"
              onClick={onContactClick}
            >
              Falar com Corretor
            </Button>
          </div>
        </div>

        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {images.slice(0, 10).map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? "w-6 bg-white" 
                    : "w-2 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Ir para foto ${index + 1}`}
              />
            ))}
            {images.length > 10 && (
              <span className="text-white/70 text-xs ml-1">+{images.length - 10}</span>
            )}
          </div>
        )}
      </section>

      {/* Lightbox Gallery Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 bg-black/95 border-0">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
            aria-label="Fechar galeria"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <div className="relative h-full flex items-center justify-center">
            <img
              src={images[lightboxIndex]?.url}
              alt={images[lightboxIndex]?.alt || `Foto ${lightboxIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-8 w-8 text-white" />
                </button>
                <button
                  onClick={() => setLightboxIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="h-8 w-8 text-white" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3">
            <div className="flex gap-2 overflow-x-auto justify-center">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setLightboxIndex(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                    index === lightboxIndex ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
