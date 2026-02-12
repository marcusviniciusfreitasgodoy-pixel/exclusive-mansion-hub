import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { Search, Filter, LayoutGrid, List, Table2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PipelineColumnComponent } from './PipelineColumn';
import { LeadCard } from './LeadCard';
import { LeadDetailModal } from './LeadDetailModal';
import { LeadPipeline, PIPELINE_COLUMNS, EstagioPipeline } from '@/types/crm';
import { runStageAutomations, hasStageAutomation } from '@/utils/pipelineAutomations';

interface PipelineKanbanProps {
  type: 'construtora' | 'imobiliaria';
}

export function PipelineKanban({ type }: PipelineKanbanProps) {
  const { construtora, imobiliaria, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [imovelFilter, setImovelFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'table'>('kanban');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadPipeline | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch leads
  const { data: leads, isLoading } = useQuery({
    queryKey: ['pipeline-leads', type, construtora?.id, imobiliaria?.id],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select(`
          *,
          imovel:imoveis(id, titulo, valor, bairro, cidade)
        `)
        .order('created_at', { ascending: false });

      if (type === 'construtora' && construtora?.id) {
        query = query.eq('construtora_id', construtora.id);
      } else if (type === 'imobiliaria' && imobiliaria?.id) {
        query = query.eq('imobiliaria_id', imobiliaria.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((lead: any) => ({
        ...lead,
        estagio_pipeline: lead.estagio_pipeline || 'novo',
        score_qualificacao: lead.score_qualificacao || 0,
        tags: Array.isArray(lead.tags) ? lead.tags : [],
      })) as LeadPipeline[];
    },
    enabled: !!(type === 'construtora' ? construtora?.id : imobiliaria?.id),
  });

  // Fetch imoveis for filter
  const { data: imoveis } = useQuery({
    queryKey: ['pipeline-imoveis', type, construtora?.id, imobiliaria?.id],
    queryFn: async () => {
      if (type === 'construtora' && construtora?.id) {
        const { data } = await supabase
          .from('imoveis')
          .select('id, titulo')
          .eq('construtora_id', construtora.id);
        return data || [];
      } else if (type === 'imobiliaria' && imobiliaria?.id) {
        const { data } = await supabase
          .from('imobiliaria_imovel_access')
          .select('imovel:imoveis(id, titulo)')
          .eq('imobiliaria_id', imobiliaria.id)
          .eq('status', 'active');
        return (data || []).map((d: any) => d.imovel).filter(Boolean);
      }
      return [];
    },
    enabled: !!(type === 'construtora' ? construtora?.id : imobiliaria?.id),
  });

  // Update lead stage mutation
  const updateStageMutation = useMutation({
    mutationFn: async ({ leadId, newStage, oldStage }: { leadId: string; newStage: EstagioPipeline; oldStage: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ 
          estagio_pipeline: newStage,
          ultimo_contato: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) throw error;

      // Log activity
      await supabase.from('atividades_lead').insert({
        lead_id: leadId,
        tipo: 'status_alterado',
        titulo: 'Estágio alterado',
        descricao: `Estágio alterado de "${oldStage}" para "${newStage}"`,
        usuario_id: user?.id,
        usuario_nome: user?.email?.split('@')[0] || 'Usuário',
      });

      // Fire-and-forget automations
      const lead = leads?.find(l => l.id === leadId);
      runStageAutomations({
        leadId,
        newStage,
        userId: user?.id,
        userName: user?.email?.split('@')[0] || 'Usuário',
        imobiliariaId: lead?.imobiliaria_id,
        construtoraId: lead?.construtora_id,
      });
    },
    onSuccess: (_, { newStage }) => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-leads'] });
      
      if (newStage === 'ganho') {
        toast({
          title: '🎉 Parabéns!',
          description: 'Lead convertido com sucesso!',
        });
      } else if (hasStageAutomation(newStage)) {
        toast({ title: 'Estágio atualizado!', description: 'Tarefa de follow-up criada automaticamente.' });
      } else {
        toast({ title: 'Estágio atualizado!' });
      }
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    },
  });

  // Filter leads
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    
    return leads.filter((lead) => {
      const matchesSearch = !searchTerm || 
        lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefone?.includes(searchTerm);
      
      const matchesImovel = imovelFilter === 'all' || lead.imovel_id === imovelFilter;
      
      return matchesSearch && matchesImovel;
    });
  }, [leads, searchTerm, imovelFilter]);

  // Group leads by stage
  const leadsByStage = useMemo(() => {
    const grouped: Record<EstagioPipeline, LeadPipeline[]> = {
      novo: [],
      contatado: [],
      qualificado: [],
      visita_agendada: [],
      proposta_enviada: [],
      negociacao: [],
      ganho: [],
      perdido: [],
    };

    filteredLeads.forEach((lead) => {
      const stage = lead.estagio_pipeline as EstagioPipeline;
      if (grouped[stage]) {
        grouped[stage].push(lead);
      } else {
        grouped.novo.push(lead);
      }
    });

    return grouped;
  }, [filteredLeads]);

  // Metrics
  const metrics = useMemo(() => {
    const total = filteredLeads.length;
    const ganhos = leadsByStage.ganho.length;
    const perdidos = leadsByStage.perdido.length;
    const taxaConversao = total > 0 ? ((ganhos / total) * 100).toFixed(1) : 0;
    const valorNegociacao = [...leadsByStage.proposta_enviada, ...leadsByStage.negociacao]
      .reduce((sum, lead) => sum + (lead.imovel?.valor || lead.orcamento || 0), 0);

    return { total, ganhos, perdidos, taxaConversao, valorNegociacao };
  }, [filteredLeads, leadsByStage]);

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const newStage = over.id as EstagioPipeline;
    
    const lead = filteredLeads.find((l) => l.id === leadId);
    if (!lead || lead.estagio_pipeline === newStage) return;

    updateStageMutation.mutate({
      leadId,
      newStage,
      oldStage: lead.estagio_pipeline,
    });
  };

  const activeLead = activeId ? filteredLeads.find((l) => l.id === activeId) : null;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}K`;
    return `R$ ${value}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Leads Ativos</p>
            <p className="text-2xl font-bold">{metrics.total - metrics.ganhos - metrics.perdidos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
            <p className="text-2xl font-bold">{metrics.taxaConversao}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Em Negociação</p>
            <p className="text-2xl font-bold">{formatCurrency(metrics.valorNegociacao)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Ganhos / Perdidos</p>
            <p className="text-2xl font-bold text-primary">
              {metrics.ganhos} <span className="text-muted-foreground">/</span>{' '}
              <span className="text-destructive">{metrics.perdidos}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={imovelFilter} onValueChange={setImovelFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por imóvel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os imóveis</SelectItem>
            {imoveis?.map((imovel: any) => (
              <SelectItem key={imovel.id} value={imovel.id}>
                {imovel.titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <Table2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : viewMode === 'kanban' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <ScrollArea className="flex-1 -mx-4 px-4">
            <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
              {PIPELINE_COLUMNS.map((column) => (
                <PipelineColumnComponent
                  key={column.id}
                  column={column}
                  leads={leadsByStage[column.id] || []}
                  onViewLead={setSelectedLead}
                  onQuickAction={(lead, action) => {
                    if (action === 'whatsapp' && lead.telefone) {
                      window.open(`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`, '_blank');
                    } else if (action === 'email') {
                      window.open(`mailto:${lead.email}`, '_blank');
                    } else if (action === 'call' && lead.telefone) {
                      window.open(`tel:${lead.telefone}`, '_blank');
                    }
                  }}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <DragOverlay>
            {activeLead && (
              <div className="w-[264px]">
                <LeadCard
                  lead={activeLead}
                  onView={() => {}}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        // List/Table view placeholder
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Visualização em {viewMode === 'list' ? 'lista' : 'tabela'} em breve
        </div>
      )}

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={() => queryClient.invalidateQueries({ queryKey: ['pipeline-leads'] })}
      />
    </div>
  );
}
