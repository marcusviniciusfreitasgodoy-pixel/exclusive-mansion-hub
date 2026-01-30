import { useQuery } from '@tanstack/react-query';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Funnel, FunnelChart, LabelList
} from 'recharts';
import { Eye, Users, TrendingUp, Building2, MessageSquare, ArrowUp, ArrowDown } from 'lucide-react';

type PeriodFilter = '7d' | '30d' | '90d' | 'all';

const COLORS = ['#1e3a5f', '#b8860b', '#2d5a87', '#d4a84b', '#4a7c9f'];

export default function AnalyticsPage() {
  const { construtora } = useAuth();
  const [period, setPeriod] = useState<PeriodFilter>('30d');

  const getDays = () => {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 365;
    }
  };

  const startDate = subDays(new Date(), getDays());

  // Fetch KPIs
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['analytics-kpis', construtora?.id, period],
    queryFn: async () => {
      if (!construtora?.id) return null;

      // Get imoveis IDs
      const { data: imoveis } = await supabase
        .from('imoveis')
        .select('id')
        .eq('construtora_id', construtora.id);

      if (!imoveis?.length) return { views: 0, leads: 0, conversion: 0, topProperty: null };

      const imovelIds = imoveis.map(i => i.id);

      // Pageviews
      const { count: viewsCount } = await supabase
        .from('pageviews')
        .select('id', { count: 'exact', head: true })
        .in('imovel_id', imovelIds)
        .gte('created_at', startDate.toISOString());

      // Leads
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .in('imovel_id', imovelIds)
        .gte('created_at', startDate.toISOString());

      // Top property by views
      const { data: viewsByProperty } = await supabase
        .from('pageviews')
        .select('imovel_id')
        .in('imovel_id', imovelIds)
        .gte('created_at', startDate.toISOString());

      let topPropertyId: string | null = null;
      if (viewsByProperty?.length) {
        const counts: Record<string, number> = {};
        viewsByProperty.forEach(v => {
          counts[v.imovel_id] = (counts[v.imovel_id] || 0) + 1;
        });
        topPropertyId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
      }

      let topProperty = null;
      if (topPropertyId) {
        const { data } = await supabase
          .from('imoveis')
          .select('titulo')
          .eq('id', topPropertyId)
          .single();
        topProperty = data?.titulo || null;
      }

      const views = viewsCount || 0;
      const leads = leadsCount || 0;
      const conversion = views > 0 ? ((leads / views) * 100).toFixed(1) : '0';

      return { views, leads, conversion: parseFloat(conversion), topProperty };
    },
    enabled: !!construtora?.id,
  });

  // Fetch leads over time
  const { data: leadsOverTime } = useQuery({
    queryKey: ['analytics-leads-chart', construtora?.id, period],
    queryFn: async () => {
      if (!construtora?.id) return [];

      const { data: imoveis } = await supabase
        .from('imoveis')
        .select('id')
        .eq('construtora_id', construtora.id);

      if (!imoveis?.length) return [];

      const { data: leads } = await supabase
        .from('leads')
        .select('created_at')
        .in('imovel_id', imoveis.map(i => i.id))
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      // Group by day
      const days = eachDayOfInterval({ start: startDate, end: new Date() });
      const grouped = days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const count = leads?.filter(l => format(new Date(l.created_at), 'yyyy-MM-dd') === dayStr).length || 0;
        return {
          date: format(day, 'dd/MM', { locale: ptBR }),
          leads: count,
        };
      });

      return grouped;
    },
    enabled: !!construtora?.id,
  });

  // Fetch performance by property
  const { data: propertyPerformance } = useQuery({
    queryKey: ['analytics-property-performance', construtora?.id, period],
    queryFn: async () => {
      if (!construtora?.id) return [];

      const { data: imoveis } = await supabase
        .from('imoveis')
        .select('id, titulo')
        .eq('construtora_id', construtora.id);

      if (!imoveis?.length) return [];

      const performance = await Promise.all(imoveis.map(async (imovel) => {
        const { count: views } = await supabase
          .from('pageviews')
          .select('id', { count: 'exact', head: true })
          .eq('imovel_id', imovel.id)
          .gte('created_at', startDate.toISOString());

        const { count: leads } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('imovel_id', imovel.id)
          .gte('created_at', startDate.toISOString());

        const viewsNum = views || 0;
        const leadsNum = leads || 0;
        const conversion = viewsNum > 0 ? ((leadsNum / viewsNum) * 100).toFixed(1) : '0';

        return {
          name: imovel.titulo.length > 30 ? imovel.titulo.substring(0, 30) + '...' : imovel.titulo,
          views: viewsNum,
          leads: leadsNum,
          conversion: parseFloat(conversion),
        };
      }));

      return performance.sort((a, b) => b.views - a.views);
    },
    enabled: !!construtora?.id,
  });

  // Fetch performance by imobiliaria
  const { data: imobiliariaPerformance } = useQuery({
    queryKey: ['analytics-imobiliaria-performance', construtora?.id, period],
    queryFn: async () => {
      if (!construtora?.id) return [];

      const { data: imoveis } = await supabase
        .from('imoveis')
        .select('id')
        .eq('construtora_id', construtora.id);

      if (!imoveis?.length) return [];

      const { data: leads } = await supabase
        .from('leads')
        .select(`
          imobiliaria_id,
          imobiliarias (nome_empresa)
        `)
        .in('imovel_id', imoveis.map(i => i.id))
        .gte('created_at', startDate.toISOString());

      if (!leads?.length) return [];

      // Group by imobiliaria
      const grouped: Record<string, { name: string; leads: number }> = {};
      leads.forEach(lead => {
        const id = lead.imobiliaria_id || 'direto';
        const name = (lead.imobiliarias as any)?.nome_empresa || 'Acesso Direto';
        if (!grouped[id]) {
          grouped[id] = { name, leads: 0 };
        }
        grouped[id].leads++;
      });

      return Object.values(grouped).sort((a, b) => b.leads - a.leads);
    },
    enabled: !!construtora?.id,
  });

  // Funnel data
  const { data: funnelData } = useQuery({
    queryKey: ['analytics-funnel', construtora?.id, period],
    queryFn: async () => {
      if (!construtora?.id) return [];

      const { data: imoveis } = await supabase
        .from('imoveis')
        .select('id')
        .eq('construtora_id', construtora.id);

      if (!imoveis?.length) return [];

      const imovelIds = imoveis.map(i => i.id);

      const { count: views } = await supabase
        .from('pageviews')
        .select('id', { count: 'exact', head: true })
        .in('imovel_id', imovelIds)
        .gte('created_at', startDate.toISOString());

      const { count: totalLeads } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .in('imovel_id', imovelIds)
        .gte('created_at', startDate.toISOString());

      const { count: qualifiedLeads } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .in('imovel_id', imovelIds)
        .in('status', ['qualificado', 'visita_agendada'])
        .gte('created_at', startDate.toISOString());

      const { count: visitLeads } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .in('imovel_id', imovelIds)
        .eq('status', 'visita_agendada')
        .gte('created_at', startDate.toISOString());

      return [
        { name: 'Visitantes', value: views || 0, fill: COLORS[0] },
        { name: 'Leads', value: totalLeads || 0, fill: COLORS[1] },
        { name: 'Qualificados', value: qualifiedLeads || 0, fill: COLORS[2] },
        { name: 'Visitas', value: visitLeads || 0, fill: COLORS[3] },
      ];
    },
    enabled: !!construtora?.id,
  });

  return (
    <DashboardLayout title="Analytics">
      {/* Period Filter */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground">
          Métricas de performance dos seus imóveis
        </p>
        <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
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

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.views?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              nos últimos {getDays()} dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.leads || 0}</div>
            <p className="text-xs text-muted-foreground">
              contatos recebidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.conversion || 0}%</div>
            <p className="text-xs text-muted-foreground">
              leads / visualizações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Imóvel Mais Visto</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate">{kpis?.topProperty || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              maior interesse
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Leads Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Leads ao Longo do Tempo</CardTitle>
            <CardDescription>Evolução de leads recebidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {leadsOverTime && leadsOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={leadsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      interval={period === '7d' ? 0 : 'preserveStartEnd'}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="leads" 
                      stroke="#b8860b" 
                      strokeWidth={2}
                      dot={{ fill: '#b8860b' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Sem dados no período
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>Do visitante à visita agendada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {funnelData && funnelData.length > 0 && funnelData[0].value > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Sem dados no período
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* By Property */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Imóvel</CardTitle>
            <CardDescription>Visualizações e leads por propriedade</CardDescription>
          </CardHeader>
          <CardContent>
            {propertyPerformance && propertyPerformance.length > 0 ? (
              <div className="space-y-4">
                {propertyPerformance.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {item.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {item.leads}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-primary">{item.conversion}%</span>
                      <p className="text-xs text-muted-foreground">conversão</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Sem dados</p>
            )}
          </CardContent>
        </Card>

        {/* By Imobiliaria */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Imobiliária</CardTitle>
            <CardDescription>Ranking de parceiros</CardDescription>
          </CardHeader>
          <CardContent>
            {imobiliariaPerformance && imobiliariaPerformance.length > 0 ? (
              <div className="space-y-4">
                {imobiliariaPerformance.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                        {idx + 1}
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{item.leads}</span>
                      <p className="text-xs text-muted-foreground">leads</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Sem dados</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
