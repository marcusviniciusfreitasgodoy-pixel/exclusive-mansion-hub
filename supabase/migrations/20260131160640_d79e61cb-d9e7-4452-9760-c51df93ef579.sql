-- Adicionar coluna para URL do documento de identificação na tabela agendamentos_visitas
ALTER TABLE public.agendamentos_visitas 
ADD COLUMN documento_identificacao_url TEXT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.agendamentos_visitas.documento_identificacao_url IS 'URL do documento de identificação (RG ou CNH) enviado pelo cliente para validação';