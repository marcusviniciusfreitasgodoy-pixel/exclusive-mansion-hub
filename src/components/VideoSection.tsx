import { Play } from "lucide-react";
import { useState } from "react";

export const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingSecond, setIsPlayingSecond] = useState(false);

  // YouTube Shorts video
  const videoUrl = "https://www.youtube.com/embed/qumxudth3mk";
  const videoUrlSecond = "https://www.youtube.com/embed/UaRbQ7U_IGE";

  return (
    <section className="relative py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center animate-fade-in">
          <span className="mb-4 inline-block text-sm uppercase tracking-[0.3em] text-accent">
            Tour Virtual
          </span>
          <h2 className="mb-4 text-4xl font-bold text-primary md:text-5xl">
            Conheça o Imóvel em Vídeo
          </h2>
          <p className="text-xl text-muted-foreground">
            Experiência imersiva pelos ambientes da cobertura
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2 justify-items-center">
            {/* Main Video */}
            <div className="relative aspect-[9/16] overflow-hidden rounded-2xl shadow-elegant animate-scale-in w-full max-w-md">
              {!isPlaying ? (
                <div className="relative h-full w-full">
                  <img
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80"
                    alt="Thumbnail do vídeo"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-accent shadow-gold transition-elegant hover:scale-110"
                      aria-label="Reproduzir vídeo"
                    >
                      <Play className="h-10 w-10 text-primary ml-1" fill="currentColor" />
                    </button>
                  </div>
                </div>
              ) : (
                <iframe
                  src={videoUrl}
                  title="Tour Virtual da Cobertura"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Second Video */}
            <div className="relative aspect-[9/16] overflow-hidden rounded-xl shadow-elegant animate-fade-in w-full max-w-md">
              {!isPlayingSecond ? (
                <div className="relative h-full w-full">
                  <img
                    src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80"
                    alt="Thumbnail suítes"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <button
                      onClick={() => setIsPlayingSecond(true)}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/90 shadow-gold transition-elegant hover:scale-110"
                      aria-label="Reproduzir vídeo das suítes"
                    >
                      <Play className="h-8 w-8 text-primary ml-1" fill="currentColor" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="font-semibold">Suítes e Closets</p>
                  </div>
                </div>
              ) : (
                <iframe
                  src={videoUrlSecond}
                  title="Vídeo das Suítes"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

          </div>

          {/* Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground italic">
              Nota: Vídeos de exemplo. Os vídeos reais da cobertura serão adicionados em breve.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
