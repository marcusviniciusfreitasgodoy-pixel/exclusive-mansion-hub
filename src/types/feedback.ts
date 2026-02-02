// Types for feedback system

export type FeedbackStatus = 'aguardando_corretor' | 'aguardando_cliente' | 'completo' | 'arquivado';
export type QualificacaoLead = 'quente' | 'morno' | 'frio';
export type PoderDecisao = 'total' | 'parcial' | 'nenhum';
export type PrazoCompra = '0-3_meses' | '3-6_meses' | '6-12_meses' | 'acima_12_meses' | 'indefinido';
export type InteresseCompra = 'muito_interessado' | 'interessado' | 'pouco_interessado' | 'sem_interesse';

export interface FeedbackVisita {
  id: string;
  agendamento_visita_id: string | null;
  lead_id: string | null;
  imovel_id: string;
  imobiliaria_id: string | null;
  construtora_id: string;
  access_id: string | null;
  
  // Dados da visita
  data_visita: string;
  duracao_minutos: number | null;
  
  // Avaliação do cliente
  nps_cliente: number | null;
  avaliacao_localizacao: number | null;
  avaliacao_acabamento: number | null;
  avaliacao_layout: number | null;
  avaliacao_custo_beneficio: number | null;
  avaliacao_atendimento: number | null;
  pontos_positivos: string | null;
  pontos_negativos: string | null;
  sugestoes: string | null;
  interesse_compra: InteresseCompra | null;
  objecoes: string[];
  objecoes_detalhes: string | null;
  
  // Dados do cliente
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone: string | null;
  
  // Avaliação do corretor
  corretor_nome: string | null;
  corretor_email: string | null;
  qualificacao_lead: QualificacaoLead | null;
  poder_decisao: PoderDecisao | null;
  poder_decisao_detalhes: string | null;
  prazo_compra: PrazoCompra | null;
  orcamento_disponivel: number | null;
  forma_pagamento_pretendida: string | null;
  observacoes_corretor: string | null;
  proximos_passos: string | null;
  necessita_followup: boolean;
  data_followup: string | null;
  score_lead: number;
  
  // Assinaturas
  assinatura_cliente: string | null;
  assinatura_cliente_data: string | null;
  assinatura_cliente_ip: string | null;
  assinatura_cliente_device: string | null;
  assinatura_cliente_geolocation: { lat: number; lng: number } | Record<string, unknown> | null;
  assinatura_corretor: string | null;
  assinatura_corretor_data: string | null;
  assinatura_corretor_ip: string | null;
  assinatura_corretor_device: string | null;
  
  // Documento
  documento_hash: string | null;
  pdf_url: string | null;
  pdf_gerado_em: string | null;
  
  // Status e tokens
  status: FeedbackStatus;
  token_acesso_cliente: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  feedback_cliente_em: string | null;
  feedback_corretor_em: string | null;
  completo_em: string | null;
}

export interface FeedbackWithDetails extends FeedbackVisita {
  imovel?: {
    titulo: string;
    endereco: string | null;
    bairro: string | null;
    cidade: string | null;
    valor: number | null;
  };
  imobiliaria?: {
    nome_empresa: string;
    logo_url: string | null;
  };
  construtora?: {
    nome_empresa: string;
    logo_url: string | null;
  };
}

// Objeções possíveis
export const OBJECOES_OPTIONS = [
  { value: "preco_alto", label: "Preço acima do orçamento" },
  { value: "localizacao", label: "Localização não ideal" },
  { value: "tamanho", label: "Tamanho inadequado" },
  { value: "acabamento", label: "Acabamento não agradou" },
  { value: "layout", label: "Layout não funcional" },
  { value: "infraestrutura", label: "Falta de infraestrutura" },
  { value: "outro", label: "Outro motivo" },
] as const;

// Labels para interesse de compra
export const INTERESSE_LABELS = {
  muito_interessado: { label: "🔥 Muito interessado - quero fazer proposta", color: "text-green-600" },
  interessado: { label: "👍 Interessado - preciso pensar mais", color: "text-blue-600" },
  pouco_interessado: { label: "🤔 Pouco interessado", color: "text-yellow-600" },
  sem_interesse: { label: "❌ Não tenho interesse", color: "text-red-600" },
} as const;

// Labels para qualificação
export const QUALIFICACAO_LABELS = {
  quente: { label: "🔥 Quente", color: "bg-red-100 text-red-700 border-red-300" },
  morno: { label: "🌡️ Morno", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  frio: { label: "❄️ Frio", color: "bg-blue-100 text-blue-700 border-blue-300" },
} as const;

// Labels para prazo
export const PRAZO_LABELS = {
  "0-3_meses": "0 a 3 meses",
  "3-6_meses": "3 a 6 meses",
  "6-12_meses": "6 a 12 meses",
  "acima_12_meses": "Acima de 12 meses",
  "indefinido": "Indefinido",
} as const;
