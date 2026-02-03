import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Save, Check, Loader2, Home, Eye, Plus } from 'lucide-react';

// Step components
import { Step1BasicInfo, step1Schema, type Step1Data } from '@/components/wizard/Step1BasicInfo';
import { Step2Specifications, step2Schema, type Step2Data } from '@/components/wizard/Step2Specifications';
import { Step3Description, step3Schema, type Step3Data } from '@/components/wizard/Step3Description';
import { Step4Media, step4Schema, type Step4Data } from '@/components/wizard/Step4Media';
import { Step5Review, type ReviewData } from '@/components/wizard/Step5Review';
import type { TemplateType, TemplateCustomization } from '@/types/database';

const STEPS = [
  { id: 1, title: 'Informações Básicas', icon: '📋' },
  { id: 2, title: 'Especificações', icon: '📐' },
  { id: 3, title: 'Descrição', icon: '📝' },
  { id: 4, title: 'Mídias', icon: '🖼️' },
  { id: 5, title: 'Revisão', icon: '✅' },
];

const DRAFT_KEY = 'imovel_draft';

export default function NovoImovel() {
  const { construtora } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form data for all steps
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data & Step3Data & Step4Data> & {
    template_escolhido?: TemplateType;
    customizacao_template?: TemplateCustomization;
  }>({
    template_escolhido: 'moderno',
    customizacao_template: {},
  });
  const [confirmed, setConfirmed] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
        toast({
          title: 'Rascunho recuperado',
          description: 'Seus dados foram restaurados do último rascunho.',
        });
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(formData).length > 0) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
        console.log('[Draft] Saved automatically');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData]);

  const saveDraft = useCallback(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    toast({
      title: 'Rascunho salvo',
      description: 'Seus dados foram salvos com sucesso.',
    });
  }, [formData, toast]);

  const generateSlug = (titulo: string): string => {
    const baseSlug = titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const timestamp = Date.now().toString(36).slice(-4);
    return `${baseSlug}-${timestamp}`;
  };

  const handleStepComplete = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handlePublish = async () => {
    if (!construtora?.id) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado como construtora.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirmed) {
      toast({
        title: 'Confirmação necessária',
        description: 'Por favor, confirme que as informações estão corretas.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const slug = generateSlug(formData.titulo || 'imovel');

      // Prepare data for insertion
      const imovelData = {
        construtora_id: construtora.id,
        titulo: formData.titulo,
        endereco: `${formData.endereco}, ${formData.numero}${formData.complemento ? ` - ${formData.complemento}` : ''}`,
        bairro: formData.bairro,
        cidade: formData.cidade || 'Rio de Janeiro',
        estado: formData.estado || 'RJ',
        valor: formData.valor,
        condominio: formData.condominio || null,
        iptu: formData.iptu || null,
        area_total: formData.areaTotal,
        area_privativa: formData.areaPrivativa,
        suites: formData.suites,
        banheiros: formData.banheiros,
        vagas: formData.vagas,
        descricao: formData.descricao,
        diferenciais: JSON.stringify(formData.diferenciais || []),
        memorial_descritivo: formData.memorial || null,
        imagens: JSON.stringify(formData.imagens || []),
        videos: JSON.stringify(formData.videos || []),
        tour_360_url: formData.tour360Url || null,
        documentos: JSON.stringify(formData.documentos || []),
        status: formData.status || 'ativo',
        template_escolhido: formData.template_escolhido || 'moderno',
        customizacao_template: JSON.stringify(formData.customizacao_template || {}),
      };

      console.log('[Publish] Creating imovel:', imovelData);

      const { data: imovel, error: imovelError } = await supabase
        .from('imoveis')
        .insert(imovelData)
        .select()
        .single();

      if (imovelError) {
        throw imovelError;
      }

      console.log('[Publish] Imovel created:', imovel.id);

      // Create white-label access for the construtora itself
      // First, we need to check if there's an imobiliaria for this user or create a default access
      const { data: access, error: accessError } = await supabase
        .from('imobiliaria_imovel_access')
        .insert({
          imovel_id: imovel.id,
          imobiliaria_id: construtora.id, // Using construtora ID as a workaround
          url_slug: slug,
          status: 'active',
          visitas: 0,
        })
        .select()
        .single();

      if (accessError) {
        console.warn('[Publish] Could not create access:', accessError);
        // Don't fail the whole operation
      } else {
        console.log('[Publish] Access created with slug:', slug);
      }

      // Clear draft
      localStorage.removeItem(DRAFT_KEY);

      setPublishedSlug(slug);
      setShowSuccess(true);

      toast({
        title: 'Imóvel publicado!',
        description: 'Seu imóvel foi criado com sucesso.',
      });

    } catch (error: any) {
      console.error('[Publish] Error:', error);
      toast({
        title: 'Erro ao publicar',
        description: error.message || 'Ocorreu um erro ao publicar o imóvel.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <DashboardLayout title="Imóvel Publicado">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              🎉 Imóvel Publicado com Sucesso!
            </h2>
            <p className="text-muted-foreground mb-6">
              Seu imóvel está agora disponível para visualização.
            </p>

            {publishedSlug && (
              <div className="p-4 bg-muted rounded-lg mb-6">
                <p className="text-sm text-muted-foreground mb-1">Slug gerado:</p>
                <code className="text-primary font-mono">/imovel/{publishedSlug}</code>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {publishedSlug && (
                <Button
                  onClick={() => window.open(`/imovel/${publishedSlug}`, '_blank')}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver Página Pública
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowSuccess(false);
                  setCurrentStep(1);
                  setFormData({});
                  setPublishedSlug(null);
                  setConfirmed(false);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Cadastrar Outro Imóvel
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard/construtora')}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Ir para Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Novo Imóvel">
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
        <Progress value={(currentStep / 5) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].icon} {STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Preencha as informações básicas do imóvel'}
            {currentStep === 2 && 'Especifique as dimensões e características'}
            {currentStep === 3 && 'Descreva o imóvel e seus diferenciais'}
            {currentStep === 4 && 'Adicione fotos, vídeos e tour virtual'}
            {currentStep === 5 && 'Revise todas as informações antes de publicar'}
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
              onComplete={(data) => {
                handleStepComplete(data);
                handleNext();
              }}
            />
          )}
          {currentStep === 4 && (
            <Step4Media
              defaultValues={formData}
              onComplete={(data) => {
                handleStepComplete(data);
                handleNext();
              }}
            />
          )}
          {currentStep === 5 && (
            <Step5Review
              data={formData as ReviewData}
              confirmed={confirmed}
              onConfirmChange={setConfirmed}
              onTemplateChange={(template) => setFormData(prev => ({ ...prev, template_escolhido: template }))}
              onCustomizationChange={(custom) => setFormData(prev => ({ ...prev, customizacao_template: custom }))}
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

        <Button variant="ghost" onClick={saveDraft} className="gap-2">
          <Save className="h-4 w-4" />
          Salvar Rascunho
        </Button>

        {currentStep < 5 ? (
          <div /> // Empty div for spacing - actual next is handled by step forms
        ) : (
          <Button
            onClick={handlePublish}
            disabled={isSubmitting || !confirmed}
            className="gap-2 bg-amber-600 hover:bg-amber-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Publicar Imóvel
              </>
            )}
          </Button>
        )}
      </div>
    </DashboardLayout>
  );
}
