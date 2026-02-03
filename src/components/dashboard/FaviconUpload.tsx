import { useState, useRef } from "react";
import { Upload, X, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FaviconUploadProps {
  currentFaviconUrl: string | null;
  onFaviconChange: (url: string | null) => void;
  entityId: string;
}

export function FaviconUpload({ currentFaviconUrl, onFaviconChange, entityId }: FaviconUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentFaviconUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/x-icon", "image/vnd.microsoft.icon", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato inválido. Use ICO, PNG, WebP ou SVG.");
      return;
    }

    // Validate file size (max 256KB for favicons)
    if (file.size > 256 * 1024) {
      toast.error("Arquivo muito grande. Máximo 256KB para favicons.");
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `imobiliarias/${entityId}/favicon-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage (reusing logos bucket)
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("logos")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      
      setPreviewUrl(publicUrl);
      onFaviconChange(publicUrl);
      toast.success("Favicon enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao enviar favicon. Tente novamente.");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveFavicon = () => {
    setPreviewUrl(null);
    onFaviconChange(null);
    toast.info("Favicon removido. Salve para confirmar.");
  };

  return (
    <div className="space-y-4">
      {/* Preview Area */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex items-center justify-center overflow-hidden">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Favicon preview"
              className="w-8 h-8 object-contain"
            />
          ) : (
            <Globe className="h-5 w-5 text-muted-foreground/50" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".ico,.png,.webp,.svg,image/x-icon,image/vnd.microsoft.icon,image/png,image/webp,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
            id="favicon-upload"
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {previewUrl ? "Alterar Favicon" : "Enviar Favicon"}
              </>
            )}
          </Button>

          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFavicon}
              className="text-destructive hover:text-destructive"
            >
              <X className="mr-2 h-4 w-4" />
              Remover
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Formatos: ICO, PNG, SVG ou WebP. Tamanho ideal: 32x32 ou 64x64 pixels. Máximo: 256KB.
      </p>
    </div>
  );
}
