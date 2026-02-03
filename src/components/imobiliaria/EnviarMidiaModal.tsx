import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Image, Video, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnviarMidiaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imovel: {
    id: string;
    titulo: string;
    access?: {
      id: string;
    };
  };
  imobiliariaId: string;
  onSuccess?: () => void;
}

interface PendingMedia {
  id: string;
  file?: File;
  preview?: string;
  tipo: 'imagem' | 'video';
  url?: string; // For video URLs
  alt?: string;
  videoTipo?: string;
}

function extractVideoInfo(url: string): { tipo: string; valid: boolean } | null {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return { tipo: 'youtube', valid: true };
  }
  if (url.includes('vimeo.com')) {
    return { tipo: 'vimeo', valid: true };
  }
  return null;
}

export function EnviarMidiaModal({
  open,
  onOpenChange,
  imovel,
  imobiliariaId,
  onSuccess,
}: EnviarMidiaModalProps) {
  const { toast } = useToast();
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newMedia: PendingMedia[] = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      tipo: 'imagem' as const,
      alt: '',
    }));
    setPendingMedia((prev) => [...prev, ...newMedia]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 20 * 1024 * 1024, // 20MB
  });

  const handleAddVideo = () => {
    if (!videoUrl.trim()) return;
    
    const videoInfo = extractVideoInfo(videoUrl);
    if (!videoInfo) {
      toast({
        title: 'URL inválida',
        description: 'Por favor, insira uma URL válida do YouTube ou Vimeo.',
        variant: 'destructive',
      });
      return;
    }

    const newVideo: PendingMedia = {
      id: crypto.randomUUID(),
      tipo: 'video',
      url: videoUrl.trim(),
      videoTipo: videoInfo.tipo,
    };
    
    setPendingMedia((prev) => [...prev, newVideo]);
    setVideoUrl('');
  };

  const removeMedia = (id: string) => {
    setPendingMedia((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (!imovel.access?.id) {
      toast({
        title: 'Erro',
        description: 'Acesso ao imóvel não encontrado.',
        variant: 'destructive',
      });
      return;
    }

    if (pendingMedia.length === 0) {
      toast({
        title: 'Nenhuma mídia',
        description: 'Adicione pelo menos uma imagem ou vídeo.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      for (const media of pendingMedia) {
        let url = media.url || '';
        let nomeArquivo: string | null = null;
        let tamanhoBytes: number | null = null;

        // Upload image to storage
        if (media.tipo === 'imagem' && media.file) {
          const fileExt = media.file.name.split('.').pop();
          const fileName = `${imobiliariaId}/${imovel.id}/${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('midias-pendentes')
            .upload(fileName, media.file);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('midias-pendentes')
            .getPublicUrl(fileName);

          url = publicUrlData.publicUrl;
          nomeArquivo = media.file.name;
          tamanhoBytes = media.file.size;
        }

        // Insert record into midias_pendentes
        const { error: insertError } = await supabase
          .from('midias_pendentes')
          .insert({
            imovel_id: imovel.id,
            imobiliaria_id: imobiliariaId,
            access_id: imovel.access.id,
            tipo: media.tipo,
            url,
            alt: media.alt || null,
            video_tipo: media.videoTipo || null,
            nome_arquivo_original: nomeArquivo,
            tamanho_bytes: tamanhoBytes,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: 'Material enviado!',
        description: 'Suas mídias foram enviadas para aprovação da construtora.',
      });

      // Cleanup
      pendingMedia.forEach((m) => {
        if (m.preview) URL.revokeObjectURL(m.preview);
      });
      setPendingMedia([]);
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao enviar mídia:', error);
      toast({
        title: 'Erro ao enviar',
        description: error.message || 'Ocorreu um erro ao enviar as mídias.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      pendingMedia.forEach((m) => {
        if (m.preview) URL.revokeObjectURL(m.preview);
      });
      setPendingMedia([]);
      setVideoUrl('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar Material - {imovel.titulo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Image Upload */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Image className="h-4 w-4" />
              Imagens
            </Label>
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? 'Solte as imagens aqui...'
                  : 'Arraste imagens ou clique para selecionar'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WebP • Máx. 20MB cada
              </p>
            </div>
          </div>

          {/* Video URL */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Video className="h-4 w-4" />
              Vídeo (YouTube/Vimeo)
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddVideo()}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddVideo}
                disabled={!videoUrl.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preview */}
          {pendingMedia.length > 0 && (
            <div>
              <Label className="mb-2 block">Preview ({pendingMedia.length})</Label>
              <div className="grid grid-cols-3 gap-3">
                {pendingMedia.map((media) => (
                  <div
                    key={media.id}
                    className="relative aspect-video rounded-lg overflow-hidden bg-muted group"
                  >
                    {media.tipo === 'imagem' && media.preview && (
                      <img
                        src={media.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    {media.tipo === 'video' && (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <div className="text-center p-2">
                          <Video className="h-8 w-8 mx-auto text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground truncate">
                            {media.videoTipo?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(media.id)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {media.tipo === 'imagem' && (
                      <div className="absolute bottom-0 inset-x-0 p-1 bg-black/50">
                        <Input
                          placeholder="Descrição (alt)"
                          value={media.alt || ''}
                          onChange={(e) => {
                            setPendingMedia((prev) =>
                              prev.map((m) =>
                                m.id === media.id ? { ...m, alt: e.target.value } : m
                              )
                            );
                          }}
                          className="h-6 text-xs bg-transparent border-0 text-white placeholder:text-white/60"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading || pendingMedia.length === 0}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar para Aprovação'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
