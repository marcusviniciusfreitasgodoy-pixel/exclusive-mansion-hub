import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, eachDayOfInterval, eachWeekOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Building2, Eye, Users } from 'lucide-react';

interface ImobiliariaEvolutionChartProps {
  construtoraId: string;
  startDate: Date;
  periodDays: number;
}

const COLORS = [
  '#1e3a5f', '#b8860b', '#2563eb', '#16a34a', '#dc2626', 
  '#9333ea', '#0891b2', '#ea580c', '#4f46e5', '#059669'
];

type MetricType = 'views' | 'leads';
type AggregationType = 'daily' | 'weekly';

export function ImobiliariaEvolutionChart({ construtoraId, startDate, periodDays }: ImobiliariaEvolutionChartProps) {
  const [metric, setMetric] = useState<MetricType>('leads');
  const [aggregation, setAggregation] = useState<AggregationType>(periodDays > 30 ? 'weekly' : 'daily');

  const { data: evolutionData, isLoading } = useQuery({
    queryKey: ['imobiliaria-evolution', construtoraId, startDate.toISOString(), metric],
    queryFn: async () => {
      // Get all imoveis for this construtora
      const { data: imoveis } = await supabase
        .from('imoveis')
        .select('id')
        .eq('construtora_id', construtoraId);

      if (!imoveis?.length) return { chartData: [], imobiliarias: [] };

      const imovelIds = imoveis.map(i => i.id);

      // Get all active access records with imobiliaria names
      const { data: accessRecords } = await supabase
        .from('imobiliaria_imovel_access')
        .select('imobiliaria_id, imobiliarias(id, nome_empresa)')
        .in('imovel_id', imovelIds)
        .eq('status', 'active');

      // Build unique imobiliarias map
      const imobiliariasMap = new Map<string, string>();
      accessRecords?.forEach(access => {
        const imob = access.imobiliarias as any;
        if (imob && !imobiliariasMap.has(imob.id)) {
          imobiliariasMap.set(imob.id, imob.nome_empresa);
        }
      });

      const imobiliariaIds = Array.from(imobiliariasMap.keys());
      
      if (imobiliariaIds.length === 0) {
        return { chartData: [], imobiliarias: [] };
      }

      // Fetch data based on metric
      let rawData: { created_at: string; imobiliaria_id: string | null }[] = [];

      if (metric === 'views') {
        const { data } = await supabase
          .from('pageviews')
          .select('created_at, imobiliaria_id')
          .in('imovel_id', imovelIds)
          .gte('created_at', startDate.toISOString());
        rawData = data || [];
      } else {
        const { data } = await supabase
          .from('leads')
          .select('created_at, imobiliaria_id')
          .in('imovel_id', imovelIds)
          .gte('created_at', startDate.toISOString());
        rawData = data || [];
      }

      // Filter to only include data from known imobiliarias
      const filteredData = rawData.filter(item => 
        item.imobiliaria_id && imobiliariaIds.includes(item.imobiliaria_id)
      );

      // Build time series data
      const endDate = new Date();
      const days = eachDayOfInterval({ start: startDate, end: endDate });

      // Create base chart data structure
      const chartDataMap = new Map<string, Record<string, number>>();

      days.forEach(day => {
        const key = format(day, 'yyyy-MM-dd');
        const entry: Record<string, number> = {};
        imobiliariaIds.forEach(id => {
          entry[id] = 0;
        });
        chartDataMap.set(key, entry);
      });

      // Populate with actual data
      filteredData.forEach(item => {
        if (item.created_at && item.imobiliaria_id) {
          const key = format(new Date(item.created_at), 'yyyy-MM-dd');
          const entry = chartDataMap.get(key);
          if (entry && entry[item.imobiliaria_id] !== undefined) {
            entry[item.imobiliaria_id]++;
          }
        }
      });

      // Convert to array format for Recharts
      const chartData = Array.from(chartDataMap.entries()).map(([date, values]) => ({
        date,
        dateLabel: format(new Date(date), 'dd/MM', { locale: ptBR }),
        ...values,
      }));

      // Build imobiliarias array with colors
      const imobiliarias = Array.from(imobiliariasMap.entries()).map(([id, name], idx) => ({
        id,
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        fullName: name,
        color: COLORS[idx % COLORS.length],
      }));

      return { chartData, imobiliarias };
    },
    enabled: !!construtoraId,
  });

  // Aggregate data if weekly view is selected
  const aggregatedData = useMemo(() => {
    if (!evolutionData?.chartData.length) return [];
    
    if (aggregation === 'daily') {
      return evolutionData.chartData;
    }

    // Weekly aggregation
    const weeks = eachWeekOfInterval(
      { start: startDate, end: new Date() },
      { weekStartsOn: 1 }
    );

    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekLabel = `${format(weekStart, 'dd/MM', { locale: ptBR })}`;
      
      const weekData: Record<string, number> = {};
      evolutionData.imobiliarias.forEach(imob => {
        weekData[imob.id] = 0;
      });

      evolutionData.chartData.forEach(day => {
        const dayDate = new Date(day.date);
        if (dayDate >= weekStart && dayDate <= weekEnd) {
          evolutionData.imobiliarias.forEach(imob => {
            weekData[imob.id] += (day[imob.id] as number) || 0;
          });
        }
      });

      return {
        date: format(weekStart, 'yyyy-MM-dd'),
        dateLabel: weekLabel,
        ...weekData,
      };
    });
  }, [evolutionData, aggregation, startDate]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 max-w-xs">
        <p className="font-medium mb-2">{label}</p>
        <div className="space-y-1">
          {sortedPayload.map((entry: any) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="truncate max-w-[150px]">{entry.name}</span>
              </div>
              <span className="font-medium tabular-nums">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-80">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  const hasData = evolutionData?.imobiliarias && evolutionData.imobiliarias.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução por Imobiliária
            </CardTitle>
            <CardDescription>
              Comparativo temporal de performance das parceiras
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={metric} onValueChange={(v) => setMetric(v as MetricType)}>
              <TabsList className="h-9">
                <TabsTrigger value="leads" className="text-xs px-3">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  Leads
                </TabsTrigger>
                <TabsTrigger value="views" className="text-xs px-3">
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Views
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={aggregation} onValueChange={(v) => setAggregation(v as AggregationType)}>
              <SelectTrigger className="w-[100px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Building2 className="h-12 w-12 mb-4 opacity-50" />
            <p>Nenhuma imobiliária parceira com dados no período</p>
          </div>
        ) : (
          <>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 mb-4">
              {evolutionData.imobiliarias.map((imob) => (
                <Badge 
                  key={imob.id} 
                  variant="outline"
                  className="flex items-center gap-1.5"
                  title={imob.fullName}
                >
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: imob.color }}
                  />
                  {imob.name}
                </Badge>
              ))}
            </div>

            {/* Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aggregatedData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="dateLabel" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    interval={aggregation === 'daily' && aggregatedData.length > 15 ? Math.floor(aggregatedData.length / 10) : 0}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {evolutionData.imobiliarias.map((imob) => (
                    <Line
                      key={imob.id}
                      type="monotone"
                      dataKey={imob.id}
                      name={imob.name}
                      stroke={imob.color}
                      strokeWidth={2}
                      dot={aggregation === 'weekly' || aggregatedData.length <= 14}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
