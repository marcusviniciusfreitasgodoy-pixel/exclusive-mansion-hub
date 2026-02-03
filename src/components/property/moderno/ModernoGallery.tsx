import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ModernoGalleryProps {
  images: { url: string; alt?: string }[];
}

export function ModernoGallery({ images }: ModernoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderIndex, setSliderIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Autoplay for slider
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const slideLeft = () => {
    setSliderIndex((prev) => (prev === 0 ? Math.max(0, images.length - 3) : prev - 1));
  };

  const slideRight = () => {
    setSliderIndex((prev) => (prev >= images.length - 3 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) return null;

  return (
    <>
      {/* Horizontal Slider */}
      <div className="relative">
        {/* Navigation Arrows */}
        {images.length > 3 && (
          <>
            <button
              onClick={slideLeft}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition-all hover:bg-white"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5 text-[#1E3A8A]" />
            </button>
            <button
              onClick={slideRight}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition-all hover:bg-white"
              aria-label="Próximo"
            >
              <ChevronRight className="h-5 w-5 text-[#1E3A8A]" />
            </button>
          </>
        )}

        {/* Slider Container */}
        <div className="overflow-hidden" ref={sliderRef}>
          <div
            className="flex gap-4 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${sliderIndex * (100 / 3)}%)` }}
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="group relative w-full flex-shrink-0 cursor-pointer overflow-hidden rounded-lg sm:w-1/2 lg:w-1/3"
                style={{ aspectRatio: "16/10" }}
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.url}
                  alt={image.alt || `Imagem ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-[#1E3A8A]/0 transition-all duration-300 group-hover:bg-[#1E3A8A]/30">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="mt-6 flex justify-center gap-2">
          {images.slice(0, 10).map((_, index) => (
            <button
              key={index}
              onClick={() => setSliderIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === sliderIndex ? "w-6 bg-[#1E3A8A]" : "bg-gray-300"
              }`}
              aria-label={`Ir para imagem ${index + 1}`}
            />
          ))}
          {images.length > 10 && (
            <span className="ml-2 text-xs text-gray-500">+{images.length - 10}</span>
          )}
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-6xl border-none bg-white p-0">
          <div className="relative flex h-[80vh] items-center justify-center bg-gray-50">
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 z-50 rounded-full bg-[#1E3A8A]/80 p-2 text-white transition-colors hover:bg-[#1E3A8A]"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-[#1E3A8A]/80 p-3 text-white transition-colors hover:bg-[#1E3A8A]"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-[#1E3A8A]/80 p-3 text-white transition-colors hover:bg-[#1E3A8A]"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={images[currentIndex]?.url}
              alt={images[currentIndex]?.alt || `Imagem ${currentIndex + 1}`}
              className="max-h-full max-w-full rounded-lg object-contain"
            />

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#1E3A8A]/80 px-4 py-2 text-sm text-white">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
