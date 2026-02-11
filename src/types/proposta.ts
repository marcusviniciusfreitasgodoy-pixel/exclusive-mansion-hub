export interface PropostaCompra {
  id: string;
  feedback_id: string | null;
  construtora_id: string | null;
  imobiliaria_id: string | null;
  imovel_id: string | null;
  codigo: string;
  nome_completo: string;
  cpf_cnpj: string;
  telefone: string;
  email: string | null;
  endereco_resumido: string | null;
  unidade: string | null;
  matricula: string | null;
  valor_ofertado: number | null;
  moeda: string;
  sinal_entrada: string | null;
  parcelas: string | null;
  financiamento: string | null;
  outras_condicoes: string | null;
  validade_proposta: string | null;
  forma_aceite: string;
  assinatura_proponente: string | null;
  cnh_url: string | null;
  status: 'pendente' | 'aceita' | 'recusada' | 'expirada';
  created_at: string;
  updated_at: string;
}

export interface PropostaPreFill {
  nome_completo?: string;
  cpf_cnpj?: string;
  telefone?: string;
  email?: string;
  endereco_resumido?: string;
  valor_ofertado?: number;
  token?: string;
}
