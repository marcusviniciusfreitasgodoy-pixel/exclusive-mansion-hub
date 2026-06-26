# CONTEXT.md — Regras Invioláveis e Padrões do Projeto

> Documento de referência mestra. **Toda contribuição (humana ou IA) deve obedecer estas regras.**
> Plataforma: SaaS B2B White-label para o mercado imobiliário de alto padrão.
> Domínio de produção: `whitelabel.godoyprime.com.br`.

---

## 1. Identidade e Domínio do Produto

- **Setor**: SaaS B2B Imobiliário (alto padrão / luxo).
- **Modelo Multi-tenant**: Construtoras (gestoras) ↔ Imobiliárias/Corretores (parceiros) ↔ Cliente final.
- **Atores principais**:
  - **Construtora**: dona dos empreendimentos, gerencia portfolio, aprova mídias, distribui imóveis para imobiliárias parceiras.
  - **Imobiliária**: opera o white-label, gerencia equipe de corretores, recebe leads.
  - **Corretor**: usa CRM, agenda visitas, executa feedbacks pós-visita.
  - **Cliente final**: navega sites white-label, agenda visita, preenche feedback via token público.
  - **Admin (dev)**: `dev@godoyrealty.com` — gestão global da plataforma.

---

## 2. Identidade Visual (Design System) — INVIOLÁVEL

- **Cores oficiais**:
  - Navy `#0C2340` (primary / background institucional)
  - Gold `#D4AF37` (accent / CTAs / destaques)
- **Tipografia**:
  - **Montserrat** — títulos / headings
  - **Roboto** — corpo de texto
  - ❌ Nunca usar serifadas. Nunca Inter, Poppins ou fontes "genéricas de IA".
- **Tokens semânticos**: TODAS as cores, gradientes e sombras devem vir de `src/index.css` e dos variants do shadcn. **Proibido** hardcode tipo `text-white`, `bg-black`, `bg-[#xxx]` nos componentes — quebra dark mode e tematização.
- **Estética**: sóbria, premium, alto padrão. Rejeitar gradientes roxo/índigo, layouts genéricos, "AI aesthetic".

---

## 3. Terminologia (PT-BR) — OBRIGATÓRIO na UI

Sempre traduzir termos técnicos para a linguagem do mercado imobiliário:

| Técnico (proibido na UI) | Usuário Final (correto)  |
| ------------------------ | ------------------------ |
| White-label              | **Marca Própria**        |
| Leads                    | **Contatos**             |
| Pipeline                 | **Funil Visual**         |
| Chatbot                  | **Sofia IA**             |
| Dashboard                | **Painel**               |

---

## 4. Stack Tecnológica — FIXA

- **Frontend**: React 18 + Vite 5 + TypeScript 5 + Tailwind v3 + shadcn/ui.
- **Backend**: Lovable Cloud (Supabase) — Postgres + Edge Functions (Deno) + Storage + Auth.
- **IA**: Lovable AI Gateway (Gemini para texto/visão; ElevenLabs para TTS).
- **Email transacional**: Resend (`leads@godoyprime.com.br`, `contato@godoyprime.com.br`).
- **WhatsApp**: Z-API (secrets: `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN`).
- ❌ **Nunca** introduzir Angular, Vue, Next.js, Svelte, servidor Node persistente ou backend Python no repositório.
- ❌ **Nunca** mencionar "Supabase" ao usuário final — falar "Lovable Cloud / backend / banco".

---

## 5. Segurança — REGRAS INVIOLÁVEIS

### 5.1 RLS (Row Level Security)
- **Toda** tabela em `public` DEVE ter RLS habilitado.
- **Toda** tabela em `public` DEVE ter `GRANT` explícito (`authenticated`, `service_role`, e `anon` apenas se a política permitir leitura pública).
- Para verificações cross-table em policies, usar **`SECURITY DEFINER` functions** (`has_role`, `get_imobiliaria_id`, `get_construtora_id`, `user_owns_imovel`, `imobiliaria_has_access`) — evita recursão.
- `search_path = public` em **toda** function `SECURITY DEFINER`.

### 5.2 Roles
- Roles ficam **exclusivamente** em `public.user_roles` (enum `app_role`).
- ❌ **Nunca** armazenar role em `profiles` ou `auth.users.user_metadata` — escalação de privilégio.
- Verificação sempre via `public.has_role(auth.uid(), 'role')`.
- No frontend usar `.some(role => allowedRoles.includes(role))` em `ProtectedRoute`.

### 5.3 Auth
- ❌ **Sem signup público anônimo**.
- Login admin/dev exige MFA TOTP opcional.
- Bloqueio progressivo em login e reset (`auth-abuse-prevention`).
- OAuth `redirect_uri` deve ser URL pública same-origin (`${window.location.origin}/auth/callback`) — nunca apontar direto para rota protegida.
- Configurar provider Google sempre que adicionar auth Google na mesma migração.

### 5.4 Edge Functions
- `verify_jwt = false` em `supabase/config.toml` + validar token programaticamente via `supabase.auth.getUser(token)`.
- Rate limiting via `check_and_increment_rate_limit()` (DB-level) para funções sensíveis (WhatsApp webhook, AI, PDF).
- Funções de IA exigem Bearer token + role check.
- Limite de PDFs: 10MB com streaming monitor.

### 5.5 Anti-spam
- ✅ **Honeypot** em formulários públicos.
- ❌ **Proibido reCAPTCHA v3**.

### 5.6 Validação de Input
- Triggers de validação de tamanho (`validate_text_length`) para tabelas com PII.
- Sanitização regex para qualquer script de tracking (anti-XSS).

### 5.7 Tokens Públicos
- Acesso público a feedbacks/propostas via UUID token em RPC `SECURITY DEFINER` (`submit_client_feedback`, `submit_proposta_compra`, `get_feedback_by_token`).
- ❌ Nunca expor PII via SELECT direto em tabela pública.

### 5.8 Secrets Inacessíveis
- `SUPABASE_SERVICE_ROLE_KEY` e senha do banco **não são acessíveis** ao usuário no Lovable Cloud — nunca instruir o usuário a buscá-los, nunca fabricar valor placeholder.

---

## 6. Modelo de Dados — Padrões

- Multi-tenancy isolado por `construtora_id` e `imobiliaria_id` em **toda** tabela operacional.
- Histórico/timeline em tabelas dedicadas (CRM activities, feedback history).
- Schemas dinâmicos (formulários customizados, knowledge base) em **JSONB**.
- Materialized views (`mv_leads_diario`, `mv_pageviews_diario`) refrescadas via `refresh_analytics_views()` + pg_cron.
- ❌ Nunca tocar nos schemas: `auth`, `storage`, `realtime`, `supabase_functions`, `vault`.
- ❌ Nunca editar autogerados: `src/integrations/supabase/client.ts`, `types.ts`, `.env`.

### Storage Buckets
| Bucket                 | Público | Uso                                       |
| ---------------------- | ------- | ----------------------------------------- |
| `logos`                | ✅      | Logos de imobiliárias/construtoras        |
| `imoveis`              | ✅      | Mídias aprovadas de imóveis               |
| `relatorios`           | ✅      | One-pagers, PDFs comerciais               |
| `midias-pendentes`     | ✅      | Mídias enviadas aguardando aprovação      |
| `documentos-privados`  | ❌      | CNHs, contratos                           |
| `documentos-proposta`  | ❌      | Propostas formais + CNH proponente        |

---

## 7. Lógicas de Negócio Críticas

### 7.1 CRM / Funil
- **8 estágios fixos**: Novo → Contatado → Qualificado → Visita Agendada → Proposta → Negociação → Ganho / Perdido.
- Automações por estágio: 24h (Qualificado), 48h (Visita), 72h (Proposta).
- Lead Scoring 0-100: Qualificação térmica (40) + Decisão (25) + Prazo (25) + Orçamento (10).

### 7.2 Agendamento
- Slots fixos de **1h30m** — nunca sobrepor.
- Sempre tempo real (sincronização entre painéis).

### 7.3 Feedback / Visitas
- Sequência: assinatura visitante → assinatura corretor → token cliente → feedback cliente → finalização corretor.
- Captura IP + geolocalização + device para validade jurídica (Lei 6.530/78).
- Follow-up automático a cada 48h em pendências.

### 7.4 Proposta Formal
- Gerada inline pós-feedback, com assinatura digital + upload CNH.

### 7.5 Sofia IA
- 3 camadas de contexto: knowledge base + dados do imóvel + histórico da conversa.
- Gemini Vision para extrair imagens diretamente de PDFs.
- Voz: ElevenLabs com fallback Web Speech API.
- ❌ Nunca alucinar dados — respeitar estritamente fatos da base.

### 7.6 Lançamento de Imóvel
- Checklist obrigatório de validação antes de publicar.

---

## 8. Infraestrutura e Domínios

- **Produção**: `whitelabel.godoyprime.com.br`
- **Emails**: domínio verificado `godoyprime.com.br` (Resend).
- Custom Domain Management: verificação CNAME em 3 passos.
- Favicon dinâmico via react-helmet por tenant.

---

## 9. Padrões de Código

- **Componentes pequenos e focados** — preferir split em vez de mega-arquivo.
- Imports Supabase: sempre `import { supabase } from "@/integrations/supabase/client"`.
- Edits cirúrgicos: search-replace > rewrite completo.
- Quando o pedido é UI, alterar apenas frontend/presentation — não tocar regra de negócio sem pedido explícito.
- Tailwind: usar tokens semânticos do `index.css`, nunca cores literais.

### SEO
- Title <60 chars, meta description <160 chars.
- 1 único `<h1>` por página, HTML semântico, alt em imagens, canonical, viewport responsivo, lazy loading, JSON-LD quando aplicável.

### HTML
- ❌ `<noscript><img/></noscript>` **proibido em `<head>`**. Apenas em `<body>`.

---

## 10. Integrações Externas

| Serviço     | Uso                              | Secret                                          |
| ----------- | -------------------------------- | ----------------------------------------------- |
| Resend      | Email transacional               | `RESEND_API_KEY`                                |
| Z-API       | WhatsApp                         | `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN` |
| ElevenLabs  | TTS Sofia                        | `ELEVENLABS_API_KEY`                            |
| Lovable AI  | Gemini (texto + visão)           | `LOVABLE_API_KEY`                               |

Hub de integrações nativo: WhatsApp, GA4, Meta Pixel, GTM, Webhooks.

---

## 11. O que NUNCA Fazer (Hall of Shame)

- ❌ Reintroduzir reCAPTCHA v3.
- ❌ Re-adicionar dashboards que foram removidos sem pedido explícito.
- ❌ Falar "Supabase", "White-label" ou "Leads" na UI do usuário.
- ❌ Storage de role em `profiles` ou metadata.
- ❌ Hardcode de cores fora dos tokens.
- ❌ Edge function sem `getUser()` programático.
- ❌ Migration que cria tabela em `public` sem `GRANT` correspondente.
- ❌ Mostrar IDs / URLs do Supabase ou links `supabase.com/dashboard` para o usuário.
- ❌ Logar/retornar `SUPABASE_SERVICE_ROLE_KEY`.
- ❌ Usar `fetch_website`/`web_search` quando bastaria ler arquivo do projeto.

---

## 12. Workflow do Agente

1. Esclarecer escopo antes de implementar quando ambíguo.
2. Batch de leituras de arquivo em paralelo.
3. Cloud + AI Gateway por padrão — só sugerir alternativas se pedido.
4. Edits cirúrgicos, componentes pequenos.
5. **Verificar** antes de declarar concluído (build, logs, screenshot, teste).
6. Encerrar com 1 frase curta — nunca recap em terceira pessoa.

---

**Última atualização**: 2026-06-26
**Owner**: Godoy Prime / Plataforma White-label Imobiliária
