import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
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
import { useToast } from '@/hooks/use-toast';
import { 
  Search, Download, Phone, MessageSquare, 
  MoreVertical, Copy, Calendar, Clock,
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
  score_qualificacao: number | null;
  imoveis: {
    titulo: string;
    valor: number | null;
    cidade: string | null;
    bairro: string | null;
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

const getScoreLabel = (score: number | null) => {
  if (!score || score === 0) return { label: 'Sem score', color: 'bg-muted text-muted-foreground' };
  if (score <= 25) return { label: '❄️ Frio', color: 'bg-blue-100 text-blue-800' };
  if (score <= 50) return { label: '🌤️ Morno', color: 'bg-yellow-100 text-yellow-800' };
  if (score <= 75) return { label: '🔥 Quente', color: 'bg-orange-100 text-orange-800' };
  return { label: '🔥🔥 Muito Quente', color: 'bg-red-100 text-red-800' };
};

export default function LeadsImobiliariaPage() {
  const { imobiliaria } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [imovelFilter, setImovelFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Fetch imoveis (only those with access)
  const { data: imoveis } = useQuery({
    queryKey: ['imoveis-imobiliaria-filter', imobiliaria?.id],
    queryFn: async () => {
      if (!imobiliaria?.id) return [];
      const { data, error } = await supabase
        .from('imobiliaria_imovel_access')
        .select(`
          imovel_id,
          imoveis (id, titulo)
        `)
        .eq('imobiliaria_id', imobiliaria.id)
        .eq('status', 'active');
      if (error) throw error;
      return data?.map(a => a.imoveis).filter(Boolean) || [];
    },
    enabled: !!imobiliaria?.id,
  });

  // Fetch leads
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads-imobiliaria', imobiliaria?.id, statusFilter, imovelFilter, periodFilter, page],
    queryFn: async () => {
      if (!imobiliaria?.id) return { leads: [], total: 0 };

      let query = supabase
        .from('leads')
        .select(`
          *,
          imoveis (titulo, valor, cidade, bairro)
        `, { count: 'exact' })
        .eq('imobiliaria_id', imobiliaria.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (imovelFilter !== 'all') {
        query = query.eq('imovel_id', imovelFilter);
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
    enabled: !!imobiliaria?.id,
  });

  // Fetch new leads count (last 24h)
  const { data: newLeadsCount } = useQuery({
    queryKey: ['new-leads-count-imobiliaria', imobiliaria?.id],
    queryFn: async () => {
      if (!imobiliaria?.id) return 0;

      const { count, error } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('imobiliaria_id', imobiliaria.id)
        .eq('status', 'novo')
        .gte('created_at', subDays(new Date(), 1).toISOString());

      if (error) throw error;
      return count || 0;
    },
    enabled: !!imobiliaria?.id,
  });

  // Fetch total leads and conversion
  const { data: stats } = useQuery({
    queryKey: ['leads-stats-imobiliaria', imobiliaria?.id],
    queryFn: async () => {
      if (!imobiliaria?.id) return { total: 0, converted: 0 };

      const { count: total } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('imobiliaria_id', imobiliaria.id);

      const { count: converted } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('imobiliaria_id', imobiliaria.id)
        .in('status', ['qualificado', 'visita_agendada']);

      return { total: total || 0, converted: converted || 0 };
    },
    enabled: !!imobiliaria?.id,
  });

  // Update lead status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: LeadStatus }) => {
      const { error } = await supabase
        .from('leads')
        .update({ status, ultimo_contato: new Date().toISOString() })
        .eq('id', leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-imobiliaria'] });
      queryClient.invalidateQueries({ queryKey: ['new-leads-count-imobiliaria'] });
      queryClient.invalidateQueries({ queryKey: ['leads-stats-imobiliaria'] });
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

    const headers = ['Data', 'Nome', 'E-mail', 'Telefone', 'Imóvel', 'Status', 'Origem', 'Score', 'Mensagem'];
    const rows = filteredLeads.map(lead => [
      format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm'),
      lead.nome,
      lead.email,
      lead.telefone || '',
      lead.imoveis?.titulo || '',
      statusLabels[lead.status],
      lead.origem,
      lead.score_qualificacao?.toString() || '0',
      (lead.mensagem || '').replace(/"/g, '""'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const filename = `leads_${imobiliaria?.nome_empresa?.replace(/\s+/g, '_') || 'export'}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
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
  const conversionRate = stats?.total ? ((stats.converted / stats.total) * 100).toFixed(1) : '0';

  return (
    <DashboardLayout title="Meus Leads">
      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Novos (24h)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{newLeadsCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

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
                {imoveis?.map((i: any) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.titulo?.length > 25 ? i.titulo.substring(0, 25) + '...' : i.titulo}
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
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => {
                  const scoreInfo = getScoreLabel(lead.score_qualificacao);
                  return (
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
                        <Badge className={scoreInfo.color}>{scoreInfo.label}</Badge>
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
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, leadsData?.total || 0)} de {leadsData?.total} leads
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Lead Detail Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
            <DialogDescription>Informações completas do contato</DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedLead.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={statusColors[selectedLead.status]}>
                    {statusLabels[selectedLead.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedLead.telefone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Origem</p>
                  <Badge variant="outline" className="capitalize">{selectedLead.origem}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Score</p>
                  <Badge className={getScoreLabel(selectedLead.score_qualificacao).color}>
                    {getScoreLabel(selectedLead.score_qualificacao).label}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Imóvel de Interesse</p>
                  <p className="font-medium">{selectedLead.imoveis?.titulo}</p>
                  {selectedLead.imoveis?.cidade && (
                    <p className="text-sm text-muted-foreground">
                      {selectedLead.imoveis.bairro}, {selectedLead.imoveis.cidade}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Data do Contato</p>
                  <p className="font-medium">
                    {format(new Date(selectedLead.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                {selectedLead.mensagem && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Mensagem</p>
                    <p className="mt-1 rounded-md bg-muted p-3 text-sm">{selectedLead.mensagem}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                {selectedLead.telefone && (
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2"
                    onClick={() => openWhatsApp(selectedLead.telefone!, selectedLead.nome)}
                  >
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={() => copyToClipboard(selectedLead.email, 'E-mail')}
                >
                  <Copy className="h-4 w-4" />
                  Copiar E-mail
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
