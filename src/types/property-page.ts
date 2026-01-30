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
  headline: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string;
  cep: string | null;
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
  condicoesPagamento: string | null;
  imagens: { url: string; alt?: string }[];
  videos: { url: string; tipo?: string }[];
  tour360Url: string | null;
  status: 'ativo' | 'vendido' | 'inativo';
  // New Sotheby's-inspired fields
  listingCode: string | null;
  propertyType: string | null;
  yearBuilt: number | null;
  lotSize: number | null;
  lotSizeUnit: string;
  parkingSpaces: number | null;
  featuresInterior: string[];
  featuresExterior: string[];
  amenities: string[];
  priceSecondary: number | null;
  priceSecondaryCurrency: string;
  priceOnRequest: boolean;
  latitude: number | null;
  longitude: number | null;
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
