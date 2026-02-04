import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Ruler, BedDouble, Bath, Car, Check, FileText } from 'lucide-react';
import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { cn } from '@/lib/utils';
import type { TemplateType, TemplateCustomization } from '@/types/database';

export interface ReviewData {
  titulo?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  valor?: number;
  condominio?: number;
  iptu?: number;
  areaTotal?: number;
  areaPrivativa?: number;
  suites?: number;
  banheiros?: number;
  vagas?: number;
  descricao?: string;
  diferenciais?: string[];
  memorial?: string;
  imagens?: { url: string; alt?: string; isPrimary?: boolean }[];
  videos?: { url: string; tipo?: string }[];
  tour360Url?: string;
  documentos?: { url: string; nome: string; tipo: string; tamanho_bytes?: number }[];
  status?: 'ativo' | 'inativo';
  template_escolhido?: TemplateType;
  customizacao_template?: TemplateCustomization;
}

interface Step5Props {
  data: ReviewData;
  confirmed: boolean;
  onConfirmChange: (checked: boolean) => void;
  onTemplateChange?: (template: TemplateType) => void;
  onCustomizationChange?: (customization: TemplateCustomization) => void;
}

export function Step5Review({ 
  data, 
  confirmed, 
  onConfirmChange,
  onTemplateChange,
  onCustomizationChange,
}: Step5Props) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const formatCurrency = (value: number | undefined): string => {
    if (!value) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const primaryImage = data.imagens?.find(img => img.isPrimary) || data.imagens?.[0];

  return (
    <div className="space-y-6">
      {/* Preview Card */}
      <Card className="overflow-hidden">
        {primaryImage && (
          <div className="aspect-video relative">
            <img
              src={primaryImage.url}
              alt={primaryImage.alt || data.titulo}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <Badge className={data.status === 'ativo' ? 'bg-green-600' : 'bg-gray-600'}>
                {data.status === 'ativo' ? 'Ativo' : 'Rascunho'}
              </Badge>
              <h2 className="text-2xl font-bold mt-2">{data.titulo || 'Sem título'}</h2>
              <p className="flex items-center gap-1 text-white/80">
                <MapPin className="h-4 w-4" />
                {data.endereco}, {data.numero} - {data.bairro}, {data.cidade}/{data.estado}
              </p>
            </div>
          </div>
        )}
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-primary mb-4">
            {formatCurrency(data.valor)}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Ruler className="h-4 w-4" />
              {data.areaPrivativa}m² privativos
            </span>
            <span className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" />
              {data.suites} suítes
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {data.banheiros} banheiros
            </span>
            <span className="flex items-center gap-1">
              <Car className="h-4 w-4" />
              {data.vagas} vagas
            </span>
          </div>

          {data.diferenciais && data.diferenciais.length > 0 && (
            <div className="space-y-2">
              <Label>Diferenciais:</Label>
              <div className="flex flex-wrap gap-2">
                {data.diferenciais.map((dif, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    <Check className="h-3 w-3" />
                    {dif}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          <h3 className="font-semibold">Resumo das Informações</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Área Total</Label>
              <p>{data.areaTotal}m²</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Área Privativa</Label>
              <p>{data.areaPrivativa}m²</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Condomínio</Label>
              <p>{formatCurrency(data.condominio)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">IPTU</Label>
              <p>{formatCurrency(data.iptu)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Imagens</Label>
              <p>{data.imagens?.length || 0} fotos</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Vídeos</Label>
              <p>{data.videos?.length || 0} vídeos</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Documentos</Label>
              <p>{data.documentos?.length || 0} arquivos</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Tour 360°</Label>
              <p>{data.tour360Url ? 'Configurado' : 'Não configurado'}</p>
            </div>
          </div>

          {/* Documents List */}
          {data.documentos && data.documentos.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                Documentos Anexados
              </Label>
              <div className="space-y-2">
                {data.documentos.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>{doc.nome}</span>
                    <Badge variant="outline" className="text-xs">{doc.tipo.toUpperCase()}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description Section */}
          {data.descricao && (
            <div className="mt-4 pt-4 border-t">
              <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                Descrição
              </Label>
              <div className={cn(
                "prose prose-sm max-w-none transition-all",
                !showFullDescription && data.descricao.length > 300 && "line-clamp-4"
              )}>
                {data.descricao.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-sm text-muted-foreground mb-2">
                    {paragraph}
                  </p>
                ))}
              </div>
              {data.descricao.length > 300 && (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-xs"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? 'Mostrar menos ▲' : 'Mostrar mais ▼'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Selector */}
      {onTemplateChange && onCustomizationChange && (
        <Card>
          <CardContent className="pt-6">
            <TemplateSelector
              selectedTemplate={data.template_escolhido || 'moderno'}
              customization={data.customizacao_template || {}}
              onTemplateChange={onTemplateChange}
              onCustomizationChange={onCustomizationChange}
            />
          </CardContent>
        </Card>
      )}

      {/* Confirmation */}
      <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
        <Checkbox
          id="confirm"
          checked={confirmed}
          onCheckedChange={(checked) => onConfirmChange(checked as boolean)}
        />
        <div>
          <Label htmlFor="confirm" className="cursor-pointer">
            Li e confirmo que todas as informações estão corretas
          </Label>
          <p className="text-sm text-muted-foreground">
            Ao publicar, o imóvel ficará disponível para visualização pública
          </p>
        </div>
      </div>
    </div>
  );
}
