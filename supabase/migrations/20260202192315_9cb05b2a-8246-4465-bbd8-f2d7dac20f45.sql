-- Create integrations table
CREATE TABLE integracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imobiliaria_id UUID REFERENCES imobiliarias(id) ON DELETE CASCADE,
  construtora_id UUID REFERENCES construtoras(id) ON DELETE CASCADE,
  
  tipo_integracao VARCHAR(100) NOT NULL,
  -- 'whatsapp_business' | 'google_analytics' | 'meta_pixel' | 
  -- 'zapier_webhook' | 'google_tag_manager'
  
  nome_exibicao VARCHAR(255),
  descricao TEXT,
  ativa BOOLEAN DEFAULT FALSE,
  
  -- Credenciais (armazenar de forma segura)
  credenciais JSONB DEFAULT '{}',
  
  -- Configurações específicas
  configuracoes JSONB DEFAULT '{}',
  
  -- Status
  ultima_sincronizacao TIMESTAMP WITH TIME ZONE,
  proxima_sincronizacao TIMESTAMP WITH TIME ZONE,
  total_eventos_enviados INTEGER DEFAULT 0,
  erro_ultima_tentativa TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure only one integration of each type per imobiliaria/construtora
  CONSTRAINT unique_integration_imobiliaria UNIQUE (imobiliaria_id, tipo_integracao),
  CONSTRAINT unique_integration_construtora UNIQUE (construtora_id, tipo_integracao),
  
  -- Check that at least one owner is set
  CONSTRAINT check_owner CHECK (
    (imobiliaria_id IS NOT NULL AND construtora_id IS NULL) OR
    (imobiliaria_id IS NULL AND construtora_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_integracoes_imobiliaria ON integracoes(imobiliaria_id);
CREATE INDEX idx_integracoes_construtora ON integracoes(construtora_id);
CREATE INDEX idx_integracoes_tipo ON integracoes(tipo_integracao);
CREATE INDEX idx_integracoes_ativa ON integracoes(ativa);

-- Enable RLS
ALTER TABLE integracoes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for imobiliarias
CREATE POLICY "Imobiliarias podem gerenciar suas integracoes"
  ON integracoes FOR ALL
  USING (imobiliaria_id = get_imobiliaria_id(auth.uid()))
  WITH CHECK (imobiliaria_id = get_imobiliaria_id(auth.uid()));

-- RLS Policies for construtoras
CREATE POLICY "Construtoras podem gerenciar suas integracoes"
  ON integracoes FOR ALL
  USING (construtora_id = get_construtora_id(auth.uid()))
  WITH CHECK (construtora_id = get_construtora_id(auth.uid()));

-- Update trigger
CREATE TRIGGER update_integracoes_updated_at
  BEFORE UPDATE ON integracoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();