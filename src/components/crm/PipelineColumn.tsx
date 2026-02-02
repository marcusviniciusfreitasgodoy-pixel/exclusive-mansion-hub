import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LeadCard } from './LeadCard';
import { LeadPipeline, PipelineColumn as PipelineColumnType } from '@/types/crm';
import { cn } from '@/lib/utils';

interface PipelineColumnProps {
  column: PipelineColumnType;
  leads: LeadPipeline[];
  onViewLead: (lead: LeadPipeline) => void;
  onQuickAction?: (lead: LeadPipeline, action: 'call' | 'email' | 'whatsapp') => void;
  onAddLead?: (columnId: string) => void;
}

export function PipelineColumnComponent({
  column,
  leads,
  onViewLead,
  onQuickAction,
  onAddLead,
}: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const totalValue = leads.reduce((sum, lead) => {
    const value = lead.imovel?.valor || lead.orcamento || 0;
    return sum + value;
  }, 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value}`;
  };

  return (
    <div
      className={cn(
        'flex flex-col w-[280px] min-w-[280px] bg-muted/30 rounded-lg',
        isOver && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{column.icone}</span>
            <span className="font-semibold text-sm">{column.titulo}</span>
            <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
              {leads.length}
            </span>
          </div>
          {onAddLead && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onAddLead(column.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(totalValue)}
        </p>
      </div>

      {/* Cards Container */}
      <ScrollArea className="flex-1 p-2">
        <div
          ref={setNodeRef}
          className="flex flex-col gap-2 min-h-[200px]"
        >
          <SortableContext
            items={leads.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onView={onViewLead}
                onQuickAction={onQuickAction}
              />
            ))}
          </SortableContext>
          
          {leads.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              Nenhum lead
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
