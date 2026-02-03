// Types for the media approval workflow

export type MidiaTipo = 'imagem' | 'video';
export type MidiaStatus = 'pendente' | 'aprovado' | 'rejeitado';

export interface MidiaPendente {
  id: string;
  imovel_id: string;
  imobiliaria_id: string;
  access_id: string;
  tipo: MidiaTipo;
  url: string;
  alt: string | null;
  video_tipo: string | null;
  status: MidiaStatus;
  enviado_em: string;
  revisado_em: string | null;
  revisado_por: string | null;
  motivo_rejeicao: string | null;
  nome_arquivo_original: string | null;
  tamanho_bytes: number | null;
  created_at: string;
}

export interface MidiaPendenteWithDetails extends MidiaPendente {
  imovel?: {
    id: string;
    titulo: string;
    bairro: string | null;
    cidade: string | null;
  };
  imobiliaria?: {
    id: string;
    nome_empresa: string;
    logo_url: string | null;
  };
}
