import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, ChevronDown, ChevronRight, Eye, Users, 
  Calendar, Star, TrendingUp, BarChart3 
} from 'lucide-react';

interface PropertyImobiliariaBreakdownProps {
  construtoraId: string;
  startDate: Date;
}

interface ImobiliariaStats {
  id: string;
  name: string;
  views: number;
  leads: number;
  agendamentos: number;
  conversion: number;
  nps: number | null;
}

interface PropertyWithBreakdown {
  id: string;
  titulo: string;
  valor: number | null;
  totalViews: number;
  totalLeads: number;
  totalAgendamentos: number;
  avgNps: number | null;
  imobiliarias: ImobiliariaStats[];
}

export function PropertyImobiliariaBreakdown({ construtoraId, startDate }: PropertyImobiliariaBreakdownProps) {
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);

  const { data: propertiesWithBreakdown, isLoading } = useQuery({
    queryKey: ['property-imobiliaria-breakdown', construtoraId, startDate.toISOString()],
    queryFn: async () => {
      // Get all imoveis for this construtora
      const { data: imoveis } = await supabase
        .from('imoveis')
        .select('id, titulo, valor')
        .eq('construtora_id', construtoraId)
        .eq('status', 'ativo');

      if (!imoveis?.length) return [];

      // For each property, get breakdown by imobiliaria
      const propertiesData: PropertyWithBreakdown[] = await Promise.all(
        imoveis.map(async (imovel) => {
          // Get all access records for this property
          const { data: accessRecords } = await supabase
            .from('imobiliaria_imovel_access')
            .select('id, imobiliaria_id, imobiliarias(id, nome_empresa)')
            .eq('imovel_id', imovel.id)
            .eq('status', 'active');

          // Get pageviews breakdown
          const { data: pageviewsData } = await supabase
            .from('pageviews')
            .select('imobiliaria_id')
            .eq('imovel_id', imovel.id)
            .gte('created_at', startDate.toISOString());

          // Get leads breakdown
          const { data: leadsData } = await supabase
            .from('leads')
            .select('imobiliaria_id')
            .eq('imovel_id', imovel.id)
            .gte('created_at', startDate.toISOString());

          // Get agendamentos breakdown
          const { data: agendamentosData } = await supabase
            .from('agendamentos_visitas')
            .select('imobiliaria_id')
            .eq('imovel_id', imovel.id)
            .gte('created_at', startDate.toISOString());

          // Get feedbacks for NPS
          const { data: feedbacksData } = await supabase
            .from('feedbacks_visitas')
            .select('imobiliaria_id, nps_cliente')
            .eq('imovel_id', imovel.id)
            .not('nps_cliente', 'is', null)
            .gte('created_at', startDate.toISOString());

          // Aggregate by imobiliaria
          const imobiliariaStats: Record<string, ImobiliariaStats> = {};
          
          // Initialize with access records
          accessRecords?.forEach(access => {
            const imob = access.imobiliarias as any;
            if (imob) {
              imobiliariaStats[imob.id] = {
                id: imob.id,
                name: imob.nome_empresa,
                views: 0,
                leads: 0,
                agendamentos: 0,
                conversion: 0,
                nps: null,
              };
            }
          });

          // Direct traffic (no imobiliaria)
          let directViews = 0;
          let directLeads = 0;
          let directAgendamentos = 0;

          // Count pageviews
          pageviewsData?.forEach(pv => {
            if (pv.imobiliaria_id && imobiliariaStats[pv.imobiliaria_id]) {
              imobiliariaStats[pv.imobiliaria_id].views++;
            } else {
              directViews++;
            }
          });

          // Count leads
          leadsData?.forEach(lead => {
            if (lead.imobiliaria_id && imobiliariaStats[lead.imobiliaria_id]) {
              imobiliariaStats[lead.imobiliaria_id].leads++;
            } else {
              directLeads++;
            }
          });

          // Count agendamentos
          agendamentosData?.forEach(ag => {
            if (ag.imobiliaria_id && imobiliariaStats[ag.imobiliaria_id]) {
              imobiliariaStats[ag.imobiliaria_id].agendamentos++;
            } else {
              directAgendamentos++;
            }
          });

          // Calculate NPS per imobiliaria
          const npsAggregator: Record<string, { sum: number; count: number }> = {};
          let directNpsSum = 0;
          let directNpsCount = 0;

          feedbacksData?.forEach(fb => {
            if (fb.imobiliaria_id) {
              if (!npsAggregator[fb.imobiliaria_id]) {
                npsAggregator[fb.imobiliaria_id] = { sum: 0, count: 0 };
              }
              npsAggregator[fb.imobiliaria_id].sum += fb.nps_cliente || 0;
              npsAggregator[fb.imobiliaria_id].count++;
            } else {
              directNpsSum += fb.nps_cliente || 0;
              directNpsCount++;
            }
          });

          // Apply NPS to stats
          Object.keys(npsAggregator).forEach(imobId => {
            if (imobiliariaStats[imobId]) {
              imobiliariaStats[imobId].nps = npsAggregator[imobId].sum / npsAggregator[imobId].count;
            }
          });

          // Calculate conversion rates
          Object.values(imobiliariaStats).forEach(stat => {
            stat.conversion = stat.views > 0 ? (stat.leads / stat.views) * 100 : 0;
          });

          const imobiliariasArray = Object.values(imobiliariaStats)
            .filter(s => s.views > 0 || s.leads > 0 || s.agendamentos > 0)
            .sort((a, b) => b.leads - a.leads);

          // Add direct traffic if exists
          if (directViews > 0 || directLeads > 0 || directAgendamentos > 0) {
            imobiliariasArray.push({
              id: 'direct',
              name: 'Tráfego Direto',
              views: directViews,
              leads: directLeads,
              agendamentos: directAgendamentos,
              conversion: directViews > 0 ? (directLeads / directViews) * 100 : 0,
              nps: directNpsCount > 0 ? directNpsSum / directNpsCount : null,
            });
          }

          // Calculate totals
          const totalViews = pageviewsData?.length || 0;
          const totalLeads = leadsData?.length || 0;
          const totalAgendamentos = agendamentosData?.length || 0;
          const avgNps = feedbacksData?.length 
            ? feedbacksData.reduce((acc, f) => acc + (f.nps_cliente || 0), 0) / feedbacksData.length 
            : null;

          return {
            id: imovel.id,
            titulo: imovel.titulo,
            valor: imovel.valor,
            totalViews,
            totalLeads,
            totalAgendamentos,
            avgNps,
            imobiliarias: imobiliariasArray,
          };
        })
      );

      // Sort by total leads descending
      return propertiesData.sort((a, b) => b.totalLeads - a.totalLeads);
    },
    enabled: !!construtoraId,
  });

  const formatCurrency = (value: number | null) => {
    if (!value) return 'A consultar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getNpsBadgeVariant = (nps: number | null) => {
    if (nps === null) return 'outline';
    if (nps >= 9) return 'default';
    if (nps >= 7) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Métricas Consolidadas por Imóvel
        </CardTitle>
        <CardDescription>
          Visão detalhada de cada imóvel com breakdown por imobiliária parceira
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!propertiesWithBreakdown?.length ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum imóvel cadastrado ou sem dados no período
          </p>
        ) : (
          <div className="space-y-3">
            {propertiesWithBreakdown.map((property) => (
              <Collapsible
                key={property.id}
                open={expandedProperty === property.id}
                onOpenChange={(open) => setExpandedProperty(open ? property.id : null)}
              >
                <div className="border rounded-lg overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto hover:bg-muted/50"
                    >
                      <div className="flex items-start gap-4 text-left flex-1">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{property.titulo}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(property.valor)} • {property.imobiliarias.length} parceiro(s) ativo(s)
                          </p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium tabular-nums">{property.totalViews}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium tabular-nums">{property.totalLeads}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium tabular-nums">{property.totalAgendamentos}</span>
                          </div>
                          {property.avgNps !== null && (
                            <Badge variant={getNpsBadgeVariant(property.avgNps)}>
                              NPS {property.avgNps.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {expandedProperty === property.id ? (
                        <ChevronDown className="h-5 w-5 ml-2 shrink-0" />
                      ) : (
                        <ChevronRight className="h-5 w-5 ml-2 shrink-0" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="border-t bg-muted/30 p-4">
                      {property.imobiliarias.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          Nenhuma imobiliária com atividade no período
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Imobiliária</TableHead>
                              <TableHead className="text-right">Views</TableHead>
                              <TableHead className="text-right">Leads</TableHead>
                              <TableHead className="text-right">Conversão</TableHead>
                              <TableHead className="text-right">Visitas</TableHead>
                              <TableHead className="text-right">NPS</TableHead>
                              <TableHead className="w-[120px]">% do Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {property.imobiliarias.map((imob, idx) => {
                              const viewsPercent = property.totalViews > 0 
                                ? (imob.views / property.totalViews) * 100 
                                : 0;
                              
                              return (
                                <TableRow key={imob.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {imob.id === 'direct' ? (
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      <span className={imob.id === 'direct' ? 'text-muted-foreground italic' : 'font-medium'}>
                                        {imob.name}
                                      </span>
                                      {idx === 0 && imob.id !== 'direct' && property.imobiliarias.length > 1 && (
                                        <Badge variant="outline" className="text-xs">Top</Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums">{imob.views}</TableCell>
                                  <TableCell className="text-right tabular-nums">{imob.leads}</TableCell>
                                  <TableCell className="text-right tabular-nums">
                                    <span className={imob.conversion >= 5 ? 'text-green-600' : ''}>
                                      {imob.conversion.toFixed(1)}%
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums">{imob.agendamentos}</TableCell>
                                  <TableCell className="text-right">
                                    {imob.nps !== null ? (
                                      <Badge variant={getNpsBadgeVariant(imob.nps)} className="text-xs">
                                        {imob.nps.toFixed(1)}
                                      </Badge>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Progress value={viewsPercent} className="h-2" />
                                      <span className="text-xs text-muted-foreground w-10 tabular-nums">
                                        {viewsPercent.toFixed(0)}%
                                      </span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
