import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, Clock, Phone, Mail, MapPin, User, 
  CheckCircle, XCircle, Search, MessageSquare,
  CalendarCheck, AlertCircle
} from 'lucide-react';
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AgendamentoStatus } from '@/types/agendamento';

interface AgendamentoWithDetails {
  id: string;
  lead_id: string | null;
  imovel_id: string;
  imobiliaria_id: string | null;
  construtora_id: string;
  access_id: string | null;
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone: string;
  opcao_data_1: string;
  opcao_data_2: string;
  data_confirmada: string | null;
  status: AgendamentoStatus;
  calendly_event_url: string | null;
  calendly_event_id: string | null;
  observacoes: string | null;
  motivo_cancelamento: string | null;
  lembrete_24h_enviado: boolean;
  lembrete_1h_enviado: boolean;
  corretor_nome: string | null;
  corretor_email: string | null;
  created_at: string;
  updated_at: string;
  confirmado_em: string | null;
  realizado_em: string | null;
  cancelado_em: string | null;
  imovel?: {
    titulo: string;
    endereco: string | null;
    bairro: string | null;
    cidade: string | null;
  };
}

export default function AgendamentosPage() {
  const { imobiliaria } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<AgendamentoStatus | 'all'>('pendente');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImovel, setSelectedImovel] = useState<string>('all');
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; agendamento: AgendamentoWithDetails | null; opcao: 1 | 2 }>({ open: false, agendamento: null, opcao: 1 });
  const [cancelModal, setCancelModal] = useState<{ open: boolean; agendamento: AgendamentoWithDetails | null }>({ open: false, agendamento: null });
  const [realizeModal, setRealizeModal] = useState<{ open: boolean; agendamento: AgendamentoWithDetails | null }>({ open: false, agendamento: null });
  const [cancelReason, setCancelReason] = useState('');

  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ['agendamentos-imobiliaria', imobiliaria?.id],
    queryFn: async () => {
      if (!imobiliaria?.id) return [];
      
      const { data, error } = await supabase
        .from('agendamentos_visitas')
        .select(`
          *,
          imovel:imoveis(titulo, endereco, bairro, cidade)
        `)
        .eq('imobiliaria_id', imobiliaria.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AgendamentoWithDetails[];
    },
    enabled: !!imobiliaria?.id,
  });

  const { data: imoveis } = useQuery({
    queryKey: ['imoveis-filter', imobiliaria?.id],
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

  // Mutations
  const confirmMutation = useMutation({
    mutationFn: async ({ id, dataConfirmada }: { id: string; dataConfirmada: string }) => {
      const { error } = await supabase
        .from('agendamentos_visitas')
        .update({
          status: 'confirmado',
          data_confirmada: dataConfirmada,
          confirmado_em: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-imobiliaria'] });
      toast({ title: 'Visita confirmada!', description: 'O cliente receberá um e-mail de confirmação.' });
      setConfirmModal({ open: false, agendamento: null, opcao: 1 });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível confirmar a visita.', variant: 'destructive' });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo: string }) => {
      const { error } = await supabase
        .from('agendamentos_visitas')
        .update({
          status: 'cancelado',
          motivo_cancelamento: motivo,
          cancelado_em: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-imobiliaria'] });
      toast({ title: 'Agendamento cancelado', description: 'O cliente foi notificado.' });
      setCancelModal({ open: false, agendamento: null });
      setCancelReason('');
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível cancelar o agendamento.', variant: 'destructive' });
    },
  });

  const realizeMutation = useMutation({
    mutationFn: async (agendamento: AgendamentoWithDetails) => {
      // 1. Update agendamento status
      const { error: updateError } = await supabase
        .from('agendamentos_visitas')
        .update({
          status: 'realizado',
          realizado_em: new Date().toISOString(),
        })
        .eq('id', agendamento.id);
      
      if (updateError) throw updateError;

      // 2. Create feedback record with status: aguardando_cliente (CLIENT FIRST)
      const { data: feedback, error: feedbackError } = await supabase
        .from('feedbacks_visitas')
        .insert({
          agendamento_visita_id: agendamento.id,
          lead_id: agendamento.lead_id,
          imovel_id: agendamento.imovel_id,
          imobiliaria_id: agendamento.imobiliaria_id,
          construtora_id: agendamento.construtora_id,
          access_id: agendamento.access_id,
          data_visita: agendamento.data_confirmada || new Date().toISOString(),
          cliente_nome: agendamento.cliente_nome,
          cliente_email: agendamento.cliente_email,
          cliente_telefone: agendamento.cliente_telefone,
          corretor_nome: agendamento.corretor_nome,
          corretor_email: agendamento.corretor_email,
          status: 'aguardando_cliente', // CHANGED: Cliente responde primeiro
        })
        .select()
        .single();

      if (feedbackError) throw feedbackError;
      
      // 3. Send email to client immediately
      try {
        await supabase.functions.invoke('send-feedback-request', {
          body: {
            feedbackId: feedback.id,
            token: feedback.token_acesso_cliente,
            clienteNome: agendamento.cliente_nome,
            clienteEmail: agendamento.cliente_email,
            imovelTitulo: agendamento.imovel?.titulo || 'Imóvel',
          },
        });
      } catch (emailError) {
        console.warn('Erro ao enviar email para cliente:', emailError);
      }
      
      return feedback;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-imobiliaria'] });
      toast({ 
        title: 'Visita marcada como realizada!', 
        description: 'O cliente receberá um email para avaliar a visita. Você será notificado quando ele responder.' 
      });
      setRealizeModal({ open: false, agendamento: null });
      // CHANGED: Não redireciona mais para o formulário do corretor - aguarda cliente
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível marcar a visita como realizada.', variant: 'destructive' });
    },
  });

  // Filter logic
  const filteredAgendamentos = agendamentos?.filter(a => {
    const matchesTab = activeTab === 'all' || a.status === activeTab;
    const matchesSearch = a.cliente_nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.cliente_telefone.includes(searchQuery);
    const matchesImovel = selectedImovel === 'all' || a.imovel_id === selectedImovel;
    return matchesTab && matchesSearch && matchesImovel;
  }) || [];

  const counts = {
    pendente: agendamentos?.filter(a => a.status === 'pendente').length || 0,
    confirmado: agendamentos?.filter(a => a.status === 'confirmado').length || 0,
    realizado: agendamentos?.filter(a => a.status === 'realizado').length || 0,
    cancelado: agendamentos?.filter(a => a.status === 'cancelado').length || 0,
  };

  const formatDateTime = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getTimeLabel = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return 'Hoje';
    if (isTomorrow(d)) return 'Amanhã';
    if (isPast(d)) return 'Passado';
    return formatDistanceToNow(d, { locale: ptBR, addSuffix: true });
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${name}, tudo bem?`);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const StatusBadge = ({ status }: { status: AgendamentoStatus }) => {
    const config = {
      pendente: { label: '⏰ Pendente', variant: 'outline' as const, className: 'border-yellow-500 text-yellow-700 bg-yellow-50' },
      confirmado: { label: '✅ Confirmado', variant: 'outline' as const, className: 'border-green-500 text-green-700 bg-green-50' },
      realizado: { label: '🎯 Realizado', variant: 'outline' as const, className: 'border-blue-500 text-blue-700 bg-blue-50' },
      cancelado: { label: '❌ Cancelado', variant: 'outline' as const, className: 'border-red-500 text-red-700 bg-red-50' },
      remarcado: { label: '🔄 Remarcado', variant: 'outline' as const, className: 'border-purple-500 text-purple-700 bg-purple-50' },
    };
    const { label, className } = config[status];
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const AgendamentoCard = ({ agendamento }: { agendamento: AgendamentoWithDetails }) => (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <StatusBadge status={agendamento.status} />
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(agendamento.created_at), { locale: ptBR, addSuffix: true })}
          </span>
        </div>
        <div className="mt-2">
          <h3 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            {agendamento.cliente_nome}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Phone className="h-3 w-3" />
            {agendamento.cliente_telefone}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm font-medium flex items-center gap-1 mb-2">
          <MapPin className="h-3 w-3 text-primary" />
          {agendamento.imovel?.titulo}
        </p>

        {agendamento.status === 'pendente' && (
          <div className="space-y-2 bg-muted/50 p-3 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground">Opções propostas:</p>
            <div className="space-y-1 text-sm">
              <p className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span className="font-medium">Opção 1:</span> {formatDateTime(agendamento.opcao_data_1)}
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span className="font-medium">Opção 2:</span> {formatDateTime(agendamento.opcao_data_2)}
              </p>
            </div>
          </div>
        )}

        {agendamento.status === 'confirmado' && agendamento.data_confirmada && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-sm font-medium flex items-center gap-2 text-green-800">
              <CalendarCheck className="h-4 w-4" />
              {formatDateTime(agendamento.data_confirmada)}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {getTimeLabel(agendamento.data_confirmada)}
            </p>
            {agendamento.corretor_nome && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <User className="h-3 w-3" />
                Corretor: {agendamento.corretor_nome}
              </p>
            )}
          </div>
        )}

        {agendamento.status === 'realizado' && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-800">
              Realizado em {agendamento.realizado_em && formatDateTime(agendamento.realizado_em)}
            </p>
          </div>
        )}

        {agendamento.status === 'cancelado' && agendamento.motivo_cancelamento && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-xs text-red-600">
              Motivo: {agendamento.motivo_cancelamento}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 flex-wrap">
        {agendamento.status === 'pendente' && (
          <>
            <Button 
              size="sm" 
              onClick={() => setConfirmModal({ open: true, agendamento, opcao: 1 })}
              className="flex-1"
            >
              Confirmar Opção 1
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setConfirmModal({ open: true, agendamento, opcao: 2 })}
              className="flex-1"
            >
              Confirmar Opção 2
            </Button>
          </>
        )}

        {agendamento.status === 'confirmado' && (
          <>
            <Button 
              size="sm" 
              onClick={() => setRealizeModal({ open: true, agendamento })}
              className="flex-1"
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Marcar Realizada
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setCancelModal({ open: true, agendamento })}
            >
              <XCircle className="h-3 w-3" />
            </Button>
          </>
        )}

        <Button 
          size="sm" 
          variant="ghost"
          onClick={() => openWhatsApp(agendamento.cliente_telefone, agendamento.cliente_nome)}
        >
          <MessageSquare className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <DashboardLayout title="Agendamentos de Visitas">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou telefone..."
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
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AgendamentoStatus | 'all')}>
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="pendente" className="gap-1">
            Pendentes
            {counts.pendente > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">{counts.pendente}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="confirmado" className="gap-1">
            Confirmados
            {counts.confirmado > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">{counts.confirmado}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="realizado" className="gap-1">
            Realizados
            {counts.realizado > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">{counts.realizado}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cancelado" className="gap-1">
            Cancelados
            {counts.cancelado > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">{counts.cancelado}</Badge>
            )}
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
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredAgendamentos.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || selectedImovel !== 'all' 
                  ? 'Nenhum agendamento encontrado com os filtros aplicados.'
                  : `Nenhum agendamento ${activeTab !== 'all' ? `com status "${activeTab}"` : ''}.`
                }
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAgendamentos.map(agendamento => (
                <AgendamentoCard key={agendamento.id} agendamento={agendamento} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm Modal */}
      <Dialog open={confirmModal.open} onOpenChange={(open) => !open && setConfirmModal({ open: false, agendamento: null, opcao: 1 })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Visita</DialogTitle>
            <DialogDescription>
              Você está confirmando a visita para:
            </DialogDescription>
          </DialogHeader>
          {confirmModal.agendamento && (
            <div className="py-4">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <p className="text-lg font-semibold">
                  {formatDateTime(
                    confirmModal.opcao === 1 
                      ? confirmModal.agendamento.opcao_data_1 
                      : confirmModal.agendamento.opcao_data_2
                  )}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                O cliente {confirmModal.agendamento.cliente_nome} será notificado por e-mail.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModal({ open: false, agendamento: null, opcao: 1 })}>
              Cancelar
            </Button>
            <Button 
              onClick={() => confirmModal.agendamento && confirmMutation.mutate({
                id: confirmModal.agendamento.id,
                dataConfirmada: confirmModal.opcao === 1 
                  ? confirmModal.agendamento.opcao_data_1 
                  : confirmModal.agendamento.opcao_data_2
              })}
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? 'Confirmando...' : 'Confirmar Visita'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Modal */}
      <Dialog open={cancelModal.open} onOpenChange={(open) => !open && setCancelModal({ open: false, agendamento: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
            <DialogDescription>
              Informe o motivo do cancelamento. O cliente será notificado.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Motivo do cancelamento..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModal({ open: false, agendamento: null })}>
              Voltar
            </Button>
            <Button 
              variant="destructive"
              onClick={() => cancelModal.agendamento && cancelMutation.mutate({
                id: cancelModal.agendamento.id,
                motivo: cancelReason
              })}
              disabled={!cancelReason.trim() || cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar Agendamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Realize Modal */}
      <Dialog open={realizeModal.open} onOpenChange={(open) => !open && setRealizeModal({ open: false, agendamento: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar Visita como Realizada</DialogTitle>
            <DialogDescription>
              Ao confirmar, você será redirecionado para preencher o feedback da visita.
            </DialogDescription>
          </DialogHeader>
          {realizeModal.agendamento && (
            <div className="py-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">{realizeModal.agendamento.cliente_nome}</p>
                <p className="text-sm text-muted-foreground">{realizeModal.agendamento.imovel?.titulo}</p>
                {realizeModal.agendamento.data_confirmada && (
                  <p className="text-sm mt-2">
                    Visita: {formatDateTime(realizeModal.agendamento.data_confirmada)}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRealizeModal({ open: false, agendamento: null })}>
              Cancelar
            </Button>
            <Button 
              onClick={() => realizeModal.agendamento && realizeMutation.mutate(realizeModal.agendamento)}
              disabled={realizeMutation.isPending}
            >
              {realizeMutation.isPending ? 'Processando...' : 'Confirmar e Preencher Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
