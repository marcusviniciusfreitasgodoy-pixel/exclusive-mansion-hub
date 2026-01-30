import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Users, MessageSquare } from 'lucide-react';
import type { Imovel } from '@/types/database';

export default function ConstrutoraDashboard() {
  const { construtora } = useAuth();

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
      return data as Imovel[];
    },
    enabled: !!construtora?.id,
  });

  const { data: accessCounts } = useQuery({
    queryKey: ['access-counts', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id || !imoveis?.length) return {};
      
      const { data, error } = await supabase
        .from('imobiliaria_imovel_access')
        .select('imovel_id')
        .in('imovel_id', imoveis.map(i => i.id))
        .eq('status', 'active');

      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(access => {
        counts[access.imovel_id] = (counts[access.imovel_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!imoveis?.length,
  });

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
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground">
          Gerencie os imóveis cadastrados pela sua construtora
        </p>
        <Button asChild>
          <Link to="/dashboard/construtora/novo-imovel">
            <Plus className="mr-2 h-4 w-4" />
            Novo Imóvel
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : !imoveis?.length ? (
        <Card className="flex h-64 flex-col items-center justify-center text-center">
          <CardContent className="pt-6">
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
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {imoveis.map((imovel) => (
            <Card key={imovel.id} className="overflow-hidden">
              <div className="aspect-video bg-muted">
                {imovel.imagens?.[0]?.url ? (
                  <img
                    src={imovel.imagens[0].url}
                    alt={imovel.titulo}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Sem imagem
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight line-clamp-2">
                    {imovel.titulo}
                  </h3>
                  <Badge className={statusColors[imovel.status]}>
                    {imovel.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {imovel.bairro}, {imovel.cidade}
                </p>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(imovel.valor)}
                </p>
                <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {accessCounts?.[imovel.id] || 0} imobiliárias
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {leadCounts?.[imovel.id] || 0} leads
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
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/imovel/preview/${imovel.id}`} target="_blank">
                    <Eye className="h-3 w-3" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
