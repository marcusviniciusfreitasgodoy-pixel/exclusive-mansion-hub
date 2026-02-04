import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Phone, Mail, MessageCircle, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LeadPipeline, getScoreIcon, getScoreColor, formatTimeAgo } from '@/types/crm';
import { cn } from '@/lib/utils';

interface LeadCardProps {
  lead: LeadPipeline;
  onView: (lead: LeadPipeline) => void;
  onQuickAction?: (lead: LeadPipeline, action: 'call' | 'email' | 'whatsapp') => void;
}

export function LeadCard({ lead, onView, onQuickAction }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'A consultar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'p-3 cursor-grab active:cursor-grabbing group hover:shadow-md transition-shadow',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary'
      )}
    >
      {/* Header - Nome e Score */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{lead.nome}</p>
          {lead.imovel && (
            <p className="text-xs text-muted-foreground truncate">
              {lead.imovel.titulo}
            </p>
          )}
        </div>
        <div className={cn('text-lg flex-shrink-0', getScoreColor(lead.score_qualificacao))}>
          <span className="text-xs font-medium">{lead.score_qualificacao}</span>
          <span className="ml-0.5">{getScoreIcon(lead.score_qualificacao)}</span>
        </div>
      </div>

      {/* Valor do Imóvel */}
      <p className="text-sm font-semibold text-primary mb-2">
        {formatCurrency(lead.imovel?.valor || lead.orcamento)}
      </p>

      {/* Tags */}
      {lead.tags && lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {lead.tags.slice(0, 2).map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
          {lead.tags.length > 2 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{lead.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Footer - Último contato e ações */}
      <div className="flex items-center justify-between pt-2 border-t">
        <span className="text-[10px] text-muted-foreground">
          {formatTimeAgo(lead.ultimo_contato || lead.created_at)}
        </span>
        
        {/* Quick Actions - appear on hover */}
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {lead.telefone && (
            <a
              href={`tel:${lead.telefone.replace(/\D/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent hover:text-accent-foreground"
              title="Ligar agora"
            >
              <Phone className="h-3 w-3" />
            </a>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction?.(lead, 'email');
            }}
            title="Email"
          >
            <Mail className="h-3 w-3" />
          </Button>
          {lead.telefone && (
            <a
              href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent hover:text-accent-foreground"
              title="WhatsApp"
            >
              <MessageCircle className="h-3 w-3" />
            </a>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onView(lead);
            }}
            title="Ver Detalhes"
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
