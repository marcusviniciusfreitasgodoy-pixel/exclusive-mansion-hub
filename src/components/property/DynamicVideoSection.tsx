import { Play } from "lucide-react";
import { useState } from "react";

interface DynamicVideoSectionProps {
  videos: { url: string; tipo?: string }[];
  tour360Url?: string | null;
}

export const DynamicVideoSection = ({ videos, tour360Url }: DynamicVideoSectionProps) => {
  const [playingVideos, setPlayingVideos] = useState<Record<number, boolean>>({});

  const hasContent = (videos && videos.length > 0) || tour360Url;
  if (!hasContent) return null;

  const togglePlay = (index: number) => {
    setPlayingVideos((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Convert YouTube URLs to embed format
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtube.com/embed")) {
      return url;
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

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
            Experiência imersiva pelos ambientes
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          {/* Videos Grid - Vertical videos first */}
          {videos && videos.length > 0 && (() => {
            const verticalVideos = videos.filter(v => v.tipo === "vertical");
            const horizontalVideos = videos.filter(v => v.tipo === "horizontal" || v.tipo === undefined);

            return (
              <>
                {/* Vertical Videos (Shorts style) */}
                {verticalVideos.length > 0 && (
                  <div className={`grid gap-8 mb-12 ${
                    verticalVideos.length === 1
                      ? "grid-cols-1 max-w-md mx-auto"
                      : verticalVideos.length === 2
                      ? "md:grid-cols-2 max-w-3xl mx-auto"
                      : "md:grid-cols-3"
                  } justify-items-center`}>
                    {verticalVideos.map((video, index) => {
                      const globalIndex = index;
                      return (
                        <div
                          key={globalIndex}
                          className="relative aspect-[9/16] overflow-hidden rounded-2xl shadow-elegant animate-scale-in w-full max-w-md"
                        >
                          {!playingVideos[globalIndex] ? (
                            <div className="relative h-full w-full bg-primary/10">
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                                <button
                                  onClick={() => togglePlay(globalIndex)}
                                  className="flex h-20 w-20 items-center justify-center rounded-full bg-accent shadow-gold transition-elegant hover:scale-110"
                                  aria-label="Reproduzir vídeo"
                                >
                                  <Play
                                    className="h-10 w-10 text-primary ml-1"
                                    fill="currentColor"
                                  />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <iframe
                              src={getEmbedUrl(video.url)}
                              title={`Vídeo ${globalIndex + 1}`}
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Horizontal Videos (Regular videos with narration) */}
                {horizontalVideos.length > 0 && (
                  <div className="space-y-8">
                    <h3 className="text-center text-2xl font-semibold text-primary">
                      Vídeo com Narração
                    </h3>
                    {horizontalVideos.map((video, index) => {
                      const globalIndex = verticalVideos.length + index;
                      return (
                        <div
                          key={globalIndex}
                          className="relative aspect-video overflow-hidden rounded-2xl shadow-elegant animate-scale-in max-w-4xl mx-auto"
                        >
                          {!playingVideos[globalIndex] ? (
                            <div className="relative h-full w-full bg-primary/10">
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                                <button
                                  onClick={() => togglePlay(globalIndex)}
                                  className="flex h-24 w-24 items-center justify-center rounded-full bg-accent shadow-gold transition-elegant hover:scale-110"
                                  aria-label="Reproduzir vídeo"
                                >
                                  <Play
                                    className="h-12 w-12 text-primary ml-1"
                                    fill="currentColor"
                                  />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <iframe
                              src={getEmbedUrl(video.url)}
                              title={`Vídeo ${globalIndex + 1}`}
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}

          {/* Tour 360 */}
          {tour360Url && (
            <div className="mt-12">
              <h3 className="mb-6 text-center text-2xl font-semibold text-primary">
                Tour Virtual 360°
              </h3>
              <div className="relative aspect-video overflow-hidden rounded-2xl shadow-elegant animate-scale-in">
                <iframe
                  src={tour360Url}
                  title="Tour Virtual 360°"
                  className="h-full w-full"
                  allow="xr-spatial-tracking; fullscreen"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
