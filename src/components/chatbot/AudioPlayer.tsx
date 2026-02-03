import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audioBase64?: string;
  autoPlay?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  className?: string;
}

export function AudioPlayer({
  audioBase64,
  autoPlay = false,
  onPlayStart,
  onPlayEnd,
  className,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioBase64) return;

    // Create audio element with data URI
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
    const audio = new Audio(audioUrl);

    audio.onloadstart = () => setIsLoading(true);
    audio.oncanplaythrough = () => setIsLoading(false);
    audio.onplay = () => {
      setIsPlaying(true);
      onPlayStart?.();
    };
    audio.onended = () => {
      setIsPlaying(false);
      onPlayEnd?.();
    };
    audio.onerror = () => {
      setIsLoading(false);
      setIsPlaying(false);
      console.error("Audio playback error");
    };

    audioRef.current = audio;

    // Auto-play if enabled
    if (autoPlay) {
      audio.play().catch((error) => {
        console.error("Auto-play failed:", error);
        setIsLoading(false);
      });
    }

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioBase64, autoPlay, onPlayStart, onPlayEnd]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  if (!audioBase64) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={togglePlayback}
      disabled={isLoading}
      className={cn("h-6 px-2 text-xs gap-1", className)}
      title={isPlaying ? "Parar áudio" : "Ouvir resposta"}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isPlaying ? (
        <VolumeX className="h-3 w-3" />
      ) : (
        <Volume2 className="h-3 w-3" />
      )}
      <span className="sr-only md:not-sr-only">
        {isPlaying ? "Parar" : "Ouvir"}
      </span>
    </Button>
  );
}
