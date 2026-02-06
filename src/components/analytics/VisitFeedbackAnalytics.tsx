import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { CheckCircle, Activity, Star, Clock } from 'lucide-react';
import { KPICard } from './KPICard';
import { TrendLineChart } from './TrendLineChart';

interface Agendamento {
  id: string;
  status: string;
  created_at: string | null;
}

interface Feedback {
  id: string;
  nps_cliente: number | null;
  avaliacao_localizacao: number | null;
  avaliacao_acabamento: number | null;
  avaliacao_layout: number | null;
  avaliacao_custo_beneficio: number | null;
  avaliacao_atendimento: number | null;
  interesse_compra: string | null;
  objecoes: any;
  efeito_uau: string[] | null;
  created_at: string | null;
  feedback_cliente_em: string | null;
  status: string;
}

const EFEITO_UAU_LABELS: Record<string, string> = {
  vista: 'Vista',
  acabamento: 'Acabamento',
  espaco: 'Espaço',
  iluminacao: 'Iluminação',
  varanda: 'Varanda / Área externa',
  cozinha: 'Cozinha',
  banheiros: 'Banheiros',
  localizacao: 'Localização',
  condominio: 'Condomínio',
  seguranca: 'Segurança',
};

interface VisitFeedbackAnalyticsProps {
  agendamentos: Agendamento[];
  feedbacks: Feedback[];
  isLoading?: boolean;
}

const PIE_COLORS = ['#1e3a5f', '#b8860b', '#2d5a87', '#d4a84b', '#9ca3af'];

const INTERESSE_LABELS: Record<string, string> = {
  muito_interessado: 'Muito interessado',
  interessado: 'Interessado',
  indeciso: 'Indeciso',
  pouco_interessado: 'Pouco interessado',
  sem_interesse: 'Sem interesse',
};

const OBJECAO_LABELS: Record<string, string> = {
  preco: 'Preço',
  localizacao: 'Localização',
  tamanho: 'Tamanho',
  acabamento: 'Acabamento',
  prazo_entrega: 'Prazo de Entrega',
  financiamento: 'Financiamento',
  documentacao: 'Documentação',
  outro: 'Outro',
};

export function VisitFeedbackAnalytics({ agendamentos, feedbacks, isLoading }: VisitFeedbackAnalyticsProps) {
  const metrics = useMemo(() => {
    const total = agendamentos.length;
    const confirmados = agendamentos.filter(a => ['confirmado', 'realizado'].includes(a.status)).length;
    const realizados = agendamentos.filter(a => a.status === 'realizado').length;

    const taxaConfirmacao = total > 0 ? (confirmados / total) * 100 : 0;
    const taxaRealizacao = confirmados > 0 ? (realizados / confirmados) * 100 : 0;

    const feedbacksComNps = feedbacks.filter(f => f.nps_cliente != null);
    const npsMedio = feedbacksComNps.length > 0
      ? feedbacksComNps.reduce((acc, f) => acc + (f.nps_cliente || 0), 0) / feedbacksComNps.length
      : null;

    const feedbacksComTempo = feedbacks.filter(f => f.feedback_cliente_em && f.created_at);
    let tempoMedioHoras: number | null = null;
    if (feedbacksComTempo.length > 0) {
      const totalHoras = feedbacksComTempo.reduce((acc, f) => {
        const diff = new Date(f.feedback_cliente_em!).getTime() - new Date(f.created_at!).getTime();
        return acc + diff / (1000 * 60 * 60);
      }, 0);
      tempoMedioHoras = totalHoras / feedbacksComTempo.length;
    }

    return { taxaConfirmacao, taxaRealizacao, npsMedio, tempoMedioHoras };
  }, [agendamentos, feedbacks]);

  // NPS over time
  const npsOverTime = useMemo(() => {
    const feedbacksComNps = feedbacks
      .filter(f => f.nps_cliente != null && f.created_at)
      .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime());

    const grouped: Record<string, { sum: number; count: number }> = {};
    feedbacksComNps.forEach(f => {
      const day = format(new Date(f.created_at!), 'dd/MM', { locale: ptBR });
      if (!grouped[day]) grouped[day] = { sum: 0, count: 0 };
      grouped[day].sum += f.nps_cliente || 0;
      grouped[day].count++;
    });

    return Object.entries(grouped).map(([date, { sum, count }]) => ({
      date,
      nps: parseFloat((sum / count).toFixed(1)),
    }));
  }, [feedbacks]);

  // Category averages
  const categoryData = useMemo(() => {
    const completed = feedbacks.filter(f => f.avaliacao_localizacao != null);
    if (completed.length === 0) return [];

    const categories = [
      { key: 'avaliacao_localizacao', label: 'Localização' },
      { key: 'avaliacao_acabamento', label: 'Acabamento' },
      { key: 'avaliacao_layout', label: 'Layout' },
      { key: 'avaliacao_custo_beneficio', label: 'Custo-Benefício' },
      { key: 'avaliacao_atendimento', label: 'Atendimento' },
    ];

    return categories.map(cat => {
      const vals = completed.map(f => (f as any)[cat.key]).filter((v: any) => v != null);
      const avg = vals.length > 0 ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0;
      return { name: cat.label, media: parseFloat(avg.toFixed(1)) };
    });
  }, [feedbacks]);

  // Interest distribution
  const interesseData = useMemo(() => {
    const withInteresse = feedbacks.filter(f => f.interesse_compra);
    const grouped: Record<string, number> = {};
    withInteresse.forEach(f => {
      const key = f.interesse_compra!;
      grouped[key] = (grouped[key] || 0) + 1;
    });
    return Object.entries(grouped).map(([key, value]) => ({
      name: INTERESSE_LABELS[key] || key,
      value,
    }));
  }, [feedbacks]);

  // Objections
  const objecoesData = useMemo(() => {
    const counts: Record<string, number> = {};
    feedbacks.forEach(f => {
      if (f.objecoes && Array.isArray(f.objecoes)) {
        (f.objecoes as string[]).forEach(obj => {
          counts[obj] = (counts[obj] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([key, value]) => ({ name: OBJECAO_LABELS[key] || key, total: value }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [feedbacks]);

  // Efeito UAU ranking
  const efeitoUauData = useMemo(() => {
    const counts: Record<string, number> = {};
    feedbacks.forEach(f => {
      if (f.efeito_uau && Array.isArray(f.efeito_uau)) {
        f.efeito_uau.forEach(item => {
          counts[item] = (counts[item] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([key, value]) => ({ name: EFEITO_UAU_LABELS[key] || key, total: value }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [feedbacks]);

  const formatTempo = (hours: number | null) => {
    if (hours == null) return 'N/A';
    if (hours < 1) return `${Math.round(hours * 60)}min`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} className="text-sm">
              {item.name}: <strong>{item.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const total = interesseData.reduce((a, b) => a + b.value, 0);
      const pct = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">{payload[0].value} ({pct}%)</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando métricas de visitas...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Visitas e Satisfação</h3>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Taxa de Confirmação"
          value={`${metrics.taxaConfirmacao.toFixed(1)}%`}
          icon={CheckCircle}
          subtitle={`${agendamentos.length} agendamentos`}
        />
        <KPICard
          title="Taxa de Realização"
          value={`${metrics.taxaRealizacao.toFixed(1)}%`}
          icon={Activity}
          subtitle="confirmados → realizados"
        />
        <KPICard
          title="NPS Médio"
          value={metrics.npsMedio != null ? metrics.npsMedio.toFixed(1) : 'N/A'}
          icon={Star}
          subtitle={`${feedbacks.filter(f => f.nps_cliente != null).length} avaliações`}
        />
        <KPICard
          title="Tempo Médio Resposta"
          value={formatTempo(metrics.tempoMedioHoras)}
          icon={Clock}
          subtitle="feedback do cliente"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TrendLineChart
          title="Evolução do NPS"
          description="Satisfação ao longo do tempo"
          data={npsOverTime}
          lines={[{ dataKey: 'nps', name: 'NPS Médio', color: '#b8860b' }]}
        />

        <Card>
          <CardHeader>
            <CardTitle>Avaliações por Categoria</CardTitle>
            <CardDescription>Média de estrelas (1-5)</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={110} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="media" name="Média" fill="#1e3a5f" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem avaliações no período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Interesse de Compra</CardTitle>
            <CardDescription>Distribuição dos feedbacks</CardDescription>
          </CardHeader>
          <CardContent>
            {interesseData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={interesseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {interesseData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {interesseData.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-sm">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados no período
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Principais Objeções</CardTitle>
            <CardDescription>Motivos de não-compra mais citados</CardDescription>
          </CardHeader>
          <CardContent>
            {objecoesData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={objecoesData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={110} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total" name="Menções" fill="#b8860b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem objeções registradas
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 - Efeito UAU */}
      {efeitoUauData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>✨ Efeito UAU — Top Impressões</CardTitle>
              <CardDescription>Aspectos que mais impressionaram os visitantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={efeitoUauData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={140} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total" name="Menções" fill="#2d5a87" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
