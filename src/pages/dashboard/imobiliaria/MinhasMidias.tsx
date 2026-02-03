import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Video, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { MidiaPendenteWithDetails, MidiaStatus } from '@/types/midia';

const statusConfig: Record<MidiaStatus, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendente: { label: 'Pendente', icon: <Clock className="h-3 w-3" />, variant: 'secondary' },
  aprovado: { label: 'Aprovado', icon: <CheckCircle className="h-3 w-3" />, variant: 'default' },
  rejeitado: { label: 'Rejeitado', icon: <XCircle className="h-3 w-3" />, variant: 'destructive' },
};

export default function MinhasMidias() {
  const { imobiliaria } = useAuth();

  const { data: midias, isLoading } = useQuery({
    queryKey: ['minhas-midias', imobiliaria?.id],
    queryFn: async () => {
      if (!imobiliaria?.id) return [];

      const { data, error } = await supabase
        .from('midias_pendentes')
        .select(`
          *,
          imovel:imoveis(id, titulo, bairro, cidade)
        `)
        .eq('imobiliaria_id', imobiliaria.id)
        .order('enviado_em', { ascending: false });

      if (error) throw error;
      return data as MidiaPendenteWithDetails[];
    },
    enabled: !!imobiliaria?.id,
  });

  const pendentes = midias?.filter((m) => m.status === 'pendente') || [];
  const aprovadas = midias?.filter((m) => m.status === 'aprovado') || [];
  const rejeitadas = midias?.filter((m) => m.status === 'rejeitado') || [];

  const renderMidiaCard = (midia: MidiaPendenteWithDetails) => {
    const config = statusConfig[midia.status];

    return (
      <Card key={midia.id} className="overflow-hidden">
        <div className="aspect-video relative bg-muted">
          {midia.tipo === 'imagem' ? (
            <img
              src={midia.url}
              alt={midia.alt || 'Mídia'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <Badge className="absolute top-2 right-2" variant={config.variant}>
            {config.icon}
            <span className="ml-1">{config.label}</span>
          </Badge>
        </div>
        <CardContent className="p-3">
          <p className="font-medium text-sm truncate">
            {midia.imovel?.titulo || 'Imóvel'}
          </p>
          <p className="text-xs text-muted-foreground">
            {midia.imovel?.bairro}, {midia.imovel?.cidade}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Enviado em {format(new Date(midia.enviado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
          {midia.status === 'rejeitado' && midia.motivo_rejeicao && (
            <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive">
              <strong>Motivo:</strong> {midia.motivo_rejeicao}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout title="Minhas Mídias">
      <p className="mb-6 text-muted-foreground">
        Acompanhe o status das mídias enviadas para aprovação
      </p>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : !midias?.length ? (
        <Card className="flex h-64 flex-col items-center justify-center text-center">
          <CardContent className="pt-6">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Você ainda não enviou nenhuma mídia.
              <br />
              Acesse um imóvel e clique em "Enviar Material".
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="todas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="todas">
              Todas ({midias.length})
            </TabsTrigger>
            <TabsTrigger value="pendentes">
              Pendentes ({pendentes.length})
            </TabsTrigger>
            <TabsTrigger value="aprovadas">
              Aprovadas ({aprovadas.length})
            </TabsTrigger>
            <TabsTrigger value="rejeitadas">
              Rejeitadas ({rejeitadas.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todas">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {midias.map(renderMidiaCard)}
            </div>
          </TabsContent>

          <TabsContent value="pendentes">
            {pendentes.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma mídia pendente
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pendentes.map(renderMidiaCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="aprovadas">
            {aprovadas.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma mídia aprovada ainda
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {aprovadas.map(renderMidiaCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejeitadas">
            {rejeitadas.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma mídia rejeitada
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {rejeitadas.map(renderMidiaCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
}
