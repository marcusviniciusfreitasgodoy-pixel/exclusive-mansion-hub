import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Copy, ExternalLink, Link, Eye, Users, Calendar, Search } from 'lucide-react';

interface AccessWithProperty {
  id: string;
  url_slug: string;
  status: string;
  visitas: number;
  acesso_concedido_em: string;
  imovel: {
    id: string;
    titulo: string;
    cidade: string;
    bairro: string;
    valor: number;
    imagens: any;
  };
}

export default function MeusLinks() {
  const { imobiliaria } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: acessos = [], isLoading } = useQuery({
    queryKey: ['meus-links', imobiliaria?.id],
    queryFn: async () => {
      if (!imobiliaria?.id) return [];
      
      const { data, error } = await supabase
        .from('imobiliaria_imovel_access')
        .select(`
          id,
          url_slug,
          status,
          visitas,
          acesso_concedido_em,
          imovel:imoveis (
            id,
            titulo,
            cidade,
            bairro,
            valor,
            imagens
          )
        `)
        .eq('imobiliaria_id', imobiliaria.id)
        .eq('status', 'active')
        .order('acesso_concedido_em', { ascending: false });

      if (error) throw error;
      return (data || []) as AccessWithProperty[];
    },
    enabled: !!imobiliaria?.id,
  });

  const { data: leadsCount = {} } = useQuery({
    queryKey: ['leads-by-access', imobiliaria?.id],
    queryFn: async () => {
      if (!imobiliaria?.id) return {};
      
      const { data, error } = await supabase
        .from('leads')
        .select('access_id')
        .eq('imobiliaria_id', imobiliaria.id);

      if (error) return {};
      
      const counts: Record<string, number> = {};
      data?.forEach(lead => {
        if (lead.access_id) {
          counts[lead.access_id] = (counts[lead.access_id] || 0) + 1;
        }
      });
      return counts;
    },
    enabled: !!imobiliaria?.id,
  });

  const { data: agendamentosCount = {} } = useQuery({
    queryKey: ['agendamentos-by-access', imobiliaria?.id],
    queryFn: async () => {
      if (!imobiliaria?.id) return {};
      
      const { data, error } = await supabase
        .from('agendamentos_visitas')
        .select('access_id')
        .eq('imobiliaria_id', imobiliaria.id);

      if (error) return {};
      
      const counts: Record<string, number> = {};
      data?.forEach(ag => {
        if (ag.access_id) {
          counts[ag.access_id] = (counts[ag.access_id] || 0) + 1;
        }
      });
      return counts;
    },
    enabled: !!imobiliaria?.id,
  });

  const parseImages = (imagens: any): string[] => {
    if (Array.isArray(imagens)) return imagens;
    if (typeof imagens === 'string') {
      try {
        const parsed = JSON.parse(imagens);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const getPropertyImage = (imagens: any): string => {
    const images = parseImages(imagens);
    if (images.length > 0) {
      const first = images[0] as string | { url?: string };
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object' && 'url' in first && first.url) return first.url;
    }
    return '/placeholder.svg';
  };

  const copyLink = async (slug: string) => {
    const url = `${window.location.origin}/imovel/${slug}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: 'Link copiado!',
      description: 'O link foi copiado para a área de transferência.',
    });
  };

  const openLink = (slug: string) => {
    window.open(`/imovel/${slug}`, '_blank');
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'Sob consulta';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const filteredAcessos = acessos.filter(acesso => {
    const searchLower = searchTerm.toLowerCase();
    return (
      acesso.imovel?.titulo?.toLowerCase().includes(searchLower) ||
      acesso.imovel?.cidade?.toLowerCase().includes(searchLower) ||
      acesso.imovel?.bairro?.toLowerCase().includes(searchLower) ||
      acesso.url_slug?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardLayout title="Meus Links">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <p className="text-muted-foreground">
              Gerencie seus links white-label para compartilhar com clientes
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar imóvel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Links</CardTitle>
              <Link className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{acessos.length}</div>
              <p className="text-xs text-muted-foreground">links ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {acessos.reduce((sum, a) => sum + (a.visitas || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">visualizações totais</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Gerados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(leadsCount).reduce((sum: number, count) => sum + (count as number), 0)}
              </div>
              <p className="text-xs text-muted-foreground">via seus links</p>
            </CardContent>
          </Card>
        </div>

        {/* Links List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredAcessos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Link className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum link encontrado</h3>
              <p className="text-muted-foreground max-w-md">
                {searchTerm 
                  ? 'Nenhum imóvel corresponde à sua busca.'
                  : 'Você ainda não tem links de imóveis. Acesse os imóveis disponíveis para gerar seus links personalizados.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAcessos.map((acesso) => (
              <Card key={acesso.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={getPropertyImage(acesso.imovel?.imagens)}
                    alt={acesso.imovel?.titulo || 'Imóvel'}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-primary">
                    Ativo
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base line-clamp-1">
                    {acesso.imovel?.titulo || 'Imóvel'}
                  </CardTitle>
                  <CardDescription className="line-clamp-1">
                    {[acesso.imovel?.bairro, acesso.imovel?.cidade].filter(Boolean).join(', ') || 'Localização não informada'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-lg font-semibold text-primary">
                    {formatCurrency(acesso.imovel?.valor)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {acesso.visitas || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {leadsCount[acesso.id] || 0} leads
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {agendamentosCount[acesso.id] || 0}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <code className="text-xs flex-1 truncate">
                      /imovel/{acesso.url_slug}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => copyLink(acesso.url_slug)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => copyLink(acesso.url_slug)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => openLink(acesso.url_slug)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
