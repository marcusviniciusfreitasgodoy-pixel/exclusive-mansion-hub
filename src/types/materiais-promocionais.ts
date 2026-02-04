// Types for promotional materials (developer documents/assets)

export interface MaterialArquivo {
  url: string;
  nome: string;
  tipo: 'pdf' | 'image' | 'video';
  tamanho_bytes?: number;
}

export interface PersonalizacaoItem {
  titulo: string;
  disponivel: boolean;
}

export interface MateriaisPromocionais {
  // Documents/Files
  bookDigital?: MaterialArquivo;
  estudoRentabilidade?: MaterialArquivo;
  tabelaVendas?: MaterialArquivo;
  plantaUnidade?: MaterialArquivo;
  
  // Lists
  personalizacao?: PersonalizacaoItem[];
  seguranca?: string[];
  sustentabilidade?: string[];
  infraestrutura?: string[];
}

// Helper to parse materiais_promocionais from database
export function parseMateriaisPromocionais(data: unknown): MateriaisPromocionais {
  if (!data || typeof data !== 'object') {
    return {};
  }
  
  const raw = data as Record<string, unknown>;
  
  return {
    bookDigital: parseArquivo(raw.bookDigital),
    estudoRentabilidade: parseArquivo(raw.estudoRentabilidade),
    tabelaVendas: parseArquivo(raw.tabelaVendas),
    plantaUnidade: parseArquivo(raw.plantaUnidade),
    personalizacao: parsePersonalizacao(raw.personalizacao),
    seguranca: parseStringArray(raw.seguranca),
    sustentabilidade: parseStringArray(raw.sustentabilidade),
    infraestrutura: parseStringArray(raw.infraestrutura),
  };
}

function parseArquivo(data: unknown): MaterialArquivo | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const obj = data as Record<string, unknown>;
  if (!obj.url || typeof obj.url !== 'string') return undefined;
  
  return {
    url: obj.url,
    nome: typeof obj.nome === 'string' ? obj.nome : 'Arquivo',
    tipo: validateTipo(obj.tipo),
    tamanho_bytes: typeof obj.tamanho_bytes === 'number' ? obj.tamanho_bytes : undefined,
  };
}

function validateTipo(tipo: unknown): 'pdf' | 'image' | 'video' {
  if (tipo === 'pdf' || tipo === 'image' || tipo === 'video') return tipo;
  return 'pdf';
}

function parsePersonalizacao(data: unknown): PersonalizacaoItem[] | undefined {
  if (!Array.isArray(data)) return undefined;
  return data
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map(item => ({
      titulo: typeof item.titulo === 'string' ? item.titulo : '',
      disponivel: Boolean(item.disponivel),
    }))
    .filter(item => item.titulo);
}

function parseStringArray(data: unknown): string[] | undefined {
  if (!Array.isArray(data)) return undefined;
  return data.filter((item): item is string => typeof item === 'string' && item.length > 0);
}
