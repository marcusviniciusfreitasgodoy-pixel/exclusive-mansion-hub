import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, eachDayOfInterval, getDay, getHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, Users, TrendingUp, Calendar, MessageSquare, 
  DollarSign, Building2, Download, Star
} from 'lucide-react';
import {
  KPICard,
  FunnelChart,
  LeadOriginChart,
  HeatmapChart,
  InsightsCard,
  PerformanceTable,
  TrendLineChart,
  PropertyImobiliariaBreakdown,
  ImobiliariaEvolutionChart,
  type Insight,
} from '@/components/analytics';

type PeriodFilter = '7d' | '30d' | '90d' | 'all';

const DAYS_MAP = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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
  const previousStartDate = subDays(startDate, getDays());

  // Fetch all imoveis IDs
  const { data: imoveis } = useQuery({
    queryKey: ['construtora-imoveis', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id) return [];
      const { data } = await supabase
        .from('imoveis')
        .select('id, titulo, valor')
        .eq('construtora_id', construtora.id);
      return data || [];
    },
    enabled: !!construtora?.id,
  });

  const imovelIds = imoveis?.map(i => i.id) || [];

  // Fetch KPIs with comparison
  const { data: kpis } = useQuery({
    queryKey: ['construtora-analytics-kpis', construtora?.id, period, imovelIds],
    queryFn: async () => {
      if (!imovelIds.length) return null;

      const [views, leads, agendamentos, feedbacks, previousViews, previousLeads] = await Promise.all([
        supabase
          .from('pageviews')
          .select('id', { count: 'exact', head: true })
          .in('imovel_id', imovelIds)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .in('imovel_id', imovelIds)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('agendamentos_visitas')
          .select('id', { count: 'exact', head: true })
          .eq('construtora_id', construtora!.id)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('feedbacks_visitas')
          .select('nps_cliente', { count: 'exact' })
          .eq('construtora_id', construtora!.id)
          .not('nps_cliente', 'is', null)
          .gte('created_at', startDate.toISOString()),
        // Previous period
        supabase
          .from('pageviews')
          .select('id', { count: 'exact', head: true })
          .in('imovel_id', imovelIds)
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', startDate.toISOString()),
        supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .in('imovel_id', imovelIds)
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', startDate.toISOString()),
      ]);

      const viewsCount = views.count || 0;
      const leadsCount = leads.count || 0;
      const prevViewsCount = previousViews.count || 0;
      const prevLeadsCount = previousLeads.count || 0;

      const conversion = viewsCount > 0 ? (leadsCount / viewsCount) * 100 : 0;
      const prevConversion = prevViewsCount > 0 ? (prevLeadsCount / prevViewsCount) * 100 : 0;

      // Calculate average NPS
      const npsData = feedbacks.data as any[];
      const avgNps = npsData?.length > 0 
        ? npsData.reduce((acc, f) => acc + (f.nps_cliente || 0), 0) / npsData.length 
        : null;

      return {
        views: viewsCount,
        leads: leadsCount,
        agendamentos: agendamentos.count || 0,
        conversion,
        avgNps,
        viewsTrend: prevViewsCount > 0 ? ((viewsCount - prevViewsCount) / prevViewsCount) * 100 : 0,
        leadsTrend: prevLeadsCount > 0 ? ((leadsCount - prevLeadsCount) / prevLeadsCount) * 100 : 0,
        conversionTrend: conversion - prevConversion,
      };
    },
    enabled: !!imovelIds.length,
  });

  // Leads over time
  const { data: leadsOverTime } = useQuery({
    queryKey: ['construtora-analytics-leads-time', construtora?.id, period, imovelIds],
    queryFn: async () => {
      if (!imovelIds.length) return [];

      const [leadsRes, viewsRes] = await Promise.all([
        supabase
          .from('leads')
          .select('created_at')
          .in('imovel_id', imovelIds)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('pageviews')
          .select('created_at')
          .in('imovel_id', imovelIds)
          .gte('created_at', startDate.toISOString()),
      ]);

      const leads = leadsRes.data || [];
      const pageviews = viewsRes.data || [];

      const days = eachDayOfInterval({ start: startDate, end: new Date() });
      
      return days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        return {
          date: format(day, 'dd/MM', { locale: ptBR }),
          leads: leads.filter(l => format(new Date(l.created_at!), 'yyyy-MM-dd') === dayStr).length,
          views: pageviews.filter(p => format(new Date(p.created_at!), 'yyyy-MM-dd') === dayStr).length,
        };
      });
    },
    enabled: !!imovelIds.length,
  });

  // Funnel data
  const { data: funnelData } = useQuery({
    queryKey: ['construtora-analytics-funnel', construtora?.id, period, imovelIds],
    queryFn: async () => {
      if (!imovelIds.length) return [];

      const [views, leads, qualificados, agendamentos, realizadas] = await Promise.all([
        supabase.from('pageviews').select('id', { count: 'exact', head: true })
          .in('imovel_id', imovelIds).gte('created_at', startDate.toISOString()),
        supabase.from('leads').select('id', { count: 'exact', head: true })
          .in('imovel_id', imovelIds).gte('created_at', startDate.toISOString()),
        supabase.from('leads').select('id', { count: 'exact', head: true })
          .in('imovel_id', imovelIds)
          .in('estagio_pipeline', ['qualificado', 'visita_agendada', 'proposta_enviada', 'negociacao', 'ganho'])
          .gte('created_at', startDate.toISOString()),
        supabase.from('agendamentos_visitas').select('id', { count: 'exact', head: true })
          .eq('construtora_id', construtora!.id).gte('created_at', startDate.toISOString()),
        supabase.from('agendamentos_visitas').select('id', { count: 'exact', head: true })
          .eq('construtora_id', construtora!.id).eq('status', 'realizado')
          .gte('created_at', startDate.toISOString()),
      ]);

      return [
        { name: 'Visualizações', value: views.count || 0 },
        { name: 'Leads Gerados', value: leads.count || 0 },
        { name: 'Leads Qualificados', value: qualificados.count || 0 },
        { name: 'Visitas Agendadas', value: agendamentos.count || 0 },
        { name: 'Visitas Realizadas', value: realizadas.count || 0 },
      ];
    },
    enabled: !!imovelIds.length,
  });

  // Lead origins
  const { data: leadOrigins } = useQuery({
    queryKey: ['construtora-analytics-origins', construtora?.id, period, imovelIds],
    queryFn: async () => {
      if (!imovelIds.length) return [];

      const { data: leads } = await supabase
        .from('leads')
        .select('origem')
        .in('imovel_id', imovelIds)
        .gte('created_at', startDate.toISOString());

      const grouped: Record<string, number> = {};
      leads?.forEach(lead => {
        const origem = lead.origem || 'formulario';
        grouped[origem] = (grouped[origem] || 0) + 1;
      });

      const ORIGIN_NAMES: Record<string, string> = {
        'formulario': 'Formulário',
        'whatsapp': 'WhatsApp',
        'chat_ia': 'Chatbot IA',
      };

      return Object.entries(grouped).map(([key, value]) => ({
        name: ORIGIN_NAMES[key] || key,
        value,
      }));
    },
    enabled: !!imovelIds.length,
  });

  // Performance by property
  const { data: propertyPerformance } = useQuery({
    queryKey: ['construtora-analytics-property', construtora?.id, period, imoveis],
    queryFn: async () => {
      if (!imoveis?.length) return [];

      const performance = await Promise.all(imoveis.map(async (imovel) => {
        const [views, leads, agendamentos] = await Promise.all([
          supabase.from('pageviews').select('id', { count: 'exact', head: true })
            .eq('imovel_id', imovel.id).gte('created_at', startDate.toISOString()),
          supabase.from('leads').select('id', { count: 'exact', head: true })
            .eq('imovel_id', imovel.id).gte('created_at', startDate.toISOString()),
          supabase.from('agendamentos_visitas').select('id', { count: 'exact', head: true })
            .eq('imovel_id', imovel.id).gte('created_at', startDate.toISOString()),
        ]);

        const viewsNum = views.count || 0;
        const leadsNum = leads.count || 0;

        return {
          id: imovel.id,
          name: imovel.titulo.length > 40 ? imovel.titulo.substring(0, 40) + '...' : imovel.titulo,
          views: viewsNum,
          leads: leadsNum,
          conversion: viewsNum > 0 ? (leadsNum / viewsNum) * 100 : 0,
          visitas: agendamentos.count || 0,
        };
      }));

      return performance.sort((a, b) => b.views - a.views);
    },
    enabled: !!imoveis?.length,
  });

  // Performance by imobiliaria (ranking)
  const { data: imobiliariaRanking } = useQuery({
    queryKey: ['construtora-analytics-imob-ranking', construtora?.id, period, imovelIds],
    queryFn: async () => {
      if (!imovelIds.length) return [];

      const { data: leads } = await supabase
        .from('leads')
        .select('imobiliaria_id, imobiliarias(nome_empresa)')
        .in('imovel_id', imovelIds)
        .not('imobiliaria_id', 'is', null)
        .gte('created_at', startDate.toISOString());

      const { data: agendamentos } = await supabase
        .from('agendamentos_visitas')
        .select('imobiliaria_id')
        .eq('construtora_id', construtora!.id)
        .not('imobiliaria_id', 'is', null)
        .gte('created_at', startDate.toISOString());

      const { data: feedbacks } = await supabase
        .from('feedbacks_visitas')
        .select('imobiliaria_id, nps_cliente')
        .eq('construtora_id', construtora!.id)
        .not('imobiliaria_id', 'is', null)
        .not('nps_cliente', 'is', null)
        .gte('created_at', startDate.toISOString());

      // Aggregate by imobiliaria
      const stats: Record<string, { name: string; leads: number; visitas: number; npsSum: number; npsCount: number }> = {};

      leads?.forEach(lead => {
        const id = lead.imobiliaria_id!;
        const name = (lead.imobiliarias as any)?.nome_empresa || 'Desconhecido';
        if (!stats[id]) stats[id] = { name, leads: 0, visitas: 0, npsSum: 0, npsCount: 0 };
        stats[id].leads++;
      });

      agendamentos?.forEach(ag => {
        const id = ag.imobiliaria_id!;
        if (!stats[id]) stats[id] = { name: 'Desconhecido', leads: 0, visitas: 0, npsSum: 0, npsCount: 0 };
        stats[id].visitas++;
      });

      feedbacks?.forEach(fb => {
        const id = fb.imobiliaria_id!;
        if (!stats[id]) stats[id] = { name: 'Desconhecido', leads: 0, visitas: 0, npsSum: 0, npsCount: 0 };
        stats[id].npsSum += fb.nps_cliente || 0;
        stats[id].npsCount++;
      });

      return Object.entries(stats)
        .map(([id, data]) => ({
          id,
          name: data.name,
          leads: data.leads,
          visitas: data.visitas,
          nps: data.npsCount > 0 ? data.npsSum / data.npsCount : null,
        }))
        .sort((a, b) => b.leads - a.leads)
        .slice(0, 10);
    },
    enabled: !!imovelIds.length,
  });

  // Heatmap data
  const { data: heatmapData } = useQuery({
    queryKey: ['construtora-analytics-heatmap', construtora?.id, period, imovelIds],
    queryFn: async () => {
      if (!imovelIds.length) return [];

      const { data: pageviews } = await supabase
        .from('pageviews')
        .select('created_at')
        .in('imovel_id', imovelIds)
        .gte('created_at', startDate.toISOString());

      const heatmap: { day: string; hour: number; value: number }[] = [];
      const counts: Record<string, number> = {};

      pageviews?.forEach(pv => {
        if (pv.created_at) {
          const date = new Date(pv.created_at);
          const dayIndex = getDay(date);
          const hour = getHours(date);
          const roundedHour = Math.floor(hour / 2) * 2;
          const key = `${DAYS_MAP[dayIndex]}-${roundedHour}`;
          counts[key] = (counts[key] || 0) + 1;
        }
      });

      DAYS_MAP.forEach(day => {
        [8, 10, 12, 14, 16, 18, 20, 22].forEach(hour => {
          heatmap.push({ day, hour, value: counts[`${day}-${hour}`] || 0 });
        });
      });

      return heatmap;
    },
    enabled: !!imovelIds.length,
  });

  // Generate insights
  const insights = useMemo((): Insight[] => {
    if (!kpis) return [];

    const result: Insight[] = [];

    if (kpis.leadsTrend < -15) {
      result.push({
        type: 'warning',
        title: `Taxa de leads caiu ${Math.abs(kpis.leadsTrend).toFixed(0)}% neste período`,
        description: 'Considere revisar as estratégias de captação.',
        action: 'Analisar imóveis com menor performance',
      });
    } else if (kpis.leadsTrend > 20) {
      result.push({
        type: 'success',
        title: `Leads aumentaram ${kpis.leadsTrend.toFixed(0)}%!`,
        description: 'Excelente performance no período.',
      });
    }

    if (kpis.avgNps !== null && kpis.avgNps < 7) {
      result.push({
        type: 'warning',
        title: `NPS médio de ${kpis.avgNps.toFixed(1)} está abaixo do ideal`,
        description: 'Clientes podem estar insatisfeitos com as visitas.',
        action: 'Revisar feedbacks e treinar corretores',
      });
    } else if (kpis.avgNps !== null && kpis.avgNps >= 9) {
      result.push({
        type: 'success',
        title: `NPS excelente: ${kpis.avgNps.toFixed(1)}`,
        description: 'Clientes estão muito satisfeitos!',
      });
    }

    const chatbotLeads = leadOrigins?.find(o => o.name === 'Chatbot IA')?.value || 0;
    const totalLeads = leadOrigins?.reduce((acc, o) => acc + o.value, 0) || 0;
    if (chatbotLeads > 0 && totalLeads > 0 && (chatbotLeads / totalLeads) > 0.3) {
      result.push({
        type: 'info',
        title: `Chatbot IA responsável por ${((chatbotLeads / totalLeads) * 100).toFixed(0)}% dos leads`,
        description: 'O assistente virtual está performando bem.',
      });
    }

    return result;
  }, [kpis, leadOrigins]);

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank.toString();
    }
  };

  return (
    <DashboardLayout title="Analytics" fullWidth>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-muted-foreground">
          Visão consolidada de todos os seus imóveis e parceiros
        </p>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="all">Todo período</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" title="Exportar">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 mb-6">
        <KPICard
          title="Visualizações"
          value={kpis?.views?.toLocaleString() || '0'}
          icon={Eye}
          trend={kpis?.viewsTrend ? { value: Math.round(kpis.viewsTrend), label: 'vs anterior' } : undefined}
        />
        <KPICard
          title="Leads Gerados"
          value={kpis?.leads || 0}
          icon={MessageSquare}
          trend={kpis?.leadsTrend ? { value: Math.round(kpis.leadsTrend), label: 'vs anterior' } : undefined}
        />
        <KPICard
          title="Taxa de Conversão"
          value={`${(kpis?.conversion || 0).toFixed(1)}%`}
          icon={TrendingUp}
          trend={kpis?.conversionTrend ? { value: parseFloat(kpis.conversionTrend.toFixed(1)), label: 'pp' } : undefined}
        />
        <KPICard
          title="Visitas Agendadas"
          value={kpis?.agendamentos || 0}
          icon={Calendar}
          subtitle={`últimos ${getDays()} dias`}
        />
        <KPICard
          title="NPS Médio"
          value={kpis?.avgNps !== null ? kpis.avgNps.toFixed(1) : 'N/A'}
          icon={Star}
          subtitle="satisfação dos clientes"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <TrendLineChart
          title="Evolução de Leads"
          description="Tendência ao longo do período"
          data={leadsOverTime || []}
          lines={[
            { dataKey: 'leads', name: 'Leads', color: '#b8860b' },
            { dataKey: 'views', name: 'Visualizações', color: '#1e3a5f', hidden: true },
          ]}
        />
        <FunnelChart
          title="Funil de Conversão"
          description="Do visitante à visita realizada"
          data={funnelData || []}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <LeadOriginChart
          title="Origem dos Leads"
          description="Distribuição por canal"
          data={leadOrigins || []}
        />
        <HeatmapChart
          title="Horários de Pico"
          description="Quando seus imóveis são mais acessados"
          data={heatmapData || []}
        />
      </div>

      {/* Performance Tables */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <PerformanceTable
          title="Performance por Imóvel"
          description="Ranking dos seus imóveis"
          data={propertyPerformance || []}
          showVisitas
        />

        {/* Imobiliaria Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Ranking de Imobiliárias Parceiras
            </CardTitle>
            <CardDescription>Performance das parceiras no período</CardDescription>
          </CardHeader>
          <CardContent>
            {imobiliariaRanking && imobiliariaRanking.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Pos</TableHead>
                    <TableHead>Imobiliária</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                    <TableHead className="text-right">Visitas</TableHead>
                    <TableHead className="text-right">NPS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {imobiliariaRanking.map((row, idx) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{getRankEmoji(idx + 1)}</TableCell>
                      <TableCell className="font-medium max-w-[150px] truncate">{row.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.leads}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.visitas}</TableCell>
                      <TableCell className="text-right">
                        {row.nps !== null ? (
                          <Badge variant={row.nps >= 9 ? "default" : row.nps >= 7 ? "secondary" : "destructive"}>
                            {row.nps.toFixed(1)}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">Sem dados no período</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Imobiliaria Evolution Chart */}
      {construtora?.id && (
        <div className="mb-6">
          <ImobiliariaEvolutionChart 
            construtoraId={construtora.id} 
            startDate={startDate}
            periodDays={getDays()}
          />
        </div>
      )}

      {/* Consolidated Property Analytics */}
      {construtora?.id && (
        <div className="mb-6">
          <PropertyImobiliariaBreakdown 
            construtoraId={construtora.id} 
            startDate={startDate} 
          />
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <InsightsCard insights={insights} />
      )}
    </DashboardLayout>
  );
}
