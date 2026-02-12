import { supabase } from '@/integrations/supabase/client';
import type { EstagioPipeline } from '@/types/crm';

interface StageAutomationParams {
  leadId: string;
  newStage: EstagioPipeline;
  userId?: string;
  userName?: string;
  imobiliariaId?: string | null;
  construtoraId?: string | null;
}

interface AutomationConfig {
  titulo: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  horasVencimento: number;
}

const STAGE_AUTOMATIONS: Partial<Record<EstagioPipeline, AutomationConfig>> = {
  qualificado: {
    titulo: 'Follow-up: Contatar lead qualificado',
    prioridade: 'alta',
    horasVencimento: 24,
  },
  visita_agendada: {
    titulo: 'Preparar material para visita',
    prioridade: 'media',
    horasVencimento: 48,
  },
  proposta_enviada: {
    titulo: 'Acompanhar resposta da proposta',
    prioridade: 'alta',
    horasVencimento: 72,
  },
};

/**
 * Runs stage-based automations (fire-and-forget).
 * Creates a task and logs an activity when a lead enters specific stages.
 */
export function runStageAutomations(params: StageAutomationParams): void {
  const config = STAGE_AUTOMATIONS[params.newStage];
  if (!config) return;

  // Fire-and-forget: don't await, catch errors silently
  (async () => {
    try {
      const vencimento = new Date();
      vencimento.setHours(vencimento.getHours() + config.horasVencimento);

      await supabase.from('tarefas').insert({
        lead_id: params.leadId,
        titulo: config.titulo,
        prioridade: config.prioridade,
        data_vencimento: vencimento.toISOString(),
        responsavel_id: params.userId || null,
        responsavel_nome: params.userName || null,
        imobiliaria_id: params.imobiliariaId || null,
        construtora_id: params.construtoraId || null,
      });

      await supabase.from('atividades_lead').insert({
        lead_id: params.leadId,
        tipo: 'nota',
        titulo: '⚡ Tarefa automática criada',
        descricao: `Tarefa "${config.titulo}" criada automaticamente (vence em ${config.horasVencimento}h)`,
        usuario_id: params.userId || null,
        usuario_nome: 'Sistema',
      });
    } catch (err) {
      console.error('[pipelineAutomations] Erro silencioso:', err);
    }
  })();
}

/** Returns true if the given stage has an automation configured */
export function hasStageAutomation(stage: EstagioPipeline): boolean {
  return stage in STAGE_AUTOMATIONS;
}
