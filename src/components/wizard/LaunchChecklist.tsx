import { useMemo } from 'react';
import { Check, X, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ReviewData } from './Step5Review';
import type { TemplateType } from '@/types/database';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  completed: boolean;
}

interface LaunchChecklistProps {
  data: ReviewData;
  onTemplateSuggestion?: (template: TemplateType) => void;
}

export function LaunchChecklist({ data, onTemplateSuggestion }: LaunchChecklistProps) {
  const checklistItems = useMemo<ChecklistItem[]>(() => [
    {
      id: 'titulo',
      label: 'Título do imóvel',
      description: 'Nome atrativo para o anúncio',
      required: true,
      completed: Boolean(data.titulo && data.titulo.length >= 10),
    },
    {
      id: 'endereco',
      label: 'Endereço completo',
      description: 'Localização do imóvel',
      required: true,
      completed: Boolean(data.endereco && data.bairro && data.cidade),
    },
    {
      id: 'valor',
      label: 'Valor do imóvel',
      description: 'Preço de venda',
      required: true,
      completed: Boolean(data.valor && data.valor > 0),
    },
    {
      id: 'fotos',
      label: 'Pelo menos 5 fotos',
      description: 'Imagens de qualidade do imóvel',
      required: true,
      completed: Boolean(data.imagens && data.imagens.length >= 5),
    },
    {
      id: 'descricao',
      label: 'Descrição com +200 caracteres',
      description: 'Texto detalhado sobre o imóvel',
      required: true,
      completed: Boolean(data.descricao && data.descricao.length >= 200),
    },
    {
      id: 'especificacoes',
      label: 'Especificações básicas',
      description: 'Área, quartos, banheiros e vagas',
      required: true,
      completed: Boolean(
        data.areaPrivativa && 
        data.suites !== undefined && 
        data.banheiros !== undefined && 
        data.vagas !== undefined
      ),
    },
    {
      id: 'video',
      label: 'Vídeo do imóvel',
      description: 'Tour em vídeo aumenta conversão',
      required: false,
      completed: Boolean(data.videos && data.videos.length > 0),
    },
    {
      id: 'book',
      label: 'Book digital',
      description: 'Material promocional completo',
      required: false,
      completed: Boolean(data.materiais_promocionais?.bookDigital?.url),
    },
    {
      id: 'tour360',
      label: 'Tour virtual 360°',
      description: 'Experiência imersiva',
      required: false,
      completed: Boolean(data.tour360Url),
    },
    {
      id: 'diferenciais',
      label: 'Diferenciais listados',
      description: 'Pontos fortes do imóvel',
      required: false,
      completed: Boolean(data.diferenciais && data.diferenciais.length >= 3),
    },
  ], [data]);

  const requiredItems = checklistItems.filter(item => item.required);
  const optionalItems = checklistItems.filter(item => !item.required);
  
  const requiredCompleted = requiredItems.filter(item => item.completed).length;
  const optionalCompleted = optionalItems.filter(item => item.completed).length;
  const totalCompleted = requiredCompleted + optionalCompleted;
  
  const requiredProgress = (requiredCompleted / requiredItems.length) * 100;
  const overallProgress = (totalCompleted / checklistItems.length) * 100;
  
  const isReadyToPublish = requiredCompleted === requiredItems.length;

  // Template suggestion based on property value
  const suggestedTemplate = useMemo<TemplateType>(() => {
    if (!data.valor) return 'moderno';
    
    if (data.valor >= 3000000) {
      return 'luxo';
    } else if (data.valor >= 1000000) {
      return 'moderno';
    } else {
      return 'classico';
    }
  }, [data.valor]);

  const templateLabels: Record<TemplateType, string> = {
    luxo: 'Luxo',
    moderno: 'Moderno',
    classico: 'Clássico',
  };

  const showTemplateSuggestion = data.template_escolhido !== suggestedTemplate && onTemplateSuggestion;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Checklist de Lançamento
          </CardTitle>
          <Badge 
            variant={isReadyToPublish ? "default" : "secondary"}
            className={cn(
              isReadyToPublish && "bg-green-600 hover:bg-green-700"
            )}
          >
            {isReadyToPublish ? 'Pronto para publicar' : `${requiredCompleted}/${requiredItems.length} obrigatórios`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bars */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Itens obrigatórios</span>
            <span className="font-medium">{requiredCompleted}/{requiredItems.length}</span>
          </div>
          <Progress value={requiredProgress} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso geral</span>
            <span className="font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-1.5" />
        </div>

        {/* Template suggestion */}
        {showTemplateSuggestion && data.valor && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>
                Baseado no valor de{' '}
                <strong>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 0,
                  }).format(data.valor)}
                </strong>
                , recomendamos o template{' '}
                <button
                  onClick={() => onTemplateSuggestion?.(suggestedTemplate)}
                  className="font-semibold underline hover:no-underline"
                >
                  {templateLabels[suggestedTemplate]}
                </button>
              </span>
            </p>
          </div>
        )}

        {/* Required items */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Obrigatórios</h4>
          {requiredItems.map((item) => (
            <ChecklistItemRow key={item.id} item={item} />
          ))}
        </div>

        {/* Optional items */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Opcionais (melhoram conversão)</h4>
          {optionalItems.map((item) => (
            <ChecklistItemRow key={item.id} item={item} />
          ))}
        </div>

        {/* Warning if not ready */}
        {!isReadyToPublish && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">
              Complete todos os itens obrigatórios antes de publicar o imóvel.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChecklistItemRow({ item }: { item: ChecklistItem }) {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-2 rounded-md transition-colors",
        item.completed 
          ? "bg-green-50 dark:bg-green-950/20" 
          : item.required 
            ? "bg-red-50 dark:bg-red-950/20" 
            : "bg-muted/50"
      )}
    >
      <div className={cn(
        "h-5 w-5 rounded-full flex items-center justify-center shrink-0",
        item.completed 
          ? "bg-green-600 text-white" 
          : item.required 
            ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400" 
            : "bg-muted text-muted-foreground"
      )}>
        {item.completed ? (
          <Check className="h-3 w-3" />
        ) : (
          <X className="h-3 w-3" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium",
          item.completed && "text-green-700 dark:text-green-400"
        )}>
          {item.label}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {item.description}
        </p>
      </div>
      {!item.required && !item.completed && (
        <Badge variant="outline" className="text-xs shrink-0">
          Opcional
        </Badge>
      )}
    </div>
  );
}
