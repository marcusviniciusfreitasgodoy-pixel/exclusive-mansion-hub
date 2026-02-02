import { useState, useCallback } from 'react';

interface OptimizedImage {
  original: Blob;
  thumbnail: Blob;
  medium: Blob;
  large: Blob;
  webpSupported: boolean;
}

interface ImageDimensions {
  thumbnail: number;
  medium: number;
  large: number;
}

const DEFAULT_DIMENSIONS: ImageDimensions = {
  thumbnail: 300,
  medium: 800,
  large: 1920,
};

const QUALITY = {
  thumbnail: 0.8,
  medium: 0.85,
  large: 0.9,
};

/**
 * Hook para otimização de imagens client-side
 * Converte para WebP e gera múltiplos tamanhos antes do upload
 */
export function useImageOptimizer(dimensions: ImageDimensions = DEFAULT_DIMENSIONS) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * Verifica se o navegador suporta WebP
   */
  const supportsWebP = useCallback((): boolean => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }, []);

  /**
   * Redimensiona uma imagem mantendo proporção
   */
  const resizeImage = useCallback(
    (
      image: HTMLImageElement,
      maxWidth: number,
      quality: number,
      format: 'image/webp' | 'image/jpeg'
    ): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context não suportado'));
          return;
        }

        // Calcular dimensões mantendo proporção
        let width = image.width;
        let height = image.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(image, 0, 0, width, height);

        // Converter para blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Falha ao criar blob'));
            }
          },
          format,
          quality
        );
      });
    },
    []
  );

  /**
   * Carrega um arquivo como HTMLImageElement
   */
  const loadImage = useCallback((file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Falha ao carregar imagem'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Otimiza uma única imagem gerando múltiplos tamanhos
   */
  const optimizeImage = useCallback(
    async (file: File): Promise<OptimizedImage> => {
      const image = await loadImage(file);
      const webpSupported = supportsWebP();
      const format = webpSupported ? 'image/webp' : 'image/jpeg';

      const [thumbnail, medium, large] = await Promise.all([
        resizeImage(image, dimensions.thumbnail, QUALITY.thumbnail, format),
        resizeImage(image, dimensions.medium, QUALITY.medium, format),
        resizeImage(image, dimensions.large, QUALITY.large, format),
      ]);

      return {
        original: file,
        thumbnail,
        medium,
        large,
        webpSupported,
      };
    },
    [loadImage, resizeImage, supportsWebP, dimensions]
  );

  /**
   * Processa múltiplas imagens com progresso
   */
  const optimizeImages = useCallback(
    async (files: File[]): Promise<OptimizedImage[]> => {
      setIsProcessing(true);
      setProgress(0);

      const results: OptimizedImage[] = [];
      const total = files.length;

      for (let i = 0; i < files.length; i++) {
        try {
          const optimized = await optimizeImage(files[i]);
          results.push(optimized);
        } catch (error) {
          console.error(`Erro ao otimizar imagem ${files[i].name}:`, error);
          // Continua com as outras imagens
        }
        setProgress(Math.round(((i + 1) / total) * 100));
      }

      setIsProcessing(false);
      setProgress(0);
      return results;
    },
    [optimizeImage]
  );

  /**
   * Otimiza uma única imagem e retorna apenas a versão large (para upload simples)
   */
  const optimizeSingleImage = useCallback(
    async (file: File): Promise<Blob> => {
      setIsProcessing(true);
      try {
        const image = await loadImage(file);
        const webpSupported = supportsWebP();
        const format = webpSupported ? 'image/webp' : 'image/jpeg';
        
        // Se a imagem já é pequena o suficiente, apenas converte o formato
        const maxWidth = Math.min(image.width, dimensions.large);
        const result = await resizeImage(image, maxWidth, QUALITY.large, format);
        
        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [loadImage, resizeImage, supportsWebP, dimensions]
  );

  /**
   * Calcula a redução de tamanho
   */
  const calculateSavings = useCallback(
    (originalSize: number, optimizedSize: number): string => {
      const savings = ((originalSize - optimizedSize) / originalSize) * 100;
      return `${savings.toFixed(1)}% menor`;
    },
    []
  );

  /**
   * Gera extensão do arquivo baseado no suporte
   */
  const getOptimizedExtension = useCallback((): string => {
    return supportsWebP() ? 'webp' : 'jpg';
  }, [supportsWebP]);

  return {
    optimizeImage,
    optimizeImages,
    optimizeSingleImage,
    calculateSavings,
    getOptimizedExtension,
    supportsWebP,
    isProcessing,
    progress,
  };
}
