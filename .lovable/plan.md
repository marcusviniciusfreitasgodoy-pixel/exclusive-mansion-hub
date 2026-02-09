


## Roteiro de Escalabilidade -- Godoy Prime

### Diagnostico Atual

A aplicacao esta bem construida para um MVP, com RLS robusto, rate limiting, code splitting e Edge Functions. Porem, para escalar vendas e usuarios de forma segura, existem ajustes em 6 areas criticas.

---

### 1. Seguranca -- Correcoes Imediatas

**Prioridade: ALTA (fazer antes de escalar)**

- ✅ ~~**Rotas admin sem protecao adequada**~~ -- Corrigido: `/admin/diagnostico`, `/admin/base-conhecimento`, `/admin/usuarios` agora usam `ProtectedRoute allowedRoles={['admin']}`.
- ✅ ~~**signup-user usa import de `esm.sh`**~~ -- Migrado para `npm:@supabase/supabase-js@2`.
- ✅ ~~**RLS "always true" em rate_limits**~~ -- Corrigido: policy agora usa `USING (false)` (acesso apenas via SECURITY DEFINER functions).
- ✅ ~~**Tabela demo_requests sem policies**~~ -- Corrigido: adicionadas policies de INSERT publico e SELECT autenticado.
- **Leaked Password Protection desabilitada** -- Ativar no painel de autenticacao (acao externa).
- **Extensao no schema public** -- Mover extensoes para schema separado (acao externa, requer cuidado com dependencias).

---

### 2. Performance do Banco de Dados

**Prioridade: ALTA**

- ✅ ~~**Indices compostos**~~ -- Criados para: `leads(imovel_id, status)`, `leads(imobiliaria_id, created_at)`, `pageviews(imovel_id, created_at)`, `pageviews(imobiliaria_id, created_at)`, `imobiliaria_imovel_access(url_slug)`, `conversas_chatbot(session_id)`, `feedbacks_visitas(token_acesso_cliente)`, `agendamentos_visitas(imovel_id, status, opcao_data_1)`.
- ✅ ~~**Paginacao**~~ -- Ambas as paginas de Leads (construtora e imobiliaria) ja usam `.range()` com paginacao de 20 itens.
- ✅ ~~**Limpeza automatica de rate_limits**~~ -- CRON configurado para rodar a cada hora (`cleanup-rate-limits-hourly`).

---

### 3. Views Agregadas para Analytics

- ✅ ~~**Views materializadas**~~ -- Criadas: `mv_leads_diario` e `mv_pageviews_diario` com refresh automatico a cada 15 minutos via CRON.
- ✅ ~~**Funcao de refresh**~~ -- `refresh_analytics_views()` criada para refresh concorrente.

---

### 4. Infraestrutura de Email

**Prioridade: MEDIA-ALTA**

- **Resend tem limites** -- No plano free, sao 100 emails/dia. Para escalar vendas, sera necessario upgrade do plano Resend ou migrar para um provedor com maior volume (ex: Amazon SES).
- **Fila de emails** -- Atualmente, as Edge Functions enviam emails sincronamente. Se Resend estiver lento, o usuario espera. Implementar uma tabela `email_queue` com processamento assincrono via pg_cron ou webhook.
- **Monitoramento de bounces** -- Configurar webhook de bounces/complaints do Resend para desativar emails invalidos e manter boa reputacao do dominio.

---

### 5. Frontend -- Preparacao para Escala

**Prioridade: MEDIA**

- **CDN e caching** -- Publicar o frontend via Vercel, Netlify ou Cloudflare Pages com CDN global.
- **Imagens** -- Considerar um Image CDN (Cloudflare Images, Imgix) com transformacoes on-the-fly.
- **Service Worker / PWA** -- Certificar-se de que o cache de assets estaticos esta configurado.

---

### 6. Observabilidade e Monitoramento

**Prioridade: MEDIA**

- **Logging estruturado** -- Integrar com Sentry, LogFlare ou Datadog.
- **Alertas** -- Configurar alertas para: taxa de erro > 5%, rate limit excedido frequentemente, bounces de email.

---

### 7. Arquitetura para Multi-Regiao (Longo Prazo)

**Prioridade: BAIXA (quando tiver >100 construtoras)**

- **Read replicas** -- Supabase suporta read replicas.
- **Edge Functions regionais** -- Avaliar deploy em multiplas regioes.

---

### Resumo de Progresso

| Acao | Status |
|---|---|
| Proteger rotas admin com role `admin` | ✅ Feito |
| Migrar import esm.sh para npm: no signup-user | ✅ Feito |
| Corrigir RLS always-true (rate_limits) | ✅ Feito |
| Corrigir tabela sem policy (demo_requests) | ✅ Feito |
| Adicionar indices compostos no banco | ✅ Feito |
| Paginacao nos dashboards de leads | ✅ Ja existia |
| Configurar CRON para limpeza de rate_limits | ✅ Feito |
| Criar views agregadas para analytics | ✅ Feito |
| CRON para refresh de views | ✅ Feito |
| Ativar leaked password protection | ⏳ Acao externa |
| Mover extensoes do schema public | ⏳ Acao externa |
| Upgrade plano Resend | ⏳ Acao externa |
| Fila assincrona de emails | 📋 Pendente |
| CDN para frontend e imagens | ⏳ Acao externa |
| Logging estruturado | ⏳ Acao externa |
