import { useState, useRef } from 'react';
import { Upload, X, FileText, TrendingUp, DollarSign, LayoutGrid, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { MateriaisPromocionais, MaterialArquivo } from '@/types/materiais-promocionais';

interface MaterialUploadItem {
  key: keyof Pick<MateriaisPromocionais, 'bookDigital' | 'estudoRentabilidade' | 'tabelaVendas' | 'plantaUnidade'>;
  label: string;
  description: string;
  icon: typeof FileText;
  acceptedTypes: string;
}

const MATERIAL_ITEMS: MaterialUploadItem[] = [
  {
    key: 'bookDigital',
    label: 'Book Digital do Empreendimento',
    description: 'Apresentação completa com renders, plantas, conceito e especificações',
    icon: FileText,
    acceptedTypes: '.pdf',
  },
  {
    key: 'estudoRentabilidade',
    label: 'Estudo de Rentabilidade / ROI',
    description: 'Análise de retorno para investidores (PDF ou imagem)',
    icon: TrendingUp,
    acceptedTypes: '.pdf,.jpg,.jpeg,.png,.webp',
  },
  {
    key: 'tabelaVendas',
    label: 'Tabela de Vendas / Preços',
    description: 'Valores e condições de pagamento por unidade',
    icon: DollarSign,
    acceptedTypes: '.pdf',
  },
  {
    key: 'plantaUnidade',
    label: 'Planta da Unidade',
    description: 'Planta baixa específica desta unidade (PDF ou imagem)',
    icon: LayoutGrid,
    acceptedTypes: '.pdf,.jpg,.jpeg,.png,.webp',
  },
];

interface Step4MaterialsUploadProps {
  defaultValues?: MateriaisPromocionais;
  onChange: (materiais: MateriaisPromocionais) => void;
}

export function Step4MaterialsUpload({ defaultValues = {}, onChange }: Step4MaterialsUploadProps) {
  const { toast } = useToast();
  const [materiais, setMateriais] = useState<MateriaisPromocionais>(defaultValues);
  const [uploading, setUploading] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileUpload = async (key: MaterialUploadItem['key'], file: File) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 50MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(key);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const fileName = `${Date.now()}-${key}.${fileExt}`;
      const filePath = `temp/materiais/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('imoveis')
        .upload(filePath, file, {
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrl } = supabase.storage
        .from('imoveis')
        .getPublicUrl(filePath);

      const tipo: 'pdf' | 'image' = fileExt === 'pdf' ? 'pdf' : 'image';
      
      const newMaterial: MaterialArquivo = {
        url: publicUrl.publicUrl,
        nome: file.name,
        tipo,
        tamanho_bytes: file.size,
      };

      const updated = { ...materiais, [key]: newMaterial };
      setMateriais(updated);
      onChange(updated);

      toast({
        title: 'Arquivo enviado',
        description: `${file.name} foi enviado com sucesso.`,
      });
    } catch (error: unknown) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar o arquivo.',
        variant: 'destructive',
      });
    } finally {
      setUploading(null);
    }
  };

  const handleRemove = (key: MaterialUploadItem['key']) => {
    const updated = { ...materiais };
    delete updated[key];
    setMateriais(updated);
    onChange(updated);
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground">Materiais Promocionais</h3>
        <p className="text-sm text-muted-foreground">
          Adicione documentos da construtora para enriquecer a apresentação do imóvel
        </p>
      </div>

      <div className="space-y-4">
        {MATERIAL_ITEMS.map((item) => {
          const material = materiais[item.key];
          const Icon = item.icon;
          const isUploading = uploading === item.key;

          return (
            <div
              key={item.key}
              className="border rounded-lg p-4 bg-card"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <Label className="font-medium text-foreground">{item.label}</Label>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>

                  {material ? (
                    <div className="mt-3 flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{material.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(material.tamanho_bytes)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.key)}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <input
                        ref={(el) => { inputRefs.current[item.key] = el; }}
                        type="file"
                        accept={item.acceptedTypes}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(item.key, file);
                          }
                          e.target.value = '';
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        onClick={() => inputRefs.current[item.key]?.click()}
                        className="gap-2"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Fazer Upload
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground pt-4 border-t">
        Estes materiais são opcionais. As seções correspondentes só aparecerão no site se os arquivos forem adicionados.
      </div>
    </div>
  );
}
