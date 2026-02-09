

## Roteiro de Escalabilidade -- Godoy Prime

### Diagnostico Atual

A aplicacao esta bem construida para um MVP, com RLS robusto, rate limiting, code splitting e Edge Functions. Porem, para escalar vendas e usuarios de forma segura, existem ajustes em 6 areas criticas.

---

### 1. Seguranca -- Correcoes Imediatas

**Prioridade: ALTA (fazer antes de escalar)**

- **Leaked Password Protection desabilitada** -- Ativar a protecao contra senhas vazadas no painel de autenticacao. Sem isso, usuarios podem usar senhas ja comprometidas em vazamentos publicos.
- **RLS "always true"** -- Ha pelo menos 1 policy com `USING (true)` para INSERT/UPDATE/DELETE. Isso precisa ser revisado e restringido para operacoes nao-publicas.
- **Tabela com RLS habilitado sem policies** -- Uma tabela tem RLS ativado mas nenhuma policy criada. Isso bloqueia TODO acesso (nem leitura funciona), ou pode indicar uma tabela orfã.
- **Extensao no schema public** -- Mover extensoes para schema separado (ex: `extensions`) para reduzir superficie de ataque.
- **Rotas admin sem protecao adequada** -- `/admin/diagnostico`, `/admin/base-conhecimento`, `/admin/usuarios` nao verificam role `admin` via `ProtectedRoute`. Qualquer usuario autenticado pode acessar.
- **signup-user usa import de `esm.sh`** -- Migrar para `npm:@supabase/supabase-js@2` para consistencia e estabilidade (outras functions ja usam `npm:`).

---

### 2. Performance do Banco de Dados

**Prioridade: ALTA**

- **Indices compostos** -- Verificar e adicionar indices para as queries mais frequentes:
  - `leads(imovel_id, status)` e `leads(imobiliaria_id, created_at)`
  - `pageviews(imovel_id, created_at)` e `pageviews(imobiliaria_id, created_at)`
  - `imobiliaria_imovel_access(url_slug)` (critico -- e o ponto de entrada de toda pagina publica)
  - `conversas_chatbot(session_id)`
  - `feedbacks_visitas(token_acesso_cliente)`
  - `agendamentos_visitas(imovel_id, status, data_visita)`
- **Paginacao** -- O limite padrao do Supabase e 1000 linhas. Paginas de leads, analytics e feedbacks devem implementar paginacao com `.range()` para evitar timeout em contas com muitos dados.
- **Limpeza automatica de rate_limits** -- A funcao `cleanup_old_rate_limits()` existe mas nao ha CRON configurado. Configurar um pg_cron para rodar a cada hora.

---

### 3. Infraestrutura de Email

**Prioridade: MEDIA-ALTA**

- **Resend tem limites** -- No plano free, sao 100 emails/dia. Para escalar vendas, sera necessario upgrade do plano Resend ou migrar para um provedor com maior volume (ex: Amazon SES).
- **Fila de emails** -- Atualmente, as Edge Functions enviam emails sincronamente. Se Resend estiver lento, o usuario espera. Implementar uma tabela `email_queue` com processamento assincrono via pg_cron ou webhook.
- **Monitoramento de bounces** -- Configurar webhook de bounces/complaints do Resend para desativar emails invalidos e manter boa reputacao do dominio.

---

### 4. Frontend -- Preparacao para Escala

**Prioridade: MEDIA**

- **CDN e caching** -- Publicar o frontend via Vercel, Netlify ou Cloudflare Pages com CDN global. O Lovable App serve bem para dev/staging, mas para producao com muitos acessos simultaneos em paginas publicas de imoveis, um CDN dedicado garante latencia baixa.
- **Imagens** -- O processamento WebP ja existe no cliente, mas as imagens sao servidas diretamente do Supabase Storage. Para alto volume, considerar um Image CDN (Cloudflare Images, Imgix) com transformacoes on-the-fly.
- **Service Worker / PWA** -- Ja tem `vite-plugin-pwa` instalado. Certificar-se de que o cache de assets estaticos esta configurado para reduzir requisicoes ao servidor.

---

### 5. Observabilidade e Monitoramento

**Prioridade: MEDIA**

- **Logging estruturado** -- As Edge Functions usam `console.log/error`. Para escalar, integrar com Sentry, LogFlare ou Datadog para rastrear erros em producao com contexto (user_id, imovel_id, etc).
- **Metricas de negocio** -- Criar uma view materializada ou tabela agregada para metricas do dashboard (leads por dia, pageviews por imovel, taxa de conversao). Isso evita queries pesadas em tempo real.
- **Alertas** -- Configurar alertas para: taxa de erro > 5%, rate limit excedido frequentemente, bounces de email, falhas no chatbot.

---

### 6. Arquitetura para Multi-Regiao (Longo Prazo)

**Prioridade: BAIXA (quando tiver >100 construtoras)**

- **Read replicas** -- O Supabase suporta read replicas para distribuir carga de leitura. Util quando paginas publicas de imoveis gerarem muito trafego.
- **Edge Functions regionais** -- Avaliar deploy em multiplas regioes para reduzir latencia.
- **Separacao de schemas** -- Se necessario, implementar schema por construtora para isolamento fisico (mais complexo, so se exigido por compliance).

---

### Resumo por Prioridade

| Acao | Prioridade | Esforco | Impacto |
|---|---|---|---|
| Ativar leaked password protection | ALTA | Baixo | Seguranca |
| Corrigir RLS always-true e tabela sem policy | ALTA | Baixo | Seguranca |
| Proteger rotas admin com role `admin` | ALTA | Baixo | Seguranca |
| Adicionar indices compostos no banco | ALTA | Medio | Performance |
| Implementar paginacao nos dashboards | ALTA | Medio | Estabilidade |
| Configurar CRON para limpeza de rate_limits | MEDIA | Baixo | Manutencao |
| Upgrade plano Resend ou migrar provedor | MEDIA-ALTA | Baixo | Escala |
| Fila assincrona de emails | MEDIA | Medio | Resiliencia |
| CDN para frontend e imagens | MEDIA | Medio | Performance |
| Logging estruturado (Sentry/LogFlare) | MEDIA | Medio | Observabilidade |
| Views materializadas para analytics | MEDIA | Medio | Performance |
| Migrar import esm.sh para npm: no signup-user | BAIXA | Baixo | Estabilidade |
| Read replicas / multi-regiao | BAIXA | Alto | Escala |

---

### O que pode ser feito AGORA no Lovable

Dessas acoes, as seguintes podem ser implementadas diretamente aqui:

1. Corrigir rotas admin com `ProtectedRoute allowedRoles={['admin']}`
2. Adicionar indices compostos via migration SQL
3. Configurar CRON para limpeza de rate_limits
4. Implementar paginacao nos dashboards de leads/analytics
5. Migrar import `esm.sh` para `npm:` no signup-user
6. Criar views agregadas para dashboard analytics

As demais acoes (CDN, Sentry, upgrade Resend, leaked password protection) dependem de configuracao externa ao projeto.

