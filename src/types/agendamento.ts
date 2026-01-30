// Types for visit scheduling system

export type AgendamentoStatus = 'pendente' | 'confirmado' | 'realizado' | 'cancelado' | 'remarcado';

export interface AgendamentoVisita {
  id: string;
  lead_id: string | null;
  imovel_id: string;
  imobiliaria_id: string | null;
  construtora_id: string;
  access_id: string | null;
  
  // Dados do cliente
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone: string;
  
  // Opções de data/horário
  opcao_data_1: string;
  opcao_data_2: string;
  
  // Data confirmada
  data_confirmada: string | null;
  
  // Status
  status: AgendamentoStatus;
  
  // Integração Calendly
  calendly_event_url: string | null;
  calendly_event_id: string | null;
  
  // Observações
  observacoes: string | null;
  motivo_cancelamento: string | null;
  
  // Lembretes
  lembrete_24h_enviado: boolean;
  lembrete_1h_enviado: boolean;
  
  // Corretor
  corretor_nome: string | null;
  corretor_email: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  confirmado_em: string | null;
  realizado_em: string | null;
  cancelado_em: string | null;
}

export interface AgendamentoWithDetails extends AgendamentoVisita {
  imovel?: {
    titulo: string;
    endereco: string | null;
    bairro: string | null;
    cidade: string | null;
  };
  imobiliaria?: {
    nome_empresa: string;
    email_contato: string | null;
    telefone: string | null;
  };
}
