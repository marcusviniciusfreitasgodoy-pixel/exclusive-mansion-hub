import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Image, Video, Check, X, Clock, Building2, Calendar, FileImage, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { MidiaPendenteWithDetails } from '@/types/midia';

export default function AprovarMidias() {
  const { construtora, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [rejectModal, setRejectModal] = useState<{ open: boolean; midia: MidiaPendenteWithDetails | null }>({
    open: false,
    midia: null,
  });
  const [motivoRejeicao, setMotivoRejeicao] = useState('');

  const { data: midiasPendentes, isLoading } = useQuery({
    queryKey: ['midias-pendentes-construtora', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id) return [];

      const { data, error } = await supabase
        .from('midias_pendentes')
        .select(`
          *,
          imovel:imoveis!inner(id, titulo, bairro, cidade, construtora_id),
          imobiliaria:imobiliarias(id, nome_empresa, logo_url)
        `)
        .eq('imovel.construtora_id', construtora.id)
        .eq('status', 'pendente')
        .order('enviado_em', { ascending: true });

      if (error) throw error;
      return data as MidiaPendenteWithDetails[];
    },
    enabled: !!construtora?.id,
  });

  const aprovarMutation = useMutation({
    mutationFn: async (midia: MidiaPendenteWithDetails) => {
      // 1. Update midia status
      const { error: updateError } = await supabase
        .from('midias_pendentes')
        .update({
          status: 'aprovado',
          revisado_em: new Date().toISOString(),
          revisado_por: user?.id,
        })
        .eq('id', midia.id);

      if (updateError) throw updateError;

      // 2. Add media to imovel's imagens/videos array
      const { data: imovelData, error: fetchError } = await supabase
        .from('imoveis')
        .select('imagens, videos')
        .eq('id', midia.imovel_id)
        .single();

      if (fetchError) throw fetchError;

      if (midia.tipo === 'imagem') {
        const currentImagens = (imovelData.imagens as any[]) || [];
        const newImagem = { url: midia.url, alt: midia.alt || '' };
        
        const { error: updateImovelError } = await supabase
          .from('imoveis')
          .update({ imagens: [...currentImagens, newImagem] })
          .eq('id', midia.imovel_id);

        if (updateImovelError) throw updateImovelError;
      } else {
        const currentVideos = (imovelData.videos as any[]) || [];
        const newVideo = { url: midia.url, tipo: midia.video_tipo || 'youtube' };
        
        const { error: updateImovelError } = await supabase
          .from('imoveis')
          .update({ videos: [...currentVideos, newVideo] })
          .eq('id', midia.imovel_id);

        if (updateImovelError) throw updateImovelError;
      }
    },
    onSuccess: () => {
      toast({ title: 'Mídia aprovada!', description: 'A mídia foi adicionada ao imóvel.' });
      queryClient.invalidateQueries({ queryKey: ['midias-pendentes-construtora'] });
      queryClient.invalidateQueries({ queryKey: ['pending-media-count'] });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const rejeitarMutation = useMutation({
    mutationFn: async ({ midia, motivo }: { midia: MidiaPendenteWithDetails; motivo: string }) => {
      const { error } = await supabase
        .from('midias_pendentes')
        .update({
          status: 'rejeitado',
          revisado_em: new Date().toISOString(),
          revisado_por: user?.id,
          motivo_rejeicao: motivo,
        })
        .eq('id', midia.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Mídia rejeitada', description: 'A imobiliária foi notificada.' });
      queryClient.invalidateQueries({ queryKey: ['midias-pendentes-construtora'] });
      queryClient.invalidateQueries({ queryKey: ['pending-media-count'] });
      setRejectModal({ open: false, midia: null });
      setMotivoRejeicao('');
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const handleReject = () => {
    if (rejectModal.midia && motivoRejeicao.trim()) {
      rejeitarMutation.mutate({ midia: rejectModal.midia, motivo: motivoRejeicao.trim() });
    }
  };

  // Group by imovel
  const groupedByImovel = midiasPendentes?.reduce((acc, midia) => {
    const key = midia.imovel_id;
    if (!acc[key]) {
      acc[key] = {
        imovel: midia.imovel,
        midias: [],
      };
    }
    acc[key].midias.push(midia);
    return acc;
  }, {} as Record<string, { imovel: any; midias: MidiaPendenteWithDetails[] }>);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <DashboardLayout title="Aprovar Mídias">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          Revise e aprove mídias enviadas pelas imobiliárias
        </p>
        {midiasPendentes && midiasPendentes.length > 0 && (
          <Badge variant="secondary" className="text-base px-3 py-1">
            <Clock className="h-4 w-4 mr-1" />
            {midiasPendentes.length} pendente{midiasPendentes.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : !midiasPendentes?.length ? (
        <Card className="flex h-64 flex-col items-center justify-center text-center">
          <CardContent className="pt-6">
            <Check className="h-12 w-12 mx-auto text-primary mb-4" />
            <p className="text-lg font-medium">Tudo em dia!</p>
            <p className="text-muted-foreground">
              Não há mídias pendentes de aprovação.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByImovel || {}).map(([imovelId, group]) => (
            <Card key={imovelId}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {group.imovel?.titulo}
                  <span className="text-sm font-normal text-muted-foreground">
                    - {group.imovel?.bairro}, {group.imovel?.cidade}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {group.midias.map((midia) => (
                    <div
                      key={midia.id}
                      className="flex gap-4 p-4 border rounded-lg bg-muted/30"
                    >
                      {/* Preview */}
                      <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        {midia.tipo === 'imagem' ? (
                          <img
                            src={midia.url}
                            alt={midia.alt || 'Preview'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {midia.tipo === 'imagem' ? (
                              <><Image className="h-3 w-3 mr-1" /> Imagem</>
                            ) : (
                              <><Video className="h-3 w-3 mr-1" /> {midia.video_tipo?.toUpperCase()}</>
                            )}
                          </Badge>
                          {midia.tamanho_bytes && (
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(midia.tamanho_bytes)}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {midia.imobiliaria?.nome_empresa}
                        </p>
                        
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          Enviado em {format(new Date(midia.enviado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>

                        {midia.nome_arquivo_original && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                            <FileImage className="h-3 w-3" />
                            {midia.nome_arquivo_original}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => aprovarMutation.mutate(midia)}
                          disabled={aprovarMutation.isPending}
                        >
                          {aprovarMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Aprovar
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectModal({ open: true, midia })}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Dialog open={rejectModal.open} onOpenChange={(open) => !open && setRejectModal({ open: false, midia: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Rejeitar Mídia
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Informe o motivo da rejeição. A imobiliária receberá este feedback.
            </p>
            <Textarea
              placeholder="Ex: Qualidade da imagem muito baixa, não condiz com o padrão do imóvel..."
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModal({ open: false, midia: null })}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!motivoRejeicao.trim() || rejeitarMutation.isPending}
            >
              {rejeitarMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
