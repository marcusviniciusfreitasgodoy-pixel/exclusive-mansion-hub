// Types for property-specific knowledge base entries

export type KnowledgeBaseCategory = 'FAQ' | 'Especificacao' | 'Financiamento' | 'Documentacao' | 'Outros';
export type KnowledgeBaseSourceType = 'manual' | 'pdf_extraido';

export interface KnowledgeBaseEntry {
  id: string;
  imovel_id: string;
  categoria: KnowledgeBaseCategory;
  titulo: string;
  conteudo: string;
  fonte_tipo: KnowledgeBaseSourceType;
  fonte_arquivo_url?: string;
  fonte_arquivo_nome?: string;
  tags: string[];
  ativo: boolean;
  prioridade: number;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBaseFormData {
  categoria: KnowledgeBaseCategory;
  titulo: string;
  conteudo: string;
  tags?: string[];
  prioridade?: number;
}

export const CATEGORY_LABELS: Record<KnowledgeBaseCategory, string> = {
  FAQ: 'FAQ',
  Especificacao: 'Especificação',
  Financiamento: 'Financiamento',
  Documentacao: 'Documentação',
  Outros: 'Outros',
};

export const CATEGORY_COLORS: Record<KnowledgeBaseCategory, string> = {
  FAQ: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Especificacao: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Financiamento: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  Documentacao: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Outros: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};
