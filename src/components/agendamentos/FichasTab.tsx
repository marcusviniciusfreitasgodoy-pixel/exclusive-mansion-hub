import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, MapPin, Phone, FileText, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

const statusConfig: Record<string, { label: string; className: string }> = {
  agendada: { label: '⏰ Agendada', className: 'border-yellow-500 text-yellow-700 bg-yellow-50' },
  confirmada: { label: '✅ Confirmada', className: 'border-green-500 text-green-700 bg-green-50' },
  realizada: { label: '🎯 Realizada', className: 'border-blue-500 text-blue-700 bg-blue-50' },
  cancelada: { label: '❌ Cancelada', className: 'border-red-500 text-red-700 bg-red-50' },
};

export function FichasTab() {
  const { imobiliaria } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: fichas, isLoading } = useQuery({
    queryKey: ['fichas-visita', imobiliaria?.id],
    queryFn: async () => {
      if (!imobiliaria?.id) return [];
      const { data, error } = await supabase
        .from('fichas_visita')
        .select('*')
        .eq('imobiliaria_id', imobiliaria.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!imobiliaria?.id,
  });

  const filtered = fichas?.filter(f => statusFilter === 'all' || f.status === statusFilter) || [];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="agendada">Agendada</SelectItem>
            <SelectItem value="confirmada">Confirmada</SelectItem>
            <SelectItem value="realizada">Realizada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} ficha(s)</span>
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma ficha de visita encontrada.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(ficha => (
            <Card key={ficha.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className={statusConfig[ficha.status]?.className}>
                    {statusConfig[ficha.status]?.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">{ficha.codigo}</span>
                </div>
                <div className="mt-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {ficha.nome_visitante}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {ficha.telefone_visitante}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  {ficha.endereco_imovel}
                </p>
                <p className="text-sm flex items-center gap-1 text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  CPF: {ficha.cpf_visitante}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(ficha.created_at), { locale: ptBR, addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
