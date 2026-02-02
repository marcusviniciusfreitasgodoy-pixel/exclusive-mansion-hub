import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save, ArrowLeft, Monitor, Smartphone, Loader2 } from 'lucide-react';
import { SortableFieldItem } from '@/components/forms/SortableFieldItem';
import { FieldPreview } from '@/components/forms/FieldPreview';
import { FieldModal } from '@/components/forms/FieldModal';
import type { TipoFormulario, CampoFormulario, ConfiguracaoFormulario } from '@/types/form-config';
import {
  TIPO_FORMULARIO_LABELS,
  CAMPOS_PADRAO_AGENDAMENTO,
  CAMPOS_PADRAO_FEEDBACK_CLIENTE,
  CAMPOS_PADRAO_FEEDBACK_CORRETOR
} from '@/types/form-config';

const getDefaultCampos = (tipo: TipoFormulario): CampoFormulario[] => {
  switch (tipo) {
    case 'agendamento_visita': return CAMPOS_PADRAO_AGENDAMENTO;
    case 'feedback_cliente': return CAMPOS_PADRAO_FEEDBACK_CLIENTE;
    case 'feedback_corretor': return CAMPOS_PADRAO_FEEDBACK_CORRETOR;
  }
};

export default function EditarFormulario() {
  const { tipo } = useParams<{ tipo: TipoFormulario }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { imobiliaria, user } = useAuth();

  const [campos, setCampos] = useState<CampoFormulario[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CampoFormulario | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [hasChanges, setHasChanges] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, unknown>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: config, isLoading } = useQuery({
    queryKey: ['config-formulario', imobiliaria?.id, tipo],
    queryFn: async () => {
      if (!imobiliaria?.id || !tipo) return null;

      const { data, error } = await supabase
        .from('configuracoes_formularios')
        .select('*')
        .eq('imobiliaria_id', imobiliaria.id)
        .eq('tipo_formulario', tipo)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as ConfiguracaoFormulario | null;
    },
    enabled: !!imobiliaria?.id && !!tipo,
  });

  useEffect(() => {
    if (config) {
      setCampos((config.campos as unknown as CampoFormulario[]) || []);
    } else if (tipo) {
      setCampos(getDefaultCampos(tipo as TipoFormulario));
    }
  }, [config, tipo]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!imobiliaria?.id || !tipo) throw new Error('Dados inválidos');

      // Sort campos by ordem before saving
      const sortedCampos = campos.map((c, i) => ({ ...c, ordem: i + 1 }));

      if (config?.id) {
        // Update existing
        const { error } = await supabase
          .from('configuracoes_formularios')
          .update({
            campos: sortedCampos as unknown as never,
            updated_at: new Date().toISOString(),
          })
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('configuracoes_formularios')
          .insert({
            imobiliaria_id: imobiliaria.id,
            tipo_formulario: tipo,
            nome_formulario: TIPO_FORMULARIO_LABELS[tipo as TipoFormulario].nome,
            campos: sortedCampos as unknown as never,
            created_by: user?.id,
          } as never);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Formulário salvo com sucesso!');
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ['config-formulario'] });
      queryClient.invalidateQueries({ queryKey: ['configuracoes-formularios'] });
    },
    onError: (error) => {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar formulário');
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCampos((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return reordered;
      });
    }
  };

  const handleAddField = () => {
    setEditingField(null);
    setModalOpen(true);
  };

  const handleEditField = (campo: CampoFormulario) => {
    setEditingField(campo);
    setModalOpen(true);
  };

  const handleDeleteField = (campoId: string) => {
    setCampos(prev => prev.filter(c => c.id !== campoId));
    setHasChanges(true);
  };

  const handleSaveField = (campo: CampoFormulario) => {
    if (editingField) {
      // Update existing
      setCampos(prev => prev.map(c => c.id === campo.id ? campo : c));
    } else {
      // Add new
      setCampos(prev => [...prev, { ...campo, ordem: prev.length + 1 }]);
    }
    setHasChanges(true);
    setModalOpen(false);
  };

  // Função para verificar visibilidade condicional no preview (suporta cascading)
  const isFieldVisibleInPreview = (campo: CampoFormulario): boolean => {
    if (!campo.condicional) return true;

    const { campo_id, valor, mostrar_se } = campo.condicional;
    const campoReferencia = campos.find(c => c.id === campo_id);
    if (!campoReferencia) return true;

    // Verificar se campo de referência está visível (cascading)
    if (!isFieldVisibleInPreview(campoReferencia)) return false;

    const valorAtual = previewData[campoReferencia.nome];

    switch (mostrar_se) {
      case 'igual':
        return valorAtual === valor;
      case 'diferente':
        return valorAtual !== valor;
      case 'contem':
        if (Array.isArray(valorAtual)) {
          return valorAtual.includes(valor);
        }
        return String(valorAtual || '').includes(valor);
      default:
        return true;
    }
  };

  const updatePreviewField = (nome: string, value: unknown) => {
    setPreviewData(prev => {
      const newData = { ...prev, [nome]: value };
      
      // Limpar valores de campos que ficam ocultos
      campos.forEach(campo => {
        if (campo.condicional) {
          const campoRef = campos.find(c => c.id === campo.condicional!.campo_id);
          if (campoRef?.nome === nome) {
            const { valor: condValor, mostrar_se } = campo.condicional;
            let shouldShow = true;
            
            switch (mostrar_se) {
              case 'igual':
                shouldShow = value === condValor;
                break;
              case 'diferente':
                shouldShow = value !== condValor;
                break;
              case 'contem':
                if (Array.isArray(value)) {
                  shouldShow = value.includes(condValor);
                } else {
                  shouldShow = String(value || '').includes(condValor);
                }
                break;
            }
            
            if (!shouldShow && newData[campo.nome] !== undefined) {
              delete newData[campo.nome];
            }
          }
        }
      });
      
      return newData;
    });
  };

  if (!tipo || !['agendamento_visita', 'feedback_cliente', 'feedback_corretor'].includes(tipo)) {
    navigate('/dashboard/imobiliaria/configuracoes/formularios');
    return null;
  }

  const { nome } = TIPO_FORMULARIO_LABELS[tipo as TipoFormulario];

  return (
    <DashboardLayout title={`Editar: ${nome}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard/imobiliaria/configuracoes/formularios')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !hasChanges}>
            {saveMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Alterações
          </Button>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-3">
              <Skeleton className="h-[600px] w-full" />
            </div>
            <div className="md:col-span-2">
              <Skeleton className="h-[600px] w-full" />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-5 gap-6">
            {/* Left Column - Fields List */}
            <div className="md:col-span-3 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Campos do Formulário</CardTitle>
                    <Button onClick={handleAddField} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Campo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[550px] pr-4">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={campos.map(c => c.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {campos.map(campo => (
                            <SortableFieldItem
                              key={campo.id}
                              campo={campo}
                              onEdit={handleEditField}
                              onDelete={handleDeleteField}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    {campos.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Nenhum campo configurado.</p>
                        <Button onClick={handleAddField} variant="outline" className="mt-4">
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar primeiro campo
                        </Button>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Preview</CardTitle>
                    <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as 'desktop' | 'mobile')}>
                      <TabsList className="h-8">
                        <TabsTrigger value="desktop" className="h-7 px-2">
                          <Monitor className="h-4 w-4" />
                        </TabsTrigger>
                        <TabsTrigger value="mobile" className="h-7 px-2">
                          <Smartphone className="h-4 w-4" />
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={`
                      bg-muted/30 rounded-lg border p-4 transition-all
                      ${previewMode === 'mobile' ? 'max-w-[375px] mx-auto' : ''}
                    `}
                  >
                    <ScrollArea className="h-[550px]">
                      <div className="space-y-4 pr-2">
                        <h3 className="font-semibold text-lg">{nome}</h3>
                        {campos
                          .sort((a, b) => a.ordem - b.ordem)
                          .filter(isFieldVisibleInPreview)
                          .map(campo => (
                            <FieldPreview 
                              key={campo.id} 
                              campo={campo}
                              value={previewData[campo.nome]}
                              onChange={(value) => updatePreviewField(campo.nome, value)}
                              disabled={false}
                            />
                          ))}
                        {campos.length === 0 && (
                          <p className="text-center py-8 text-muted-foreground">
                            Adicione campos para ver o preview
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Field Modal */}
      <FieldModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        field={editingField}
        existingNames={campos.map(c => c.nome)}
        existingFields={campos.filter(c => c.id !== editingField?.id)}
        onSave={handleSaveField}
      />
    </DashboardLayout>
  );
}
