// Helpers for dynamic form system
import { supabase } from '@/integrations/supabase/client';
import type { TipoFormulario, CampoFormulario } from '@/types/form-config';
import {
  CAMPOS_PADRAO_AGENDAMENTO,
  CAMPOS_PADRAO_FEEDBACK_CLIENTE,
  CAMPOS_PADRAO_FEEDBACK_CORRETOR,
} from '@/types/form-config';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Get default fields for a form type
 */
export function getDefaultCampos(tipo: TipoFormulario): CampoFormulario[] {
  switch (tipo) {
    case 'agendamento_visita':
      return CAMPOS_PADRAO_AGENDAMENTO;
    case 'feedback_cliente':
      return CAMPOS_PADRAO_FEEDBACK_CLIENTE;
    case 'feedback_corretor':
      return CAMPOS_PADRAO_FEEDBACK_CORRETOR;
    default:
      return [];
  }
}

/**
 * Create default form configurations for a new imobiliária
 */
export async function criarConfiguracoesFormularioPadrao(
  imobiliariaId: string,
  userId: string
): Promise<{ success: boolean; error?: Error }> {
  const configsPadrao = [
    {
      imobiliaria_id: imobiliariaId,
      tipo_formulario: 'agendamento_visita',
      nome_formulario: 'Agendamento de Visita',
      descricao: 'Formulário padrão para agendamento de visitas',
      ativo: true,
      created_by: userId,
      campos: CAMPOS_PADRAO_AGENDAMENTO.map((campo, index) => ({
        ...campo,
        id: crypto.randomUUID(),
        ordem: index + 1,
      })),
    },
    {
      imobiliaria_id: imobiliariaId,
      tipo_formulario: 'feedback_corretor',
      nome_formulario: 'Feedback do Corretor',
      descricao: 'Avaliação do corretor após a visita',
      ativo: true,
      created_by: userId,
      campos: CAMPOS_PADRAO_FEEDBACK_CORRETOR.map((campo, index) => ({
        ...campo,
        id: crypto.randomUUID(),
        ordem: index + 1,
      })),
    },
    {
      imobiliaria_id: imobiliariaId,
      tipo_formulario: 'feedback_cliente',
      nome_formulario: 'Feedback do Cliente',
      descricao: 'Avaliação do cliente após a visita',
      ativo: true,
      created_by: userId,
      campos: CAMPOS_PADRAO_FEEDBACK_CLIENTE.map((campo, index) => ({
        ...campo,
        id: crypto.randomUUID(),
        ordem: index + 1,
      })),
    },
  ];

  const { error } = await supabase
    .from('configuracoes_formularios')
    .insert(configsPadrao as unknown as never);

  if (error) {
    console.error('Erro ao criar configurações de formulário:', error);
    return { success: false, error: error as unknown as Error };
  }

  return { success: true };
}

/**
 * Collect form responses from dynamic fields
 */
export function coletarRespostasFormulario(
  campos: CampoFormulario[],
  formData: Record<string, unknown>
): Record<string, unknown> {
  const respostas: Record<string, unknown> = {};

  campos.forEach((campo) => {
    // Skip signature fields (handled separately)
    if (campo.tipo === 'assinatura') return;
    
    const valor = formData[campo.nome];
    if (valor !== undefined && valor !== null && valor !== '') {
      respostas[campo.nome] = valor;
    }
  });

  return respostas;
}

/**
 * Format a value for display based on field type
 */
export function formatarValor(valor: unknown, tipo?: string): string {
  if (valor === null || valor === undefined) return '';
  
  if (Array.isArray(valor)) {
    return valor.join(', ');
  }
  
  if (tipo === 'date' && typeof valor === 'string') {
    try {
      return format(new Date(valor), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return String(valor);
    }
  }
  
  if (tipo === 'rating' && typeof valor === 'number') {
    return '⭐'.repeat(valor);
  }
  
  if (tipo === 'escala_nps' && typeof valor === 'number') {
    const labels: Record<number, string> = {
      0: '0 - Muito improvável',
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5 - Neutro',
      6: '6',
      7: '7',
      8: '8',
      9: '9',
      10: '10 - Muito provável',
    };
    return labels[valor] || String(valor);
  }
  
  return String(valor);
}

export interface RespostaMapeada {
  nome: string;
  label: string;
  valor: string;
  tipo: string;
}

/**
 * Map custom responses with their labels for display/PDF
 */
export async function mapearRespostasComLabels(
  respostasCustomizadas: Record<string, unknown> | null,
  tipoFormulario: TipoFormulario,
  imobiliariaId: string
): Promise<RespostaMapeada[]> {
  if (!respostasCustomizadas) return [];

  // Fetch form configuration
  const { data: config } = await supabase
    .from('configuracoes_formularios')
    .select('campos')
    .eq('imobiliaria_id', imobiliariaId)
    .eq('tipo_formulario', tipoFormulario)
    .eq('ativo', true)
    .maybeSingle();

  // Use default fields if no config found
  const campos: CampoFormulario[] = config?.campos 
    ? (config.campos as unknown as CampoFormulario[])
    : getDefaultCampos(tipoFormulario);

  // Map responses with labels
  return Object.entries(respostasCustomizadas)
    .map(([nomeCampo, valor]) => {
      const campo = campos.find((c) => c.nome === nomeCampo);
      const valorFormatado = formatarValor(valor, campo?.tipo);
      
      if (!valorFormatado) return null;
      
      return {
        nome: nomeCampo,
        label: campo?.label || nomeCampo,
        valor: valorFormatado,
        tipo: campo?.tipo || 'text',
      } as RespostaMapeada;
    })
    .filter((r): r is RespostaMapeada => r !== null);
}

/**
 * Get form configuration for a specific imobiliária and form type
 */
export async function buscarConfiguracaoFormulario(
  imobiliariaId: string,
  tipoFormulario: TipoFormulario
): Promise<CampoFormulario[]> {
  const { data, error } = await supabase
    .from('configuracoes_formularios')
    .select('campos')
    .eq('imobiliaria_id', imobiliariaId)
    .eq('tipo_formulario', tipoFormulario)
    .eq('ativo', true)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar configuração:', error);
    return getDefaultCampos(tipoFormulario);
  }

  if (!data) {
    return getDefaultCampos(tipoFormulario);
  }

  const campos = data.campos as unknown as CampoFormulario[];
  return campos.sort((a, b) => a.ordem - b.ordem);
}

/**
 * Validate form data against field configuration
 */
export function validarFormulario(
  campos: CampoFormulario[],
  formData: Record<string, unknown>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  campos.forEach((campo) => {
    const valor = formData[campo.nome];

    // Check required
    if (campo.obrigatorio) {
      if (valor === undefined || valor === null || valor === '') {
        errors[campo.nome] = `${campo.label} é obrigatório`;
        return;
      }
    }

    // Skip further validation if empty and not required
    if (!valor) return;

    // Validate based on type
    if (campo.validacao) {
      const { min, max } = campo.validacao;

      if (campo.tipo === 'text' || campo.tipo === 'textarea') {
        const length = String(valor).length;
        if (min && length < min) {
          errors[campo.nome] = `Mínimo de ${min} caracteres`;
        }
        if (max && length > max) {
          errors[campo.nome] = `Máximo de ${max} caracteres`;
        }
      }

      if (campo.tipo === 'number') {
        const num = Number(valor);
        if (min && num < min) {
          errors[campo.nome] = `Valor mínimo: ${min}`;
        }
        if (max && num > max) {
          errors[campo.nome] = `Valor máximo: ${max}`;
        }
      }
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
