import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Save, Check, Loader2, Home, Eye } from 'lucide-react';

// Step components
import { Step1BasicInfo, type Step1Data } from '@/components/wizard/Step1BasicInfo';
import { Step2Specifications, type Step2Data } from '@/components/wizard/Step2Specifications';
import { Step3Description, type Step3Data } from '@/components/wizard/Step3Description';
import { Step4Media, type Step4Data } from '@/components/wizard/Step4Media';
import { Step5Review, type ReviewData } from '@/components/wizard/Step5Review';
import { Step6Template, type Step6Data } from '@/components/wizard/Step6Template';
import type { TemplateType, TemplateCustomization } from '@/types/database';
import type { KnowledgeBaseEntry } from '@/types/knowledge-base';

const STEPS = [
  { id: 1, title: 'Informações Básicas', icon: '📋' },
  { id: 2, title: 'Especificações', icon: '📐' },
  { id: 3, title: 'Descrição', icon: '📝' },
  { id: 4, title: 'Mídias', icon: '🖼️' },
  { id: 5, title: 'Template', icon: '🎨' },
  { id: 6, title: 'Revisão', icon: '✅' },
];

export default function EditarImovel() {
  const { id } = useParams<{ id: string }>();
  const { construtora } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data & Step3Data & Step4Data & Step6Data>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [knowledgeBaseEntries, setKnowledgeBaseEntries] = useState<KnowledgeBaseEntry[]>([]);

  // Fetch knowledge base entries
  useEffect(() => {
    if (!id) return;
    supabase
      .from('imovel_knowledge_base')
      .select('*')
      .eq('imovel_id', id)
      .order('prioridade', { ascending: false })
      .then(({ data }) => {
        if (data) setKnowledgeBaseEntries(data as unknown as KnowledgeBaseEntry[]);
      });
  }, [id]);

  // Fetch existing imovel
  const { data: imovel, isLoading } = useQuery({
    queryKey: ['imovel', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Populate form with existing data
  // Robust JSON parsing helper for JSONB fields (can come as array or string)
  const parseJsonArray = <T,>(value: unknown, defaultValue: T[] = []): T[] => {
    if (Array.isArray(value)) {
      return value as T[];
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : defaultValue;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  };

  useEffect(() => {
    if (imovel) {
      // Parse address parts
      const enderecoParts = imovel.endereco?.split(', ') || ['', ''];
      const numeroPart = enderecoParts[1]?.split(' - ') || ['', ''];
      
      // Robust parsing for all JSONB fields
      const diferenciaisArray = parseJsonArray<string>(imovel.diferenciais);
      const imagensArray = parseJsonArray<{ url?: string; alt?: string; isPrimary?: boolean }>(imovel.imagens);
      const videosArray = parseJsonArray<{ url?: string; tipo?: string }>(imovel.videos);
      const documentosArray = parseJsonArray<{ url?: string; nome?: string; tipo?: string; tamanho_bytes?: number }>(
        (imovel as any).documentos
      );
      
      // Parse materiais_promocionais
      const materiaisPromocionais = (() => {
        const mp = imovel.materiais_promocionais;
        if (!mp || typeof mp !== 'object') return undefined;
        return mp as Step4Data['materiais_promocionais'];
      })();
      
      // Parse template customization
      const customizacaoTemplate = (() => {
        const ct = imovel.customizacao_template;
        if (!ct || typeof ct !== 'object') return {};
        return ct as TemplateCustomization;
      })();

      const mapped: Partial<Step1Data & Step2Data & Step3Data & Step4Data & Step6Data> = {
        titulo: imovel.titulo,
        endereco: enderecoParts[0] || '',
        numero: numeroPart[0] || '',
        complemento: numeroPart[1] || '',
        bairro: imovel.bairro || '',
        cidade: imovel.cidade || 'Rio de Janeiro',
        estado: imovel.estado || 'RJ',
        valor: imovel.valor || undefined,
        condominio: imovel.condominio || undefined,
        iptu: imovel.iptu || undefined,
        areaTotal: imovel.area_total || undefined,
        areaPrivativa: imovel.area_privativa || undefined,
        suites: imovel.suites || undefined,
        banheiros: imovel.banheiros || undefined,
        vagas: imovel.vagas || undefined,
        descricao: imovel.descricao || '',
        diferenciais: diferenciaisArray,
        memorial: imovel.memorial_descritivo || '',
        condicoesPagamento: imovel.condicoes_pagamento || '',
        contextoAdicionalIA: imovel.contexto_adicional_ia || '',
        imagens: imagensArray,
        videos: videosArray,
        tour360Url: imovel.tour_360_url || '',
        status: (imovel.status === 'vendido' ? 'inativo' : imovel.status) as 'ativo' | 'inativo',
        documentos: documentosArray,
        materiais_promocionais: materiaisPromocionais,
        templateEscolhido: (imovel.template_escolhido as TemplateType) || 'luxo',
        customizacaoTemplate: customizacaoTemplate,
      };
      setFormData(mapped);
      setIsDataLoaded(true);
    }
  }, [imovel]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!id) throw new Error('ID não encontrado');

      const updateData = {
        titulo: data.titulo,
        endereco: `${data.endereco}, ${data.numero}${data.complemento ? ` - ${data.complemento}` : ''}`,
        bairro: data.bairro,
        cidade: data.cidade || 'Rio de Janeiro',
        estado: data.estado || 'RJ',
        valor: data.valor,
        condominio: data.condominio || null,
        iptu: data.iptu || null,
        area_total: data.areaTotal,
        area_privativa: data.areaPrivativa,
        suites: data.suites,
        banheiros: data.banheiros,
        vagas: data.vagas,
        descricao: data.descricao,
        diferenciais: JSON.stringify(data.diferenciais || []),
        memorial_descritivo: data.memorial || null,
        condicoes_pagamento: data.condicoesPagamento || null,
        contexto_adicional_ia: data.contextoAdicionalIA || null,
        imagens: JSON.stringify(data.imagens || []),
        videos: JSON.stringify(data.videos || []),
        tour_360_url: data.tour360Url || null,
        status: data.status || 'ativo',
        documentos: JSON.stringify(data.documentos || []),
        materiais_promocionais: data.materiais_promocionais || null,
        template_escolhido: data.templateEscolhido || 'luxo',
        customizacao_template: (data.customizacaoTemplate || null) as any,
      };

      const { error } = await supabase
        .from('imoveis')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Save knowledge base entries (delete + re-insert)
      try {
        await supabase
          .from('imovel_knowledge_base')
          .delete()
          .eq('imovel_id', id);

        if (knowledgeBaseEntries.length > 0) {
          const entriesToInsert = knowledgeBaseEntries.map(({ id: _entryId, created_at, updated_at, ...entry }) => ({
            ...entry,
            imovel_id: id,
          }));
          await supabase.from('imovel_knowledge_base').insert(entriesToInsert);
        }
      } catch (kbError) {
        console.error('Erro ao salvar base de conhecimento:', kbError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      queryClient.invalidateQueries({ queryKey: ['imovel', id] });
      toast({
        title: 'Imóvel atualizado!',
        description: 'As alterações foram salvas com sucesso.',
      });
      navigate('/dashboard/construtora');
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleStepComplete = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = () => {
    if (!confirmed) {
      toast({
        title: 'Confirmação necessária',
        description: 'Por favor, confirme que as informações estão corretas.',
        variant: 'destructive',
      });
      return;
    }
    updateMutation.mutate(formData);
  };

  if (isLoading || !isDataLoaded) {
    return (
      <DashboardLayout title="Carregando...">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!imovel) {
    return (
      <DashboardLayout title="Imóvel não encontrado">
        <Card className="flex h-64 items-center justify-center">
          <CardContent>
            <p className="text-muted-foreground mb-4">O imóvel solicitado não foi encontrado.</p>
            <Button onClick={() => navigate('/dashboard/construtora')}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Editar Imóvel">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                step.id === currentStep
                  ? 'text-primary'
                  : step.id < currentStep
                  ? 'text-green-600'
                  : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1 ${
                  step.id === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : step.id < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-muted'
                }`}
              >
                {step.id < currentStep ? <Check className="h-5 w-5" /> : step.icon}
              </div>
              <span className="text-xs font-medium hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>
        <Progress value={(currentStep / 6) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].icon} {STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Atualize as informações básicas do imóvel'}
            {currentStep === 2 && 'Especifique as dimensões e características'}
            {currentStep === 3 && 'Descreva o imóvel e seus diferenciais'}
            {currentStep === 4 && 'Gerencie fotos, vídeos e tour virtual'}
            {currentStep === 5 && 'Escolha o estilo visual do site do imóvel'}
            {currentStep === 6 && 'Revise todas as informações antes de salvar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <Step1BasicInfo
              defaultValues={formData}
              onComplete={(data) => {
                handleStepComplete(data);
                handleNext();
              }}
            />
          )}
          {currentStep === 2 && (
            <Step2Specifications
              defaultValues={formData}
              onComplete={(data) => {
                handleStepComplete(data);
                handleNext();
              }}
            />
          )}
          {currentStep === 3 && (
            <Step3Description
              defaultValues={formData}
              propertyData={{
                titulo: formData.titulo,
                bairro: formData.bairro,
                cidade: formData.cidade,
                areaTotal: formData.areaTotal,
                areaPrivativa: formData.areaPrivativa,
                suites: formData.suites,
                banheiros: formData.banheiros,
                vagas: formData.vagas,
                valor: formData.valor,
              }}
              onComplete={(data) => {
                handleStepComplete(data);
                handleNext();
              }}
            />
          )}
          {currentStep === 4 && (
            <Step4Media
              defaultValues={formData}
              imovelId={id}
              knowledgeBaseEntries={knowledgeBaseEntries}
              onKnowledgeBaseChange={setKnowledgeBaseEntries}
              onComplete={(data) => {
                handleStepComplete(data);
                handleNext();
              }}
            />
          )}
          {currentStep === 5 && (
            <Step6Template
              defaultValues={{
                templateEscolhido: formData.templateEscolhido,
                customizacaoTemplate: formData.customizacaoTemplate,
              }}
              propertyData={{
                titulo: formData.titulo,
                bairro: formData.bairro,
                cidade: formData.cidade,
                valor: formData.valor,
                imagens: formData.imagens,
              }}
              onComplete={(data) => {
                handleStepComplete(data);
                handleNext();
              }}
            />
          )}
          {currentStep === 6 && (
            <Step5Review
              data={formData as ReviewData}
              confirmed={confirmed}
              onConfirmChange={setConfirmed}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/construtora')}
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          Cancelar
        </Button>

        {currentStep < 6 ? (
          <div /> // Empty div - next handled by step forms
        ) : (
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !confirmed}
            className="gap-2"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        )}
      </div>
    </DashboardLayout>
  );
}
