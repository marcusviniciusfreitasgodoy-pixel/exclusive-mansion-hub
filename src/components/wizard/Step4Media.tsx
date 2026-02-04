import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, Upload, X, Star, StarOff, Image, Video, Globe, Loader2, Zap, FileText, File, Link, Film } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  documentos: z.array(z.object({
    url: z.string(),
    nome: z.string(),
    tipo: z.string(),
    tamanho_bytes: z.number().optional(),
  })).optional(),
  materiais_promocionais: z.object({
    bookDigital: z.object({
      url: z.string(),
      nome: z.string(),
      tipo: z.enum(['pdf', 'image', 'video']),
      tamanho_bytes: z.number().optional(),
    }).optional(),
    estudoRentabilidade: z.object({
      url: z.string(),
      nome: z.string(),
      tipo: z.enum(['pdf', 'image', 'video']),
      tamanho_bytes: z.number().optional(),
    }).optional(),
    tabelaVendas: z.object({
      url: z.string(),
      nome: z.string(),
      tipo: z.enum(['pdf', 'image', 'video']),
      tamanho_bytes: z.number().optional(),
    }).optional(),
    plantaUnidade: z.object({
      url: z.string(),
      nome: z.string(),
      tipo: z.enum(['pdf', 'image', 'video']),
      tamanho_bytes: z.number().optional(),
    }).optional(),
  }).optional(),
});

export type Step4Data = z.infer<typeof step4Schema>;

interface ImageItem {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface VideoItem {
  url: string;
  tipo?: string; // 'youtube' | 'vimeo' | 'vertical' | 'horizontal' | 'uploaded'
  isUploaded?: boolean;
  nome?: string;
}

interface DocumentItem {
  url: string;
  nome: string;
  tipo: string;
  tamanho_bytes?: number;
}

interface Step4Props {
  defaultValues?: Partial<Step4Data>;
  onComplete: (data: Step4Data) => void;
}

export function Step4Media({ defaultValues, onComplete }: Step4Props) {
  const { construtora } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
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
  const [documentos, setDocumentos] = useState<DocumentItem[]>(
    (defaultValues?.documentos?.filter((d): d is DocumentItem => !!d.url)) || []
  );
  const [tour360Url, setTour360Url] = useState(defaultValues?.tour360Url || '');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadStats, setUploadStats] = useState<{ original: number; optimized: number } | null>(null);

  const form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      imagens: defaultValues?.imagens || [],
      videos: defaultValues?.videos || [],
      tour360Url: defaultValues?.tour360Url || '',
      documentos: defaultValues?.documentos || [],
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

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxVideos = 10;
    const uploadedVideoCount = videos.filter(v => v.isUploaded).length;
    
    if (uploadedVideoCount + files.length > maxVideos) {
      toast({
        title: 'Limite excedido',
        description: `Você pode fazer upload de no máximo ${maxVideos} vídeos.`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingVideo(true);

    try {
      const uploadedVideos: VideoItem[] = [];
      const tempId = Date.now().toString();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: 'Tipo não suportado',
            description: `${file.name} não é um formato de vídeo válido (MP4, WebM, MOV, AVI).`,
            variant: 'destructive',
          });
          continue;
        }

        // Max 500MB per video
        if (file.size > 500 * 1024 * 1024) {
          toast({
            title: 'Arquivo muito grande',
            description: `${file.name} excede o limite de 500MB.`,
            variant: 'destructive',
          });
          continue;
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
        const fileName = `${tempId}-${i}.${fileExt}`;
        const filePath = `temp/videos/${fileName}`;

        const { data, error } = await supabase.storage
          .from('imoveis')
          .upload(filePath, file, {
            contentType: file.type,
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

        uploadedVideos.push({
          url: publicUrl.publicUrl,
          tipo: 'horizontal', // Default to horizontal, user can change
          isUploaded: true,
          nome: file.name,
        });
      }

      const newVideos = [...videos, ...uploadedVideos];
      setVideos(newVideos);
      form.setValue('videos', newVideos);

      toast({
        title: 'Vídeos enviados',
        description: `${uploadedVideos.length} vídeo(s) enviado(s) com sucesso.`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao fazer upload dos vídeos.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }
  };

  const toggleVideoOrientation = (index: number) => {
    const newVideos = videos.map((v, i) => {
      if (i === index && v.isUploaded) {
        return {
          ...v,
          tipo: v.tipo === 'vertical' ? 'horizontal' : 'vertical',
        };
      }
      return v;
    });
    setVideos(newVideos);
    form.setValue('videos', newVideos);
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

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (documentos.length + files.length > 20) {
      toast({
        title: 'Limite excedido',
        description: 'Você pode adicionar no máximo 20 documentos.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingDoc(true);

    try {
      const uploadedDocs: DocumentItem[] = [];
      const tempId = Date.now().toString();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
          toast({
            title: 'Tipo não suportado',
            description: `${file.name} não é um arquivo PDF ou documento válido.`,
            variant: 'destructive',
          });
          continue;
        }

        // Max 50MB per file
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: 'Arquivo muito grande',
            description: `${file.name} excede o limite de 50MB.`,
            variant: 'destructive',
          });
          continue;
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
        const fileName = `${tempId}-${i}.${fileExt}`;
        const filePath = `temp/docs/${fileName}`;

        const { data, error } = await supabase.storage
          .from('imoveis')
          .upload(filePath, file, {
            contentType: file.type || 'application/pdf',
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

        uploadedDocs.push({
          url: publicUrl.publicUrl,
          nome: file.name,
          tipo: fileExt,
          tamanho_bytes: file.size,
        });
      }

      const newDocs = [...documentos, ...uploadedDocs];
      setDocumentos(newDocs);
      form.setValue('documentos', newDocs);

      toast({
        title: 'Documentos enviados',
        description: `${uploadedDocs.length} documento(s) enviado(s) com sucesso.`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao fazer upload dos documentos.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingDoc(false);
      if (docInputRef.current) {
        docInputRef.current.value = '';
      }
    }
  };

  const removeDocument = (index: number) => {
    const newDocs = documentos.filter((_, i) => i !== index);
    setDocumentos(newDocs);
    form.setValue('documentos', newDocs);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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
      documentos,
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
            Vídeos
          </Label>
          
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="gap-2">
                <Film className="h-4 w-4" />
                Enviar Arquivo
              </TabsTrigger>
              <TabsTrigger value="link" className="gap-2">
                <Link className="h-4 w-4" />
                Link YouTube/Vimeo
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4 mt-4">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer ${
                  isUploadingVideo ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={() => videoInputRef.current?.click()}
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.webm,.mov,.avi"
                  multiple
                  className="hidden"
                  onChange={handleVideoUpload}
                />
                {isUploadingVideo ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                    <p className="text-muted-foreground">Enviando vídeos...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Film className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Clique ou arraste vídeos aqui
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP4, WebM, MOV, AVI (máx. 500MB cada, até 10 vídeos)
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="link" className="space-y-4 mt-4">
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
              <p className="text-xs text-muted-foreground">
                Cole links do YouTube ou Vimeo
              </p>
            </TabsContent>
          </Tabs>

          {/* Video List */}
          {videos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className={`relative group rounded-lg overflow-hidden border ${
                    video.isUploaded && video.tipo === 'vertical' ? 'aspect-[9/16] max-w-[200px]' : 'aspect-video'
                  }`}
                >
                  {video.isUploaded ? (
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                  ) : video.tipo === 'youtube' ? (
                    <img
                      src={getYouTubeThumbnail(video.url)}
                      alt={`Video ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Video className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Video info badge */}
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {video.isUploaded ? (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        {video.tipo === 'vertical' ? '9:16' : '16:9'}
                      </span>
                    ) : (
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded capitalize">
                        {video.tipo}
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {video.isUploaded && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleVideoOrientation(index)}
                        title={video.tipo === 'vertical' ? 'Mudar para horizontal' : 'Mudar para vertical'}
                      >
                        <Film className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeVideo(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Video name for uploaded files */}
                  {video.isUploaded && video.nome && (
                    <div className="absolute bottom-2 right-2 max-w-[60%]">
                      <span className="bg-black/60 text-white text-xs px-2 py-1 rounded truncate block">
                        {video.nome}
                      </span>
                    </div>
                  )}
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

        {/* Documents / PDFs */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos e Materiais Promocionais (máx. 20)
          </Label>
          <p className="text-sm text-muted-foreground">
            Envie PDFs com informações do imóvel, memorial descritivo, plantas, book de vendas, etc.
          </p>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer ${
              isUploadingDoc ? 'opacity-50 pointer-events-none' : ''
            }`}
            onClick={() => docInputRef.current?.click()}
          >
            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple
              className="hidden"
              onChange={handleDocUpload}
            />
            {isUploadingDoc ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                <p className="text-muted-foreground">Enviando documentos...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <File className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Clique ou arraste documentos aqui
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX (máx. 50MB cada)
                </p>
              </div>
            )}
          </div>

          {/* Document List */}
          {documentos.length > 0 && (
            <div className="space-y-2">
              {documentos.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.tipo.toUpperCase()} • {doc.tamanho_bytes ? formatFileSize(doc.tamanho_bytes) : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        Visualizar
                      </a>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeDocument(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
