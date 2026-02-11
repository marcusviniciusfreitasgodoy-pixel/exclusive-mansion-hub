import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, X, FileImage, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface CNHUploadProps {
  onUpload: (file: File) => Promise<string>;
  isUploading?: boolean;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "application/pdf"];

export function CNHUpload({ onUpload, isUploading = false }: CNHUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Formato inválido. Envie JPG, PNG ou PDF.");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Arquivo muito grande. Máximo: 5MB.");
      return;
    }
    setFileName(file.name);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    try {
      await onUpload(file);
      setUploaded(true);
      toast.success("CNH enviada com sucesso!");
    } catch {
      toast.error("Erro ao enviar CNH. Tente novamente.");
      setFileName(null);
      setPreview(null);
    }
  };

  const clear = () => {
    setPreview(null);
    setFileName(null);
    setUploaded(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">📄 Upload da CNH</CardTitle>
        <CardDescription>
          Envie uma foto da sua CNH (frente e verso). JPG, PNG ou PDF (máx. 5MB).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="hidden"
        />
        {uploaded && fileName ? (
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            {preview ? (
              <img src={preview} alt="CNH" className="w-16 h-16 object-cover rounded" />
            ) : (
              <FileImage className="h-10 w-10 text-muted-foreground" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Enviada
              </p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={clear}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full h-20 border-dashed"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Upload className="h-5 w-5 mr-2" />
            )}
            {isUploading ? "Enviando..." : "Clique para enviar a CNH"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
