// Types for dynamic property page

export interface PropertyBranding {
  imobiliariaLogo: string | null;
  imobiliariaNome: string;
  corPrimaria: string;
  telefone: string | null;
  emailContato: string | null;
}

export interface PropertyData {
  id: string;
  construtoraId: string;
  titulo: string;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string;
  valor: number | null;
  condominio: number | null;
  iptu: number | null;
  areaTotal: number | null;
  areaPrivativa: number | null;
  suites: number | null;
  banheiros: number | null;
  vagas: number | null;
  descricao: string | null;
  diferenciais: string[];
  memorialDescritivo: string | null;
  imagens: { url: string; alt?: string }[];
  videos: { url: string; tipo?: string }[];
  tour360Url: string | null;
  status: 'ativo' | 'vendido' | 'inativo';
}

export interface PropertyPageData {
  property: PropertyData;
  branding: PropertyBranding;
  construtora: {
    nome: string;
    logo: string | null;
  };
  accessId: string;
  imobiliariaId: string;
}
