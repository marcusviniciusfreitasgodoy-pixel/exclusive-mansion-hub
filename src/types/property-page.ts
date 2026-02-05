// Types for dynamic property page
import type { MateriaisPromocionais } from './materiais-promocionais';

export interface Corretor {
  nome: string;
  cargo?: string;
  fotoUrl?: string;
  telefone?: string;
  email?: string;
  miniBio?: string;
}

export interface PropertyBranding {
  imobiliariaLogo: string | null;
  imobiliariaNome: string;
  corPrimaria: string;
  telefone: string | null;
  emailContato: string | null;
  faviconUrl: string | null;
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
  // Sotheby's-inspired fields
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
  // New The Agency-inspired fields
  flagDestaque: boolean;
  flagNovoAnuncio: boolean;
  flagExclusividade: boolean;
  flagOffMarket: boolean;
  flagLancamento: boolean;
  flagAltoPadrao: boolean;
  dataPublicacao: string | null;
  origemCadastro: string | null;
  regiao: string | null;
  distrito: string | null;
  estiloArquitetonico: string | null;
  estruturaConstrucao: string | null;
  tipoPiso: string[];
  caracteristicasTerreno: string[];
  vista: string[];
  aquecimento: string[];
  sistemaEsgoto: string | null;
  abastecimentoAgua: string | null;
  vagasDescricao: string | null;
  impostosAnuais: number | null;
  seoTitulo: string | null;
  seoDescricao: string | null;
  tags: string[];
  corretores: Corretor[];
  // Template fields
  templateEscolhido: 'luxo' | 'moderno' | 'classico' | 'alto_padrao';
  customizacaoTemplate: {
    cor_primaria?: string;
    cor_secundaria?: string;
    cor_texto?: string;
    fonte_titulos?: string;
    fonte_corpo?: string;
    estilo_botoes?: 'rounded' | 'squared' | 'pill';
    tamanho_hero?: 'fullscreen' | 'grande' | 'medio';
    animacoes_ativas?: boolean;
  };
  // Promotional materials
  materiaisPromocionais?: MateriaisPromocionais;
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
