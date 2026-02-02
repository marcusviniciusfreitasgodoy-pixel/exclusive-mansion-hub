import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { IntegracaoConfig, Integracao, EventoRastreamento } from '@/types/integrations';
import { Loader2, AlertCircle, CheckCircle2, Trash2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface IntegrationConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: IntegracaoConfig;
  integracao?: Integracao;
  onSave: (credenciais: Record<string, any>, configuracoes: Record<string, any>, ativa: boolean) => Promise<void>;
  onDelete?: () => Promise<void>;
  onTest?: (credenciais: Record<string, any>) => Promise<boolean>;
}

export function IntegrationConfigModal({
  open,
  onOpenChange,
  config,
  integracao,
  onSave,
  onDelete,
  onTest
}: IntegrationConfigModalProps) {
  const [credenciais, setCredenciais] = useState<Record<string, any>>({});
  const [eventosAtivos, setEventosAtivos] = useState<string[]>([]);
  const [ativa, setAtiva] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // Initialize form with existing data
  useEffect(() => {
    if (integracao) {
      setCredenciais(integracao.credenciais || {});
      setEventosAtivos(integracao.configuracoes?.eventos || []);
      setAtiva(integracao.ativa);
    } else {
      // Set defaults for new integration
      setCredenciais({});
      setEventosAtivos(
        config.eventosDisponiveis?.filter(e => e.padrao).map(e => e.key) || []
      );
      setAtiva(false);
    }
    setTestResult(null);
  }, [integracao, config, open]);

  const handleFieldChange = (key: string, value: any) => {
    setCredenciais(prev => ({ ...prev, [key]: value }));
    setTestResult(null);
  };

  const handleEventoToggle = (eventoKey: string) => {
    setEventosAtivos(prev =>
      prev.includes(eventoKey)
        ? prev.filter(k => k !== eventoKey)
        : [...prev, eventoKey]
    );
  };

  const handleTest = async () => {
    if (!onTest) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const success = await onTest(credenciais);
      setTestResult(success ? 'success' : 'error');
      
      if (success) {
        toast.success('Conexão testada com sucesso!');
      } else {
        toast.error('Falha ao testar conexão. Verifique as credenciais.');
      }
    } catch (error) {
      setTestResult('error');
      toast.error('Erro ao testar conexão');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    const missingFields = config.campos
      .filter(c => c.obrigatorio && !credenciais[c.key])
      .map(c => c.label);

    if (missingFields.length > 0) {
      toast.error(`Preencha os campos obrigatórios: ${missingFields.join(', ')}`);
      return;
    }

    setIsSaving(true);
    
    try {
      await onSave(
        credenciais,
        { eventos: eventosAtivos },
        ativa
      );
      toast.success('Integração salva com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving integration:', error);
      toast.error('Erro ao salvar integração');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (!confirm('Tem certeza que deseja remover esta integração?')) return;
    
    setIsDeleting(true);
    
    try {
      await onDelete();
      toast.success('Integração removida com sucesso');
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast.error('Erro ao remover integração');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderField = (campo: typeof config.campos[0]) => {
    const value = credenciais[campo.key] || '';

    switch (campo.tipo) {
      case 'textarea':
        return (
          <Textarea
            id={campo.key}
            placeholder={campo.placeholder}
            value={value}
            onChange={e => handleFieldChange(campo.key, e.target.value)}
            rows={3}
          />
        );
      
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={val => handleFieldChange(campo.key, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {campo.opcoes?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={campo.key}
              checked={!!value}
              onCheckedChange={checked => handleFieldChange(campo.key, checked)}
            />
            <Label htmlFor={campo.key} className="font-normal cursor-pointer">
              {campo.label}
            </Label>
          </div>
        );
      
      default:
        return (
          <Input
            id={campo.key}
            type={campo.tipo === 'password' ? 'password' : 'text'}
            placeholder={campo.placeholder}
            value={value}
            onChange={e => handleFieldChange(campo.key, e.target.value)}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${config.cor}`}>
              {config.icone}
            </div>
            <div>
              <DialogTitle>{integracao ? 'Configurar' : 'Conectar'} {config.nome}</DialogTitle>
              <DialogDescription>
                {config.descricao}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Toggle */}
          {integracao && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Status da Integração</p>
                <p className="text-sm text-muted-foreground">
                  {ativa ? 'A integração está ativa e funcionando' : 'A integração está desativada'}
                </p>
              </div>
              <Switch
                checked={ativa}
                onCheckedChange={setAtiva}
              />
            </div>
          )}

          {/* Credenciais */}
          <div className="space-y-4">
            <h3 className="font-medium">Credenciais</h3>
            
            {config.campos.map(campo => (
              campo.tipo !== 'checkbox' && (
                <div key={campo.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={campo.key}>
                      {campo.label}
                      {campo.obrigatorio && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {campo.ajuda && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{campo.ajuda}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  {renderField(campo)}
                </div>
              )
            ))}

            {/* Test Button */}
            {onTest && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTest}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    'Testar Conexão'
                  )}
                </Button>
                
                {testResult === 'success' && (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Conexão OK
                  </Badge>
                )}
                {testResult === 'error' && (
                  <Badge className="bg-red-100 text-red-700">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Falha na conexão
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Eventos a Rastrear */}
          {config.eventosDisponiveis && config.eventosDisponiveis.length > 0 && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Eventos para Rastrear</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione quais eventos devem ser enviados para esta integração.
                </p>
                
                <div className="space-y-3">
                  {config.eventosDisponiveis.map(evento => (
                    <div
                      key={evento.key}
                      className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <Checkbox
                        id={`evento-${evento.key}`}
                        checked={eventosAtivos.includes(evento.key)}
                        onCheckedChange={() => handleEventoToggle(evento.key)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor={`evento-${evento.key}`}
                          className="font-medium cursor-pointer"
                        >
                          {evento.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {evento.descricao}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {integracao && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="sm:mr-auto"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </>
              )}
            </Button>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
