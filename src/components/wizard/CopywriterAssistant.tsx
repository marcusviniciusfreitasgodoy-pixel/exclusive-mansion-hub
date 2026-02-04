import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Check, Copy, Loader2, AlertCircle, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type TipoTexto = 'descricao' | 'headline' | 'copy_anuncio';

interface PropertyData {
  titulo?: string;
  propertyType?: string;
  bairro?: string;
  cidade?: string;
  areaTotal?: number;
  areaPrivativa?: number;
  suites?: number;
  banheiros?: number;
  vagas?: number;
  valor?: number;
}

interface CopywriterAssistantProps {
  propertyData: PropertyData;
  diferenciais: string[];
  onUseDescription: (text: string) => void;
  onUseHeadline?: (text: string) => void;
}

const TIPO_OPTIONS: { value: TipoTexto; label: string; description: string }[] = [
  { 
    value: 'descricao', 
    label: 'Descrição Completa', 
    description: 'Texto detalhado para a página do imóvel (3-4 parágrafos)'
  },
  { 
    value: 'headline', 
    label: 'Headline Impactante', 
    description: 'Frase curta e memorável (máx. 100 caracteres)'
  },
  { 
    value: 'copy_anuncio', 
    label: 'Copy para Anúncio', 
    description: 'Texto curto para redes sociais (2-3 frases)'
  },
];

export function CopywriterAssistant({ 
  propertyData, 
  diferenciais, 
  onUseDescription,
  onUseHeadline 
}: CopywriterAssistantProps) {
  const { toast } = useToast();
  const [tipoTexto, setTipoTexto] = useState<TipoTexto>('descricao');
  const [palavrasChaveExtra, setPalavrasChaveExtra] = useState('');
  const [textoGerado, setTextoGerado] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMinimumData = propertyData.titulo || diferenciais.length > 0;

  const handleGenerate = async () => {
    if (!hasMinimumData) {
      toast({
        title: 'Dados insuficientes',
        description: 'Adicione ao menos o título do imóvel ou alguns diferenciais para gerar o texto.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setTextoGerado('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-property-copy', {
        body: {
          tipo: tipoTexto,
          dados_imovel: {
            titulo: propertyData.titulo,
            bairro: propertyData.bairro,
            cidade: propertyData.cidade || 'Rio de Janeiro',
            property_type: propertyData.propertyType,
            area_total: propertyData.areaTotal,
            area_privativa: propertyData.areaPrivativa,
            suites: propertyData.suites,
            banheiros: propertyData.banheiros,
            vagas: propertyData.vagas,
            valor: propertyData.valor,
            diferenciais: diferenciais,
            palavras_chave_adicionais: palavrasChaveExtra || undefined,
          },
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        if (data.error === 'rate_limit') {
          setError(data.message || 'Limite de requisições excedido. Aguarde um momento.');
        } else if (data.error === 'payment_required') {
          setError(data.message || 'Créditos de IA esgotados.');
        } else {
          setError(data.error);
        }
        return;
      }

      if (data?.texto_gerado) {
        setTextoGerado(data.texto_gerado);
        toast({
          title: 'Texto gerado!',
          description: 'A IA criou um texto baseado nos dados do seu imóvel.',
        });
      }
    } catch (err) {
      console.error('[CopywriterAssistant] Error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao gerar texto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseText = () => {
    if (!textoGerado) return;

    if (tipoTexto === 'descricao' || tipoTexto === 'copy_anuncio') {
      onUseDescription(textoGerado);
      toast({
        title: 'Texto inserido!',
        description: 'O texto foi adicionado ao campo de descrição.',
      });
    } else if (tipoTexto === 'headline' && onUseHeadline) {
      onUseHeadline(textoGerado);
      toast({
        title: 'Headline inserida!',
        description: 'A headline foi copiada para a área de transferência.',
      });
    }
  };

  const handleCopy = async () => {
    if (!textoGerado) return;
    
    try {
      await navigator.clipboard.writeText(textoGerado);
      toast({
        title: 'Copiado!',
        description: 'Texto copiado para a área de transferência.',
      });
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o texto.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-primary" />
          Assistente de Copywriting
        </CardTitle>
        <CardDescription>
          Deixe a IA criar descrições persuasivas baseadas nos dados e diferenciais do seu imóvel.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tipo de Texto */}
        <div className="space-y-2">
          <Label>Tipo de Texto</Label>
          <Select value={tipoTexto} onValueChange={(v) => setTipoTexto(v as TipoTexto)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPO_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex flex-col">
                    <span>{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Palavras-chave extras */}
        <div className="space-y-2">
          <Label>Palavras-chave adicionais (opcional)</Label>
          <Input
            placeholder="Ex: sustentabilidade, família, home office, vista mar..."
            value={palavrasChaveExtra}
            onChange={(e) => setPalavrasChaveExtra(e.target.value)}
          />
        </div>

        {/* Status dos dados */}
        <div className="flex flex-wrap gap-2 text-sm">
          {propertyData.titulo && (
            <Badge variant="secondary" className="gap-1">
              <Check className="h-3 w-3" />
              Título
            </Badge>
          )}
          {propertyData.bairro && (
            <Badge variant="secondary" className="gap-1">
              <Check className="h-3 w-3" />
              Bairro
            </Badge>
          )}
          {diferenciais.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Check className="h-3 w-3" />
              {diferenciais.length} diferencial(is)
            </Badge>
          )}
          {propertyData.valor && (
            <Badge variant="secondary" className="gap-1">
              <Check className="h-3 w-3" />
              Valor
            </Badge>
          )}
        </div>

        {/* Botão Gerar */}
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !hasMinimumData}
          className="w-full gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando com IA...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Gerar com IA
            </>
          )}
        </Button>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Resultado */}
        {textoGerado && (
          <div className="space-y-3 pt-2">
            <Label className="text-base font-medium">📝 Texto Gerado</Label>
            <Textarea
              value={textoGerado}
              readOnly
              className="min-h-[150px] bg-background"
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleUseText} className="gap-2">
                <Check className="h-4 w-4" />
                Usar Este Texto
              </Button>
              <Button variant="outline" onClick={handleGenerate} disabled={isLoading} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Gerar Outro
              </Button>
              <Button variant="outline" onClick={handleCopy} className="gap-2">
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
