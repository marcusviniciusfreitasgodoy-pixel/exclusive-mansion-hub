import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Eye, Mail, Phone, MessageCircle } from 'lucide-react';
import {
  LeadPipeline, PIPELINE_COLUMNS, EstagioPipeline,
  formatTimeAgo, getScoreIcon, getScoreColor,
} from '@/types/crm';

interface PipelineTableViewProps {
  leads: LeadPipeline[];
  onViewLead: (lead: LeadPipeline) => void;
  onQuickAction: (lead: LeadPipeline, action: 'whatsapp' | 'email' | 'call') => void;
  onStageChange: (leadId: string, newStage: EstagioPipeline, oldStage: string) => void;
}

export function PipelineTableView({ leads, onViewLead, onQuickAction, onStageChange }: PipelineTableViewProps) {
  const getStageColumn = (stage: string) => PIPELINE_COLUMNS.find((c) => c.id === stage);

  return (
    <div className="flex-1 overflow-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden sm:table-cell">Telefone</TableHead>
            <TableHead className="hidden lg:table-cell">Imóvel</TableHead>
            <TableHead>Estágio</TableHead>
            <TableHead className="hidden sm:table-cell">Score</TableHead>
            <TableHead className="hidden lg:table-cell">Origem</TableHead>
            <TableHead className="hidden md:table-cell">Último Contato</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                Nenhum lead encontrado
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => {
              const stageCol = getStageColumn(lead.estagio_pipeline);
              return (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.nome}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <a href={`mailto:${lead.email}`} className="text-muted-foreground hover:text-foreground text-sm truncate block max-w-[180px]">
                      {lead.email}
                    </a>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {lead.telefone ? (
                      <a href={`tel:${lead.telefone}`} className="text-muted-foreground hover:text-foreground text-sm">
                        {lead.telefone}
                      </a>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground truncate max-w-[160px]">
                    {lead.imovel?.titulo || '—'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lead.estagio_pipeline}
                      onValueChange={(val) => onStageChange(lead.id, val as EstagioPipeline, lead.estagio_pipeline)}
                    >
                      <SelectTrigger className="h-7 w-[140px] text-xs">
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
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className={`text-sm font-medium ${getScoreColor(lead.score_qualificacao)}`}>
                      {getScoreIcon(lead.score_qualificacao)} {lead.score_qualificacao}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground capitalize">
                    {lead.origem || '—'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {formatTimeAgo(lead.ultimo_contato)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
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
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onViewLead(lead)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
