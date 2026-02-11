import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, Download, Send, Eye, Star, MapPin, User, Calendar,
  Search, AlertCircle, RefreshCw, TrendingUp, ThumbsUp, Clock, Receipt
} from 'lucide-react';
import { PropostasTab } from '@/components/propostas/PropostasTab';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { FeedbackStatus, FeedbackWithDetails } from '@/types/feedback';
import { INTERESSE_LABELS, QUALIFICACAO_LABELS } from '@/types/feedback';

export default function FeedbacksPage() {
  const { imobiliaria } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<FeedbackStatus | 'all' | 'propostas'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImovel, setSelectedImovel] = useState<string>('all');
  const [viewModal, setViewModal] = useState<{ open: boolean; feedback: FeedbackWithDetails | null }>({ open: false, feedback: null });

  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['feedbacks-imobiliaria', imobiliaria?.id],
    queryFn: async () => {
      if (!imobiliaria?.id) return [];
      
      const { data, error } = await supabase
        .from('feedbacks_visitas')
        .select(`
          *,
          imovel:imoveis(titulo, endereco, bairro, cidade, valor)
        `)
        .eq('imobiliaria_id', imobiliaria.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as unknown) as FeedbackWithDetails[];
    },
    enabled: !!imobiliaria?.id,
  });

  const { data: imoveis } = useQuery({
    queryKey: ['imoveis-filter-feedback', imobiliaria?.id],
    queryFn: async () => {
      if (!imobiliaria?.id) return [];
      
      const { data } = await supabase
        .from('imobiliaria_imovel_access')
        .select('imovel:imoveis(id, titulo)')
        .eq('imobiliaria_id', imobiliaria.id)
        .eq('status', 'active');

      return data?.map(d => d.imovel).filter(Boolean) || [];
    },
    enabled: !!imobiliaria?.id,
  });

  const resendMutation = useMutation({
    mutationFn: async (feedback: FeedbackWithDetails) => {
      const { error } = await supabase.functions.invoke('send-feedback-request', {
        body: {
          feedbackId: feedback.id,
          clienteNome: feedback.cliente_nome,
          clienteEmail: feedback.cliente_email,
          imovelTitulo: feedback.imovel?.titulo || 'Imóvel',
          token: feedback.token_acesso_cliente,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Link reenviado!', description: 'O cliente receberá um novo e-mail.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível reenviar o link.', variant: 'destructive' });
    },
  });

  // Filter logic
  const filteredFeedbacks = feedbacks?.filter(f => {
    const matchesTab = activeTab === 'all' || f.status === activeTab;
    const matchesSearch = f.cliente_nome.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesImovel = selectedImovel === 'all' || f.imovel_id === selectedImovel;
    return matchesTab && matchesSearch && matchesImovel;
  }) || [];

  const counts = {
    aguardando_corretor: feedbacks?.filter(f => f.status === 'aguardando_corretor').length || 0,
    aguardando_cliente: feedbacks?.filter(f => f.status === 'aguardando_cliente').length || 0,
    completo: feedbacks?.filter(f => f.status === 'completo').length || 0,
    arquivado: feedbacks?.filter(f => f.status === 'arquivado').length || 0,
  };

  // Analytics
  const completeFeedbacks = feedbacks?.filter(f => f.status === 'completo') || [];
  const avgNPS = completeFeedbacks.length > 0
    ? (completeFeedbacks.reduce((acc, f) => acc + (f.nps_cliente || 0), 0) / completeFeedbacks.length).toFixed(1)
    : '0';
  const muitoInteressados = completeFeedbacks.filter(f => f.interesse_compra === 'muito_interessado').length;
  const interessadosPercent = completeFeedbacks.length > 0
    ? Math.round((muitoInteressados / completeFeedbacks.length) * 100)
    : 0;

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const StatusBadge = ({ status }: { status: FeedbackStatus }) => {
    const config = {
      aguardando_corretor: { label: '⏳ Aguardando Corretor', className: 'border-yellow-500 text-yellow-700 bg-yellow-50' },
      aguardando_cliente: { label: '⏰ Aguardando Cliente', className: 'border-orange-500 text-orange-700 bg-orange-50' },
      completo: { label: '✅ Completo', className: 'border-green-500 text-green-700 bg-green-50' },
      arquivado: { label: '📦 Arquivado', className: 'border-gray-500 text-gray-700 bg-gray-50' },
    };
    const { label, className } = config[status];
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const StarDisplay = ({ rating }: { rating: number | null }) => {
    if (!rating) return <span className="text-muted-foreground">-</span>;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star 
            key={i} 
            className={`h-3 w-3 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  const FeedbackCard = ({ feedback }: { feedback: FeedbackWithDetails }) => (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <StatusBadge status={feedback.status} />
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
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {feedback.status === 'aguardando_corretor' && (
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              Visita realizada {formatDistanceToNow(new Date(feedback.data_visita), { locale: ptBR, addSuffix: true })}
            </p>
          </div>
        )}

        {feedback.status === 'aguardando_cliente' && (
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800">
              Seu feedback foi enviado. Aguardando cliente responder.
            </p>
            <p className="text-xs text-orange-600 mt-1">
              Link enviado {feedback.feedback_corretor_em && formatDistanceToNow(new Date(feedback.feedback_corretor_em), { locale: ptBR, addSuffix: true })}
            </p>
          </div>
        )}

        {feedback.status === 'completo' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">NPS:</span>
              <span className="font-bold text-lg">{feedback.nps_cliente}/10</span>
            </div>
            {feedback.interesse_compra && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Interesse:</span>
                <span className={`text-sm font-medium ${INTERESSE_LABELS[feedback.interesse_compra]?.color || ''}`}>
                  {INTERESSE_LABELS[feedback.interesse_compra]?.label.split(' - ')[0]}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avaliação média:</span>
              <StarDisplay rating={Math.round(
                ((feedback.avaliacao_localizacao || 0) + 
                (feedback.avaliacao_acabamento || 0) + 
                (feedback.avaliacao_layout || 0) + 
                (feedback.avaliacao_custo_beneficio || 0) + 
                (feedback.avaliacao_atendimento || 0)) / 5
              )} />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 flex-wrap">
        {feedback.status === 'aguardando_corretor' && (
          <Button size="sm" asChild className="flex-1">
            <Link to={`/dashboard/imobiliaria/feedback/${feedback.id}`}>
              <FileText className="mr-1 h-3 w-3" />
              Completar Feedback
            </Link>
          </Button>
        )}

        {feedback.status === 'aguardando_cliente' && (
          <>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => resendMutation.mutate(feedback)}
              disabled={resendMutation.isPending}
              className="flex-1"
            >
              <RefreshCw className={`mr-1 h-3 w-3 ${resendMutation.isPending ? 'animate-spin' : ''}`} />
              Reenviar Link
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setViewModal({ open: true, feedback })}
            >
              <Eye className="h-3 w-3" />
            </Button>
          </>
        )}

        {feedback.status === 'completo' && (
          <>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setViewModal({ open: true, feedback })}
              className="flex-1"
            >
              <Eye className="mr-1 h-3 w-3" />
              Ver Relatório
            </Button>
            {feedback.pdf_url && (
              <Button 
                size="sm" 
                variant="ghost"
                asChild
              >
                <a href={feedback.pdf_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3 w-3" />
                </a>
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <DashboardLayout title="Feedbacks de Visitas">
      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NPS Médio</p>
                <p className="text-2xl font-bold">{avgNPS}/10</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Muito Interessados</p>
                <p className="text-2xl font-bold">{interessadosPercent}%</p>
              </div>
              <ThumbsUp className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Feedbacks</p>
                <p className="text-2xl font-bold">{completeFeedbacks.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Corretor */}
      {(() => {
        const corretorMap: Record<string, { count: number; totalNPS: number }> = {};
        completeFeedbacks.forEach(f => {
          const nome = f.corretor_nome || 'Não informado';
          if (!corretorMap[nome]) corretorMap[nome] = { count: 0, totalNPS: 0 };
          corretorMap[nome].count++;
          corretorMap[nome].totalNPS += f.nps_cliente || 0;
        });
        const corretorData = Object.entries(corretorMap)
          .map(([nome, { count, totalNPS }]) => ({ nome, count, avgNPS: count > 0 ? totalNPS / count : 0 }))
          .sort((a, b) => b.count - a.count);

        if (corretorData.length === 0) return null;

        return (
          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">Performance por Corretor</h3>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-muted-foreground">Corretor</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Feedbacks</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">NPS Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {corretorData.map(c => (
                      <tr key={c.nome} className="border-b last:border-0">
                        <td className="py-2">{c.nome}</td>
                        <td className="py-2 text-right">{c.count}</td>
                        <td className="py-2 text-right font-bold">{c.avgNPS.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })()}

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
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FeedbackStatus | 'all' | 'propostas')}>
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="aguardando_corretor" className="gap-1">
            Aguardando Corretor
            {counts.aguardando_corretor > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">{counts.aguardando_corretor}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="aguardando_cliente" className="gap-1">
            Aguardando Cliente
            {counts.aguardando_cliente > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">{counts.aguardando_cliente}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completo" className="gap-1">
            Completos
            {counts.completo > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">{counts.completo}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="propostas" className="gap-1">
            <Receipt className="h-4 w-4" />
            Propostas
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-32 mb-4" />
                  <Skeleton className="h-16 w-full mb-4" />
                  <Skeleton className="h-9 w-full" />
                </Card>
              ))}
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || selectedImovel !== 'all' 
                  ? 'Nenhum feedback encontrado com os filtros aplicados.'
                  : 'Nenhum feedback disponível ainda. Realize visitas para gerar feedbacks.'
                }
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFeedbacks.map(feedback => (
                <FeedbackCard key={feedback.id} feedback={feedback} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Propostas Tab */}
        <TabsContent value="propostas" className="mt-0">
          <PropostasTab
            entityId={imobiliaria?.id}
            entityType="imobiliaria"
            imoveis={imoveis?.map((im: any) => ({ id: im.id, titulo: im.titulo })) || []}
          />
        </TabsContent>
      </Tabs>

      {/* View Modal */}
      <Dialog open={viewModal.open} onOpenChange={(open) => !open && setViewModal({ open: false, feedback: null })}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Relatório de Feedback</DialogTitle>
          </DialogHeader>
          {viewModal.feedback && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold">{viewModal.feedback.imovel?.titulo}</h3>
                <p className="text-sm text-muted-foreground">
                  Visita em {formatDate(viewModal.feedback.data_visita)} • Cliente: {viewModal.feedback.cliente_nome}
                </p>
              </div>

              {/* Client Evaluation */}
              {viewModal.feedback.nps_cliente !== null && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Avaliação do Cliente
                  </h4>
                  <div className="grid gap-3">
                    <div className="flex justify-between items-center">
                      <span>NPS</span>
                      <span className="font-bold text-lg">{viewModal.feedback.nps_cliente}/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Localização</span>
                      <StarDisplay rating={viewModal.feedback.avaliacao_localizacao} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Acabamento</span>
                      <StarDisplay rating={viewModal.feedback.avaliacao_acabamento} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Layout</span>
                      <StarDisplay rating={viewModal.feedback.avaliacao_layout} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Custo-Benefício</span>
                      <StarDisplay rating={viewModal.feedback.avaliacao_custo_beneficio} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Atendimento</span>
                      <StarDisplay rating={viewModal.feedback.avaliacao_atendimento} />
                    </div>
                    {viewModal.feedback.interesse_compra && (
                      <div className="flex justify-between items-center">
                        <span>Interesse</span>
                        <span className={INTERESSE_LABELS[viewModal.feedback.interesse_compra]?.color}>
                          {INTERESSE_LABELS[viewModal.feedback.interesse_compra]?.label}
                        </span>
                      </div>
                    )}
                    {viewModal.feedback.pontos_positivos && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Pontos positivos:</p>
                        <p className="text-sm text-muted-foreground">{viewModal.feedback.pontos_positivos}</p>
                      </div>
                    )}
                    {viewModal.feedback.pontos_negativos && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Pontos negativos:</p>
                        <p className="text-sm text-muted-foreground">{viewModal.feedback.pontos_negativos}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Broker Evaluation */}
              {viewModal.feedback.qualificacao_lead && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Avaliação do Corretor
                  </h4>
                  <div className="grid gap-3">
                    <div className="flex justify-between items-center">
                      <span>Qualificação</span>
                      <Badge className={QUALIFICACAO_LABELS[viewModal.feedback.qualificacao_lead]?.color}>
                        {QUALIFICACAO_LABELS[viewModal.feedback.qualificacao_lead]?.label}
                      </Badge>
                    </div>
                    {viewModal.feedback.prazo_compra && (
                      <div className="flex justify-between items-center">
                        <span>Prazo de compra</span>
                        <span className="font-medium">{viewModal.feedback.prazo_compra.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                    {viewModal.feedback.orcamento_disponivel && (
                      <div className="flex justify-between items-center">
                        <span>Orçamento</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(viewModal.feedback.orcamento_disponivel)}
                        </span>
                      </div>
                    )}
                    {viewModal.feedback.observacoes_corretor && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Observações:</p>
                        <p className="text-sm text-muted-foreground">{viewModal.feedback.observacoes_corretor}</p>
                      </div>
                    )}
                    {viewModal.feedback.proximos_passos && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Próximos passos:</p>
                        <p className="text-sm text-muted-foreground">{viewModal.feedback.proximos_passos}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Signatures */}
              {(viewModal.feedback.assinatura_corretor || viewModal.feedback.assinatura_cliente) && (
                <div>
                  <h4 className="font-semibold mb-3">Assinaturas Digitais</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {viewModal.feedback.assinatura_corretor && (
                      <div className="border rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-2">Corretor</p>
                        <img 
                          src={viewModal.feedback.assinatura_corretor} 
                          alt="Assinatura do corretor" 
                          className="max-h-20 mx-auto"
                        />
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          {viewModal.feedback.assinatura_corretor_data && formatDate(viewModal.feedback.assinatura_corretor_data)}
                        </p>
                      </div>
                    )}
                    {viewModal.feedback.assinatura_cliente && (
                      <div className="border rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-2">Cliente</p>
                        <img 
                          src={viewModal.feedback.assinatura_cliente} 
                          alt="Assinatura do cliente" 
                          className="max-h-20 mx-auto"
                        />
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          {viewModal.feedback.assinatura_cliente_data && formatDate(viewModal.feedback.assinatura_cliente_data)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                {viewModal.feedback.pdf_url && (
                  <Button asChild>
                    <a href={viewModal.feedback.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Baixar PDF
                    </a>
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
