// Database types for the SaaS platform

export type AppRole = 'construtora' | 'imobiliaria' | 'admin';

export type ImovelStatus = 'ativo' | 'vendido' | 'inativo';

export type AccessStatus = 'active' | 'revoked';

export type PlanoConstrutora = 'start' | 'pro' | 'enterprise';

export type ConstrutorStatus = 'active' | 'suspended' | 'cancelled';

export type LeadOrigem = 'formulario' | 'whatsapp' | 'chat_ia';

export type LeadStatus = 'novo' | 'contatado' | 'qualificado' | 'visita_agendada' | 'perdido';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Construtora {
  id: string;
  user_id: string;
  nome_empresa: string;
  cnpj: string;
  logo_url: string | null;
  cor_primaria: string;
  cor_secundaria: string;
  dominio_customizado: string | null;
  plano: PlanoConstrutora;
  status: ConstrutorStatus;
  created_at: string;
}

export interface Imobiliaria {
  id: string;
  user_id: string;
  nome_empresa: string;
  creci: string;
  logo_url: string | null;
  cor_primaria: string;
  telefone: string | null;
  email_contato: string | null;
  created_at: string;
}

export interface Imovel {
  id: string;
  construtora_id: string;
  titulo: string;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string;
  valor: number | null;
  condominio: number | null;
  iptu: number | null;
  area_total: number | null;
  area_privativa: number | null;
  suites: number | null;
  banheiros: number | null;
  vagas: number | null;
  descricao: string | null;
  diferenciais: string[];
  memorial_descritivo: string | null;
  imagens: { url: string; alt?: string }[];
  videos: { url: string; tipo?: string }[];
  tour_360_url: string | null;
  status: ImovelStatus;
  created_at: string;
  updated_at: string;
}

export interface ImobiliariaImovelAccess {
  id: string;
  imobiliaria_id: string;
  imovel_id: string;
  url_slug: string;
  acesso_concedido_em: string;
  status: AccessStatus;
  visitas: number;
}

export interface Lead {
  id: string;
  imovel_id: string;
  imobiliaria_id: string | null;
  access_id: string | null;
  nome: string;
  email: string;
  telefone: string | null;
  mensagem: string | null;
  origem: LeadOrigem;
  status: LeadStatus;
  created_at: string;
}

// Extended types for queries with joins
export interface ImovelWithConstrutora extends Imovel {
  construtora: Construtora;
}

export interface LeadWithDetails extends Lead {
  imovel?: Imovel;
  imobiliaria?: Imobiliaria;
}

export interface PropertyPageData {
  imovel: Imovel;
  construtora: Construtora;
  imobiliaria: Imobiliaria;
  access: ImobiliariaImovelAccess;
}
