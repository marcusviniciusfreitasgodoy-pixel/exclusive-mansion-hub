import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LuxoGalleryProps {
  images: { url: string; alt?: string }[];
}

export function LuxoGallery({ images }: LuxoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  if (!images || images.length === 0) return null;

  return (
    <>
      {/* Grid Gallery - 1 col mobile / 3 tablet / 4 desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="group relative aspect-square cursor-pointer overflow-hidden bg-gray-100"
            onClick={() => openLightbox(index)}
          >
            <img
              src={image.url}
              alt={image.alt || `Imagem ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
              <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            {/* Subtle Border */}
            <div className="absolute inset-0 border border-gray-200 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-6xl border-none bg-black p-0">
          <div className="relative flex h-[80vh] items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 z-50 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/40"
              aria-label="Fechar"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/40"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/40"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={images[currentIndex]?.url}
              alt={images[currentIndex]?.alt || `Imagem ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
