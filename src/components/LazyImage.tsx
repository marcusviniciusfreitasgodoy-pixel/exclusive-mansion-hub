import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  srcSet?: string;
  sizes?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  onLoadComplete?: () => void;
}

export function LazyImage({
  src,
  alt,
  placeholderSrc,
  srcSet,
  sizes,
  className,
  aspectRatio = 'auto',
  objectFit = 'cover',
  onLoadComplete,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadComplete?.();
  };

  const handleError = () => {
    setError(true);
  };

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  }[aspectRatio];

  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
  }[objectFit];

  // Default placeholder with blur effect
  const defaultPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';

  if (error) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          aspectRatioClass,
          className
        )}
      >
        <span className="text-sm">Imagem indisponível</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', aspectRatioClass, className)}>
      {/* Placeholder/Blur */}
      {!isLoaded && (
        <div 
          className={cn(
            'absolute inset-0 animate-pulse bg-muted',
            aspectRatioClass
          )}
          style={{
            backgroundImage: placeholderSrc ? `url(${placeholderSrc})` : undefined,
            backgroundSize: 'cover',
            filter: 'blur(10px)',
          }}
        />
      )}
      
      {/* Actual Image */}
      <img
        ref={imgRef}
        src={isInView ? src : (placeholderSrc || defaultPlaceholder)}
        srcSet={isInView ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          objectFitClass,
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        {...props}
      />
    </div>
  );
}

// Responsive image with multiple sizes
interface ResponsiveImageProps extends Omit<LazyImageProps, 'srcSet' | 'sizes'> {
  thumbUrl?: string;
  mediumUrl?: string;
  largeUrl: string;
}

export function ResponsiveImage({
  thumbUrl,
  mediumUrl,
  largeUrl,
  ...props
}: ResponsiveImageProps) {
  const srcSet = [
    thumbUrl && `${thumbUrl} 300w`,
    mediumUrl && `${mediumUrl} 800w`,
    `${largeUrl} 1920w`,
  ].filter(Boolean).join(', ');

  const sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

  return (
    <LazyImage
      src={largeUrl}
      srcSet={srcSet}
      sizes={sizes}
      placeholderSrc={thumbUrl}
      {...props}
    />
  );
}
