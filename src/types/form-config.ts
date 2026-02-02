// Types for customizable form system

export type TipoFormulario = 'agendamento_visita' | 'feedback_corretor' | 'feedback_cliente';

export type TipoCampo = 
  | 'text'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'number'
  | 'date'
  | 'email'
  | 'telefone'
  | 'rating'
  | 'escala_nps'
  | 'assinatura';

export interface ValidacaoCampo {
  min?: number;
  max?: number;
  regex?: string;
}

export interface CondicaoCampo {
  campo_id: string;
  valor: string;
  mostrar_se: 'igual' | 'diferente' | 'contem';
}

export interface CampoFormulario {
  id: string;
  tipo: TipoCampo;
  nome: string;
  label: string;
  placeholder?: string;
  texto_ajuda?: string;
  obrigatorio: boolean;
  ordem: number;
  opcoes?: string[];
  validacao?: ValidacaoCampo;
  condicional?: CondicaoCampo;
  bloqueado?: boolean; // Campos obrigatórios do sistema não podem ser excluídos
}

export interface ConfiguracaoFormulario {
  id: string;
  imobiliaria_id: string;
  tipo_formulario: TipoFormulario;
  nome_formulario: string | null;
  descricao: string | null;
  ativo: boolean;
  campos: CampoFormulario[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Default field configurations
export const CAMPOS_PADRAO_AGENDAMENTO: CampoFormulario[] = [
  {
    id: 'nome',
    tipo: 'text',
    nome: 'nome',
    label: 'Nome completo',
    placeholder: 'Seu nome',
    obrigatorio: true,
    ordem: 1,
    bloqueado: true,
    validacao: { min: 3, max: 100 }
  },
  {
    id: 'email',
    tipo: 'email',
    nome: 'email',
    label: 'E-mail',
    placeholder: 'seu@email.com',
    obrigatorio: true,
    ordem: 2,
    bloqueado: true
  },
  {
    id: 'telefone',
    tipo: 'telefone',
    nome: 'telefone',
    label: 'Telefone/WhatsApp',
    placeholder: '(99) 99999-9999',
    obrigatorio: true,
    ordem: 3,
    bloqueado: true
  },
  {
    id: 'opcao_data_1',
    tipo: 'date',
    nome: 'opcao_data_1',
    label: 'Opção de Data 1',
    obrigatorio: true,
    ordem: 4,
    bloqueado: true
  },
  {
    id: 'opcao_data_2',
    tipo: 'date',
    nome: 'opcao_data_2',
    label: 'Opção de Data 2',
    obrigatorio: true,
    ordem: 5,
    bloqueado: true
  }
];

export const CAMPOS_PADRAO_FEEDBACK_CLIENTE: CampoFormulario[] = [
  {
    id: 'nps_cliente',
    tipo: 'escala_nps',
    nome: 'nps_cliente',
    label: 'De 0 a 10, qual a probabilidade de você recomendar este imóvel?',
    obrigatorio: true,
    ordem: 1,
    bloqueado: true
  },
  {
    id: 'avaliacao_localizacao',
    tipo: 'rating',
    nome: 'avaliacao_localizacao',
    label: 'Localização',
    obrigatorio: false,
    ordem: 2
  },
  {
    id: 'avaliacao_acabamento',
    tipo: 'rating',
    nome: 'avaliacao_acabamento',
    label: 'Acabamento',
    obrigatorio: false,
    ordem: 3
  },
  {
    id: 'avaliacao_layout',
    tipo: 'rating',
    nome: 'avaliacao_layout',
    label: 'Layout/Planta',
    obrigatorio: false,
    ordem: 4
  },
  {
    id: 'avaliacao_custo_beneficio',
    tipo: 'rating',
    nome: 'avaliacao_custo_beneficio',
    label: 'Custo-benefício',
    obrigatorio: false,
    ordem: 5
  },
  {
    id: 'avaliacao_atendimento',
    tipo: 'rating',
    nome: 'avaliacao_atendimento',
    label: 'Atendimento',
    obrigatorio: false,
    ordem: 6
  },
  {
    id: 'interesse_compra',
    tipo: 'radio',
    nome: 'interesse_compra',
    label: 'Qual seu interesse em adquirir este imóvel?',
    obrigatorio: true,
    ordem: 7,
    bloqueado: true,
    opcoes: [
      'Muito interessado - quero fazer proposta',
      'Interessado - preciso pensar mais',
      'Pouco interessado',
      'Não tenho interesse'
    ]
  },
  {
    id: 'pontos_positivos',
    tipo: 'textarea',
    nome: 'pontos_positivos',
    label: 'O que mais gostou?',
    placeholder: 'Conte-nos o que mais chamou sua atenção',
    obrigatorio: false,
    ordem: 8
  },
  {
    id: 'pontos_negativos',
    tipo: 'textarea',
    nome: 'pontos_negativos',
    label: 'O que menos gostou?',
    placeholder: 'Há algo que poderia ser melhor?',
    obrigatorio: false,
    ordem: 9
  },
  {
    id: 'sugestoes',
    tipo: 'textarea',
    nome: 'sugestoes',
    label: 'Sugestões ou comentários adicionais',
    placeholder: 'Compartilhe sua opinião',
    obrigatorio: false,
    ordem: 10
  },
  {
    id: 'assinatura_cliente',
    tipo: 'assinatura',
    nome: 'assinatura_cliente',
    label: 'Sua assinatura',
    obrigatorio: true,
    ordem: 11,
    bloqueado: true
  }
];

export const CAMPOS_PADRAO_FEEDBACK_CORRETOR: CampoFormulario[] = [
  {
    id: 'qualificacao_lead',
    tipo: 'radio',
    nome: 'qualificacao_lead',
    label: 'Qualificação do Lead',
    obrigatorio: true,
    ordem: 1,
    bloqueado: true,
    opcoes: ['🔥 Quente', '🌡️ Morno', '❄️ Frio']
  },
  {
    id: 'poder_decisao',
    tipo: 'radio',
    nome: 'poder_decisao',
    label: 'Poder de decisão',
    obrigatorio: false,
    ordem: 2,
    opcoes: ['Total - decide sozinho(a)', 'Parcial - precisa consultar alguém', 'Nenhum - não é o decisor']
  },
  {
    id: 'prazo_compra',
    tipo: 'select',
    nome: 'prazo_compra',
    label: 'Prazo estimado para compra',
    obrigatorio: false,
    ordem: 3,
    opcoes: ['0 a 3 meses', '3 a 6 meses', '6 a 12 meses', 'Acima de 12 meses', 'Indefinido']
  },
  {
    id: 'orcamento_disponivel',
    tipo: 'number',
    nome: 'orcamento_disponivel',
    label: 'Orçamento disponível (R$)',
    placeholder: '1000000',
    obrigatorio: false,
    ordem: 4
  },
  {
    id: 'forma_pagamento_pretendida',
    tipo: 'select',
    nome: 'forma_pagamento_pretendida',
    label: 'Forma de pagamento pretendida',
    obrigatorio: false,
    ordem: 5,
    opcoes: ['À vista', 'Financiamento bancário', 'FGTS', 'Consórcio', 'Permuta', 'Outro']
  },
  {
    id: 'observacoes_corretor',
    tipo: 'textarea',
    nome: 'observacoes_corretor',
    label: 'Observações do corretor',
    placeholder: 'Detalhes importantes sobre a visita e o cliente',
    obrigatorio: true,
    ordem: 6,
    bloqueado: true,
    validacao: { min: 10 }
  },
  {
    id: 'proximos_passos',
    tipo: 'textarea',
    nome: 'proximos_passos',
    label: 'Próximos passos',
    placeholder: 'O que foi combinado com o cliente?',
    obrigatorio: false,
    ordem: 7
  },
  {
    id: 'assinatura_corretor',
    tipo: 'assinatura',
    nome: 'assinatura_corretor',
    label: 'Assinatura do corretor',
    obrigatorio: true,
    ordem: 8,
    bloqueado: true
  }
];

export const TIPO_FORMULARIO_LABELS: Record<TipoFormulario, { nome: string; descricao: string }> = {
  agendamento_visita: {
    nome: 'Agendamento de Visita',
    descricao: 'Formulário para agendar visitas aos imóveis'
  },
  feedback_corretor: {
    nome: 'Feedback do Corretor',
    descricao: 'Formulário preenchido pelo corretor após a visita'
  },
  feedback_cliente: {
    nome: 'Feedback do Cliente',
    descricao: 'Formulário preenchido pelo cliente após a visita'
  }
};

export const TIPO_CAMPO_LABELS: Record<TipoCampo, string> = {
  text: 'Texto curto',
  textarea: 'Texto longo',
  select: 'Seleção única (dropdown)',
  radio: 'Múltipla escolha',
  checkbox: 'Caixas de seleção',
  number: 'Número',
  date: 'Data',
  email: 'E-mail',
  telefone: 'Telefone',
  rating: 'Avaliação por estrelas (1-5)',
  escala_nps: 'Escala NPS (0-10)',
  assinatura: 'Assinatura digital'
};
