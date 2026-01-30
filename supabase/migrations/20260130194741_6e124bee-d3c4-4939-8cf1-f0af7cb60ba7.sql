-- Criar enum para status do feedback
CREATE TYPE public.feedback_status AS ENUM ('aguardando_corretor', 'aguardando_cliente', 'completo', 'arquivado');

-- Criar enum para qualificação do lead
CREATE TYPE public.qualificacao_lead AS ENUM ('quente', 'morno', 'frio');

-- Criar enum para poder de decisão
CREATE TYPE public.poder_decisao AS ENUM ('total', 'parcial', 'nenhum');

-- Criar enum para prazo de compra
CREATE TYPE public.prazo_compra AS ENUM ('0-3_meses', '3-6_meses', '6-12_meses', 'acima_12_meses', 'indefinido');

-- Criar enum para interesse de compra
CREATE TYPE public.interesse_compra AS ENUM ('muito_interessado', 'interessado', 'pouco_interessado', 'sem_interesse');

-- Criar tabela de feedbacks de visitas
CREATE TABLE public.feedbacks_visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_visita_id UUID REFERENCES public.agendamentos_visitas(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  imovel_id UUID REFERENCES public.imoveis(id) ON DELETE CASCADE NOT NULL,
  imobiliaria_id UUID REFERENCES public.imobiliarias(id) ON DELETE SET NULL,
  construtora_id UUID REFERENCES public.construtoras(id) ON DELETE CASCADE NOT NULL,
  access_id UUID REFERENCES public.imobiliaria_imovel_access(id) ON DELETE SET NULL,
  
  -- Dados da visita
  data_visita TIMESTAMP WITH TIME ZONE NOT NULL,
  duracao_minutos INTEGER,
  
  -- ═══════════════════════════════════════════════
  -- AVALIAÇÃO DO CLIENTE
  -- ═══════════════════════════════════════════════
  
  -- NPS (Net Promoter Score)
  nps_cliente INTEGER,
  
  -- Avaliações por categoria (1-5 estrelas)
  avaliacao_localizacao INTEGER,
  avaliacao_acabamento INTEGER,
  avaliacao_layout INTEGER,
  avaliacao_custo_beneficio INTEGER,
  avaliacao_atendimento INTEGER,
  
  -- Feedback textual
  pontos_positivos TEXT,
  pontos_negativos TEXT,
  sugestoes TEXT,
  
  -- Interesse de compra
  interesse_compra public.interesse_compra,
  
  -- Objeções
  objecoes JSONB DEFAULT '[]'::jsonb,
  objecoes_detalhes TEXT,
  
  -- Dados do cliente (cópia para histórico)
  cliente_nome TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  cliente_telefone TEXT,
  
  -- ═══════════════════════════════════════════════
  -- AVALIAÇÃO DO CORRETOR
  -- ═══════════════════════════════════════════════
  
  corretor_nome TEXT,
  corretor_email TEXT,
  
  -- Qualificação do lead
  qualificacao_lead public.qualificacao_lead,
  
  -- Poder de decisão
  poder_decisao public.poder_decisao,
  poder_decisao_detalhes TEXT,
  
  -- Prazo de compra
  prazo_compra public.prazo_compra,
  
  -- Orçamento
  orcamento_disponivel DECIMAL(15,2),
  forma_pagamento_pretendida TEXT,
  
  -- Observações e próximos passos
  observacoes_corretor TEXT,
  proximos_passos TEXT,
  necessita_followup BOOLEAN DEFAULT TRUE,
  data_followup TIMESTAMP WITH TIME ZONE,
  
  -- Pontuação de qualidade do lead (0-100)
  score_lead INTEGER DEFAULT 0,
  
  -- ═══════════════════════════════════════════════
  -- ASSINATURAS DIGITAIS
  -- ═══════════════════════════════════════════════
  
  -- Assinatura do Cliente
  assinatura_cliente TEXT,
  assinatura_cliente_data TIMESTAMP WITH TIME ZONE,
  assinatura_cliente_ip TEXT,
  assinatura_cliente_device TEXT,
  assinatura_cliente_geolocation JSONB,
  
  -- Assinatura do Corretor
  assinatura_corretor TEXT,
  assinatura_corretor_data TIMESTAMP WITH TIME ZONE,
  assinatura_corretor_ip TEXT,
  assinatura_corretor_device TEXT,
  
  -- ═══════════════════════════════════════════════
  -- INTEGRIDADE E AUDITORIA
  -- ═══════════════════════════════════════════════
  
  -- Hash SHA-256 do documento
  documento_hash TEXT,
  
  -- URL do PDF gerado
  pdf_url TEXT,
  pdf_gerado_em TIMESTAMP WITH TIME ZONE,
  
  -- Status do feedback
  status public.feedback_status DEFAULT 'aguardando_corretor' NOT NULL,
  
  -- Token único para acesso público do cliente
  token_acesso_cliente UUID UNIQUE DEFAULT gen_random_uuid(),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  feedback_cliente_em TIMESTAMP WITH TIME ZONE,
  feedback_corretor_em TIMESTAMP WITH TIME ZONE,
  completo_em TIMESTAMP WITH TIME ZONE
);

-- Validações CHECK separadas (não usar now() em CHECK)
-- Validações serão feitas na aplicação

-- Índices para performance
CREATE INDEX idx_feedbacks_agendamento ON public.feedbacks_visitas(agendamento_visita_id);
CREATE INDEX idx_feedbacks_imovel ON public.feedbacks_visitas(imovel_id);
CREATE INDEX idx_feedbacks_imobiliaria ON public.feedbacks_visitas(imobiliaria_id);
CREATE INDEX idx_feedbacks_construtora ON public.feedbacks_visitas(construtora_id);
CREATE INDEX idx_feedbacks_status ON public.feedbacks_visitas(status);
CREATE INDEX idx_feedbacks_token ON public.feedbacks_visitas(token_acesso_cliente);
CREATE INDEX idx_feedbacks_created_at ON public.feedbacks_visitas(created_at);

-- Trigger para updated_at
CREATE TRIGGER update_feedbacks_updated_at
  BEFORE UPDATE ON public.feedbacks_visitas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Habilitar RLS
ALTER TABLE public.feedbacks_visitas ENABLE ROW LEVEL SECURITY;

-- Política: Imobiliárias podem ver seus feedbacks
CREATE POLICY "Imobiliarias podem ver seus feedbacks"
  ON public.feedbacks_visitas
  FOR SELECT
  USING (imobiliaria_id = get_imobiliaria_id(auth.uid()));

-- Política: Construtoras podem ver feedbacks de seus imóveis
CREATE POLICY "Construtoras podem ver feedbacks de seus imoveis"
  ON public.feedbacks_visitas
  FOR SELECT
  USING (construtora_id = get_construtora_id(auth.uid()));

-- Política: Acesso público via token (leitura)
CREATE POLICY "Acesso publico via token para leitura"
  ON public.feedbacks_visitas
  FOR SELECT
  USING (token_acesso_cliente IS NOT NULL);

-- Política: Imobiliárias podem criar feedbacks
CREATE POLICY "Imobiliarias podem criar feedbacks"
  ON public.feedbacks_visitas
  FOR INSERT
  WITH CHECK (imobiliaria_id = get_imobiliaria_id(auth.uid()));

-- Política: Construtoras podem criar feedbacks
CREATE POLICY "Construtoras podem criar feedbacks"
  ON public.feedbacks_visitas
  FOR INSERT
  WITH CHECK (construtora_id = get_construtora_id(auth.uid()));

-- Política: Imobiliárias podem atualizar seus feedbacks
CREATE POLICY "Imobiliarias podem atualizar feedbacks"
  ON public.feedbacks_visitas
  FOR UPDATE
  USING (imobiliaria_id = get_imobiliaria_id(auth.uid()));

-- Política: Construtoras podem atualizar feedbacks de seus imóveis
CREATE POLICY "Construtoras podem atualizar feedbacks"
  ON public.feedbacks_visitas
  FOR UPDATE
  USING (construtora_id = get_construtora_id(auth.uid()));

-- Política: Permitir update anônimo via token (para cliente preencher)
CREATE POLICY "Update publico via token"
  ON public.feedbacks_visitas
  FOR UPDATE
  USING (token_acesso_cliente IS NOT NULL)
  WITH CHECK (token_acesso_cliente IS NOT NULL);

-- Criar bucket para relatórios PDF
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('relatorios', 'relatorios', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Política de storage: leitura pública
CREATE POLICY "Relatorios sao publicos para leitura"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'relatorios');

-- Política de storage: upload autenticado
CREATE POLICY "Upload de relatorios autenticado"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'relatorios' AND auth.role() = 'authenticated');

-- Política de storage: upload anônimo (para geração via edge function)
CREATE POLICY "Upload de relatorios anonimo"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'relatorios');