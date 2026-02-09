import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, ThumbsUp, FileText, User, MapPin } from 'lucide-react';
import { DEMO_FEEDBACKS, DEMO_IMOVEIS } from '@/data/demo-data';

const INTERESSE_LABELS: Record<string, { label: string; color: string }> = {
  muito_interessado: { label: '🔥 Muito Interessado', color: 'text-green-600' },
  interessado: { label: '👍 Interessado', color: 'text-blue-600' },
  pouco_interessado: { label: '🤔 Pouco Interessado', color: 'text-yellow-600' },
  sem_interesse: { label: '❌ Sem Interesse', color: 'text-red-600' },
};

const StarDisplay = ({ rating }: { rating: number | null }) => {
  if (!rating) return <span className="text-muted-foreground">-</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-3 w-3 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );
};

interface DemoFeedbacksContentProps {
  filterImobiliariaId?: string;
}

export function DemoFeedbacksContent({ filterImobiliariaId }: DemoFeedbacksContentProps) {
  const feedbacks = filterImobiliariaId
    ? DEMO_FEEDBACKS.filter(f => f.imobiliaria_id === filterImobiliariaId)
    : DEMO_FEEDBACKS;

  const completeFeedbacks = feedbacks.filter(f => f.status === 'completo');

  const avgNPS = completeFeedbacks.length > 0
    ? (completeFeedbacks.reduce((acc, f) => acc + (f.nps_cliente || 0), 0) / completeFeedbacks.length).toFixed(1)
    : '0';

  const muitoInteressados = completeFeedbacks.filter(f => f.interesse_compra === 'muito_interessado').length;
  const interessadosPercent = completeFeedbacks.length > 0
    ? Math.round((muitoInteressados / completeFeedbacks.length) * 100)
    : 0;

  const categoryAverages = {
    localizacao: completeFeedbacks.reduce((acc, f) => acc + (f.avaliacao_localizacao || 0), 0) / (completeFeedbacks.length || 1),
    acabamento: completeFeedbacks.reduce((acc, f) => acc + (f.avaliacao_acabamento || 0), 0) / (completeFeedbacks.length || 1),
    layout: completeFeedbacks.reduce((acc, f) => acc + (f.avaliacao_layout || 0), 0) / (completeFeedbacks.length || 1),
    custo_beneficio: completeFeedbacks.reduce((acc, f) => acc + (f.avaliacao_custo_beneficio || 0), 0) / (completeFeedbacks.length || 1),
    atendimento: completeFeedbacks.reduce((acc, f) => acc + (f.avaliacao_atendimento || 0), 0) / (completeFeedbacks.length || 1),
  };

  // Efeito UAU ranking
  const uauCounts: Record<string, number> = {};
  completeFeedbacks.forEach(f => {
    (f.efeito_uau ?? []).forEach(item => {
      uauCounts[item] = (uauCounts[item] || 0) + 1;
    });
  });
  const uauRanking = Object.entries(uauCounts).sort((a, b) => b[1] - a[1]);

  // Objeções
  const objCounts: Record<string, number> = {};
  completeFeedbacks.forEach(f => {
    (f.objecoes ?? []).forEach(obj => {
      objCounts[obj as string] = (objCounts[obj as string] || 0) + 1;
    });
  });
  const objRanking = Object.entries(objCounts).sort((a, b) => b[1] - a[1]);

  const OBJECAO_LABELS: Record<string, string> = {
    preco: 'Preço', tamanho: 'Tamanho', acabamento: 'Acabamento',
    localizacao: 'Localização', vizinhanca: 'Vizinhança', barulho: 'Barulho',
  };

  const UAU_LABELS: Record<string, string> = {
    vista: 'Vista', acabamento: 'Acabamento', varanda: 'Varanda', espaco: 'Espaço',
    seguranca: 'Segurança', condominio: 'Condomínio', iluminacao: 'Iluminação',
    cozinha: 'Cozinha', localizacao: 'Localização',
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
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
                <p className="text-sm text-muted-foreground">Total Feedbacks</p>
                <p className="text-2xl font-bold">{completeFeedbacks.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Ratings */}
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold">Avaliações por Categoria</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Localização', value: categoryAverages.localizacao },
                { label: 'Acabamento', value: categoryAverages.acabamento },
                { label: 'Layout', value: categoryAverages.layout },
                { label: 'Custo-Benefício', value: categoryAverages.custo_beneficio },
                { label: 'Atendimento', value: categoryAverages.atendimento },
              ].map(cat => (
                <div key={cat.label} className="flex justify-between items-center">
                  <span className="text-sm">{cat.label}</span>
                  <div className="flex items-center gap-1">
                    <StarDisplay rating={Math.round(cat.value)} />
                    <span className="ml-1 text-sm font-medium">{cat.value.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Efeito UAU */}
        {uauRanking.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <h3 className="font-semibold">✨ Efeito UAU</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {uauRanking.map(([key, count], i) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                    <span className="flex-1 text-sm font-medium">{UAU_LABELS[key] || key}</span>
                    <Badge variant="secondary">{count}x</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Objeções */}
        {objRanking.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <h3 className="font-semibold">⚠️ Principais Objeções</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {objRanking.map(([key, count], i) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                    <span className="flex-1 text-sm">{OBJECAO_LABELS[key] || key}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Feedbacks List */}
      <div>
        <h3 className="font-semibold mb-4">Feedbacks Recebidos</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {feedbacks.map(fb => {
            const imovel = DEMO_IMOVEIS.find(i => i.id === fb.imovel_id);
            return (
              <Card key={fb.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                      ✅ Completo
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(fb.data_visita).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="mt-2">
                    <h4 className="font-semibold flex items-center gap-2 text-sm">
                      <User className="h-3 w-3" />
                      {fb.cliente_nome}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {imovel?.titulo}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NPS:</span>
                      <span className="font-bold">{fb.nps_cliente}/10</span>
                    </div>
                    {fb.interesse_compra && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interesse:</span>
                        <span className={`font-medium ${INTERESSE_LABELS[fb.interesse_compra]?.color || ''}`}>
                          {INTERESSE_LABELS[fb.interesse_compra]?.label}
                        </span>
                      </div>
                    )}
                    {fb.pontos_positivos && (
                      <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                        👍 {fb.pontos_positivos}
                      </p>
                    )}
                    {fb.pontos_negativos && (
                      <p className="text-xs text-red-700 bg-red-50 p-2 rounded">
                        👎 {fb.pontos_negativos}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
