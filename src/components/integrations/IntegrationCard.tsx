import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Check, AlertCircle, Loader2 } from 'lucide-react';
import { IntegracaoConfig, Integracao } from '@/types/integrations';
import { cn } from '@/lib/utils';

interface IntegrationCardProps {
  config: IntegracaoConfig;
  integracao?: Integracao;
  onConnect: () => void;
  onConfigure: () => void;
  isLoading?: boolean;
}

export function IntegrationCard({
  config,
  integracao,
  onConnect,
  onConfigure,
  isLoading
}: IntegrationCardProps) {
  const isConnected = integracao?.ativa;
  const hasError = integracao?.erro_ultima_tentativa;

  return (
    <Card className={cn(
      "relative transition-all hover:shadow-md",
      isConnected && "ring-2 ring-green-500/20"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center text-2xl",
            config.cor
          )}>
            {config.icone}
          </div>
          
          {isConnected ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Check className="h-3 w-3 mr-1" />
              Conectado
            </Badge>
          ) : hasError ? (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Erro
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              Inativo
            </Badge>
          )}
        </div>
        
        <CardTitle className="text-lg mt-3">{config.nome}</CardTitle>
        <CardDescription className="text-sm">
          {config.descricao}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {integracao && isConnected && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Eventos enviados</span>
              <span className="font-medium">{integracao.total_eventos_enviados.toLocaleString()}</span>
            </div>
            {integracao.ultima_sincronizacao && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-muted-foreground">Última sync</span>
                <span className="font-medium text-xs">
                  {new Date(integracao.ultima_sincronizacao).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {hasError && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg text-sm text-red-700">
            <p className="font-medium">Erro na última tentativa:</p>
            <p className="text-xs mt-1 truncate">{integracao?.erro_ultima_tentativa}</p>
          </div>
        )}

        <Button
          className="w-full"
          variant={isConnected ? "outline" : "default"}
          onClick={isConnected ? onConfigure : onConnect}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : isConnected ? (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </>
          ) : (
            'Conectar'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
