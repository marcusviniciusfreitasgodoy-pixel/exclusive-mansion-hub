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
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, Phone, MapPin, User, Search, AlertCircle, Building2,
  CalendarCheck, Clock, TrendingUp
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
  created_at: string;
  realizado_em: string | null;
  imovel?: {
    id: string;
    titulo: string;
  };
  imobiliaria?: {
    id: string;
    nome_empresa: string;
  };
}

export default function AgendamentosConstrutora() {
  const { construtora } = useAuth();

  const [activeTab, setActiveTab] = useState<AgendamentoStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImovel, setSelectedImovel] = useState<string>('all');
  const [selectedImobiliaria, setSelectedImobiliaria] = useState<string>('all');

  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ['agendamentos-construtora', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id) return [];
      
      const { data, error } = await supabase
        .from('agendamentos_visitas')
        .select(`
          *,
          imovel:imoveis(id, titulo),
          imobiliaria:imobiliarias(id, nome_empresa)
        `)
        .eq('construtora_id', construtora.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AgendamentoWithDetails[];
    },
    enabled: !!construtora?.id,
  });

  const { data: imoveis } = useQuery({
    queryKey: ['imoveis-construtora-filter', construtora?.id],
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

  // Get unique imobiliarias from agendamentos
  const imobiliarias = Array.from(
    new Map(
      agendamentos
        ?.filter(a => a.imobiliaria)
        .map(a => [a.imobiliaria!.id, a.imobiliaria!])
    ).values()
  ) || [];

  // Filter logic
  const filteredAgendamentos = agendamentos?.filter(a => {
    const matchesTab = activeTab === 'all' || a.status === activeTab;
    const matchesSearch = a.cliente_nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.cliente_telefone.includes(searchQuery);
    const matchesImovel = selectedImovel === 'all' || a.imovel?.id === selectedImovel;
    const matchesImobiliaria = selectedImobiliaria === 'all' || a.imobiliaria?.id === selectedImobiliaria;
    return matchesTab && matchesSearch && matchesImovel && matchesImobiliaria;
  }) || [];

  const counts = {
    pendente: agendamentos?.filter(a => a.status === 'pendente').length || 0,
    confirmado: agendamentos?.filter(a => a.status === 'confirmado').length || 0,
    realizado: agendamentos?.filter(a => a.status === 'realizado').length || 0,
    cancelado: agendamentos?.filter(a => a.status === 'cancelado').length || 0,
  };

  // Analytics by imobiliaria
  const imobiliariaStats = imobiliarias.map(imob => ({
    ...imob,
    count: agendamentos?.filter(a => a.imobiliaria?.id === imob.id).length || 0
  })).sort((a, b) => b.count - a.count);

  const formatDateTime = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const StatusBadge = ({ status }: { status: AgendamentoStatus }) => {
    const config = {
      pendente: { label: '⏰ Pendente', className: 'border-yellow-500 text-yellow-700 bg-yellow-50' },
      confirmado: { label: '✅ Confirmado', className: 'border-green-500 text-green-700 bg-green-50' },
      realizado: { label: '🎯 Realizado', className: 'border-blue-500 text-blue-700 bg-blue-50' },
      cancelado: { label: '❌ Cancelado', className: 'border-red-500 text-red-700 bg-red-50' },
      remarcado: { label: '🔄 Remarcado', className: 'border-purple-500 text-purple-700 bg-purple-50' },
    };
    const { label, className } = config[status];
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  return (
    <DashboardLayout title="Visitas Agendadas">
      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{counts.pendente}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmadas</p>
                <p className="text-2xl font-bold">{counts.confirmado}</p>
              </div>
              <CalendarCheck className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Realizadas</p>
                <p className="text-2xl font-bold">{counts.realizado}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Canceladas</p>
                <p className="text-2xl font-bold">{counts.cancelado}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Imobiliaria Stats */}
      {imobiliariaStats.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Imobiliárias Mais Ativas
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {imobiliariaStats.slice(0, 5).map(imob => (
                <div key={imob.id} className="flex items-center justify-between text-sm">
                  <span>{imob.nome_empresa}</span>
                  <Badge variant="secondary">{imob.count} visitas</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AgendamentoStatus | 'all')}>
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Todos</TabsTrigger>
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
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-32 mb-4" />
                  <Skeleton className="h-20 w-full" />
                </Card>
              ))}
            </div>
          ) : filteredAgendamentos.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum agendamento encontrado.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAgendamentos.map(agendamento => (
                <Card key={agendamento.id} className="overflow-hidden">
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
                  
                  <CardContent>
                    <p className="text-sm font-medium flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3 text-primary" />
                      {agendamento.imovel?.titulo}
                    </p>
                    
                    {agendamento.imobiliaria && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                        <Building2 className="h-3 w-3" />
                        {agendamento.imobiliaria.nome_empresa}
                      </p>
                    )}

                    {agendamento.data_confirmada && (
                      <div className="bg-muted p-2 rounded text-sm mt-2">
                        <p className="flex items-center gap-1">
                          <CalendarCheck className="h-3 w-3" />
                          {formatDateTime(agendamento.data_confirmada)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
