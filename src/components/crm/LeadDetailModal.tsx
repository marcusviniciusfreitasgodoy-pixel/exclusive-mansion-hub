import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Phone, Mail, MessageCircle, MapPin, DollarSign, Clock, Tag,
  Plus, Edit2, Trash2, CheckCircle2, X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LeadPipeline, AtividadeLead, Tarefa, NotaLead, getScoreIcon, getScoreColor, formatTimeAgo, getPrioridadeColor, PIPELINE_COLUMNS } from '@/types/crm';
import { cn } from '@/lib/utils';

interface LeadDetailModalProps {
  lead: LeadPipeline | null;
  open: boolean;
  onClose: () => void;
  onUpdateLead?: () => void;
}

export function LeadDetailModal({ lead, open, onClose, onUpdateLead }: LeadDetailModalProps) {
  const { user, construtora, imobiliaria } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('info');
  const [newNote, setNewNote] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'baixa' | 'media' | 'alta' | 'urgente'>('media');

  // Fetch activities
  const { data: atividades } = useQuery({
    queryKey: ['atividades-lead', lead?.id],
    queryFn: async () => {
      if (!lead?.id) return [];
      const { data, error } = await supabase
        .from('atividades_lead')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AtividadeLead[];
    },
    enabled: !!lead?.id && open,
  });

  // Fetch tasks
  const { data: tarefas } = useQuery({
    queryKey: ['tarefas-lead', lead?.id],
    queryFn: async () => {
      if (!lead?.id) return [];
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('lead_id', lead.id)
        .order('data_vencimento', { ascending: true });
      if (error) throw error;
      return data as Tarefa[];
    },
    enabled: !!lead?.id && open,
  });

  // Fetch notes
  const { data: notas } = useQuery({
    queryKey: ['notas-lead', lead?.id],
    queryFn: async () => {
      if (!lead?.id) return [];
      const { data, error } = await supabase
        .from('notas_lead')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as NotaLead[];
    },
    enabled: !!lead?.id && open,
  });

  // Mutation to add note
  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!lead?.id) throw new Error('Lead não encontrado');
      const { error } = await supabase.from('notas_lead').insert({
        lead_id: lead.id,
        conteudo: content,
        autor_id: user?.id,
        autor_nome: user?.email?.split('@')[0] || 'Usuário',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-lead', lead?.id] });
      setNewNote('');
      toast({ title: 'Nota adicionada!' });
    },
    onError: () => {
      toast({ title: 'Erro ao adicionar nota', variant: 'destructive' });
    },
  });

  // Mutation to add task
  const addTaskMutation = useMutation({
    mutationFn: async () => {
      if (!lead?.id) throw new Error('Lead não encontrado');
      const { error } = await supabase.from('tarefas').insert({
        lead_id: lead.id,
        imobiliaria_id: imobiliaria?.id || null,
        construtora_id: construtora?.id || null,
        titulo: newTaskTitle,
        data_vencimento: newTaskDate || null,
        prioridade: newTaskPriority,
        responsavel_id: user?.id,
        responsavel_nome: user?.email?.split('@')[0] || 'Usuário',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas-lead', lead?.id] });
      setNewTaskTitle('');
      setNewTaskDate('');
      setNewTaskPriority('media');
      toast({ title: 'Tarefa criada!' });
    },
    onError: () => {
      toast({ title: 'Erro ao criar tarefa', variant: 'destructive' });
    },
  });

  // Mutation to complete task
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tarefas')
        .update({ status: 'concluida', data_conclusao: new Date().toISOString() })
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas-lead', lead?.id] });
      toast({ title: 'Tarefa concluída!' });
    },
  });

  // Mutation to update lead stage
  const updateStageMutation = useMutation({
    mutationFn: async (newStage: string) => {
      if (!lead?.id) throw new Error('Lead não encontrado');
      const { error } = await supabase
        .from('leads')
        .update({ estagio_pipeline: newStage })
        .eq('id', lead.id);
      if (error) throw error;

      // Log activity
      await supabase.from('atividades_lead').insert({
        lead_id: lead.id,
        tipo: 'status_alterado',
        titulo: 'Estágio alterado',
        descricao: `Estágio alterado de "${lead.estagio_pipeline}" para "${newStage}"`,
        usuario_id: user?.id,
        usuario_nome: user?.email?.split('@')[0] || 'Usuário',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atividades-lead', lead?.id] });
      onUpdateLead?.();
      toast({ title: 'Estágio atualizado!' });
    },
  });

  if (!lead) return null;

  const formatCurrency = (value: number | null) => {
    if (!value) return 'A consultar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getAtividadeIcon = (tipo: string) => {
    switch (tipo) {
      case 'ligacao_realizada': return '📞';
      case 'email_enviado': return '✉️';
      case 'whatsapp_enviado': return '💬';
      case 'reuniao': return '🤝';
      case 'visita_agendada': return '🏠';
      case 'proposta_enviada': return '📋';
      case 'status_alterado': return '🔄';
      case 'nota': return '📝';
      default: return '📌';
    }
  };

  const pendingTasks = tarefas?.filter(t => t.status === 'pendente' || t.status === 'em_andamento') || [];
  const completedTasks = tarefas?.filter(t => t.status === 'concluida') || [];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{lead.nome}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('font-bold', getScoreColor(lead.score_qualificacao))}>
                  {getScoreIcon(lead.score_qualificacao)} {lead.score_qualificacao}
                </span>
                <Select
                  value={lead.estagio_pipeline}
                  onValueChange={(value) => updateStageMutation.mutate(value)}
                >
                  <SelectTrigger className="h-7 w-auto text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_COLUMNS.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.icone} {col.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="atividades">Atividades</TabsTrigger>
            <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
            <TabsTrigger value="notas">Notas</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            {/* Info Tab */}
            <TabsContent value="info" className="m-0 space-y-4">
              {/* Contact */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Contato
                </h4>
                <div className="space-y-1 text-sm">
                  <p><Mail className="inline h-3 w-3 mr-2" />{lead.email}</p>
                  {lead.telefone && <p><Phone className="inline h-3 w-3 mr-2" />{lead.telefone}</p>}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" asChild>
                    <a href={`mailto:${lead.email}`}><Mail className="h-4 w-4 mr-1" /> Email</a>
                  </Button>
                  {lead.telefone && (
                    <>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`} target="_blank">
                          <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`tel:${lead.telefone}`}><Phone className="h-4 w-4 mr-1" /> Ligar</a>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Interest */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Interesse
                </h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Imóvel:</strong> {lead.imovel?.titulo || 'Não especificado'}</p>
                  <p><strong>Valor:</strong> {formatCurrency(lead.imovel?.valor || null)}</p>
                  <p><strong>Origem:</strong> {lead.origem_detalhada || lead.origem || 'Formulário'}</p>
                </div>
              </div>

              <Separator />

              {/* Qualification */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Qualificação
                </h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Orçamento:</strong> {lead.orcamento ? formatCurrency(lead.orcamento) : 'Não informado'}</p>
                  <p><strong>Prazo:</strong> {lead.prazo_compra || 'Não informado'}</p>
                </div>
              </div>

              <Separator />

              {/* Tags */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Tags
                </h4>
                <div className="flex flex-wrap gap-1">
                  {lead.tags && lead.tags.length > 0 ? (
                    lead.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">{tag}</Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Nenhuma tag</span>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="atividades" className="m-0 space-y-4">
              <div className="space-y-3">
                {atividades && atividades.length > 0 ? (
                  atividades.map((atividade) => (
                    <div key={atividade.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                      <span className="text-xl">{getAtividadeIcon(atividade.tipo)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{atividade.titulo || atividade.tipo}</p>
                        {atividade.descricao && (
                          <p className="text-sm text-muted-foreground mt-1">{atividade.descricao}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(atividade.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                          {atividade.usuario_nome && ` • ${atividade.usuario_nome}`}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma atividade registrada
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tarefas" className="m-0 space-y-4">
              {/* Add Task Form */}
              <div className="flex gap-2">
                <Input
                  placeholder="Nova tarefa..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="datetime-local"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="w-40"
                />
                <Select value={newTaskPriority} onValueChange={(v: any) => setNewTaskPriority(v)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  onClick={() => addTaskMutation.mutate()}
                  disabled={!newTaskTitle || addTaskMutation.isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Pendentes ({pendingTasks.length})</h4>
                  <div className="space-y-2">
                    {pendingTasks.map((tarefa) => (
                      <div key={tarefa.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => completeTaskMutation.mutate(tarefa.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{tarefa.titulo}</p>
                          {tarefa.data_vencimento && (
                            <p className="text-xs text-muted-foreground">
                              Vence: {format(new Date(tarefa.data_vencimento), "dd/MM 'às' HH:mm", { locale: ptBR })}
                            </p>
                          )}
                        </div>
                        <div className={cn('w-2 h-2 rounded-full', getPrioridadeColor(tarefa.prioridade))} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Concluídas ({completedTasks.length})</h4>
                  <div className="space-y-2">
                    {completedTasks.slice(0, 5).map((tarefa) => (
                      <div key={tarefa.id} className="flex items-center gap-2 p-2 bg-muted/10 rounded-lg opacity-60">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <p className="text-sm line-through">{tarefa.titulo}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingTasks.length === 0 && completedTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma tarefa
                </p>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notas" className="m-0 space-y-4">
              {/* Add Note Form */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Adicionar uma nota..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={() => addNoteMutation.mutate(newNote)}
                  disabled={!newNote || addNoteMutation.isPending}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" /> Adicionar Nota
                </Button>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {notas && notas.length > 0 ? (
                  notas.map((nota) => (
                    <div key={nota.id} className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{nota.conteudo}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(nota.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        {nota.autor_nome && ` • ${nota.autor_nome}`}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma nota
                  </p>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
