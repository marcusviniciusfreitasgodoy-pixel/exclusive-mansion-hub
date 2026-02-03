-- Criar tipos para o sistema de mídias pendentes
CREATE TYPE midia_tipo AS ENUM ('imagem', 'video');
CREATE TYPE midia_status AS ENUM ('pendente', 'aprovado', 'rejeitado');

-- Criar tabela para mídias enviadas por imobiliárias aguardando aprovação
CREATE TABLE midias_pendentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamentos
  imovel_id UUID NOT NULL REFERENCES imoveis(id) ON DELETE CASCADE,
  imobiliaria_id UUID NOT NULL REFERENCES imobiliarias(id) ON DELETE CASCADE,
  access_id UUID NOT NULL REFERENCES imobiliaria_imovel_access(id) ON DELETE CASCADE,
  
  -- Dados da mídia
  tipo midia_tipo NOT NULL,
  url TEXT NOT NULL,
  alt TEXT,
  video_tipo TEXT,
  
  -- Status e workflow
  status midia_status DEFAULT 'pendente',
  enviado_em TIMESTAMPTZ DEFAULT now(),
  revisado_em TIMESTAMPTZ,
  revisado_por UUID,
  motivo_rejeicao TEXT,
  
  -- Metadata
  nome_arquivo_original TEXT,
  tamanho_bytes INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_midias_pendentes_imovel ON midias_pendentes(imovel_id);
CREATE INDEX idx_midias_pendentes_status ON midias_pendentes(status);
CREATE INDEX idx_midias_pendentes_imobiliaria ON midias_pendentes(imobiliaria_id);

-- Habilitar RLS
ALTER TABLE midias_pendentes ENABLE ROW LEVEL SECURITY;

-- Imobiliárias podem inserir mídias para imóveis que têm acesso
CREATE POLICY "Imobiliarias podem enviar midias"
ON midias_pendentes FOR INSERT
WITH CHECK (
  imobiliaria_id = get_imobiliaria_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM imobiliaria_imovel_access
    WHERE id = midias_pendentes.access_id
    AND imobiliaria_id = midias_pendentes.imobiliaria_id
    AND imovel_id = midias_pendentes.imovel_id
    AND status = 'active'
  )
);

-- Imobiliárias podem ver suas próprias mídias
CREATE POLICY "Imobiliarias podem ver suas midias"
ON midias_pendentes FOR SELECT
USING (imobiliaria_id = get_imobiliaria_id(auth.uid()));

-- Construtoras podem ver mídias de seus imóveis
CREATE POLICY "Construtoras podem ver midias de seus imoveis"
ON midias_pendentes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM imoveis
    WHERE id = midias_pendentes.imovel_id
    AND construtora_id = get_construtora_id(auth.uid())
  )
);

-- Construtoras podem atualizar status (aprovar/rejeitar)
CREATE POLICY "Construtoras podem aprovar ou rejeitar"
ON midias_pendentes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM imoveis
    WHERE id = midias_pendentes.imovel_id
    AND construtora_id = get_construtora_id(auth.uid())
  )
);

-- Criar bucket para mídias pendentes
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('midias-pendentes', 'midias-pendentes', true, 20971520)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para mídias pendentes
CREATE POLICY "Imobiliarias podem fazer upload midias pendentes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'midias-pendentes'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Leitura publica de midias pendentes"
ON storage.objects FOR SELECT
USING (bucket_id = 'midias-pendentes');

CREATE POLICY "Imobiliarias podem deletar suas midias pendentes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'midias-pendentes'
  AND auth.role() = 'authenticated'
);