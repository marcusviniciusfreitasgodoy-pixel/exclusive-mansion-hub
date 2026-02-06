import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DemoProvider, useDemo } from '@/contexts/DemoContext';
import { DemoDashboardSidebar } from '@/components/demo/DemoDashboardSidebar';
import { DEMO_IMOVEIS, DEMO_LEADS, DEMO_AGENDAMENTOS, DEMO_ACCESS_DATA, DEMO_FEEDBACKS, DEMO_ANALYTICS, DEMO_IMOBILIARIAS_PARCEIRAS, DEMO_CONSTRUTORA } from '@/data/demo-data';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DemoBanner } from '@/components/demo/DemoBanner';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MessageSquare, Eye, TrendingUp } from 'lucide-react';

function DemoConstrutoraDashboardContent() {
  const formatCurrency = (value: number | null) => {
    if (!value) return 'A consultar';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  };

  const statusColors: Record<string, string> = {
    ativo: 'bg-green-100 text-green-800',
    vendido: 'bg-blue-100 text-blue-800',
    inativo: 'bg-gray-100 text-gray-800',
  };

  const leadCounts: Record<string, number> = {};
  DEMO_LEADS.forEach(l => { leadCounts[l.imovel_id] = (leadCounts[l.imovel_id] || 0) + 1; });

  return (
    <div>
      <div className="mb-6">
        <p className="text-muted-foreground">Gerencie os imóveis cadastrados pela sua construtora</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DEMO_IMOVEIS.map((imovel) => (
          <Card key={imovel.id} className="overflow-hidden">
            <div className="aspect-video bg-muted relative">
              {imovel.imagens[0]?.url ? (
                <img src={imovel.imagens[0].url} alt={imovel.titulo} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground"><Building2 className="h-12 w-12" /></div>
              )}
              <Badge className={`absolute top-2 right-2 ${statusColors[imovel.status]}`}>{imovel.status}</Badge>
            </div>
            <CardHeader className="pb-2">
              <h3 className="font-semibold leading-tight line-clamp-2">{imovel.titulo}</h3>
              <p className="text-sm text-muted-foreground">📍 {imovel.bairro}, {imovel.cidade}</p>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-lg font-bold text-primary">{formatCurrency(imovel.valor)}</p>
            </CardContent>
            <CardFooter className="gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{leadCounts[imovel.id] || 0} leads</span>
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{Math.floor(Math.random() * 200 + 50)} views</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DemoLeadsContent() {
  const statusLabels: Record<string, string> = { novo: 'Novo', contatado: 'Contatado', qualificado: 'Qualificado' };
  return (
    <div>
      <p className="mb-6 text-muted-foreground">Todos os contatos recebidos nos seus imóveis</p>
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left font-medium">Nome</th><th className="p-3 text-left font-medium">Imóvel</th><th className="p-3 text-left font-medium">Origem</th><th className="p-3 text-left font-medium">Status</th><th className="p-3 text-left font-medium">Data</th></tr></thead>
          <tbody>
            {DEMO_LEADS.map(lead => {
              const imovel = DEMO_IMOVEIS.find(i => i.id === lead.imovel_id);
              return (
                <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3"><div className="font-medium">{lead.nome}</div><div className="text-xs text-muted-foreground">{lead.email}</div></td>
                  <td className="p-3 text-muted-foreground">{imovel?.titulo}</td>
                  <td className="p-3"><Badge variant="secondary">{lead.origem}</Badge></td>
                  <td className="p-3"><Badge variant="outline">{statusLabels[lead.status] || lead.status}</Badge></td>
                  <td className="p-3 text-muted-foreground">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DemoAnalyticsContent() {
  return (
    <div>
      <p className="mb-6 text-muted-foreground">Métricas consolidadas da sua construtora</p>
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {[
          { label: 'Visualizações', value: DEMO_ANALYTICS.totalVisualizacoes.toLocaleString('pt-BR'), icon: Eye },
          { label: 'Leads', value: DEMO_ANALYTICS.totalLeads, icon: MessageSquare },
          { label: 'Agendamentos', value: DEMO_ANALYTICS.totalAgendamentos, icon: Building2 },
          { label: 'NPS Geral', value: DEMO_ANALYTICS.npsGeral.toFixed(1), icon: TrendingUp },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><kpi.icon className="h-5 w-5 text-primary" /></div>
              <div><p className="text-2xl font-bold">{kpi.value}</p><p className="text-sm text-muted-foreground">{kpi.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader className="pb-2"><h3 className="text-sm font-semibold">Funil de Conversão</h3></CardHeader><CardContent><div className="space-y-3">{DEMO_ANALYTICS.funil.map((f, i) => (<div key={f.etapa} className="flex items-center gap-3"><span className="w-28 text-sm text-muted-foreground">{f.etapa}</span><div className="flex-1 h-6 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary/80 rounded-full" style={{ width: `${(f.valor / DEMO_ANALYTICS.funil[0].valor) * 100}%` }} /></div><span className="w-12 text-right text-sm font-medium">{f.valor}</span></div>))}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><h3 className="text-sm font-semibold">Origem dos Leads</h3></CardHeader><CardContent><div className="space-y-3">{DEMO_ANALYTICS.origemLeads.map(o => (<div key={o.origem} className="flex items-center justify-between"><span className="text-sm">{o.origem}</span><div className="flex items-center gap-2"><div className="h-2 rounded-full bg-secondary" style={{ width: `${(o.quantidade / DEMO_ANALYTICS.totalLeads) * 100}px` }} /><span className="text-sm font-medium">{o.quantidade}</span></div></div>))}</div></CardContent></Card>
      </div>
    </div>
  );
}

function DemoAgendamentosContent() {
  const statusLabels: Record<string, string> = { pendente: 'Pendente', confirmado: 'Confirmado', realizado: 'Realizado', cancelado: 'Cancelado' };
  const statusColors: Record<string, string> = { pendente: 'bg-yellow-100 text-yellow-800', confirmado: 'bg-green-100 text-green-800', realizado: 'bg-blue-100 text-blue-800', cancelado: 'bg-red-100 text-red-800' };
  return (
    <div>
      <p className="mb-6 text-muted-foreground">Visitas agendadas nos seus imóveis</p>
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left font-medium">Cliente</th><th className="p-3 text-left font-medium">Imóvel</th><th className="p-3 text-left font-medium">Data</th><th className="p-3 text-left font-medium">Status</th></tr></thead>
          <tbody>
            {DEMO_AGENDAMENTOS.map(a => {
              const imovel = DEMO_IMOVEIS.find(i => i.id === a.imovel_id);
              return (
                <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3"><div className="font-medium">{a.cliente_nome}</div><div className="text-xs text-muted-foreground">{a.cliente_telefone}</div></td>
                  <td className="p-3 text-muted-foreground">{imovel?.titulo}</td>
                  <td className="p-3 text-muted-foreground">{new Date(a.opcao_data_1).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3"><Badge className={statusColors[a.status]}>{statusLabels[a.status]}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DemoPipelineContent() {
  const stages = [
    { key: 'novo', label: 'Novo', color: 'border-blue-400' },
    { key: 'contatado', label: 'Contatado', color: 'border-yellow-400' },
    { key: 'qualificado', label: 'Qualificado', color: 'border-purple-400' },
    { key: 'visita_agendada', label: 'Visita Agendada', color: 'border-cyan-400' },
    { key: 'proposta', label: 'Proposta', color: 'border-orange-400' },
    { key: 'negociacao', label: 'Negociação', color: 'border-pink-400' },
    { key: 'ganho', label: 'Ganho', color: 'border-green-400' },
    { key: 'perdido', label: 'Perdido', color: 'border-red-400' },
  ];

  return (
    <div>
      <p className="mb-6 text-muted-foreground">Gerencie seus leads em um pipeline visual</p>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => {
          const stageLeads = DEMO_LEADS.filter(l => l.estagio_pipeline === stage.key);
          return (
            <div key={stage.key} className={`min-w-[240px] flex-shrink-0 rounded-lg border-t-4 ${stage.color} bg-muted/30 p-3`}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{stage.label}</h3>
                <Badge variant="secondary" className="text-xs">{stageLeads.length}</Badge>
              </div>
              <div className="space-y-2">
                {stageLeads.map(lead => (
                  <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <p className="font-medium text-sm">{lead.nome}</p>
                      <p className="text-xs text-muted-foreground">{DEMO_IMOVEIS.find(i => i.id === lead.imovel_id)?.titulo}</p>
                      {lead.score_qualificacao && (
                        <div className="mt-2 flex items-center gap-1">
                          <div className="h-1.5 flex-1 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${lead.score_qualificacao}%` }} /></div>
                          <span className="text-xs text-muted-foreground">{lead.score_qualificacao}%</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {stageLeads.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum lead</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DemoImobiliariasContent() {
  return (
    <div>
      <p className="mb-6 text-muted-foreground">Imobiliárias parceiras da sua construtora</p>
      <div className="grid gap-4 md:grid-cols-3">
        {DEMO_IMOBILIARIAS_PARCEIRAS.map(imob => (
          <Card key={imob.id}>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-1">{imob.nome_empresa}</h3>
              <p className="text-xs text-muted-foreground mb-4">{imob.creci}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-lg font-bold text-primary">{imob.total_leads}</p><p className="text-xs text-muted-foreground">Leads</p></div>
                <div><p className="text-lg font-bold text-primary">{imob.total_visitas}</p><p className="text-xs text-muted-foreground">Visitas</p></div>
                <div><p className="text-lg font-bold text-primary">{imob.total_agendamentos}</p><p className="text-xs text-muted-foreground">Agend.</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Page titles map
const pageTitles: Record<string, string> = {
  '': 'Meus Imóveis',
  'leads': 'Leads',
  'analytics': 'Analytics',
  'pipeline': 'Pipeline de Leads',
  'agendamentos': 'Visitas Agendadas',
  'imobiliarias': 'Imobiliárias Parceiras',
};

function DemoConstructoraInner() {
  const { setDemoRole } = useDemo();
  useEffect(() => { setDemoRole('construtora'); }, [setDemoRole]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <DemoBanner />
        <div className="flex flex-1">
          <DemoDashboardSidebar role="construtora" />
          <main className="flex-1 overflow-auto">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <SidebarTrigger />
            </header>
            <div className="p-6">
              <Routes>
                <Route index element={<><h1 className="text-xl font-semibold mb-4">Meus Imóveis</h1><DemoConstrutoraDashboardContent /></>} />
                <Route path="leads" element={<><h1 className="text-xl font-semibold mb-4">Leads</h1><DemoLeadsContent /></>} />
                <Route path="analytics" element={<><h1 className="text-xl font-semibold mb-4">Analytics</h1><DemoAnalyticsContent /></>} />
                <Route path="pipeline" element={<><h1 className="text-xl font-semibold mb-4">Pipeline de Leads</h1><DemoPipelineContent /></>} />
                <Route path="agendamentos" element={<><h1 className="text-xl font-semibold mb-4">Visitas Agendadas</h1><DemoAgendamentosContent /></>} />
                <Route path="imobiliarias" element={<><h1 className="text-xl font-semibold mb-4">Imobiliárias Parceiras</h1><DemoImobiliariasContent /></>} />
                <Route path="*" element={<Navigate to="/demo/construtora" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function DemoConstrutora() {
  return (
    <DemoProvider>
      <DemoConstructoraInner />
    </DemoProvider>
  );
}
