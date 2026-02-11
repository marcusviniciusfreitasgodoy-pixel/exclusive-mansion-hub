import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KPICard } from '@/components/analytics/KPICard';
import {
  Calendar, Phone, MapPin, User, Search, AlertCircle, Building2,
  CalendarCheck, Clock, TrendingUp, CheckCircle, XCircle, Star,
  MessageSquare, BarChart3, Trophy, FileText
} from 'lucide-react';
import { format, formatDistanceToNow, subMonths, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { AgendamentoStatus } from '@/types/agendamento';

interface AgendamentoWithDetails {
  id: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone: string;
  opcao_data_1: string;
  opcao_data_2: string;
  data_confirmada: string | null;
  status: AgendamentoStatus;
  corretor_nome: string | null;
  corretor_email: string | null;
  created_at: string;
  realizado_em: string | null;
  imovel?: { id: string; titulo: string };
  imobiliaria?: { id: string; nome_empresa: string };
}

export default function AgendamentosConstrutora() {
  const { construtora } = useAuth();
  const [mainTab, setMainTab] = useState('dashboard');
  const [statusFilter, setStatusFilter] = useState<AgendamentoStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImovel, setSelectedImovel] = useState<string>('all');
  const [selectedImobiliaria, setSelectedImobiliaria] = useState<string>('all');

  // Fetch agendamentos
  const { data: agendamentos = [], isLoading } = useQuery({
    queryKey: ['agendamentos-construtora', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id) return [];
      const { data, error } = await supabase
        .from('agendamentos_visitas')
        .select(`*, imovel:imoveis(id, titulo), imobiliaria:imobiliarias(id, nome_empresa)`)
        .eq('construtora_id', construtora.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AgendamentoWithDetails[];
    },
    enabled: !!construtora?.id,
  });

  // Fetch feedbacks
  const { data: feedbacks = [] } = useQuery({
    queryKey: ['feedbacks-construtora', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id) return [];
      const { data, error } = await supabase
        .from('feedbacks_visitas')
        .select(`*, imovel:imoveis(id, titulo), imobiliaria:imobiliarias(id, nome_empresa)`)
        .eq('construtora_id', construtora.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!construtora?.id,
  });

  // Fetch imoveis for filter
  const { data: imoveis = [] } = useQuery({
    queryKey: ['imoveis-construtora-filter', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id) return [];
      const { data } = await supabase.from('imoveis').select('id, titulo').eq('construtora_id', construtora.id);
      return data || [];
    },
    enabled: !!construtora?.id,
  });

  // Unique imobiliarias
  const imobiliarias = useMemo(() =>
    Array.from(new Map(agendamentos.filter(a => a.imobiliaria).map(a => [a.imobiliaria!.id, a.imobiliaria!])).values()),
    [agendamentos]
  );

  // === KPI Calculations ===
  const counts = useMemo(() => ({
    agendadas: agendamentos.filter(a => a.status === 'pendente' || a.status === 'confirmado').length,
    realizadas: agendamentos.filter(a => a.status === 'realizado').length,
    canceladas: agendamentos.filter(a => a.status === 'cancelado').length,
  }), [agendamentos]);

  const now = new Date();
  const realizadasEsteMes = agendamentos.filter(a => a.status === 'realizado' && a.realizado_em && isSameMonth(new Date(a.realizado_em), now)).length;
  const realizadasMesAnterior = agendamentos.filter(a => a.status === 'realizado' && a.realizado_em && isSameMonth(new Date(a.realizado_em), subMonths(now, 1))).length;
  const trendRealizadas = realizadasMesAnterior > 0 ? Math.round(((realizadasEsteMes - realizadasMesAnterior) / realizadasMesAnterior) * 100) : 0;

  const feedbacksCompletos = feedbacks.filter((f: any) => f.status === 'completo');
  const feedbacksComInteresse = feedbacksCompletos.filter((f: any) =>
    f.interesse_compra === 'muito_interessado' || f.interesse_compra === 'interessado'
  );
  const conversao = counts.realizadas > 0 ? Math.round((feedbacksComInteresse.length / counts.realizadas) * 100) : 0;

  const npsValues = feedbacksCompletos.filter((f: any) => f.nps_cliente != null).map((f: any) => f.nps_cliente);
  const avaliacaoMedia = npsValues.length > 0 ? (npsValues.reduce((a: number, b: number) => a + b, 0) / npsValues.length).toFixed(1) : '0.0';

  // === Monthly evolution (last 6 months) ===
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      const agendados = agendamentos.filter(a => {
        const d = new Date(a.created_at);
        return d >= start && d <= end;
      }).length;
      const realizados = agendamentos.filter(a => {
        if (a.status !== 'realizado' || !a.realizado_em) return false;
        const d = new Date(a.realizado_em);
        return d >= start && d <= end;
      }).length;
      months.push({
        mes: format(month, 'MMM/yy', { locale: ptBR }),
        Agendadas: agendados,
        Realizadas: realizados,
      });
    }
    return months;
  }, [agendamentos]);

  // === Ranking de Corretores ===
  const corretorRanking = useMemo(() => {
    const map = new Map<string, { nome: string; visitas: number; realizadas: number; notas: number[] }>();
    agendamentos.forEach(a => {
      const nome = a.corretor_nome || 'Sem corretor';
      if (!map.has(nome)) map.set(nome, { nome, visitas: 0, realizadas: 0, notas: [] });
      const entry = map.get(nome)!;
      entry.visitas++;
      if (a.status === 'realizado') entry.realizadas++;
    });
    feedbacks.forEach((f: any) => {
      const nome = f.corretor_nome || 'Sem corretor';
      if (f.nps_cliente != null && map.has(nome)) {
        map.get(nome)!.notas.push(f.nps_cliente);
      }
    });
    return Array.from(map.values())
      .filter(c => c.nome !== 'Sem corretor')
      .sort((a, b) => b.visitas - a.visitas);
  }, [agendamentos, feedbacks]);

  // === Ranking de Imobiliárias ===
  const imobiliariaRanking = useMemo(() => {
    const map = new Map<string, { nome: string; visitas: number; realizadas: number; notas: number[] }>();
    agendamentos.forEach(a => {
      const nome = a.imobiliaria?.nome_empresa;
      if (!nome) return;
      if (!map.has(nome)) map.set(nome, { nome, visitas: 0, realizadas: 0, notas: [] });
      const entry = map.get(nome)!;
      entry.visitas++;
      if (a.status === 'realizado') entry.realizadas++;
    });
    feedbacks.forEach((f: any) => {
      const nome = f.imobiliaria?.nome_empresa;
      if (nome && f.nps_cliente != null && map.has(nome)) {
        map.get(nome)!.notas.push(f.nps_cliente);
      }
    });
    return Array.from(map.values()).sort((a, b) => b.visitas - a.visitas);
  }, [agendamentos, feedbacks]);

  // === Filtered agendamentos ===
  const filteredAgendamentos = agendamentos.filter(a => {
    const matchesTab = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch = a.cliente_nome.toLowerCase().includes(searchQuery.toLowerCase()) || a.cliente_telefone.includes(searchQuery);
    const matchesImovel = selectedImovel === 'all' || a.imovel?.id === selectedImovel;
    const matchesImobiliaria = selectedImobiliaria === 'all' || a.imobiliaria?.id === selectedImobiliaria;
    return matchesTab && matchesSearch && matchesImovel && matchesImobiliaria;
  });

  // === Fichas pendentes ===
  const fichasPendentes = feedbacks.filter((f: any) => f.status === 'aguardando_corretor' || f.status === 'aguardando_cliente');

  const statusCounts = {
    pendente: agendamentos.filter(a => a.status === 'pendente').length,
    confirmado: agendamentos.filter(a => a.status === 'confirmado').length,
    realizado: agendamentos.filter(a => a.status === 'realizado').length,
    cancelado: agendamentos.filter(a => a.status === 'cancelado').length,
  };

  const formatDateTime = (date: string) => format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  const StatusBadge = ({ status }: { status: AgendamentoStatus }) => {
    const config: Record<string, { label: string; className: string }> = {
      pendente: { label: '⏰ Pendente', className: 'border-yellow-500 text-yellow-700 bg-yellow-50' },
      confirmado: { label: '✅ Confirmado', className: 'border-green-500 text-green-700 bg-green-50' },
      realizado: { label: '🎯 Realizado', className: 'border-blue-500 text-blue-700 bg-blue-50' },
      cancelado: { label: '❌ Cancelado', className: 'border-red-500 text-red-700 bg-red-50' },
      remarcado: { label: '🔄 Remarcado', className: 'border-purple-500 text-purple-700 bg-purple-50' },
    };
    const { label, className } = config[status] || config.pendente;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const PositionBadge = ({ pos }: { pos: number }) => {
    const colors = ['bg-yellow-400 text-yellow-900', 'bg-gray-300 text-gray-800', 'bg-amber-600 text-white'];
    return (
      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${pos <= 3 ? colors[pos - 1] : 'bg-muted text-muted-foreground'}`}>
        {pos}º
      </span>
    );
  };

  const avgRating = (notas: number[]) => notas.length > 0 ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1) : '—';

  const InteresseLabel = ({ value }: { value: string | null }) => {
    const map: Record<string, { label: string; color: string }> = {
      muito_interessado: { label: 'Muito Interessado', color: 'bg-green-100 text-green-800' },
      interessado: { label: 'Interessado', color: 'bg-blue-100 text-blue-800' },
      neutro: { label: 'Neutro', color: 'bg-gray-100 text-gray-800' },
      pouco_interessado: { label: 'Pouco Interessado', color: 'bg-yellow-100 text-yellow-800' },
      nao_interessado: { label: 'Não Interessado', color: 'bg-red-100 text-red-800' },
    };
    const item = value ? map[value] : null;
    if (!item) return <span className="text-muted-foreground text-xs">—</span>;
    return <Badge className={item.color}>{item.label}</Badge>;
  };

  return (
    <DashboardLayout title="Dashboard de Visitas">
      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6">
        <KPICard title="AGENDADAS" value={counts.agendadas} subtitle="aguardando" icon={Calendar} />
        <KPICard title="REALIZADAS" value={counts.realizadas} icon={CheckCircle}
          trend={{ value: trendRealizadas, label: 'vs mês ant.', isPositive: trendRealizadas >= 0 }}
        />
        <KPICard title="CANCELADAS" value={counts.canceladas} subtitle="total" icon={XCircle} />
        <KPICard title="CONVERSÃO" value={`${conversao}%`} subtitle="compraria o imóvel" icon={TrendingUp} />
        <KPICard title="AVALIAÇÃO" value={`${avaliacaoMedia}/5`} subtitle="média geral" icon={Star} />
        <KPICard title="FEEDBACKS" value={feedbacks.length} subtitle="recebidos" icon={MessageSquare} />
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="dashboard" className="gap-1.5"><BarChart3 className="h-4 w-4" /> Dashboard</TabsTrigger>
          <TabsTrigger value="agendamentos" className="gap-1.5"><Calendar className="h-4 w-4" /> Agendamentos</TabsTrigger>
          <TabsTrigger value="fichas" className="gap-1.5">
            <FileText className="h-4 w-4" /> Fichas
            {fichasPendentes.length > 0 && <Badge variant="destructive" className="ml-1 h-5 px-1.5">{fichasPendentes.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="feedbacks" className="gap-1.5"><MessageSquare className="h-4 w-4" /> Feedbacks</TabsTrigger>
          <TabsTrigger value="ranking" className="gap-1.5"><Trophy className="h-4 w-4" /> Ranking</TabsTrigger>
        </TabsList>

        {/* ===== DASHBOARD TAB ===== */}
        <TabsContent value="dashboard">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Evolução Mensal */}
            <Card>
              <CardHeader><CardTitle className="text-base">Evolução Mensal de Visitas</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Agendadas" fill="hsl(0, 72%, 60%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Realizadas" fill="hsl(220, 60%, 35%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Ranking de Corretores */}
            <Card>
              <CardHeader><CardTitle className="text-base">Ranking de Corretores</CardTitle></CardHeader>
              <CardContent>
                {corretorRanking.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">Nenhum corretor registrado.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Corretor</TableHead>
                        <TableHead className="text-center">Visitas</TableHead>
                        <TableHead className="text-center">Realizadas</TableHead>
                        <TableHead className="text-center">Avaliação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {corretorRanking.slice(0, 10).map((c, i) => (
                        <TableRow key={c.nome}>
                          <TableCell><PositionBadge pos={i + 1} /></TableCell>
                          <TableCell className="font-medium">{c.nome}</TableCell>
                          <TableCell className="text-center">{c.visitas}</TableCell>
                          <TableCell className="text-center"><Badge variant="secondary">{c.realizadas}</Badge></TableCell>
                          <TableCell className="text-center">
                            <span className="flex items-center justify-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              {avgRating(c.notas)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== AGENDAMENTOS TAB ===== */}
        <TabsContent value="agendamentos">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou telefone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={selectedImovel} onValueChange={setSelectedImovel}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Imóvel" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os imóveis</SelectItem>
                {imoveis.map(im => <SelectItem key={im.id} value={im.id}>{im.titulo}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedImobiliaria} onValueChange={setSelectedImobiliaria}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Imobiliária" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas imobiliárias</SelectItem>
                {imobiliarias.map(im => <SelectItem key={im.id} value={im.id}>{im.nome_empresa}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Sub-tabs by status */}
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as AgendamentoStatus | 'all')}>
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pendente">Pendentes {statusCounts.pendente > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5">{statusCounts.pendente}</Badge>}</TabsTrigger>
              <TabsTrigger value="confirmado">Confirmados {statusCounts.confirmado > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5">{statusCounts.confirmado}</Badge>}</TabsTrigger>
              <TabsTrigger value="realizado">Realizados {statusCounts.realizado > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5">{statusCounts.realizado}</Badge>}</TabsTrigger>
              <TabsTrigger value="cancelado">Cancelados</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-0">
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map(i => <Card key={i} className="p-4"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-6 w-full mb-2" /><Skeleton className="h-20 w-full" /></Card>)}
                </div>
              ) : filteredAgendamentos.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAgendamentos.map(a => (
                    <Card key={a.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <StatusBadge status={a.status} />
                          <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { locale: ptBR, addSuffix: true })}</span>
                        </div>
                        <div className="mt-2">
                          <h3 className="font-semibold flex items-center gap-2"><User className="h-4 w-4" />{a.cliente_nome}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Phone className="h-3 w-3" />{a.cliente_telefone}</p>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm font-medium flex items-center gap-1 mb-2"><MapPin className="h-3 w-3 text-primary" />{a.imovel?.titulo}</p>
                        {a.imobiliaria && <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2"><Building2 className="h-3 w-3" />{a.imobiliaria.nome_empresa}</p>}
                        {a.corretor_nome && <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2"><User className="h-3 w-3" />{a.corretor_nome}</p>}
                        {a.data_confirmada && (
                          <div className="bg-muted p-2 rounded text-sm mt-2">
                            <p className="flex items-center gap-1"><CalendarCheck className="h-3 w-3" />{formatDateTime(a.data_confirmada)}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ===== FICHAS TAB ===== */}
        <TabsContent value="fichas">
          {fichasPendentes.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-muted-foreground">Todas as fichas estão preenchidas!</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {fichasPendentes.map((f: any) => (
                <Card key={f.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className={f.status === 'aguardando_corretor' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-blue-500 text-blue-700 bg-blue-50'}>
                        {f.status === 'aguardando_corretor' ? '🔶 Aguardando Corretor' : '🔷 Aguardando Cliente'}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mt-2 flex items-center gap-2"><User className="h-4 w-4" />{f.cliente_nome}</h3>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{(f as any).imovel?.titulo || '—'}</p>
                    <p className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" />{format(new Date(f.data_visita), 'dd/MM/yyyy', { locale: ptBR })}</p>
                    {f.corretor_nome && <p className="flex items-center gap-1 text-muted-foreground"><User className="h-3 w-3" />{f.corretor_nome}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== FEEDBACKS TAB ===== */}
        <TabsContent value="feedbacks">
          {feedbacksCompletos.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum feedback completo ainda.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {feedbacksCompletos.map((f: any) => (
                <Card key={f.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold flex items-center gap-2"><User className="h-4 w-4" />{f.cliente_nome}</h3>
                      {f.nps_cliente != null && (
                        <span className="flex items-center gap-1 text-sm font-medium">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          {f.nps_cliente}/5
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" />{(f as any).imovel?.titulo || '—'}</p>
                    <p className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" />{format(new Date(f.data_visita), 'dd/MM/yyyy', { locale: ptBR })}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Interesse:</span>
                      <InteresseLabel value={f.interesse_compra} />
                    </div>
                    {/* Avaliações por categoria */}
                    <div className="grid grid-cols-2 gap-1 pt-2 border-t text-xs">
                      {f.avaliacao_localizacao != null && <span>📍 Localização: {f.avaliacao_localizacao}/5</span>}
                      {f.avaliacao_acabamento != null && <span>🏗️ Acabamento: {f.avaliacao_acabamento}/5</span>}
                      {f.avaliacao_layout != null && <span>📐 Layout: {f.avaliacao_layout}/5</span>}
                      {f.avaliacao_custo_beneficio != null && <span>💰 Custo/Ben.: {f.avaliacao_custo_beneficio}/5</span>}
                      {f.avaliacao_atendimento != null && <span>🤝 Atendimento: {f.avaliacao_atendimento}/5</span>}
                    </div>
                    {f.pontos_positivos && <p className="text-xs text-green-700">✅ {f.pontos_positivos}</p>}
                    {f.pontos_negativos && <p className="text-xs text-red-700">❌ {f.pontos_negativos}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== RANKING TAB ===== */}
        <TabsContent value="ranking">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Ranking Corretores */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4" /> Ranking de Corretores</CardTitle></CardHeader>
              <CardContent>
                {corretorRanking.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">Nenhum corretor registrado.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Corretor</TableHead>
                        <TableHead className="text-center">Visitas</TableHead>
                        <TableHead className="text-center">Realizadas</TableHead>
                        <TableHead className="text-center">Taxa</TableHead>
                        <TableHead className="text-center">Avaliação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {corretorRanking.map((c, i) => (
                        <TableRow key={c.nome}>
                          <TableCell><PositionBadge pos={i + 1} /></TableCell>
                          <TableCell className="font-medium">{c.nome}</TableCell>
                          <TableCell className="text-center">{c.visitas}</TableCell>
                          <TableCell className="text-center"><Badge variant="secondary">{c.realizadas}</Badge></TableCell>
                          <TableCell className="text-center">{c.visitas > 0 ? Math.round((c.realizadas / c.visitas) * 100) : 0}%</TableCell>
                          <TableCell className="text-center">
                            <span className="flex items-center justify-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />{avgRating(c.notas)}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Ranking Imobiliárias */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> Ranking de Imobiliárias</CardTitle></CardHeader>
              <CardContent>
                {imobiliariaRanking.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">Nenhuma imobiliária registrada.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Imobiliária</TableHead>
                        <TableHead className="text-center">Visitas</TableHead>
                        <TableHead className="text-center">Realizadas</TableHead>
                        <TableHead className="text-center">NPS Médio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {imobiliariaRanking.map((im, i) => (
                        <TableRow key={im.nome}>
                          <TableCell><PositionBadge pos={i + 1} /></TableCell>
                          <TableCell className="font-medium">{im.nome}</TableCell>
                          <TableCell className="text-center">{im.visitas}</TableCell>
                          <TableCell className="text-center"><Badge variant="secondary">{im.realizadas}</Badge></TableCell>
                          <TableCell className="text-center">
                            <span className="flex items-center justify-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />{avgRating(im.notas)}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
