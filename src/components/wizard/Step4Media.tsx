import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, Upload, X, Star, StarOff, Image, Video, Globe, Loader2, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useImageOptimizer } from '@/hooks/useImageOptimizer';
import { Progress } from '@/components/ui/progress';
export const step4Schema = z.object({
  imagens: z.array(z.object({
    url: z.string(),
    alt: z.string().optional(),
    isPrimary: z.boolean().optional(),
  })).min(1, 'Adicione pelo menos 1 imagem'),
  videos: z.array(z.object({
    url: z.string(),
    tipo: z.string().optional(),
  })).optional(),
  tour360Url: z.string().optional(),
});

export type Step4Data = z.infer<typeof step4Schema>;

interface ImageItem {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface VideoItem {
  url: string;
  tipo?: string;
}

interface Step4Props {
  defaultValues?: Partial<Step4Data>;
  onComplete: (data: Step4Data) => void;
}

export function Step4Media({ defaultValues, onComplete }: Step4Props) {
  const { construtora } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    optimizeSingleImage, 
    getOptimizedExtension, 
    isProcessing: isOptimizing,
    progress: optimizeProgress,
    calculateSavings
  } = useImageOptimizer();

  const [imagens, setImagens] = useState<ImageItem[]>(
    (defaultValues?.imagens?.filter((img): img is ImageItem => !!img.url)) || []
  );
  const [videos, setVideos] = useState<VideoItem[]>(
    (defaultValues?.videos?.filter((v): v is VideoItem => !!v.url)) || []
  );
  const [tour360Url, setTour360Url] = useState(defaultValues?.tour360Url || '');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState<{ original: number; optimized: number } | null>(null);

  const form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      imagens: defaultValues?.imagens || [],
      videos: defaultValues?.videos || [],
      tour360Url: defaultValues?.tour360Url || '',
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imagens.length + files.length > 50) {
      toast({
        title: 'Limite excedido',
        description: 'Você pode adicionar no máximo 50 imagens.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    try {
      const uploadedImages: ImageItem[] = [];
      const tempId = Date.now().toString();
      const ext = getOptimizedExtension();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        totalOriginalSize += file.size;

        // Otimizar imagem antes do upload
        const optimizedBlob = await optimizeSingleImage(file);
        totalOptimizedSize += optimizedBlob.size;

        const fileName = `${tempId}-${i}.${ext}`;
        const filePath = `temp/${fileName}`;

        const { data, error } = await supabase.storage
          .from('imoveis')
          .upload(filePath, optimizedBlob, {
            contentType: ext === 'webp' ? 'image/webp' : 'image/jpeg',
          });

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: 'Erro no upload',
            description: `Falha ao enviar ${file.name}`,
            variant: 'destructive',
          });
          continue;
        }

        const { data: publicUrl } = supabase.storage
          .from('imoveis')
          .getPublicUrl(filePath);

        uploadedImages.push({
          url: publicUrl.publicUrl,
          alt: file.name.replace(/\.[^/.]+$/, ''),
          isPrimary: imagens.length === 0 && i === 0,
        });
      }

      const newImagens = [...imagens, ...uploadedImages];
      setImagens(newImagens);
      form.setValue('imagens', newImagens);

      // Calcular economia
      const savings = calculateSavings(totalOriginalSize, totalOptimizedSize);
      setUploadStats({ original: totalOriginalSize, optimized: totalOptimizedSize });

      toast({
        title: '✨ Upload otimizado concluído',
        description: `${uploadedImages.length} imagem(ns) convertida(s) para WebP (${savings})`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao fazer upload das imagens.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImagens = imagens.filter((_, i) => i !== index);
    // If we removed the primary image, set the first one as primary
    if (imagens[index].isPrimary && newImagens.length > 0) {
      newImagens[0].isPrimary = true;
    }
    setImagens(newImagens);
    form.setValue('imagens', newImagens);
  };

  const setPrimaryImage = (index: number) => {
    const newImagens = imagens.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setImagens(newImagens);
    form.setValue('imagens', newImagens);
  };

  const addVideo = () => {
    if (!newVideoUrl.trim()) return;

    // Basic validation for YouTube/Vimeo URLs
    if (!newVideoUrl.includes('youtube.com') && !newVideoUrl.includes('youtu.be') && !newVideoUrl.includes('vimeo.com')) {
      toast({
        title: 'URL inválida',
        description: 'Por favor, insira uma URL do YouTube ou Vimeo.',
        variant: 'destructive',
      });
      return;
    }

    const tipo = newVideoUrl.includes('vimeo') ? 'vimeo' : 'youtube';
    const newVideos = [...videos, { url: newVideoUrl, tipo }];
    setVideos(newVideos);
    form.setValue('videos', newVideos);
    setNewVideoUrl('');
  };

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index);
    setVideos(newVideos);
    form.setValue('videos', newVideos);
  };

  const getYouTubeThumbnail = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
    }
    return '';
  };

  const onSubmit = () => {
    if (imagens.length === 0) {
      toast({
        title: 'Imagem obrigatória',
        description: 'Adicione pelo menos 1 imagem do imóvel.',
        variant: 'destructive',
      });
      return;
    }

    onComplete({
      imagens,
      videos,
      tour360Url: tour360Url || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Images Upload */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Imagens do Imóvel * (máx. 50)
          </Label>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer ${
              isUploading ? 'opacity-50 pointer-events-none' : ''
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            {isUploading || isOptimizing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                <p className="text-muted-foreground">
                  {isOptimizing ? 'Otimizando imagens...' : 'Enviando imagens...'}
                </p>
                {isOptimizing && optimizeProgress > 0 && (
                  <div className="w-48">
                    <Progress value={optimizeProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {optimizeProgress}%
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Clique ou arraste imagens aqui
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG ou WebP (máx. 10MB cada)
                </p>
                <div className="flex items-center gap-1 text-xs text-primary mt-2">
                  <Zap className="h-3 w-3" />
                  <span>Otimização automática WebP</span>
                </div>
              </div>
            )}
          </div>

          {/* Upload Stats */}
          {uploadStats && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>
                Economia: {((1 - uploadStats.optimized / uploadStats.original) * 100).toFixed(0)}% 
                ({(uploadStats.original / 1024 / 1024).toFixed(1)}MB → {(uploadStats.optimized / 1024 / 1024).toFixed(1)}MB)
              </span>
            </div>
          )}

          {/* Image Grid */}
          {imagens.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagens.map((img, index) => (
                <div
                  key={index}
                  className={`relative group aspect-video rounded-lg overflow-hidden border-2 ${
                    img.isPrimary ? 'border-amber-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `Imagem ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPrimaryImage(index)}
                      title={img.isPrimary ? 'Imagem principal' : 'Definir como principal'}
                    >
                      {img.isPrimary ? (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {img.isPrimary && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
                      Principal
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {imagens.length === 0 && (
            <p className="text-sm text-amber-600">
              Adicione pelo menos 1 imagem do imóvel
            </p>
          )}
        </div>

        {/* Videos */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Vídeos (YouTube/Vimeo)
          </Label>

          <div className="flex gap-2">
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addVideo();
                }
              }}
            />
            <Button type="button" onClick={addVideo}>
              Adicionar
            </Button>
          </div>

          {videos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="relative group aspect-video rounded-lg overflow-hidden border"
                >
                  {video.tipo === 'youtube' && (
                    <img
                      src={getYouTubeThumbnail(video.url)}
                      alt={`Video ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Video className="h-10 w-10 text-white" />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => removeVideo(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tour 360° */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Tour Virtual 360° (Matterport, Kuula, etc.)
          </Label>
          <Input
            placeholder="https://my.matterport.com/show/?m=..."
            value={tour360Url}
            onChange={(e) => {
              setTour360Url(e.target.value);
              form.setValue('tour360Url', e.target.value);
            }}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2">
            Próximo
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
