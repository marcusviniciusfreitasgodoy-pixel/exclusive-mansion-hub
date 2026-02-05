import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Eye, Edit, Users, MessageSquare, Search, MoreVertical, Copy, Power, Trash2, Share2, Building2, TrendingUp } from 'lucide-react';
import type { Imovel } from '@/types/database';

type SortOption = 'recent' | 'oldest' | 'price_high' | 'price_low';
type StatusFilter = 'all' | 'ativo' | 'vendido' | 'inativo';

export default function ConstrutoraDashboard() {
  const { construtora } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const { data: imoveis, isLoading } = useQuery({
    queryKey: ['imoveis', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id) return [];
      
      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('construtora_id', construtora.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Helper to parse JSONB that may come as string or array
      const parseJsonArray = (value: any): any[] => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      };

      // Parse JSONB fields properly
      return (data || []).map(imovel => {
        const imagensArray = parseJsonArray(imovel.imagens);
        const videosArray = parseJsonArray(imovel.videos);
        const diferenciaisArray = parseJsonArray(imovel.diferenciais);
        const corretoresArray = parseJsonArray(imovel.corretores);

        return {
          ...imovel,
          diferenciais: diferenciaisArray,
          imagens: imagensArray.map((img: any) => 
            typeof img === 'string' 
              ? { url: img } 
              : { url: img?.url || '', alt: img?.alt, isPrimary: img?.isPrimary }
          ),
          videos: videosArray.map((vid: any) => 
            typeof vid === 'string' ? { url: vid } : { url: vid?.url || '', tipo: vid?.tipo }
          ),
          features_interior: parseJsonArray(imovel.features_interior),
          features_exterior: parseJsonArray(imovel.features_exterior),
          amenities: parseJsonArray(imovel.amenities),
          tipo_piso: parseJsonArray(imovel.tipo_piso),
          caracteristicas_terreno: parseJsonArray(imovel.caracteristicas_terreno),
          vista: parseJsonArray(imovel.vista),
          aquecimento: parseJsonArray(imovel.aquecimento),
          tags: parseJsonArray(imovel.tags),
          corretores: corretoresArray.map((c: any) => ({
            nome: c?.nome || '',
            cargo: c?.cargo,
            fotoUrl: c?.fotoUrl,
            telefone: c?.telefone,
            email: c?.email,
            miniBio: c?.miniBio,
          })),
          template_escolhido: imovel.template_escolhido || 'moderno',
          customizacao_template: typeof imovel.customizacao_template === 'object' 
            ? imovel.customizacao_template || {} 
            : {},
        };
      }) as Imovel[];
    },
    enabled: !!construtora?.id,
  });

  const { data: accessData } = useQuery({
    queryKey: ['access-data', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id || !imoveis?.length) return { counts: {}, slugs: {} };
      
      const { data, error } = await supabase
        .from('imobiliaria_imovel_access')
        .select('imovel_id, url_slug')
        .in('imovel_id', imoveis.map(i => i.id))
        .eq('status', 'active');

      if (error) throw error;
      
      const counts: Record<string, number> = {};
      const slugs: Record<string, string> = {};
      data?.forEach(access => {
        counts[access.imovel_id] = (counts[access.imovel_id] || 0) + 1;
        // Store first slug found for each imovel
        if (!slugs[access.imovel_id]) {
          slugs[access.imovel_id] = access.url_slug;
        }
      });
      return { counts, slugs };
    },
    enabled: !!imoveis?.length,
  });

  const accessCounts = accessData?.counts;
  const accessSlugs = accessData?.slugs;

  const { data: leadCounts } = useQuery({
    queryKey: ['lead-counts', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id || !imoveis?.length) return {};
      
      const { data, error } = await supabase
        .from('leads')
        .select('imovel_id')
        .in('imovel_id', imoveis.map(i => i.id));

      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(lead => {
        counts[lead.imovel_id] = (counts[lead.imovel_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!imoveis?.length,
  });

  const { data: viewCounts } = useQuery({
    queryKey: ['view-counts', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id || !imoveis?.length) return {};
      
      const { data, error } = await supabase
        .from('pageviews')
        .select('imovel_id')
        .in('imovel_id', imoveis.map(i => i.id));

      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(view => {
        counts[view.imovel_id] = (counts[view.imovel_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!imoveis?.length,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'ativo' | 'inativo' }) => {
      const { error } = await supabase
        .from('imoveis')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      toast({ title: 'Status atualizado', description: 'O status do imóvel foi alterado.' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('imoveis')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      toast({ title: 'Imóvel excluído', description: 'O imóvel foi removido com sucesso.' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const copyLink = async (imovelId: string, titulo: string) => {
    // Get the first access slug for this imovel
    const { data } = await supabase
      .from('imobiliaria_imovel_access')
      .select('url_slug')
      .eq('imovel_id', imovelId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    if (data?.url_slug) {
      const url = `${window.location.origin}/imovel/${data.url_slug}`;
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copiado!', description: 'O link foi copiado para a área de transferência.' });
    } else {
      toast({ title: 'Sem link', description: 'Este imóvel ainda não tem um link white-label.', variant: 'destructive' });
    }
  };

  // Filter and sort logic
  const filteredImoveis = imoveis?.filter(imovel => {
    const matchesSearch = imovel.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      imovel.bairro?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || imovel.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'price_high':
        return (b.valor || 0) - (a.valor || 0);
      case 'price_low':
        return (a.valor || 0) - (b.valor || 0);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  }) || [];

  const statusColors: Record<string, string> = {
    ativo: 'bg-green-100 text-green-800',
    vendido: 'bg-blue-100 text-blue-800',
    inativo: 'bg-gray-100 text-gray-800',
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'A consultar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <DashboardLayout title="Meus Imóveis">
      {/* Header with filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-muted-foreground">
            Gerencie os imóveis cadastrados pela sua construtora
          </p>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/seed-data">
                🌱 Dados de Teste
              </Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard/construtora/novo-imovel">
                <Plus className="mr-2 h-4 w-4" />
                Novo Imóvel
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou bairro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="vendido">Vendidos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigos</SelectItem>
              <SelectItem value="price_high">Maior valor</SelectItem>
              <SelectItem value="price_low">Menor valor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filteredImoveis.length === 0 && !searchQuery && statusFilter === 'all' ? (
        <Card className="flex h-64 flex-col items-center justify-center text-center">
          <CardContent className="pt-6">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="mb-4 text-muted-foreground">
              Você ainda não cadastrou nenhum imóvel
            </p>
            <Button asChild>
              <Link to="/dashboard/construtora/novo-imovel">
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Primeiro Imóvel
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : filteredImoveis.length === 0 ? (
        <Card className="flex h-32 items-center justify-center">
          <p className="text-muted-foreground">Nenhum imóvel encontrado com os filtros aplicados</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredImoveis.map((imovel) => (
            <Card key={imovel.id} className="overflow-hidden group">
              <div className="aspect-video bg-muted relative">
                {(() => {
                  const primaryImg = imovel.imagens?.find(img => img.isPrimary) || imovel.imagens?.[0];
                  return primaryImg?.url ? (
                    <img
                      src={primaryImg.url}
                      alt={primaryImg.alt || imovel.titulo}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <Building2 className="h-12 w-12" />
                    </div>
                  );
                })()}
                <Badge className={`absolute top-2 right-2 ${statusColors[imovel.status]}`}>
                  {imovel.status}
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight line-clamp-2">
                    {imovel.titulo}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => copyLink(imovel.id, imovel.titulo)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Compartilhar
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/dashboard/construtora/imovel/${imovel.id}/acessos`}>
                          <Users className="mr-2 h-4 w-4" />
                          Gerenciar acessos
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => toggleStatusMutation.mutate({
                          id: imovel.id,
                          newStatus: imovel.status === 'ativo' ? 'inativo' : 'ativo'
                        })}
                      >
                        <Power className="mr-2 h-4 w-4" />
                        {imovel.status === 'ativo' ? 'Inativar' : 'Ativar'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir imóvel?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O imóvel "{imovel.titulo}" e todos os dados relacionados serão removidos permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(imovel.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  📍 {imovel.bairro}, {imovel.cidade}
                </p>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(imovel.valor)}
                </p>
                <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1" title="Leads">
                    <MessageSquare className="h-4 w-4" />
                    {leadCounts?.[imovel.id] || 0}
                  </span>
                  <span className="flex items-center gap-1" title="Imobiliárias">
                    <Users className="h-4 w-4" />
                    {accessCounts?.[imovel.id] || 0}
                  </span>
                  <span className="flex items-center gap-1" title="Visualizações">
                    <TrendingUp className="h-4 w-4" />
                    {viewCounts?.[imovel.id] || 0}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link to={`/dashboard/construtora/imovel/${imovel.id}`}>
                    <Edit className="mr-1 h-3 w-3" />
                    Editar
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyLink(imovel.id, imovel.titulo)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {accessSlugs?.[imovel.id] ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/imovel/${accessSlugs[imovel.id]}`} target="_blank">
                      <Eye className="h-3 w-3" />
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled
                    title="Nenhuma imobiliária com acesso"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
