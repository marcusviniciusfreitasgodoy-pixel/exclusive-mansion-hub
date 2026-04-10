// Types for the integrations hub

export type TipoIntegracao = 
  | 'whatsapp_business' 
  | 'whatsapp_simples'
  | 'google_analytics' 
  | 'meta_pixel' 
  | 'zapier_webhook' 
  | 'google_tag_manager'
  | 'custom_webhook';

export interface Integracao {
  id: string;
  imobiliaria_id: string | null;
  construtora_id: string | null;
  tipo_integracao: TipoIntegracao;
  nome_exibicao: string | null;
  descricao: string | null;
  ativa: boolean;
  credenciais: Record<string, any>;
  configuracoes: Record<string, any>;
  ultima_sincronizacao: string | null;
  proxima_sincronizacao: string | null;
  total_eventos_enviados: number;
  erro_ultima_tentativa: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegracaoConfig {
  tipo: TipoIntegracao;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  campos: IntegracaoCampo[];
  eventosDisponiveis?: EventoRastreamento[];
}

export interface IntegracaoCampo {
  key: string;
  label: string;
  tipo: 'text' | 'password' | 'textarea' | 'checkbox' | 'select';
  placeholder?: string;
  obrigatorio?: boolean;
  opcoes?: { value: string; label: string }[];
  ajuda?: string;
}

export interface EventoRastreamento {
  key: string;
  label: string;
  descricao: string;
  padrao: boolean;
}

// Configurações padrão das integrações disponíveis
export const INTEGRACOES_DISPONIVEIS: IntegracaoConfig[] = [
  {
    tipo: 'google_analytics',
    nome: 'Google Analytics 4',
    descricao: 'Rastreie todo o tráfego e comportamento dos visitantes nas páginas dos imóveis.',
    icone: '📊',
    cor: 'bg-orange-500',
    campos: [
      {
        key: 'measurement_id',
        label: 'Measurement ID',
        tipo: 'text',
        placeholder: 'G-XXXXXXXXXX',
        obrigatorio: true,
        ajuda: 'Encontre em Admin > Fluxos de dados > Web > ID da medição'
      }
    ],
    eventosDisponiveis: [
      { key: 'pageview', label: 'Pageview', descricao: 'Visualizações de páginas de imóveis', padrao: true },
      { key: 'lead', label: 'Lead gerado', descricao: 'Conversão primária - formulário enviado', padrao: true },
      { key: 'agendamento', label: 'Agendamento solicitado', descricao: 'Conversão secundária - visita agendada', padrao: true },
      { key: 'formulario_iniciado', label: 'Formulário iniciado', descricao: 'Usuário começou a preencher formulário', padrao: false },
      { key: 'whatsapp_click', label: 'WhatsApp clicado', descricao: 'Botão de WhatsApp clicado', padrao: true },
      { key: 'galeria_aberta', label: 'Galeria aberta', descricao: 'Galeria de fotos visualizada', padrao: false },
      { key: 'video_play', label: 'Vídeo reproduzido', descricao: 'Vídeo do imóvel iniciado', padrao: false },
      { key: 'chatbot_opened', label: 'Chatbot aberto', descricao: 'Assistente virtual iniciado', padrao: true }
    ]
  },
  {
    tipo: 'meta_pixel',
    nome: 'Meta Pixel (Facebook)',
    descricao: 'Otimize seus anúncios no Facebook e Instagram com dados de conversão.',
    icone: '📱',
    cor: 'bg-blue-600',
    campos: [
      {
        key: 'pixel_id',
        label: 'Pixel ID',
        tipo: 'text',
        placeholder: '123456789012345',
        obrigatorio: true,
        ajuda: 'Encontre em Gerenciador de Eventos > Pixels > ID do Pixel'
      },
      {
        key: 'access_token',
        label: 'Token de Acesso (opcional)',
        tipo: 'password',
        placeholder: 'Token para Conversions API',
        obrigatorio: false,
        ajuda: 'Necessário apenas para Conversions API (servidor)'
      }
    ],
    eventosDisponiveis: [
      { key: 'PageView', label: 'PageView', descricao: 'Visualização de página', padrao: true },
      { key: 'Lead', label: 'Lead', descricao: 'Lead gerado via formulário', padrao: true },
      { key: 'Schedule', label: 'Schedule', descricao: 'Agendamento de visita', padrao: true },
      { key: 'Contact', label: 'Contact', descricao: 'Contato via WhatsApp', padrao: true },
      { key: 'ViewContent', label: 'ViewContent', descricao: 'Visualização detalhada do imóvel', padrao: false }
    ]
  },
  {
    tipo: 'google_tag_manager',
    nome: 'Google Tag Manager',
    descricao: 'Gerencie todas as suas tags e scripts em um só lugar.',
    icone: '🏷️',
    cor: 'bg-blue-400',
    campos: [
      {
        key: 'container_id',
        label: 'Container ID',
        tipo: 'text',
        placeholder: 'GTM-XXXXXXX',
        obrigatorio: true,
        ajuda: 'Encontre em GTM > Administrador > ID do contêiner'
      }
    ]
  },
  {
    tipo: 'zapier_webhook',
    nome: 'Zapier Webhooks',
    descricao: 'Conecte com mais de 5.000 aplicações via webhooks Zapier.',
    icone: '⚡',
    cor: 'bg-orange-400',
    campos: [
      {
        key: 'webhook_url',
        label: 'URL do Webhook',
        tipo: 'text',
        placeholder: 'https://hooks.zapier.com/hooks/catch/...',
        obrigatorio: true,
        ajuda: 'Crie um Zap com trigger "Webhooks by Zapier" e copie a URL'
      }
    ],
    eventosDisponiveis: [
      { key: 'novo_lead', label: 'Novo lead', descricao: 'Disparar quando novo lead for capturado', padrao: true },
      { key: 'agendamento', label: 'Novo agendamento', descricao: 'Disparar quando visita for agendada', padrao: true },
      { key: 'status_alterado', label: 'Status alterado', descricao: 'Disparar quando status do lead mudar', padrao: false }
    ]
  },
  {
    tipo: 'whatsapp_simples',
    nome: 'WhatsApp Simples (wa.me)',
    descricao: 'Abra conversas no WhatsApp com um clique. Não requer API oficial.',
    icone: '💬',
    cor: 'bg-green-400',
    campos: [
      {
        key: 'numero_padrao',
        label: 'Número Padrão (opcional)',
        tipo: 'text',
        placeholder: '5511999999999',
        obrigatorio: false,
        ajuda: 'Número para receber mensagens de leads (com código do país)'
      },
      {
        key: 'mensagem_padrao',
        label: 'Mensagem Padrão',
        tipo: 'textarea',
        placeholder: 'Olá! Vi seu anúncio e gostaria de mais informações.',
        obrigatorio: false,
        ajuda: 'Mensagem pré-preenchida ao abrir conversa'
      }
    ],
    eventosDisponiveis: [
      { key: 'novo_lead', label: 'Novo lead', descricao: 'Abrir WhatsApp ao receber novo lead', padrao: true },
      { key: 'agendamento', label: 'Novo agendamento', descricao: 'Abrir WhatsApp ao receber agendamento', padrao: true }
    ]
  },
  {
    tipo: 'whatsapp_business',
    nome: 'Z-API (WhatsApp)',
    descricao: 'Envie notificações automáticas de novos leads e agendamentos via WhatsApp usando Z-API.',
    icone: '📲',
    cor: 'bg-green-600',
    campos: [
      {
        key: 'instance_id',
        label: 'Instance ID',
        tipo: 'text',
        placeholder: 'SUA-INSTANCE-ID',
        obrigatorio: true,
        ajuda: 'ID da instância na Z-API (encontre no painel da Z-API)'
      },
      {
        key: 'token',
        label: 'Token',
        tipo: 'password',
        placeholder: 'SEU-TOKEN',
        obrigatorio: true,
        ajuda: 'Token de autenticação da instância Z-API'
      },
      {
        key: 'security_token',
        label: 'Security Token (opcional)',
        tipo: 'password',
        placeholder: 'Token de segurança para webhooks',
        obrigatorio: false,
        ajuda: 'Token de segurança configurado nos webhooks da Z-API'
      }
    ],
    eventosDisponiveis: [
      { key: 'novo_lead', label: 'Novo lead', descricao: 'Notificar automaticamente ao receber lead', padrao: true },
      { key: 'agendamento', label: 'Agendamento confirmado', descricao: 'Enviar confirmação de visita', padrao: true },
      { key: 'lembrete_24h', label: 'Lembrete 24h', descricao: 'Lembrete automático um dia antes', padrao: true },
      { key: 'lembrete_1h', label: 'Lembrete 1h', descricao: 'Lembrete automático uma hora antes', padrao: false }
    ]
  },
  {
    tipo: 'custom_webhook',
    nome: 'Webhook Customizado',
    descricao: 'Integre com qualquer API externa via webhooks personalizados.',
    icone: '🔗',
    cor: 'bg-purple-500',
    campos: [
      {
        key: 'url',
        label: 'URL do Endpoint',
        tipo: 'text',
        placeholder: 'https://api.exemplo.com/webhook',
        obrigatorio: true
      },
      {
        key: 'metodo',
        label: 'Método HTTP',
        tipo: 'select',
        obrigatorio: true,
        opcoes: [
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'PATCH', label: 'PATCH' }
        ]
      },
      {
        key: 'headers',
        label: 'Headers (JSON)',
        tipo: 'textarea',
        placeholder: '{"Authorization": "Bearer token", "Content-Type": "application/json"}',
        obrigatorio: false
      }
    ],
    eventosDisponiveis: [
      { key: 'novo_lead', label: 'Novo lead', descricao: 'Disparar quando novo lead for capturado', padrao: true },
      { key: 'agendamento', label: 'Novo agendamento', descricao: 'Disparar quando visita for agendada', padrao: true },
      { key: 'feedback', label: 'Feedback recebido', descricao: 'Disparar quando feedback for preenchido', padrao: false }
    ]
  }
];

// Helper para buscar config de uma integração
export const getIntegracaoConfig = (tipo: TipoIntegracao): IntegracaoConfig | undefined => {
  return INTEGRACOES_DISPONIVEIS.find(i => i.tipo === tipo);
};
