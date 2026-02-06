import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, eachDayOfInterval, getDay, getHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Eye, Users, TrendingUp, Calendar, MessageSquare, 
  DollarSign, Clock, Download, FileSpreadsheet 
} from 'lucide-react';
import {
  KPICard,
  FunnelChart,
  LeadOriginChart,
  HeatmapChart,
  InsightsCard,
  PerformanceTable,
  TrendLineChart,
  VisitFeedbackAnalytics,
  type Insight,
} from '@/components/analytics';

type PeriodFilter = '7d' | '30d' | '90d' | 'all';

const DAYS_MAP = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function ImobVisitFeedbackSection({ imobiliariaId, startDate }: { imobiliariaId: string; startDate: Date }) {
  const { data: agendamentos, isLoading: loadingAg } = useQuery({
    queryKey: ['imob-vf-agendamentos', imobiliariaId, startDate.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from('agendamentos_visitas')
        .select('id, status, created_at')
        .eq('imobiliaria_id', imobiliariaId)
        .gte('created_at', startDate.toISOString());
      return data || [];
    },
  });

  const { data: feedbacks, isLoading: loadingFb } = useQuery({
    queryKey: ['imob-vf-feedbacks', imobiliariaId, startDate.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from('feedbacks_visitas')
        .select('id, nps_cliente, avaliacao_localizacao, avaliacao_acabamento, avaliacao_layout, avaliacao_custo_beneficio, avaliacao_atendimento, interesse_compra, objecoes, efeito_uau, created_at, feedback_cliente_em, status')
        .eq('imobiliaria_id', imobiliariaId)
        .gte('created_at', startDate.toISOString());
      return data || [];
    },
  });

  return (
    <div className="mb-6">
      <VisitFeedbackAnalytics
        agendamentos={agendamentos || []}
        feedbacks={feedbacks || []}
        isLoading={loadingAg || loadingFb}
      />
    </div>
  );
}


export default function AnalyticsImobiliariaPage() {
  const { imobiliaria } = useAuth();
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

  // Fetch all base data
  const { data: baseData, isLoading } = useQuery({
    queryKey: ['imob-analytics-base', imobiliaria?.id, period],
    queryFn: async () => {
      if (!imobiliaria?.id) return null;

      // Get access IDs for this imobiliaria
      const { data: accesses } = await supabase
        .from('imobiliaria_imovel_access')
        .select('id, imovel_id, imoveis(id, titulo, valor)')
        .eq('imobiliaria_id', imobiliaria.id)
        .eq('status', 'active');

      if (!accesses?.length) return { accesses: [], imovelIds: [], accessIds: [] };

      const imovelIds = accesses.map(a => a.imovel_id);
      const accessIds = accesses.map(a => a.id);

      return { accesses, imovelIds, accessIds };
    },
    enabled: !!imobiliaria?.id,
  });

  // Fetch KPIs with comparison
  const { data: kpis } = useQuery({
    queryKey: ['imob-analytics-kpis', imobiliaria?.id, period, baseData?.accessIds],
    queryFn: async () => {
      if (!baseData?.accessIds?.length) return null;

      const { accessIds, imovelIds } = baseData;

      // Current period
      const [views, leads, agendamentos, previousViews, previousLeads] = await Promise.all([
        supabase
          .from('pageviews')
          .select('id', { count: 'exact', head: true })
          .eq('imobiliaria_id', imobiliaria!.id)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('imobiliaria_id', imobiliaria!.id)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('agendamentos_visitas')
          .select('id', { count: 'exact', head: true })
          .eq('imobiliaria_id', imobiliaria!.id)
          .gte('created_at', startDate.toISOString()),
        // Previous period for comparison
        supabase
          .from('pageviews')
          .select('id', { count: 'exact', head: true })
          .eq('imobiliaria_id', imobiliaria!.id)
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', startDate.toISOString()),
        supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('imobiliaria_id', imobiliaria!.id)
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', startDate.toISOString()),
      ]);

      const viewsCount = views.count || 0;
      const leadsCount = leads.count || 0;
      const agendamentosCount = agendamentos.count || 0;
      const prevViewsCount = previousViews.count || 0;
      const prevLeadsCount = previousLeads.count || 0;

      const conversion = viewsCount > 0 ? (leadsCount / viewsCount) * 100 : 0;
      const prevConversion = prevViewsCount > 0 ? (prevLeadsCount / prevViewsCount) * 100 : 0;

      const viewsTrend = prevViewsCount > 0 ? ((viewsCount - prevViewsCount) / prevViewsCount) * 100 : 0;
      const leadsTrend = prevLeadsCount > 0 ? ((leadsCount - prevLeadsCount) / prevLeadsCount) * 100 : 0;
      const conversionTrend = conversion - prevConversion;

      return {
        views: viewsCount,
        leads: leadsCount,
        agendamentos: agendamentosCount,
        conversion,
        viewsTrend,
        leadsTrend,
        conversionTrend,
      };
    },
    enabled: !!baseData?.accessIds?.length,
  });

  // Leads over time
  const { data: leadsOverTime } = useQuery({
    queryKey: ['imob-analytics-leads-time', imobiliaria?.id, period],
    queryFn: async () => {
      if (!imobiliaria?.id) return [];

      const { data: leads } = await supabase
        .from('leads')
        .select('created_at')
        .eq('imobiliaria_id', imobiliaria.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      const { data: pageviews } = await supabase
        .from('pageviews')
        .select('created_at')
        .eq('imobiliaria_id', imobiliaria.id)
        .gte('created_at', startDate.toISOString());

      const days = eachDayOfInterval({ start: startDate, end: new Date() });
      
      return days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const leadsCount = leads?.filter(l => format(new Date(l.created_at), 'yyyy-MM-dd') === dayStr).length || 0;
        const viewsCount = pageviews?.filter(p => format(new Date(p.created_at!), 'yyyy-MM-dd') === dayStr).length || 0;
        
        return {
          date: format(day, 'dd/MM', { locale: ptBR }),
          leads: leadsCount,
          views: viewsCount,
        };
      });
    },
    enabled: !!imobiliaria?.id,
  });

  // Funnel data
  const { data: funnelData } = useQuery({
    queryKey: ['imob-analytics-funnel', imobiliaria?.id, period],
    queryFn: async () => {
      if (!imobiliaria?.id) return [];

      const [views, leads, agendamentos, realizadas] = await Promise.all([
        supabase
          .from('pageviews')
          .select('id', { count: 'exact', head: true })
          .eq('imobiliaria_id', imobiliaria.id)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('imobiliaria_id', imobiliaria.id)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('agendamentos_visitas')
          .select('id', { count: 'exact', head: true })
          .eq('imobiliaria_id', imobiliaria.id)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('agendamentos_visitas')
          .select('id', { count: 'exact', head: true })
          .eq('imobiliaria_id', imobiliaria.id)
          .eq('status', 'realizado')
          .gte('created_at', startDate.toISOString()),
      ]);

      return [
        { name: 'Visualizações', value: views.count || 0 },
        { name: 'Leads Gerados', value: leads.count || 0 },
        { name: 'Visitas Agendadas', value: agendamentos.count || 0 },
        { name: 'Visitas Realizadas', value: realizadas.count || 0 },
      ];
    },
    enabled: !!imobiliaria?.id,
  });

  // Lead origins
  const { data: leadOrigins } = useQuery({
    queryKey: ['imob-analytics-origins', imobiliaria?.id, period],
    queryFn: async () => {
      if (!imobiliaria?.id) return [];

      const { data: leads } = await supabase
        .from('leads')
        .select('origem')
        .eq('imobiliaria_id', imobiliaria.id)
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
    enabled: !!imobiliaria?.id,
  });

  // Performance by property
  const { data: propertyPerformance } = useQuery({
    queryKey: ['imob-analytics-property', imobiliaria?.id, period, baseData?.accesses],
    queryFn: async () => {
      if (!baseData?.accesses?.length) return [];

      const performance = await Promise.all(baseData.accesses.map(async (access) => {
        const imovel = access.imoveis as any;
        
        const [views, leads, agendamentos] = await Promise.all([
          supabase
            .from('pageviews')
            .select('id', { count: 'exact', head: true })
            .eq('access_id', access.id)
            .gte('created_at', startDate.toISOString()),
          supabase
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .eq('access_id', access.id)
            .gte('created_at', startDate.toISOString()),
          supabase
            .from('agendamentos_visitas')
            .select('id', { count: 'exact', head: true })
            .eq('access_id', access.id)
            .gte('created_at', startDate.toISOString()),
        ]);

        const viewsNum = views.count || 0;
        const leadsNum = leads.count || 0;
        const conversion = viewsNum > 0 ? (leadsNum / viewsNum) * 100 : 0;

        return {
          id: access.id,
          name: imovel?.titulo || 'Imóvel',
          views: viewsNum,
          leads: leadsNum,
          conversion,
          visitas: agendamentos.count || 0,
        };
      }));

      return performance.sort((a, b) => b.views - a.views);
    },
    enabled: !!baseData?.accesses?.length,
  });

  // Heatmap data
  const { data: heatmapData } = useQuery({
    queryKey: ['imob-analytics-heatmap', imobiliaria?.id, period],
    queryFn: async () => {
      if (!imobiliaria?.id) return [];

      const { data: pageviews } = await supabase
        .from('pageviews')
        .select('created_at')
        .eq('imobiliaria_id', imobiliaria.id)
        .gte('created_at', startDate.toISOString());

      const heatmap: { day: string; hour: number; value: number }[] = [];
      const counts: Record<string, number> = {};

      pageviews?.forEach(pv => {
        if (pv.created_at) {
          const date = new Date(pv.created_at);
          const dayIndex = getDay(date);
          const hour = getHours(date);
          const roundedHour = Math.floor(hour / 2) * 2; // Round to even hours
          const key = `${DAYS_MAP[dayIndex]}-${roundedHour}`;
          counts[key] = (counts[key] || 0) + 1;
        }
      });

      DAYS_MAP.forEach(day => {
        [8, 10, 12, 14, 16, 18, 20, 22].forEach(hour => {
          const key = `${day}-${hour}`;
          heatmap.push({ day, hour, value: counts[key] || 0 });
        });
      });

      return heatmap;
    },
    enabled: !!imobiliaria?.id,
  });

  // Generate insights
  const insights = useMemo((): Insight[] => {
    if (!kpis) return [];

    const result: Insight[] = [];

    // Trend insights
    if (kpis.leadsTrend < -10) {
      result.push({
        type: 'warning',
        title: `Taxa de leads caiu ${Math.abs(kpis.leadsTrend).toFixed(0)}% neste período`,
        description: 'Possível causa: menos tráfego ou descrições pouco atrativas',
        action: 'Revisar descrições e fotos dos imóveis',
      });
    } else if (kpis.leadsTrend > 20) {
      result.push({
        type: 'success',
        title: `Leads aumentaram ${kpis.leadsTrend.toFixed(0)}%!`,
        description: 'Suas estratégias de captação estão funcionando bem.',
      });
    }

    // Conversion insights
    if (kpis.conversion < 3) {
      result.push({
        type: 'tip',
        title: 'Taxa de conversão abaixo de 3%',
        description: 'A média do mercado é 5-7%. Considere melhorar CTAs e formulários.',
        action: 'Adicionar formulário simplificado e botões de WhatsApp',
      });
    } else if (kpis.conversion > 10) {
      result.push({
        type: 'success',
        title: `Conversão excelente: ${kpis.conversion.toFixed(1)}%`,
        description: 'Sua taxa está acima da média do mercado!',
      });
    }

    // Chatbot insight
    const chatbotLeads = leadOrigins?.find(o => o.name === 'Chatbot IA')?.value || 0;
    const totalLeads = leadOrigins?.reduce((acc, o) => acc + o.value, 0) || 0;
    if (chatbotLeads > 0 && totalLeads > 0) {
      const chatbotPct = (chatbotLeads / totalLeads) * 100;
      if (chatbotPct > 30) {
        result.push({
          type: 'success',
          title: `Chatbot IA gerou ${chatbotPct.toFixed(0)}% dos leads`,
          description: 'Continue investindo em melhorias do assistente virtual.',
        });
      }
    }

    return result;
  }, [kpis, leadOrigins]);

  return (
    <DashboardLayout title="Analytics">
      {/* Header with filters */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-muted-foreground">
          Métricas de performance dos seus imóveis parceiros
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
          <Button variant="outline" size="icon" title="Exportar CSV">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <KPICard
          title="Visualizações"
          value={kpis?.views?.toLocaleString() || '0'}
          icon={Eye}
          trend={kpis?.viewsTrend ? {
            value: Math.round(kpis.viewsTrend),
            label: 'vs período anterior',
          } : undefined}
        />
        <KPICard
          title="Leads Gerados"
          value={kpis?.leads || 0}
          icon={MessageSquare}
          trend={kpis?.leadsTrend ? {
            value: Math.round(kpis.leadsTrend),
            label: 'vs período anterior',
          } : undefined}
        />
        <KPICard
          title="Taxa de Conversão"
          value={`${(kpis?.conversion || 0).toFixed(1)}%`}
          icon={TrendingUp}
          trend={kpis?.conversionTrend ? {
            value: parseFloat(kpis.conversionTrend.toFixed(1)),
            label: 'pontos percentuais',
          } : undefined}
        />
        <KPICard
          title="Visitas Agendadas"
          value={kpis?.agendamentos || 0}
          icon={Calendar}
          subtitle={`nos últimos ${getDays()} dias`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <TrendLineChart
          title="Evolução de Leads e Visualizações"
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

      {/* Second Row */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <LeadOriginChart
          title="Origem dos Leads"
          description="De onde vêm seus leads"
          data={leadOrigins || []}
        />
        <HeatmapChart
          title="Horários de Pico"
          description="Quando seus imóveis são mais acessados"
          data={heatmapData || []}
        />
      </div>

      {/* Performance Table */}
      <div className="mb-6">
        <PerformanceTable
          title="Performance por Imóvel"
          description="Visualizações, leads e conversão por propriedade"
          data={propertyPerformance || []}
          showVisitas
        />
      </div>

      {/* Visit & Feedback Analytics */}
      {imobiliaria?.id && (
        <ImobVisitFeedbackSection imobiliariaId={imobiliaria.id} startDate={startDate} />
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <InsightsCard insights={insights} />
      )}
    </DashboardLayout>
  );
}
