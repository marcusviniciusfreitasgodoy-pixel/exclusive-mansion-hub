import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, Download, Phone, Mail, MessageSquare, Building2, 
  MoreVertical, Copy, ExternalLink, Calendar, User, Clock,
  TrendingUp, Users, CheckCircle, XCircle, Eye
} from 'lucide-react';

type LeadStatus = 'novo' | 'contatado' | 'qualificado' | 'visita_agendada' | 'perdido';
type PeriodFilter = '7d' | '30d' | '90d' | 'all';

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  mensagem: string | null;
  origem: string;
  status: LeadStatus;
  created_at: string;
  imovel_id: string;
  imobiliaria_id: string | null;
  imoveis: {
    titulo: string;
    valor: number | null;
  } | null;
  imobiliarias: {
    nome_empresa: string;
  } | null;
}

const statusLabels: Record<LeadStatus, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  qualificado: 'Qualificado',
  visita_agendada: 'Visita Agendada',
  perdido: 'Perdido',
};

const statusColors: Record<LeadStatus, string> = {
  novo: 'bg-blue-100 text-blue-800',
  contatado: 'bg-yellow-100 text-yellow-800',
  qualificado: 'bg-green-100 text-green-800',
  visita_agendada: 'bg-purple-100 text-purple-800',
  perdido: 'bg-gray-100 text-gray-800',
};

export default function LeadsPage() {
  const { construtora } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [imovelFilter, setImovelFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Fetch imoveis for filter dropdown
  const { data: imoveis } = useQuery({
    queryKey: ['imoveis-filter', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id) return [];
      const { data, error } = await supabase
        .from('imoveis')
        .select('id, titulo')
        .eq('construtora_id', construtora.id)
        .order('titulo');
      if (error) throw error;
      return data;
    },
    enabled: !!construtora?.id,
  });

  // Fetch leads
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', construtora?.id, statusFilter, imovelFilter, periodFilter, page],
    queryFn: async () => {
      if (!construtora?.id) return { leads: [], total: 0 };

      // Get imobiliaria IDs from imoveis
      const { data: imoveisData } = await supabase
        .from('imoveis')
        .select('id')
        .eq('construtora_id', construtora.id);

      if (!imoveisData?.length) return { leads: [], total: 0 };

      const imovelIds = imoveisData.map(i => i.id);

      let query = supabase
        .from('leads')
        .select(`
          *,
          imoveis (titulo, valor),
          imobiliarias (nome_empresa)
        `, { count: 'exact' })
        .in('imovel_id', imovelFilter !== 'all' ? [imovelFilter] : imovelIds)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (periodFilter !== 'all') {
        const days = periodFilter === '7d' ? 7 : periodFilter === '30d' ? 30 : 90;
        const startDate = subDays(new Date(), days).toISOString();
        query = query.gte('created_at', startDate);
      }

      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      
      return { leads: data as Lead[], total: count || 0 };
    },
    enabled: !!construtora?.id,
  });

  // Fetch new leads count (last 24h)
  const { data: newLeadsCount } = useQuery({
    queryKey: ['new-leads-count', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id) return 0;

      const { data: imoveisData } = await supabase
        .from('imoveis')
        .select('id')
        .eq('construtora_id', construtora.id);

      if (!imoveisData?.length) return 0;

      const { count, error } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .in('imovel_id', imoveisData.map(i => i.id))
        .eq('status', 'novo')
        .gte('created_at', subDays(new Date(), 1).toISOString());

      if (error) throw error;
      return count || 0;
    },
    enabled: !!construtora?.id,
  });

  // Update lead status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: LeadStatus }) => {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['new-leads-count'] });
      toast({ title: 'Status atualizado', description: 'O status do lead foi atualizado com sucesso.' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  // Filter leads by search
  const filteredLeads = leadsData?.leads.filter(lead => {
    const searchLower = searchQuery.toLowerCase();
    return (
      lead.nome.toLowerCase().includes(searchLower) ||
      lead.email.toLowerCase().includes(searchLower) ||
      lead.telefone?.includes(searchQuery)
    );
  }) || [];

  // Export to CSV
  const exportCSV = () => {
    if (!filteredLeads.length) {
      toast({ title: 'Sem dados', description: 'Não há leads para exportar.', variant: 'destructive' });
      return;
    }

    const headers = ['Data', 'Nome', 'E-mail', 'Telefone', 'Imóvel', 'Imobiliária', 'Status', 'Origem', 'Mensagem'];
    const rows = filteredLeads.map(lead => [
      format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm'),
      lead.nome,
      lead.email,
      lead.telefone || '',
      lead.imoveis?.titulo || '',
      lead.imobiliarias?.nome_empresa || 'Direto',
      statusLabels[lead.status],
      lead.origem,
      (lead.mensagem || '').replace(/"/g, '""'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const filename = `leads_${construtora?.nome_empresa?.replace(/\s+/g, '_') || 'export'}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    toast({ title: 'Exportado!', description: `${filteredLeads.length} leads exportados para CSV.` });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!', description: `${label} copiado para a área de transferência.` });
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Olá ${name}! Recebemos seu contato e gostaríamos de agendar uma visita.`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const totalPages = Math.ceil((leadsData?.total || 0) / pageSize);

  return (
    <DashboardLayout title="Gestão de Leads">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Leads Recebidos</h2>
          {newLeadsCount && newLeadsCount > 0 && (
            <Badge className="bg-red-500 text-white">
              {newLeadsCount} novo{newLeadsCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | 'all')}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="contatado">Contatado</SelectItem>
                <SelectItem value="qualificado">Qualificado</SelectItem>
                <SelectItem value="visita_agendada">Visita Agendada</SelectItem>
                <SelectItem value="perdido">Perdido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={imovelFilter} onValueChange={setImovelFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Imóvel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Imóveis</SelectItem>
                {imoveis?.map(i => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.titulo.length > 25 ? i.titulo.substring(0, 25) + '...' : i.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card className="flex h-64 items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum lead encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Compartilhe os links dos imóveis para receber contatos
            </p>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Imóvel</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="font-medium">{lead.nome}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-[150px]">{lead.email}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(lead.email, 'E-mail')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.telefone ? (
                        <div className="flex items-center gap-1">
                          <span>{lead.telefone}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-green-600"
                            onClick={() => openWhatsApp(lead.telefone!, lead.nome)}
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {lead.imoveis?.titulo || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {lead.origem}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[lead.status]}>
                        {statusLabels[lead.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ leadId: lead.id, status: 'contatado' })}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como Contatado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ leadId: lead.id, status: 'visita_agendada' })}>
                              <Calendar className="mr-2 h-4 w-4" />
                              Agendar Visita
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ leadId: lead.id, status: 'qualificado' })}>
                              <TrendingUp className="mr-2 h-4 w-4" />
                              Marcar como Qualificado
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => updateStatusMutation.mutate({ leadId: lead.id, status: 'perdido' })}
                              className="text-destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Marcar como Perdido
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, leadsData?.total || 0)} de {leadsData?.total || 0} leads
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Lead Details Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {selectedLead?.nome}
            </DialogTitle>
            <DialogDescription>
              Lead recebido {selectedLead && formatDistanceToNow(new Date(selectedLead.created_at), { addSuffix: true, locale: ptBR })}
            </DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4">
              {/* Contact Info */}
              <div className="grid gap-3">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{selectedLead.email}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedLead.email, 'E-mail')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {selectedLead.telefone && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{selectedLead.telefone}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-green-600"
                      onClick={() => openWhatsApp(selectedLead.telefone!, selectedLead.nome)}
                    >
                      Abrir WhatsApp
                    </Button>
                  </div>
                )}
              </div>

              {/* Property */}
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Imóvel de Interesse</p>
                <p className="font-medium">{selectedLead.imoveis?.titulo}</p>
                {selectedLead.imoveis?.valor && (
                  <p className="text-sm text-muted-foreground">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedLead.imoveis.valor)}
                  </p>
                )}
              </div>

              {/* Message */}
              {selectedLead.mensagem && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Mensagem</p>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    {selectedLead.mensagem}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Origem</p>
                  <p className="capitalize">{selectedLead.origem}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={statusColors[selectedLead.status]}>
                    {statusLabels[selectedLead.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Imobiliária</p>
                  <p>{selectedLead.imobiliarias?.nome_empresa || 'Acesso Direto'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Recebido em</p>
                  <p>{format(new Date(selectedLead.created_at), "dd/MM/yyyy 'às' HH:mm")}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  className="flex-1 gap-2" 
                  onClick={() => window.location.href = `mailto:${selectedLead.email}`}
                >
                  <Mail className="h-4 w-4" />
                  Enviar E-mail
                </Button>
                {selectedLead.telefone && (
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2 text-green-600 border-green-600"
                    onClick={() => openWhatsApp(selectedLead.telefone!, selectedLead.nome)}
                  >
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
