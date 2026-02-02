// CRM Types for Pipeline Kanban

export type EstagioPipeline = 
  | 'novo' 
  | 'contatado' 
  | 'qualificado' 
  | 'visita_agendada' 
  | 'proposta_enviada' 
  | 'negociacao' 
  | 'ganho' 
  | 'perdido';

export type TipoAtividade = 
  | 'email_enviado' 
  | 'whatsapp_enviado' 
  | 'ligacao_realizada' 
  | 'reuniao' 
  | 'visita_agendada' 
  | 'proposta_enviada' 
  | 'nota' 
  | 'status_alterado';

export type PrioridadeTarefa = 'baixa' | 'media' | 'alta' | 'urgente';

export type StatusTarefa = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';

export interface LeadPipeline {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  mensagem: string | null;
  origem: string | null;
  status: string | null;
  estagio_pipeline: EstagioPipeline;
  score_qualificacao: number;
  tags: string[];
  orcamento: number | null;
  prazo_compra: string | null;
  origem_detalhada: string | null;
  ultimo_contato: string | null;
  responsavel_id: string | null;
  responsavel_nome: string | null;
  imovel_id: string;
  imobiliaria_id: string | null;
  construtora_id: string | null;
  access_id: string | null;
  created_at: string | null;
  // Joined data
  imovel?: {
    id: string;
    titulo: string;
    valor: number | null;
    bairro: string | null;
    cidade: string | null;
  };
}

export interface AtividadeLead {
  id: string;
  lead_id: string;
  tipo: TipoAtividade;
  titulo: string | null;
  descricao: string | null;
  metadata: Record<string, any>;
  usuario_id: string | null;
  usuario_nome: string | null;
  created_at: string;
}

export interface Tarefa {
  id: string;
  lead_id: string | null;
  imobiliaria_id: string | null;
  construtora_id: string | null;
  titulo: string;
  descricao: string | null;
  responsavel_id: string | null;
  responsavel_nome: string | null;
  data_vencimento: string | null;
  data_conclusao: string | null;
  prioridade: PrioridadeTarefa;
  status: StatusTarefa;
  notificar_em: string | null;
  notificacao_enviada: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  lead?: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface NotaLead {
  id: string;
  lead_id: string;
  conteudo: string;
  autor_id: string | null;
  autor_nome: string | null;
  anexos: string[];
  privada: boolean;
  created_at: string;
  updated_at: string;
}

export interface PipelineColumn {
  id: EstagioPipeline;
  titulo: string;
  cor: string;
  icone: string;
}

export const PIPELINE_COLUMNS: PipelineColumn[] = [
  { id: 'novo', titulo: 'Novo', cor: 'bg-primary/20', icone: '🆕' },
  { id: 'contatado', titulo: 'Contatado', cor: 'bg-secondary', icone: '📞' },
  { id: 'qualificado', titulo: 'Qualificado', cor: 'bg-accent', icone: '✓' },
  { id: 'visita_agendada', titulo: 'Visita Agendada', cor: 'bg-muted', icone: '📅' },
  { id: 'proposta_enviada', titulo: 'Proposta Enviada', cor: 'bg-primary/30', icone: '📋' },
  { id: 'negociacao', titulo: 'Negociação', cor: 'bg-secondary/80', icone: '💬' },
  { id: 'ganho', titulo: 'Ganho', cor: 'bg-primary', icone: '✅' },
  { id: 'perdido', titulo: 'Perdido', cor: 'bg-destructive', icone: '❌' },
];

export function getScoreIcon(score: number): string {
  if (score >= 80) return '🔥';
  if (score >= 50) return '🌡️';
  return '❄️';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-destructive';
  if (score >= 50) return 'text-primary';
  return 'text-muted-foreground';
}

export function getPrioridadeColor(prioridade: PrioridadeTarefa): string {
  switch (prioridade) {
    case 'urgente': return 'bg-destructive';
    case 'alta': return 'bg-primary';
    case 'media': return 'bg-secondary';
    case 'baixa': return 'bg-muted';
    default: return 'bg-muted';
  }
}

export function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return 'Nunca';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'agora';
  if (diffMinutes < 60) return `há ${diffMinutes}min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays < 7) return `há ${diffDays}d`;
  
  return date.toLocaleDateString('pt-BR');
}
