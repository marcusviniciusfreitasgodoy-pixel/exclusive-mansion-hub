import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, Camera, Video, View, Images, Sparkles, Star, Building, Clock } from "lucide-react";
import type { PropertyData, PropertyBranding } from "@/types/property-page";
import useEmblaCarousel from "embla-carousel-react";
import { resolveImageUrl } from "@/lib/galleryImages";

interface PropertyHeroNewProps {
  property: PropertyData;
  branding: PropertyBranding;
  onContactClick: () => void;
  onGalleryOpen?: () => void;
}

export function PropertyHeroNew({ property, branding, onContactClick, onGalleryOpen }: PropertyHeroNewProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const rawImages = property.imagens?.length > 0 
    ? property.imagens 
    : [{ url: "/placeholder.svg", alt: "Imagem do imóvel" }];

  // Resolve all image URLs to bundled assets
  const images = rawImages.map(img => ({
    ...img,
    url: resolveImageUrl(img.url)
  }));

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

  const handleGalleryClick = () => {
    if (onGalleryOpen) {
      onGalleryOpen();
    } else {
      openLightbox(0);
    }
  };

  const hasVideos = property.videos && property.videos.length > 0;
  const hasTour = !!property.tour360Url;
  const photoCount = images.length;

  // Build badges array based on flags
  const badges: { label: string; icon: React.ElementType; className: string }[] = [];
  
  if (property.flagNovoAnuncio) {
    badges.push({ label: "NOVO", icon: Sparkles, className: "bg-green-500 text-white" });
  }
  if (property.flagDestaque) {
    badges.push({ label: "DESTAQUE", icon: Star, className: "bg-accent text-primary" });
  }
  if (property.flagExclusividade) {
    badges.push({ label: "EXCLUSIVO", icon: Building, className: "bg-purple-600 text-white" });
  }
  if (property.flagOffMarket) {
    badges.push({ label: "OFF MARKET", icon: Clock, className: "bg-gray-800 text-white" });
  }
  if (property.flagLancamento) {
    badges.push({ label: "LANÇAMENTO", icon: Sparkles, className: "bg-orange-500 text-white" });
  }
  if (property.flagAltoPadrao) {
    badges.push({ label: "ALTO PADRÃO", icon: Star, className: "bg-primary text-white" });
  }

  const formatCurrency = (value: number | null) => {
    if (property.priceOnRequest || !value) return "Preço sob consulta";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  return (
    <>
      <section className="relative h-[55vh] sm:h-[60vh] md:h-[80vh] w-full overflow-hidden bg-primary">
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
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows - Hidden on very small screens */}
        {images.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition-all"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition-all"
              aria-label="Próxima foto"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </button>
          </>
        )}

        {/* Top Left - Property Badges (below navbar) */}
        <div className="absolute top-16 sm:top-20 md:top-24 left-2 sm:left-4 z-20 flex flex-col gap-1.5 sm:gap-2">
          {/* Dynamic Flags - limit on mobile */}
          {badges.slice(0, 2).map((badge, index) => {
            const Icon = badge.icon;
            return (
              <Badge key={index} className={`${badge.className} hover:opacity-90 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs`}>
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">{badge.label}</span>
              </Badge>
            );
          })}
          
          {/* Media Counters */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
            {hasVideos && (
              <Badge className="bg-primary/90 text-white hover:bg-primary flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs">
                <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">VÍDEO</span>
              </Badge>
            )}
            <Badge className="bg-primary/90 text-white hover:bg-primary flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs">
              <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
              {photoCount}
              <span className="hidden sm:inline">FOTOS</span>
            </Badge>
            {hasTour && (
              <Badge className="bg-primary/90 text-white hover:bg-primary flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs">
                <View className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">TOUR 360°</span>
                <span className="sm:hidden">360°</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Bottom Left - Info Box */}
        <div className="absolute bottom-4 left-4 z-20 hidden md:block">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-xl max-w-md">
            <p className="text-sm font-semibold tracking-widest text-accent uppercase mb-1">
              {property.bairro?.toUpperCase() || "LOCALIZAÇÃO"}
            </p>
            <p className="text-lg text-muted-foreground mb-2">
              {property.endereco || property.titulo}
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              {property.cidade} - {property.estado}, Brasil
            </p>
            
            <p className="text-2xl font-bold text-primary mb-1">
              {formatCurrency(property.valor)}
            </p>
            {property.priceSecondary && (
              <p className="text-sm text-muted-foreground">
                ≈ {property.priceSecondaryCurrency} {formatNumber(property.priceSecondary)}
              </p>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleGalleryClick}
              >
                <Images className="mr-2 h-4 w-4" />
                Galeria
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-accent hover:bg-accent/90 text-primary"
                onClick={onContactClick}
              >
                Contato
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Right - Logo & Actions */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-3">
          {/* Logo - smaller on mobile */}
          {branding.imobiliariaLogo && (
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-lg">
              <img
                src={branding.imobiliariaLogo}
                alt={branding.imobiliariaNome}
                className="h-8 sm:h-10 md:h-14 w-auto max-w-[120px] sm:max-w-[150px] md:max-w-[180px] object-contain"
              />
            </div>
          )}
          
          {/* Mobile Action Buttons */}
          <div className="flex gap-2 md:hidden">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/95 backdrop-blur-sm border-0 hover:bg-white text-primary font-semibold"
              onClick={handleGalleryClick}
            >
              <Images className="mr-2 h-4 w-4" />
              Galeria
            </Button>
            <Button
              size="sm"
              className="bg-accent hover:bg-accent/90 text-primary font-semibold shadow-lg"
              onClick={onContactClick}
            >
              Contato
            </Button>
          </div>
        </div>

        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 md:bottom-6">
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
