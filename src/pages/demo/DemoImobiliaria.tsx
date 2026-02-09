import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DemoProvider, useDemo } from '@/contexts/DemoContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DemoBanner } from '@/components/demo/DemoBanner';
import { DemoDashboardSidebar } from '@/components/demo/DemoDashboardSidebar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Eye, MessageSquare, Calendar, TrendingUp, Info } from 'lucide-react';
import { DEMO_IMOVEIS, DEMO_ACCESS_DATA, DEMO_LEADS, DEMO_AGENDAMENTOS, DEMO_ANALYTICS, DEMO_FEEDBACKS } from '@/data/demo-data';
import { VisitFeedbackAnalytics } from '@/components/analytics/VisitFeedbackAnalytics';
import { DemoFeedbacksContent } from '@/components/demo/DemoFeedbacksContent';
import { DemoSitesContent } from '@/components/demo/DemoSitesContent';

function DemoImoveisDisponiveis() {
  const formatCurrency = (value: number | null) => {
    if (!value) return 'A consultar';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div>
      <p className="mb-6 text-muted-foreground">Imóveis que você tem autorização para divulgar</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DEMO_IMOVEIS.filter(i => i.status === 'ativo').map(imovel => {
          const access = DEMO_ACCESS_DATA.find(a => a.imovel_id === imovel.id);
          return (
            <Card key={imovel.id} className="overflow-hidden">
              <div className="aspect-video bg-muted">
                {imovel.imagens[0]?.url ? (
                  <img src={imovel.imagens[0].url} alt={imovel.titulo} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">Sem imagem</div>
                )}
              </div>
              <CardHeader className="pb-2">
                <h3 className="font-semibold leading-tight line-clamp-2">{imovel.titulo}</h3>
                <p className="text-sm text-muted-foreground">{imovel.bairro}, {imovel.cidade}</p>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-lg font-bold text-primary">{formatCurrency(imovel.valor)}</p>
                {access && <p className="mt-2 text-xs text-muted-foreground truncate">/imovel/{access.url_slug}</p>}
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" className="flex-1" disabled><Copy className="mr-1 h-3 w-3" />Copiar Link</Button>
                <Button variant="outline" size="sm" disabled><ExternalLink className="h-3 w-3" /></Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function DemoMeusLinks() {
  return (
    <div>
      <p className="mb-6 text-muted-foreground">Seus links personalizados e métricas de performance</p>
      <div className="grid gap-4 md:grid-cols-2">
        {DEMO_ACCESS_DATA.map(access => {
          const imovel = DEMO_IMOVEIS.find(i => i.id === access.imovel_id);
          const leads = DEMO_LEADS.filter(l => l.imovel_id === access.imovel_id && l.imobiliaria_id === 'demo-imobiliaria-001').length;
          const agendamentos = DEMO_AGENDAMENTOS.filter(a => a.imovel_id === access.imovel_id && a.imobiliaria_id === 'demo-imobiliaria-001').length;
          return (
            <Card key={access.id}>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-1">{imovel?.titulo}</h3>
                <p className="text-xs text-muted-foreground mb-4 truncate">/imovel/{access.url_slug}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-lg font-bold text-primary">{access.visitas}</p><p className="text-xs text-muted-foreground">Visitas</p></div>
                  <div><p className="text-lg font-bold text-primary">{leads}</p><p className="text-xs text-muted-foreground">Leads</p></div>
                  <div><p className="text-lg font-bold text-primary">{agendamentos}</p><p className="text-xs text-muted-foreground">Agend.</p></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function DemoLeadsImob() {
  const myLeads = DEMO_LEADS.filter(l => l.imobiliaria_id === 'demo-imobiliaria-001');
  return (
    <div>
      <p className="mb-6 text-muted-foreground">Leads capturados pelos seus links</p>
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left font-medium">Nome</th><th className="p-3 text-left font-medium">Imóvel</th><th className="p-3 text-left font-medium">Origem</th><th className="p-3 text-left font-medium">Data</th></tr></thead>
          <tbody>
            {myLeads.map(lead => {
              const imovel = DEMO_IMOVEIS.find(i => i.id === lead.imovel_id);
              return (
                <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3"><div className="font-medium">{lead.nome}</div><div className="text-xs text-muted-foreground">{lead.email}</div></td>
                  <td className="p-3 text-muted-foreground">{imovel?.titulo}</td>
                  <td className="p-3"><Badge variant="secondary">{lead.origem}</Badge></td>
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

function DemoAnalyticsImob() {
  const myLeads = DEMO_LEADS.filter(l => l.imobiliaria_id === 'demo-imobiliaria-001').length;
  const myVisitas = DEMO_ACCESS_DATA.reduce((sum, a) => sum + a.visitas, 0);
  const myAgend = DEMO_AGENDAMENTOS.filter(a => a.imobiliaria_id === 'demo-imobiliaria-001').length;
  return (
    <div>
      <p className="mb-6 text-muted-foreground">Sua performance como imobiliária parceira</p>
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {[
          { label: 'Visualizações', value: myVisitas.toLocaleString('pt-BR'), icon: Eye },
          { label: 'Leads', value: myLeads, icon: MessageSquare },
          { label: 'Agendamentos', value: myAgend, icon: Calendar },
          { label: 'Conversão', value: `${((myLeads / myVisitas) * 100).toFixed(1)}%`, icon: TrendingUp },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><kpi.icon className="h-5 w-5 text-primary" /></div>
              <div><p className="text-2xl font-bold">{kpi.value}</p><p className="text-sm text-muted-foreground">{kpi.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visitas e Satisfação */}
      <div className="mt-2">
        <VisitFeedbackAnalytics
          agendamentos={DEMO_AGENDAMENTOS.filter(a => a.imobiliaria_id === 'demo-imobiliaria-001').map(a => ({ id: a.id, status: a.status, created_at: a.created_at }))}
          feedbacks={DEMO_FEEDBACKS.filter(f => f.imobiliaria_id === 'demo-imobiliaria-001').map(f => ({
            id: f.id,
            nps_cliente: f.nps_cliente,
            avaliacao_localizacao: f.avaliacao_localizacao,
            avaliacao_acabamento: f.avaliacao_acabamento,
            avaliacao_layout: f.avaliacao_layout,
            avaliacao_custo_beneficio: f.avaliacao_custo_beneficio,
            avaliacao_atendimento: f.avaliacao_atendimento,
            interesse_compra: f.interesse_compra,
            objecoes: f.objecoes ?? [],
            efeito_uau: f.efeito_uau ?? [],
            created_at: f.created_at,
            feedback_cliente_em: f.feedback_cliente_em ?? null,
            status: f.status,
          }))}
        />
      </div>
    </div>
  );
}

function DemoAgendImob() {
  const myAgend = DEMO_AGENDAMENTOS.filter(a => a.imobiliaria_id === 'demo-imobiliaria-001');
  const statusLabels: Record<string, string> = { pendente: 'Pendente', confirmado: 'Confirmado', realizado: 'Realizado', cancelado: 'Cancelado' };
  const statusColors: Record<string, string> = { pendente: 'bg-yellow-100 text-yellow-800', confirmado: 'bg-green-100 text-green-800', realizado: 'bg-blue-100 text-blue-800', cancelado: 'bg-red-100 text-red-800' };
  return (
    <div>
      <p className="mb-6 text-muted-foreground">Visitas agendadas pelos seus clientes</p>
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left font-medium">Cliente</th><th className="p-3 text-left font-medium">Imóvel</th><th className="p-3 text-left font-medium">Data</th><th className="p-3 text-left font-medium">Status</th></tr></thead>
          <tbody>
            {myAgend.map(a => {
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

function DemoImobiliariaInner() {
  const { setDemoRole } = useDemo();
  useEffect(() => { setDemoRole('imobiliaria'); }, [setDemoRole]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <DemoBanner />
        <div className="flex flex-1">
          <DemoDashboardSidebar role="imobiliaria" />
          <main className="flex-1 overflow-auto">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <SidebarTrigger />
            </header>
            <div className="p-6">
              <Routes>
                <Route index element={<><h1 className="text-xl font-semibold mb-4">Imóveis Disponíveis</h1><DemoImoveisDisponiveis /></>} />
                <Route path="sites" element={<><h1 className="text-xl font-semibold mb-4">Sites & Templates</h1><div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300"><Info className="h-5 w-5 mt-0.5 flex-shrink-0" /><p>Os templates dos sites são <strong>selecionados pela construtora</strong> para cada imóvel. Como imobiliária, você recebe o link personalizado com o template já aplicado pela construtora.</p></div><DemoSitesContent /></>} />
                <Route path="meus-links" element={<><h1 className="text-xl font-semibold mb-4">Meus Links</h1><DemoMeusLinks /></>} />
                <Route path="leads" element={<><h1 className="text-xl font-semibold mb-4">Meus Leads</h1><DemoLeadsImob /></>} />
                <Route path="analytics" element={<><h1 className="text-xl font-semibold mb-4">Analytics</h1><DemoAnalyticsImob /></>} />
                <Route path="agendamentos" element={<><h1 className="text-xl font-semibold mb-4">Agendamentos</h1><DemoAgendImob /></>} />
                <Route path="feedbacks" element={<><h1 className="text-xl font-semibold mb-4">Feedbacks de Visitas</h1><DemoFeedbacksContent filterImobiliariaId="demo-imobiliaria-001" /></>} />
                <Route path="*" element={<Navigate to="/demo/imobiliaria" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function DemoImobiliaria() {
  return (
    <DemoProvider>
      <DemoImobiliariaInner />
    </DemoProvider>
  );
}
