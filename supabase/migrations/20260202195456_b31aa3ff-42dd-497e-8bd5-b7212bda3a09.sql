-- =====================================================
-- Database Performance Indexes
-- =====================================================

-- Leads indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_imobiliaria_status 
ON leads(imobiliaria_id, status);

CREATE INDEX IF NOT EXISTS idx_leads_construtora_created 
ON leads(construtora_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_imovel_created 
ON leads(imovel_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_estagio_pipeline 
ON leads(estagio_pipeline);

-- Pageviews indexes for analytics
CREATE INDEX IF NOT EXISTS idx_pageviews_imovel_date 
ON pageviews(imovel_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pageviews_imobiliaria_date 
ON pageviews(imobiliaria_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pageviews_access_date 
ON pageviews(access_id, created_at DESC);

-- Agendamentos indexes
CREATE INDEX IF NOT EXISTS idx_agendamentos_construtora_status 
ON agendamentos_visitas(construtora_id, status);

CREATE INDEX IF NOT EXISTS idx_agendamentos_imobiliaria_status 
ON agendamentos_visitas(imobiliaria_id, status);

CREATE INDEX IF NOT EXISTS idx_agendamentos_data_confirmada 
ON agendamentos_visitas(data_confirmada);

CREATE INDEX IF NOT EXISTS idx_agendamentos_lembrete 
ON agendamentos_visitas(status, lembrete_24h_enviado, data_confirmada)
WHERE status = 'confirmado' AND lembrete_24h_enviado = false;

-- Feedbacks indexes
CREATE INDEX IF NOT EXISTS idx_feedbacks_construtora_status 
ON feedbacks_visitas(construtora_id, status);

CREATE INDEX IF NOT EXISTS idx_feedbacks_imobiliaria_status 
ON feedbacks_visitas(imobiliaria_id, status);

CREATE INDEX IF NOT EXISTS idx_feedbacks_data_visita 
ON feedbacks_visitas(data_visita DESC);

CREATE INDEX IF NOT EXISTS idx_feedbacks_token 
ON feedbacks_visitas(token_acesso_cliente)
WHERE token_acesso_cliente IS NOT NULL;

-- Imoveis indexes
CREATE INDEX IF NOT EXISTS idx_imoveis_construtora_status 
ON imoveis(construtora_id, status);

CREATE INDEX IF NOT EXISTS idx_imoveis_status_created 
ON imoveis(status, created_at DESC);

-- Imobiliaria access indexes
CREATE INDEX IF NOT EXISTS idx_access_imobiliaria_status 
ON imobiliaria_imovel_access(imobiliaria_id, status);

CREATE INDEX IF NOT EXISTS idx_access_imovel_status 
ON imobiliaria_imovel_access(imovel_id, status);

CREATE INDEX IF NOT EXISTS idx_access_slug 
ON imobiliaria_imovel_access(url_slug);

-- Atividades lead indexes
CREATE INDEX IF NOT EXISTS idx_atividades_lead_created 
ON atividades_lead(lead_id, created_at DESC);

-- Notas lead indexes
CREATE INDEX IF NOT EXISTS idx_notas_lead_created 
ON notas_lead(lead_id, created_at DESC);

-- Tarefas indexes
CREATE INDEX IF NOT EXISTS idx_tarefas_lead_status 
ON tarefas(lead_id, status);

CREATE INDEX IF NOT EXISTS idx_tarefas_vencimento 
ON tarefas(data_vencimento)
WHERE status != 'concluida';

-- Integracoes indexes
CREATE INDEX IF NOT EXISTS idx_integracoes_construtora 
ON integracoes(construtora_id, tipo_integracao);

CREATE INDEX IF NOT EXISTS idx_integracoes_imobiliaria 
ON integracoes(imobiliaria_id, tipo_integracao);

-- Conversas chatbot indexes
CREATE INDEX IF NOT EXISTS idx_conversas_imovel_session 
ON conversas_chatbot(imovel_id, session_id);

CREATE INDEX IF NOT EXISTS idx_conversas_construtora_created 
ON conversas_chatbot(construtora_id, created_at DESC);

-- Configuracoes formularios indexes
CREATE INDEX IF NOT EXISTS idx_config_forms_imobiliaria_tipo 
ON configuracoes_formularios(imobiliaria_id, tipo_formulario);