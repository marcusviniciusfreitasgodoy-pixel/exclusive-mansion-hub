import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { IntegrationCard } from '@/components/integrations/IntegrationCard';
import { IntegrationConfigModal } from '@/components/integrations/IntegrationConfigModal';
import { 
  INTEGRACOES_DISPONIVEIS, 
  IntegracaoConfig, 
  Integracao,
  TipoIntegracao 
} from '@/types/integrations';
import { Loader2, Link2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Integracoes() {
  const { imobiliaria } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConfig, setSelectedConfig] = useState<IntegracaoConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch existing integrations
  const { data: integracoes, isLoading } = useQuery({
    queryKey: ['integracoes', imobiliaria?.id],
    queryFn: async () => {
      if (!imobiliaria?.id) return [];
      
      const { data, error } = await supabase
        .from('integracoes')
        .select('*')
        .eq('imobiliaria_id', imobiliaria.id);

      if (error) throw error;
      return data as unknown as Integracao[];
    },
    enabled: !!imobiliaria?.id
  });

  // Save/update integration
  const saveMutation = useMutation({
    mutationFn: async ({
      tipo,
      credenciais,
      configuracoes,
      ativa
    }: {
      tipo: TipoIntegracao;
      credenciais: Record<string, any>;
      configuracoes: Record<string, any>;
      ativa: boolean;
    }) => {
      if (!imobiliaria?.id) throw new Error('Imobiliária não encontrada');

      const existing = integracoes?.find(i => i.tipo_integracao === tipo);
      const config = INTEGRACOES_DISPONIVEIS.find(c => c.tipo === tipo);

      if (existing) {
        const { error } = await supabase
          .from('integracoes')
          .update({
            credenciais,
            configuracoes,
            ativa,
            erro_ultima_tentativa: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('integracoes')
          .insert({
            imobiliaria_id: imobiliaria.id,
            tipo_integracao: tipo,
            nome_exibicao: config?.nome || tipo,
            credenciais,
            configuracoes,
            ativa
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integracoes'] });
    }
  });

  // Delete integration
  const deleteMutation = useMutation({
    mutationFn: async (tipo: TipoIntegracao) => {
      const existing = integracoes?.find(i => i.tipo_integracao === tipo);
      if (!existing) return;

      const { error } = await supabase
        .from('integracoes')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integracoes'] });
    }
  });

  const getIntegracao = (tipo: TipoIntegracao): Integracao | undefined => {
    return integracoes?.find(i => i.tipo_integracao === tipo);
  };

  const handleOpenModal = (config: IntegracaoConfig) => {
    setSelectedConfig(config);
    setModalOpen(true);
  };

  const handleSave = async (
    credenciais: Record<string, any>,
    configuracoes: Record<string, any>,
    ativa: boolean
  ) => {
    if (!selectedConfig) return;
    
    await saveMutation.mutateAsync({
      tipo: selectedConfig.tipo,
      credenciais,
      configuracoes,
      ativa
    });
  };

  const handleDelete = async () => {
    if (!selectedConfig) return;
    await deleteMutation.mutateAsync(selectedConfig.tipo);
  };

  // Test connection based on integration type
  const handleTest = async (credenciais: Record<string, any>): Promise<boolean> => {
    if (!selectedConfig) return false;

    try {
      switch (selectedConfig.tipo) {
        case 'google_analytics':
          // Validate GA4 Measurement ID format
          const gaId = credenciais.measurement_id || '';
          return /^G-[A-Z0-9]{10,}$/i.test(gaId);

        case 'meta_pixel':
          // Validate Pixel ID format
          const pixelId = credenciais.pixel_id || '';
          return /^\d{15,16}$/.test(pixelId);

        case 'google_tag_manager':
          // Validate GTM Container ID format
          const gtmId = credenciais.container_id || '';
          return /^GTM-[A-Z0-9]{7,}$/i.test(gtmId);

        case 'zapier_webhook':
        case 'custom_webhook':
          // Test webhook URL by sending a test ping
          const url = credenciais.webhook_url || credenciais.url;
          if (!url) return false;
          
          try {
            await fetch(url, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ test: true, timestamp: new Date().toISOString() })
            });
            return true;
          } catch {
            return false;
          }

        default:
          return true;
      }
    } catch {
      return false;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Link2 className="h-6 w-6" />
            Integrações
          </h1>
          <p className="text-muted-foreground mt-1">
            Conecte sua conta com ferramentas externas para automatizar processos e melhorar resultados.
          </p>
        </div>

        {/* Info Alert */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            Os scripts de rastreamento (Google Analytics, Meta Pixel, GTM) serão injetados automaticamente 
            nas páginas públicas dos seus imóveis quando a integração estiver ativa.
          </AlertDescription>
        </Alert>

        {/* Integration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRACOES_DISPONIVEIS.map(config => (
            <IntegrationCard
              key={config.tipo}
              config={config}
              integracao={getIntegracao(config.tipo)}
              onConnect={() => handleOpenModal(config)}
              onConfigure={() => handleOpenModal(config)}
              isLoading={
                (saveMutation.isPending || deleteMutation.isPending) &&
                selectedConfig?.tipo === config.tipo
              }
            />
          ))}
        </div>

        {/* Configuration Modal */}
        {selectedConfig && (
          <IntegrationConfigModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            config={selectedConfig}
            integracao={getIntegracao(selectedConfig.tipo)}
            onSave={handleSave}
            onDelete={getIntegracao(selectedConfig.tipo) ? handleDelete : undefined}
            onTest={handleTest}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
