import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, AlertCircle, Eye, User, MapPin, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PropostaDetailModal, StatusBadgeProposta, type PropostaWithDetails } from './PropostaDetailModal';

const formatBRL = (value: number | null) => {
  if (!value) return '-';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

interface PropostasTabProps {
  entityId: string | undefined;
  entityType: 'construtora' | 'imobiliaria';
  imoveis?: { id: string; titulo: string }[];
}

export function PropostasTab({ entityId, entityType, imoveis }: PropostasTabProps) {
  const [search, setSearch] = useState('');
  const [selectedImovel, setSelectedImovel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [detailModal, setDetailModal] = useState<{ open: boolean; proposta: PropostaWithDetails | null }>({ open: false, proposta: null });

  const filterCol = entityType === 'construtora' ? 'construtora_id' : 'imobiliaria_id';
  const selectJoins = entityType === 'construtora'
    ? '*, imovel:imoveis(id, titulo), imobiliaria:imobiliarias(id, nome_empresa)'
    : '*, imovel:imoveis(id, titulo)';

  const { data: propostas, isLoading } = useQuery({
    queryKey: ['propostas', entityType, entityId],
    queryFn: async () => {
      if (!entityId) return [];
      const { data, error } = await supabase
        .from('propostas_compra')
        .select(selectJoins)
        .eq(filterCol, entityId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown) as PropostaWithDetails[];
    },
    enabled: !!entityId,
  });

  const filtered = propostas?.filter(p => {
    const matchesSearch = p.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase());
    const matchesImovel = selectedImovel === 'all' || p.imovel?.id === selectedImovel;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    return matchesSearch && matchesImovel && matchesStatus;
  }) || [];

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {imoveis && imoveis.length > 0 && (
          <Select value={selectedImovel} onValueChange={setSelectedImovel}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por imóvel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os imóveis</SelectItem>
              {imoveis.map(im => (
                <SelectItem key={im.id} value={im.id}>{im.titulo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="aceita">Aceita</SelectItem>
            <SelectItem value="recusada">Recusada</SelectItem>
            <SelectItem value="expirada">Expirada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma proposta encontrada.</p>
        </Card>
      ) : entityType === 'construtora' ? (
        /* Table view for construtora */
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Proponente</TableHead>
                  <TableHead>Imóvel</TableHead>
                  <TableHead>Valor Ofertado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.codigo}</TableCell>
                    <TableCell className="font-medium">{p.nome_completo}</TableCell>
                    <TableCell className="text-muted-foreground">{p.imovel?.titulo || '-'}</TableCell>
                    <TableCell className="font-medium">{formatBRL(p.valor_ofertado)}</TableCell>
                    <TableCell><StatusBadgeProposta status={p.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setDetailModal({ open: true, proposta: p })}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        /* Card view for imobiliaria */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => (
            <Card key={p.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <StatusBadgeProposta status={p.status} />
                  <span className="text-xs text-muted-foreground">{formatDate(p.created_at)}</span>
                </div>
                <div className="mt-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {p.nome_completo}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {p.imovel?.titulo || '-'}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">#{p.codigo}</p>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valor ofertado:</span>
                  <span className="font-bold flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatBRL(p.valor_ofertado)}
                  </span>
                </div>
                {p.parcelas && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-muted-foreground">Parcelas:</span>
                    <span className="text-sm">{p.parcelas}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setDetailModal({ open: true, proposta: p })}>
                  <Eye className="mr-1 h-3 w-3" />
                  Ver Detalhes
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <PropostaDetailModal
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, proposta: null })}
        proposta={detailModal.proposta}
      />
    </div>
  );
}
