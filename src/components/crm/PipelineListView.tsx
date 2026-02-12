import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Mail, Phone, MessageCircle } from 'lucide-react';
import { LeadPipeline, PIPELINE_COLUMNS, EstagioPipeline, formatTimeAgo, getScoreIcon, getScoreColor } from '@/types/crm';

interface PipelineListViewProps {
  leadsByStage: Record<EstagioPipeline, LeadPipeline[]>;
  onViewLead: (lead: LeadPipeline) => void;
  onQuickAction: (lead: LeadPipeline, action: 'whatsapp' | 'email' | 'call') => void;
}

export function PipelineListView({ leadsByStage, onViewLead, onQuickAction }: PipelineListViewProps) {
  return (
    <div className="space-y-6 flex-1 overflow-auto">
      {PIPELINE_COLUMNS.map((column) => {
        const leads = leadsByStage[column.id] || [];
        if (leads.length === 0) return null;

        return (
          <div key={column.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{column.icone}</span>
              <h3 className="font-semibold text-sm">{column.titulo}</h3>
              <Badge variant="secondary" className="text-xs">{leads.length}</Badge>
            </div>

            <div className="space-y-2">
              {leads.map((lead) => (
                <Card key={lead.id} className="p-3">
                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge className={`${column.cor} text-foreground border-0 shrink-0`}>
                      {column.titulo}
                    </Badge>

                    <span className="font-medium text-sm min-w-[120px]">{lead.nome}</span>

                    <span className="text-sm text-muted-foreground truncate max-w-[180px]">
                      {lead.imovel?.titulo || '—'}
                    </span>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {lead.telefone && (
                        <a href={`tel:${lead.telefone}`} className="hover:text-foreground">{lead.telefone}</a>
                      )}
                      <span className="hidden sm:inline">·</span>
                      <a href={`mailto:${lead.email}`} className="hover:text-foreground hidden sm:inline truncate max-w-[160px]">
                        {lead.email}
                      </a>
                    </div>

                    <span className={`text-sm font-medium ${getScoreColor(lead.score_qualificacao)}`}>
                      {getScoreIcon(lead.score_qualificacao)} {lead.score_qualificacao}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(lead.ultimo_contato)}
                    </span>

                    <div className="flex items-center gap-1 ml-auto">
                      {lead.telefone && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onQuickAction(lead, 'whatsapp')}>
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onQuickAction(lead, 'call')}>
                            <Phone className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onQuickAction(lead, 'email')}>
                        <Mail className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onViewLead(lead)}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> Detalhes
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
