import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Star, MapPin, User, Search, AlertCircle, Building2, Download,
  TrendingUp, ThumbsUp, FileText, BarChart3, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import type { FeedbackStatus, FeedbackWithDetails } from '@/types/feedback';
import { INTERESSE_LABELS, QUALIFICACAO_LABELS, OBJECOES_OPTIONS } from '@/types/feedback';

export default function FeedbacksConstrutora() {
  const { construtora } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImovel, setSelectedImovel] = useState<string>('all');
  const [selectedImobiliaria, setSelectedImobiliaria] = useState<string>('all');
  const [viewModal, setViewModal] = useState<{ open: boolean; feedback: FeedbackWithDetails | null }>({ open: false, feedback: null });

  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['feedbacks-construtora', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id) return [];
      
      const { data, error } = await supabase
        .from('feedbacks_visitas')
        .select(`
          *,
          imovel:imoveis(id, titulo, endereco, bairro, cidade, valor),
          imobiliaria:imobiliarias(id, nome_empresa, logo_url)
        `)
        .eq('construtora_id', construtora.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Cast to any to handle complex type mapping
      return data as any[];
    },
    enabled: !!construtora?.id,
  });

  const { data: imoveis } = useQuery({
    queryKey: ['imoveis-construtora-filter-fb', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id) return [];
      
      const { data } = await supabase
        .from('imoveis')
        .select('id, titulo')
        .eq('construtora_id', construtora.id);

      return data || [];
    },
    enabled: !!construtora?.id,
  });

  // Get unique imobiliarias
  const imobiliarias = Array.from(
    new Map(
      feedbacks
        ?.filter(f => f.imobiliaria)
        .map(f => [f.imobiliaria!.id, f.imobiliaria!])
    ).values()
  ) || [];

  // Completed feedbacks for analytics
  const completeFeedbacks = feedbacks?.filter(f => f.status === 'completo') || [];

  // Filter logic
  const filteredFeedbacks = feedbacks?.filter(f => {
    const matchesSearch = f.cliente_nome.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesImovel = selectedImovel === 'all' || f.imovel?.id === selectedImovel;
    const matchesImobiliaria = selectedImobiliaria === 'all' || f.imobiliaria?.id === selectedImobiliaria;
    return matchesSearch && matchesImovel && matchesImobiliaria;
  }) || [];

  // Analytics calculations
  const avgNPS = completeFeedbacks.length > 0
    ? (completeFeedbacks.reduce((acc, f) => acc + (f.nps_cliente || 0), 0) / completeFeedbacks.length).toFixed(1)
    : '0';

  const interesseData = [
    { name: '🔥 Muito Interessado', value: completeFeedbacks.filter(f => f.interesse_compra === 'muito_interessado').length, color: '#22c55e' },
    { name: '👍 Interessado', value: completeFeedbacks.filter(f => f.interesse_compra === 'interessado').length, color: '#3b82f6' },
    { name: '🤔 Pouco Interessado', value: completeFeedbacks.filter(f => f.interesse_compra === 'pouco_interessado').length, color: '#eab308' },
    { name: '❌ Sem Interesse', value: completeFeedbacks.filter(f => f.interesse_compra === 'sem_interesse').length, color: '#ef4444' },
  ];

  // NPS by property
  const npsByProperty = imoveis?.map(imovel => {
    const imovelFeedbacks = completeFeedbacks.filter(f => f.imovel?.id === imovel.id);
    const avgScore = imovelFeedbacks.length > 0
      ? imovelFeedbacks.reduce((acc, f) => acc + (f.nps_cliente || 0), 0) / imovelFeedbacks.length
      : 0;
    return {
      name: imovel.titulo.substring(0, 20) + (imovel.titulo.length > 20 ? '...' : ''),
      nps: parseFloat(avgScore.toFixed(1)),
      count: imovelFeedbacks.length,
    };
  }).filter(p => p.count > 0).sort((a, b) => b.nps - a.nps) || [];

  // Category averages
  const categoryAverages = {
    localizacao: completeFeedbacks.reduce((acc, f) => acc + (f.avaliacao_localizacao || 0), 0) / (completeFeedbacks.length || 1),
    acabamento: completeFeedbacks.reduce((acc, f) => acc + (f.avaliacao_acabamento || 0), 0) / (completeFeedbacks.length || 1),
    layout: completeFeedbacks.reduce((acc, f) => acc + (f.avaliacao_layout || 0), 0) / (completeFeedbacks.length || 1),
    custo_beneficio: completeFeedbacks.reduce((acc, f) => acc + (f.avaliacao_custo_beneficio || 0), 0) / (completeFeedbacks.length || 1),
    atendimento: completeFeedbacks.reduce((acc, f) => acc + (f.avaliacao_atendimento || 0), 0) / (completeFeedbacks.length || 1),
  };

  // Objections count
  const objectionsCounts: Record<string, number> = {};
  completeFeedbacks.forEach(f => {
    const objecoes = f.objecoes as string[] || [];
    objecoes.forEach(obj => {
      objectionsCounts[obj] = (objectionsCounts[obj] || 0) + 1;
    });
  });
  const objectionsData = Object.entries(objectionsCounts)
    .map(([key, count]) => ({
      name: OBJECOES_OPTIONS.find(o => o.value === key)?.label || key,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  // Imobiliaria performance
  const imobiliariaPerformance = imobiliarias.map(imob => {
    const imobFeedbacks = completeFeedbacks.filter(f => f.imobiliaria?.id === imob.id);
    const avgNps = imobFeedbacks.length > 0
      ? imobFeedbacks.reduce((acc, f) => acc + (f.nps_cliente || 0), 0) / imobFeedbacks.length
      : 0;
    return {
      ...imob,
      feedbackCount: imobFeedbacks.length,
      avgNps: parseFloat(avgNps.toFixed(1)),
    };
  }).sort((a, b) => b.feedbackCount - a.feedbackCount);

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Cliente', 'Imóvel', 'Imobiliária', 'NPS', 'Interesse', 'Localização', 'Acabamento', 'Layout', 'Custo-Benefício', 'Atendimento', 'Qualificação'];
    const rows = filteredFeedbacks
      .filter(f => f.status === 'completo')
      .map(f => [
        formatDate(f.data_visita),
        f.cliente_nome,
        f.imovel?.titulo || '',
        f.imobiliaria?.nome_empresa || '',
        f.nps_cliente || '',
        f.interesse_compra || '',
        f.avaliacao_localizacao || '',
        f.avaliacao_acabamento || '',
        f.avaliacao_layout || '',
        f.avaliacao_custo_beneficio || '',
        f.avaliacao_atendimento || '',
        f.qualificacao_lead || '',
      ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `feedbacks_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star 
          key={i} 
          className={`h-4 w-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );

  return (
    <DashboardLayout title="Feedbacks & Satisfação">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="analytics" className="gap-1">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-1">
              <FileText className="h-4 w-4" />
              Feedbacks ({completeFeedbacks.length})
            </TabsTrigger>
          </TabsList>
          
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-0 space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">NPS Médio</p>
                    <p className="text-3xl font-bold">{avgNPS}</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Muito Interessados</p>
                    <p className="text-3xl font-bold">
                      {completeFeedbacks.length > 0 
                        ? Math.round((interesseData[0].value / completeFeedbacks.length) * 100) 
                        : 0}%
                    </p>
                  </div>
                  <ThumbsUp className="h-10 w-10 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Feedbacks</p>
                    <p className="text-3xl font-bold">{completeFeedbacks.length}</p>
                  </div>
                  <FileText className="h-10 w-10 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Imobiliárias</p>
                    <p className="text-3xl font-bold">{imobiliarias.length}</p>
                  </div>
                  <Building2 className="h-10 w-10 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* NPS by Property */}
            {npsByProperty.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="font-semibold">NPS por Imóvel</h3>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={npsByProperty.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 10]} />
                      <YAxis type="category" dataKey="name" width={100} fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="nps" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Interest Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <h3 className="font-semibold">Taxa de Interesse</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={interesseData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {interesseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {interesseData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Ratings */}
            <Card>
              <CardHeader className="pb-2">
                <h3 className="font-semibold">Avaliações por Categoria</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Localização</span>
                    <StarDisplay rating={categoryAverages.localizacao} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Acabamento</span>
                    <StarDisplay rating={categoryAverages.acabamento} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Layout</span>
                    <StarDisplay rating={categoryAverages.layout} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Custo-Benefício</span>
                    <StarDisplay rating={categoryAverages.custo_beneficio} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Atendimento</span>
                    <StarDisplay rating={categoryAverages.atendimento} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Objections */}
            {objectionsData.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="font-semibold">Principais Objeções</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {objectionsData.slice(0, 5).map((obj, i) => (
                      <div key={obj.name} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                        <span className="flex-1 text-sm">{obj.name}</span>
                        <Badge variant="secondary">{obj.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Performance by Imobiliaria */}
          {imobiliariaPerformance.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <h3 className="font-semibold">Performance por Imobiliária</h3>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b">
                        <th className="pb-2">Imobiliária</th>
                        <th className="pb-2 text-center">Feedbacks</th>
                        <th className="pb-2 text-center">NPS Médio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {imobiliariaPerformance.map(imob => (
                        <tr key={imob.id} className="border-b last:border-0">
                          <td className="py-3">{imob.nome_empresa}</td>
                          <td className="py-3 text-center">{imob.feedbackCount}</td>
                          <td className="py-3 text-center font-bold">{imob.avgNps}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* List Tab */}
        <TabsContent value="list" className="mt-0">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome do cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedImovel} onValueChange={setSelectedImovel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Imóvel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os imóveis</SelectItem>
                {imoveis?.map((imovel) => (
                  <SelectItem key={imovel.id} value={imovel.id}>
                    {imovel.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedImobiliaria} onValueChange={setSelectedImobiliaria}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Imobiliária" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas imobiliárias</SelectItem>
                {imobiliarias.map((imob) => (
                  <SelectItem key={imob.id} value={imob.id}>
                    {imob.nome_empresa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-32 mb-4" />
                  <Skeleton className="h-16 w-full" />
                </Card>
              ))}
            </div>
          ) : filteredFeedbacks.filter(f => f.status === 'completo').length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum feedback completo encontrado.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFeedbacks.filter(f => f.status === 'completo').map(feedback => (
                <Card key={feedback.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                        ✅ Completo
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(feedback.data_visita)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {feedback.cliente_nome}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {feedback.imovel?.titulo}
                      </p>
                      {feedback.imobiliaria && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {feedback.imobiliaria.nome_empresa}
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">NPS:</span>
                        <span className="font-bold text-lg">{feedback.nps_cliente}/10</span>
                      </div>
                      {feedback.interesse_compra && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Interesse:</span>
                          <span className={`text-sm font-medium ${INTERESSE_LABELS[feedback.interesse_compra]?.color}`}>
                            {INTERESSE_LABELS[feedback.interesse_compra]?.label.split(' - ')[0]}
                          </span>
                        </div>
                      )}
                      {feedback.qualificacao_lead && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Qualificação:</span>
                          <Badge className={QUALIFICACAO_LABELS[feedback.qualificacao_lead]?.color}>
                            {QUALIFICACAO_LABELS[feedback.qualificacao_lead]?.label}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setViewModal({ open: true, feedback })}
                        className="flex-1"
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Ver Detalhes
                      </Button>
                      {feedback.pdf_url && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={feedback.pdf_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Modal */}
      <Dialog open={viewModal.open} onOpenChange={(open) => !open && setViewModal({ open: false, feedback: null })}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Feedback</DialogTitle>
          </DialogHeader>
          {viewModal.feedback && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold">{viewModal.feedback.imovel?.titulo}</h3>
                <p className="text-sm text-muted-foreground">
                  Visita em {formatDate(viewModal.feedback.data_visita)} • Cliente: {viewModal.feedback.cliente_nome}
                </p>
                {viewModal.feedback.imobiliaria && (
                  <p className="text-sm text-muted-foreground">
                    Imobiliária: {viewModal.feedback.imobiliaria.nome_empresa}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Avaliação do Cliente</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>NPS</span>
                      <span className="font-bold">{viewModal.feedback.nps_cliente}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Localização</span>
                      <span>{viewModal.feedback.avaliacao_localizacao}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Acabamento</span>
                      <span>{viewModal.feedback.avaliacao_acabamento}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Layout</span>
                      <span>{viewModal.feedback.avaliacao_layout}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Custo-Benefício</span>
                      <span>{viewModal.feedback.avaliacao_custo_beneficio}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Atendimento</span>
                      <span>{viewModal.feedback.avaliacao_atendimento}/5</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Avaliação do Corretor</h4>
                  <div className="space-y-2 text-sm">
                    {viewModal.feedback.qualificacao_lead && (
                      <div className="flex justify-between">
                        <span>Qualificação</span>
                        <Badge className={QUALIFICACAO_LABELS[viewModal.feedback.qualificacao_lead]?.color}>
                          {QUALIFICACAO_LABELS[viewModal.feedback.qualificacao_lead]?.label}
                        </Badge>
                      </div>
                    )}
                    {viewModal.feedback.prazo_compra && (
                      <div className="flex justify-between">
                        <span>Prazo</span>
                        <span>{viewModal.feedback.prazo_compra.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                    {viewModal.feedback.orcamento_disponivel && (
                      <div className="flex justify-between">
                        <span>Orçamento</span>
                        <span>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(viewModal.feedback.orcamento_disponivel)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {viewModal.feedback.pdf_url && (
                <div className="flex justify-end pt-4 border-t">
                  <Button asChild>
                    <a href={viewModal.feedback.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Baixar PDF
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
