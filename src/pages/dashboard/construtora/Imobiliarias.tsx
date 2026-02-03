import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Building2, Mail, Phone, ExternalLink, TrendingUp } from 'lucide-react';

interface ImobiliariaAccess {
  id: string;
  imobiliaria_id: string;
  imovel_id: string;
  url_slug: string;
  status: 'active' | 'revoked';
  acesso_concedido_em: string;
  visitas: number;
  imobiliarias: {
    id: string;
    nome_empresa: string;
    email_contato: string | null;
    telefone: string | null;
    creci: string;
    logo_url: string | null;
  };
  imoveis: {
    id: string;
    titulo: string;
  };
}

export default function ImobiliariasConstrutora() {
  const { construtora } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all imobiliarias with access to construtora's properties
  const { data: accessData, isLoading } = useQuery({
    queryKey: ['imobiliarias-access', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id) return [];

      // First get all imoveis belonging to this construtora
      const { data: imoveis, error: imoveisError } = await supabase
        .from('imoveis')
        .select('id')
        .eq('construtora_id', construtora.id);

      if (imoveisError) throw imoveisError;
      if (!imoveis?.length) return [];

      const imovelIds = imoveis.map(i => i.id);

      // Then get all access records for these imoveis
      const { data, error } = await supabase
        .from('imobiliaria_imovel_access')
        .select(`
          id,
          imobiliaria_id,
          imovel_id,
          url_slug,
          status,
          acesso_concedido_em,
          visitas,
          imobiliarias (
            id,
            nome_empresa,
            email_contato,
            telefone,
            creci,
            logo_url
          ),
          imoveis (
            id,
            titulo
          )
        `)
        .in('imovel_id', imovelIds)
        .order('acesso_concedido_em', { ascending: false });

      if (error) throw error;
      return (data || []) as ImobiliariaAccess[];
    },
    enabled: !!construtora?.id,
  });

  // Fetch lead counts per imobiliaria
  const { data: leadCounts } = useQuery({
    queryKey: ['leads-per-imobiliaria', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id) return {};

      const { data, error } = await supabase
        .from('leads')
        .select('imobiliaria_id')
        .eq('construtora_id', construtora.id)
        .not('imobiliaria_id', 'is', null);

      if (error) return {};

      const counts: Record<string, number> = {};
      data?.forEach(lead => {
        if (lead.imobiliaria_id) {
          counts[lead.imobiliaria_id] = (counts[lead.imobiliaria_id] || 0) + 1;
        }
      });
      return counts;
    },
    enabled: !!construtora?.id,
  });

  // Group access by imobiliaria
  const imobiliariasMap = new Map<string, {
    imobiliaria: ImobiliariaAccess['imobiliarias'];
    accesses: ImobiliariaAccess[];
    totalVisitas: number;
  }>();

  accessData?.forEach(access => {
    if (!access.imobiliarias) return;
    
    const existing = imobiliariasMap.get(access.imobiliaria_id);
    if (existing) {
      existing.accesses.push(access);
      existing.totalVisitas += access.visitas || 0;
    } else {
      imobiliariasMap.set(access.imobiliaria_id, {
        imobiliaria: access.imobiliarias,
        accesses: [access],
        totalVisitas: access.visitas || 0,
      });
    }
  });

  const imobiliariasList = Array.from(imobiliariasMap.values());

  // Filter by search
  const filteredImobiliarias = imobiliariasList.filter(item =>
    item.imobiliaria.nome_empresa.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.imobiliaria.creci.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Imobiliárias Parceiras">
      <div className="mb-6 space-y-4">
        <p className="text-muted-foreground">
          Visualize todas as imobiliárias que têm acesso aos seus imóveis
        </p>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CRECI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredImobiliarias.length === 0 ? (
        <Card className="flex h-64 flex-col items-center justify-center text-center">
          <CardContent className="pt-6">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Nenhuma imobiliária encontrada com esse filtro'
                : 'Nenhuma imobiliária tem acesso aos seus imóveis ainda'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Conceda acesso a imobiliárias através da página de gerenciamento de cada imóvel
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredImobiliarias.map(({ imobiliaria, accesses, totalVisitas }) => (
            <Card key={imobiliaria.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  {imobiliaria.logo_url ? (
                    <img
                      src={imobiliaria.logo_url}
                      alt={imobiliaria.nome_empresa}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {imobiliaria.nome_empresa}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      CRECI: {imobiliaria.creci}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact info */}
                <div className="space-y-2 text-sm">
                  {imobiliaria.email_contato && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{imobiliaria.email_contato}</span>
                    </div>
                  )}
                  {imobiliaria.telefone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{imobiliaria.telefone}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-4 pt-2 border-t">
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold">{accesses.length}</p>
                    <p className="text-xs text-muted-foreground">
                      {accesses.length === 1 ? 'Imóvel' : 'Imóveis'}
                    </p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold">{leadCounts?.[imobiliaria.id] || 0}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold">{totalVisitas}</p>
                    <p className="text-xs text-muted-foreground">Visitas</p>
                  </div>
                </div>

                {/* Accessed properties */}
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Imóveis com acesso:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {accesses.slice(0, 3).map(access => (
                      <Badge key={access.id} variant="secondary" className="text-xs">
                        {access.imoveis?.titulo?.slice(0, 20)}
                        {(access.imoveis?.titulo?.length || 0) > 20 ? '...' : ''}
                      </Badge>
                    ))}
                    {accesses.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{accesses.length - 3} mais
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {filteredImobiliarias.length > 0 && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Resumo</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">{filteredImobiliarias.length}</p>
                <p className="text-sm text-muted-foreground">Imobiliárias</p>
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {filteredImobiliarias.reduce((acc, i) => acc + i.accesses.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Acessos Ativos</p>
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {Object.values(leadCounts || {}).reduce((a, b) => a + b, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total de Leads</p>
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {filteredImobiliarias.reduce((acc, i) => acc + i.totalVisitas, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total de Visitas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
