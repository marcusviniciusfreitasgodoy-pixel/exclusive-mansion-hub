import { Play } from "lucide-react";
import { useState } from "react";
import videoThumbnailOcean from "@/assets/video-thumbnail-ocean.jpg";
import videoThumbnailInterior from "@/assets/video-thumbnail-interior.jpg";
export const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingSecond, setIsPlayingSecond] = useState(false);
  const [isPlayingThird, setIsPlayingThird] = useState(false);
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);

  // YouTube Shorts video
  const videoUrl = "https://www.youtube.com/embed/qumxudth3mk";
  const videoUrlSecond = "https://www.youtube.com/embed/UaRbQ7U_IGE";
  const videoUrlThird = "https://www.youtube.com/embed/vNY2KsXWkH8";
  const videoUrlNarration = "https://www.youtube.com/embed/SEpp55jgOqA";
  return <section className="relative py-24 bg-white">
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

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3 justify-items-center">
            {/* Main Video */}
            <div className="relative aspect-[9/16] overflow-hidden rounded-2xl shadow-elegant animate-scale-in w-full max-w-md">
              {!isPlaying ? <div className="relative h-full w-full">
                  <img src={videoThumbnailOcean} alt="Vista da praia" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <button onClick={() => setIsPlaying(true)} className="flex h-20 w-20 items-center justify-center rounded-full bg-accent shadow-gold transition-elegant hover:scale-110" aria-label="Reproduzir vídeo">
                      <Play className="h-10 w-10 text-primary ml-1" fill="currentColor" />
                    </button>
                  </div>
                </div> : <iframe src={videoUrl} title="Tour Virtual da Cobertura" className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
            </div>

            {/* Second Video */}
            <div className="relative aspect-[9/16] overflow-hidden rounded-xl shadow-elegant animate-fade-in w-full max-w-md">
              {!isPlayingSecond ? <div className="relative h-full w-full">
                  <img src={videoThumbnailInterior} alt="Interior da cobertura" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <button onClick={() => setIsPlayingSecond(true)} className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/90 shadow-gold transition-elegant hover:scale-110" aria-label="Reproduzir vídeo das suítes">
                      <Play className="h-8 w-8 text-primary ml-1" fill="currentColor" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    
                  </div>
                </div> : <iframe src={videoUrlSecond} title="Vídeo das Suítes" className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
            </div>

            {/* Third Video */}
            <div className="relative aspect-[9/16] overflow-hidden rounded-xl shadow-elegant animate-fade-in w-full max-w-md">
              {!isPlayingThird ? <div className="relative h-full w-full">
                  <img src={videoThumbnailOcean} alt="Tour da cobertura" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <button onClick={() => setIsPlayingThird(true)} className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/90 shadow-gold transition-elegant hover:scale-110" aria-label="Reproduzir tour da cobertura">
                      <Play className="h-8 w-8 text-primary ml-1" fill="currentColor" />
                    </button>
                  </div>
                </div> : <iframe src={videoUrlThird} title="Tour da Cobertura" className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
            </div>

          </div>

          {/* Narration Video - 16:9 */}
          <div className="mt-12">
            <h3 className="mb-6 text-center text-2xl font-semibold text-primary">
              Vídeo com Narração
            </h3>
            <div className="relative aspect-video overflow-hidden rounded-2xl shadow-elegant animate-scale-in">
              {!isPlayingNarration ? (
                <div className="relative h-full w-full">
                  <img 
                    src={videoThumbnailOcean} 
                    alt="Vídeo com narração" 
                    className="h-full w-full object-cover" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <button
                      onClick={() => setIsPlayingNarration(true)}
                      className="flex h-24 w-24 items-center justify-center rounded-full bg-accent shadow-gold transition-elegant hover:scale-110"
                      aria-label="Reproduzir vídeo com narração"
                    >
                      <Play className="h-12 w-12 text-primary ml-1" fill="currentColor" />
                    </button>
                  </div>
                </div>
              ) : (
                <iframe
                  src={videoUrlNarration}
                  title="Vídeo com Narração"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>;
};