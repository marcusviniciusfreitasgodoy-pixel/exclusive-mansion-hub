import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, Edit, Eye, Copy, Calendar, MessageSquare, ClipboardCheck,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { TipoFormulario, CampoFormulario } from '@/types/form-config';
import { 
  TIPO_FORMULARIO_LABELS,
  CAMPOS_PADRAO_AGENDAMENTO,
  CAMPOS_PADRAO_FEEDBACK_CLIENTE,
  CAMPOS_PADRAO_FEEDBACK_CORRETOR
} from '@/types/form-config';

const TIPOS_FORMULARIO: TipoFormulario[] = ['agendamento_visita', 'feedback_cliente', 'feedback_corretor'];

const ICONS: Record<TipoFormulario, typeof Calendar> = {
  agendamento_visita: Calendar,
  feedback_cliente: MessageSquare,
  feedback_corretor: ClipboardCheck
};

const getDefaultCampos = (tipo: TipoFormulario): CampoFormulario[] => {
  switch (tipo) {
    case 'agendamento_visita': return CAMPOS_PADRAO_AGENDAMENTO;
    case 'feedback_cliente': return CAMPOS_PADRAO_FEEDBACK_CLIENTE;
    case 'feedback_corretor': return CAMPOS_PADRAO_FEEDBACK_CORRETOR;
  }
};

export default function ConfiguracoesFormularios() {
  const { imobiliaria } = useAuth();

  const { data: configuracoes, isLoading } = useQuery({
    queryKey: ['configuracoes-formularios', imobiliaria?.id],
    queryFn: async () => {
      if (!imobiliaria?.id) return [];

      const { data, error } = await supabase
        .from('configuracoes_formularios')
        .select('*')
        .eq('imobiliaria_id', imobiliaria.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!imobiliaria?.id,
  });

  const getConfig = (tipo: TipoFormulario) => {
    return configuracoes?.find(c => c.tipo_formulario === tipo);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Nunca editado';
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <DashboardLayout title="Configuração de Formulários">
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground">
            Personalize os formulários de agendamento e feedback de acordo com as necessidades da sua imobiliária.
            Adicione, edite ou remova perguntas para coletar as informações mais relevantes.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40 mt-2" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {TIPOS_FORMULARIO.map(tipo => {
              const config = getConfig(tipo);
              const Icon = ICONS[tipo];
              const { nome, descricao } = TIPO_FORMULARIO_LABELS[tipo];
              const campos = (config?.campos as unknown as CampoFormulario[]) || getDefaultCampos(tipo);
              const numCampos = campos.length;

              return (
                <Card key={tipo} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{nome}</CardTitle>
                          <CardDescription>{descricao}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Perguntas configuradas:</span>
                        <Badge variant="secondary">{numCampos}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Última edição:</span>
                        <span className="text-xs">{formatDate(config?.updated_at || null)}</span>
                      </div>
                      {config && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={config.ativo ? "default" : "secondary"}>
                            {config.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link to={`/dashboard/imobiliaria/configuracoes/formularios/${tipo}/editar`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link to={`/dashboard/imobiliaria/configuracoes/formularios/${tipo}/preview`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Como funciona?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Campos bloqueados:</strong> Alguns campos são obrigatórios e não podem ser removidos</li>
                  <li>• <strong>Campos customizados:</strong> Adicione perguntas específicas para sua necessidade</li>
                  <li>• <strong>Lógica condicional:</strong> Mostre campos apenas se certas condições forem atendidas</li>
                  <li>• <strong>Reordenação:</strong> Arraste e solte para definir a ordem das perguntas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
