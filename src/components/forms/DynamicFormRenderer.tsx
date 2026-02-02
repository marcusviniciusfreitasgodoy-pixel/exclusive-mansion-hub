import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StarRating } from '@/components/feedback/StarRating';
import { NPSScale } from '@/components/feedback/NPSScale';
import { SignaturePad, SignaturePadRef } from '@/components/feedback/SignaturePad';
import type { TipoFormulario, CampoFormulario } from '@/types/form-config';
import {
  CAMPOS_PADRAO_AGENDAMENTO,
  CAMPOS_PADRAO_FEEDBACK_CLIENTE,
  CAMPOS_PADRAO_FEEDBACK_CORRETOR
} from '@/types/form-config';

const getDefaultCampos = (tipo: TipoFormulario): CampoFormulario[] => {
  switch (tipo) {
    case 'agendamento_visita': return CAMPOS_PADRAO_AGENDAMENTO;
    case 'feedback_cliente': return CAMPOS_PADRAO_FEEDBACK_CLIENTE;
    case 'feedback_corretor': return CAMPOS_PADRAO_FEEDBACK_CORRETOR;
  }
};

interface DynamicFormRendererProps {
  tipoFormulario: TipoFormulario;
  imobiliariaId?: string;
  initialData?: Record<string, unknown>;
  onChange?: (data: Record<string, unknown>) => void;
  onSubmit?: (data: Record<string, unknown>) => Promise<void>;
  disabled?: boolean;
  showSignatureFor?: 'cliente' | 'corretor';
  onSignatureChange?: (signature: string) => void;
}

export function DynamicFormRenderer({
  tipoFormulario,
  imobiliariaId,
  initialData = {},
  onChange,
  disabled = false,
  showSignatureFor,
  onSignatureChange,
}: DynamicFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const signatureRefs = useRef<Record<string, SignaturePadRef | null>>({});

  // Fetch custom configuration if imobiliariaId is provided
  const { data: config } = useQuery({
    queryKey: ['form-config', imobiliariaId, tipoFormulario],
    queryFn: async () => {
      if (!imobiliariaId) return null;

      const { data, error } = await supabase
        .from('configuracoes_formularios')
        .select('campos')
        .eq('imobiliaria_id', imobiliariaId)
        .eq('tipo_formulario', tipoFormulario)
        .eq('ativo', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!imobiliariaId,
  });

  // Get campos from config or defaults
  const campos = useMemo(() => {
    if (config?.campos) {
      return (config.campos as unknown as CampoFormulario[])
        .sort((a, b) => a.ordem - b.ordem);
    }
    return getDefaultCampos(tipoFormulario);
  }, [config, tipoFormulario]);

  // Update parent when formData changes
  useEffect(() => {
    onChange?.(formData);
  }, [formData, onChange]);

  // Initialize with initialData
  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData(initialData);
    }
  }, [initialData]);

  const updateField = (nome: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [nome]: value }));
  };

  // Check conditional visibility
  const isFieldVisible = (campo: CampoFormulario): boolean => {
    if (!campo.condicional) return true;

    const { campo_id, valor, mostrar_se } = campo.condicional;
    const campoReferencia = campos.find(c => c.id === campo_id);
    if (!campoReferencia) return true;

    const valorAtual = formData[campoReferencia.nome];

    switch (mostrar_se) {
      case 'igual':
        return valorAtual === valor;
      case 'diferente':
        return valorAtual !== valor;
      case 'contem':
        if (Array.isArray(valorAtual)) {
          return valorAtual.includes(valor);
        }
        return String(valorAtual || '').includes(valor);
      default:
        return true;
    }
  };

  const renderField = (campo: CampoFormulario) => {
    if (!isFieldVisible(campo)) return null;

    const value = formData[campo.nome];

    // Handle signature fields specially
    if (campo.tipo === 'assinatura') {
      // Only show if it matches showSignatureFor or showSignatureFor is not set
      const isClienteSignature = campo.nome.includes('cliente');
      const isCorretorSignature = campo.nome.includes('corretor');

      if (showSignatureFor === 'cliente' && !isClienteSignature) return null;
      if (showSignatureFor === 'corretor' && !isCorretorSignature) return null;

      return (
        <div key={campo.id} className="space-y-2">
          <Label className="flex items-center gap-1">
            {campo.label}
            {campo.obrigatorio && <span className="text-destructive">*</span>}
          </Label>
          <SignaturePad
            ref={(el) => { signatureRefs.current[campo.nome] = el; }}
            onSignatureChange={(hasSignature) => {
              if (hasSignature && signatureRefs.current[campo.nome]) {
                const sig = signatureRefs.current[campo.nome]?.getSignatureData() || '';
                updateField(campo.nome, sig);
                onSignatureChange?.(sig);
              }
            }}
            disabled={disabled}
          />
          {campo.texto_ajuda && (
            <p className="text-sm text-muted-foreground">{campo.texto_ajuda}</p>
          )}
        </div>
      );
    }

    const fieldContent = (() => {
      switch (campo.tipo) {
        case 'text':
          return (
            <Input
              placeholder={campo.placeholder || ''}
              disabled={disabled}
              value={(value as string) || ''}
              onChange={(e) => updateField(campo.nome, e.target.value)}
              minLength={campo.validacao?.min}
              maxLength={campo.validacao?.max}
            />
          );

        case 'email':
          return (
            <Input
              type="email"
              placeholder={campo.placeholder || 'email@exemplo.com'}
              disabled={disabled}
              value={(value as string) || ''}
              onChange={(e) => updateField(campo.nome, e.target.value)}
            />
          );

        case 'telefone':
          return (
            <Input
              type="tel"
              placeholder={campo.placeholder || '(99) 99999-9999'}
              disabled={disabled}
              value={(value as string) || ''}
              onChange={(e) => updateField(campo.nome, e.target.value)}
            />
          );

        case 'number':
          return (
            <Input
              type="number"
              placeholder={campo.placeholder || ''}
              disabled={disabled}
              value={(value as number) ?? ''}
              onChange={(e) => updateField(campo.nome, e.target.value ? Number(e.target.value) : null)}
              min={campo.validacao?.min}
              max={campo.validacao?.max}
            />
          );

        case 'date':
          return (
            <Input
              type="datetime-local"
              disabled={disabled}
              value={(value as string) || ''}
              onChange={(e) => updateField(campo.nome, e.target.value)}
            />
          );

        case 'textarea':
          return (
            <Textarea
              placeholder={campo.placeholder || ''}
              disabled={disabled}
              rows={3}
              value={(value as string) || ''}
              onChange={(e) => updateField(campo.nome, e.target.value)}
              minLength={campo.validacao?.min}
              maxLength={campo.validacao?.max}
            />
          );

        case 'select':
          return (
            <Select
              disabled={disabled}
              value={(value as string) || ''}
              onValueChange={(v) => updateField(campo.nome, v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={campo.placeholder || 'Selecione...'} />
              </SelectTrigger>
              <SelectContent>
                {campo.opcoes?.map((opcao, i) => (
                  <SelectItem key={i} value={opcao}>
                    {opcao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case 'radio':
          return (
            <RadioGroup
              disabled={disabled}
              value={(value as string) || ''}
              onValueChange={(v) => updateField(campo.nome, v)}
            >
              {campo.opcoes?.map((opcao, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem value={opcao} id={`${campo.id}-${i}`} />
                  <Label htmlFor={`${campo.id}-${i}`} className="font-normal cursor-pointer">
                    {opcao}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          );

        case 'checkbox':
          return (
            <div className="space-y-2">
              {campo.opcoes?.map((opcao, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${campo.id}-${i}`}
                    disabled={disabled}
                    checked={(value as string[])?.includes(opcao) || false}
                    onCheckedChange={(checked) => {
                      const current = (value as string[]) || [];
                      if (checked) {
                        updateField(campo.nome, [...current, opcao]);
                      } else {
                        updateField(campo.nome, current.filter(v => v !== opcao));
                      }
                    }}
                  />
                  <Label htmlFor={`${campo.id}-${i}`} className="font-normal cursor-pointer">
                    {opcao}
                  </Label>
                </div>
              ))}
            </div>
          );

        case 'rating':
          return (
            <StarRating
              value={(value as number) || 0}
              onChange={(v) => updateField(campo.nome, v)}
              maxStars={5}
              disabled={disabled}
            />
          );

        case 'escala_nps':
          return (
            <NPSScale
              value={(value as number) ?? null}
              onChange={(v) => updateField(campo.nome, v)}
              disabled={disabled}
            />
          );

        default:
          return (
            <Input placeholder="Campo não suportado" disabled />
          );
      }
    })();

    return (
      <div key={campo.id} className="space-y-2">
        <Label className="flex items-center gap-1">
          {campo.label}
          {campo.obrigatorio && <span className="text-destructive">*</span>}
        </Label>
        {fieldContent}
        {campo.texto_ajuda && (
          <p className="text-sm text-muted-foreground">{campo.texto_ajuda}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {campos.map(renderField)}
    </div>
  );
}

// Hook to validate form data against campo requirements
export function useFormValidation(
  campos: CampoFormulario[],
  formData: Record<string, unknown>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const campo of campos) {
    const value = formData[campo.nome];

    // Skip if field has conditional and is not visible
    if (campo.condicional) {
      const campoReferencia = campos.find(c => c.id === campo.condicional?.campo_id);
      if (campoReferencia) {
        const valorRef = formData[campoReferencia.nome];
        const { valor, mostrar_se } = campo.condicional;

        let isVisible = true;
        switch (mostrar_se) {
          case 'igual':
            isVisible = valorRef === valor;
            break;
          case 'diferente':
            isVisible = valorRef !== valor;
            break;
          case 'contem':
            isVisible = String(valorRef || '').includes(valor);
            break;
        }

        if (!isVisible) continue;
      }
    }

    // Check required
    if (campo.obrigatorio) {
      if (value === undefined || value === null || value === '') {
        errors[campo.nome] = `${campo.label} é obrigatório`;
        continue;
      }
      if (Array.isArray(value) && value.length === 0) {
        errors[campo.nome] = `${campo.label} é obrigatório`;
        continue;
      }
    }

    // Check min/max for text
    if ((campo.tipo === 'text' || campo.tipo === 'textarea') && typeof value === 'string') {
      if (campo.validacao?.min && value.length < campo.validacao.min) {
        errors[campo.nome] = `${campo.label} deve ter pelo menos ${campo.validacao.min} caracteres`;
      }
      if (campo.validacao?.max && value.length > campo.validacao.max) {
        errors[campo.nome] = `${campo.label} deve ter no máximo ${campo.validacao.max} caracteres`;
      }
    }

    // Check min/max for number
    if (campo.tipo === 'number' && typeof value === 'number') {
      if (campo.validacao?.min !== undefined && value < campo.validacao.min) {
        errors[campo.nome] = `${campo.label} deve ser pelo menos ${campo.validacao.min}`;
      }
      if (campo.validacao?.max !== undefined && value > campo.validacao.max) {
        errors[campo.nome] = `${campo.label} deve ser no máximo ${campo.validacao.max}`;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
