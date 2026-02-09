

## Documentacao de Emergencia -- Godoy Prime

### 1. Visao Geral do Projeto

**Nome:** Godoy Prime - Plataforma Imobiliaria Multi-Tenant
**Descricao:** SaaS que conecta construtoras e imobiliarias, com paginas white-label de imoveis, gestao de leads, agendamento de visitas, feedback digital e chatbot com IA.
**Stack:** React 18 + Vite + TypeScript + Tailwind CSS + Shadcn UI + Lovable Cloud (Supabase)

---

### 2. Acessos e URLs

| Recurso | URL/Info |
|---|---|
| Lovable Project | `https://lovable.dev/projects/0ad4a9cb-9e3e-45e8-897a-7a7bb9a3a3f4` |
| Preview URL | `https://id-preview--6c4a0233-f323-4218-9d12-61d1660066ac.lovable.app` |
| Published URL | `https://exclusive-mansion-hub.lovable.app` |
| Backend Project ID | `afntqukanvgcwobwvwuo` |
| E-mail transacional | Resend (dominio: `godoyprime.com.br`) |
| Voz IA | ElevenLabs (secret configurada) |

**Secrets configuradas no backend:**
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`
- `RESEND_API_KEY` -- Envio de emails (confirmacao, notificacoes, feedback)
- `ELEVENLABS_API_KEY` -- Text-to-speech no chatbot
- `LOVABLE_API_KEY` -- IA integrada

---

### 3. Papeis de Usuario (Roles)

| Role | Descricao | Dashboard |
|---|---|---|
| `construtora` | Cadastra imoveis, gera links, gerencia acessos, ve leads/analytics | `/dashboard/construtora` |
| `imobiliaria` | Recebe acesso a imoveis, gera leads via link white-label, agenda visitas | `/dashboard/imobiliaria` |
| `admin` | Acesso administrativo (seed data, base conhecimento, usuarios) | `/admin/*` |

**Regra de negocio:** O signup cria usuario + role + perfil (construtora ou imobiliaria) em transacao. Se falhar, faz rollback. Email de confirmacao e obrigatorio via Resend.

---

### 4. Funcionalidades por Modulo

#### 4.1 Autenticacao
- **Signup:** Edge function `signup-user` cria usuario, role, perfil e envia email de confirmacao via Resend
- **Login:** Email + senha via Supabase Auth
- **Recuperacao de senha:** `/auth/forgot-password` e `/auth/reset-password`
- **Protecao de rotas:** `ProtectedRoute` valida role e redireciona se nao autorizado
- **Regra:** Email precisa ser confirmado antes do primeiro login

#### 4.2 Cadastro de Imoveis (Construtora)
- **Wizard de 6 etapas:** Info basica, Especificacoes, Descricao, Midias, Revisao, Template
- **Templates:** `luxo`, `moderno`, `classico`, `alto_padrao` -- cada um com componentes visuais proprios
- **Customizacao:** Cores, fontes, estilo de botoes, tamanho do hero
- **Materiais promocionais:** Book digital (PDF), estudo ROI, planta, tabela de vendas, videos
- **Base de conhecimento por imovel:** Textos e PDFs processados para alimentar o chatbot (tabela `imovel_knowledge_base`)

#### 4.3 Links Publicos de Imoveis
- **White-label (imobiliaria):** Construtora concede acesso via `imobiliaria_imovel_access`, gerando slug unico. Pagina usa branding da imobiliaria.
- **Link direto (construtora):** Registro com `imobiliaria_id = NULL`. Pagina usa branding da construtora.
- **Rota:** `/imovel/:slug`
- **Hook principal:** `usePropertyPage` -- resolve slug, carrega imovel + branding + construtora, registra pageview com deduplicacao de 24h via localStorage

#### 4.4 Gestao de Acessos
- **Construtora gerencia:** Concede/revoga acesso de imobiliarias a imoveis
- **Cada acesso:** Gera slug unico, contabiliza visitas
- **Pagina:** `/dashboard/construtora/imovel/:id/acessos`

#### 4.5 Leads
- **Origens:** Formulario de contato, WhatsApp, Chat IA (Sofia)
- **Status:** `novo` > `contatado` > `qualificado` > `visita_agendada` > `perdido`
- **Pipeline Kanban:** Drag-and-drop com `@dnd-kit`
- **Notificacao:** Edge function `send-lead-notification` envia email para construtora e imobiliaria
- **CRM:** Notas (`notas_lead`), atividades (`atividades_lead`), tags, score de qualificacao, responsavel
- **Regra RLS:** Construtora ve leads dos seus imoveis; Imobiliaria ve apenas seus proprios leads

#### 4.6 Agendamento de Visitas
- **Formulario publico:** Cliente escolhe 2 opcoes de data/hora
- **Disponibilidade:** Configuravel pela imobiliaria (tabela `disponibilidade_corretor`) com bloqueios (`bloqueios_agenda`)
- **Status:** `pendente` > `confirmado` > `realizado` / `cancelado`
- **Lembretes:** Edge function `send-visit-reminder` (24h e 1h antes)
- **Notificacao:** Edge function `send-visit-notification` envia email ao confirmar/agendar
- **Regra:** Imobiliaria_id pode ser null (link direto da construtora)

#### 4.7 Feedback de Visitas
- **Fluxo em 2 etapas:**
  1. Corretor preenche feedback interno (qualificacao, poder de decisao, score)
  2. Cliente recebe link por email (`send-feedback-request`) e preenche avaliacao (NPS, notas 1-5 por categoria, assinatura digital)
- **Token unico:** UUID gerado por feedback, expira em 7 dias
- **Rota publica:** `/feedback-visita/:token`
- **Funcoes DB:** `submit_client_feedback` (SECURITY DEFINER) valida token e status antes de atualizar
- **PDF:** Edge function `generate-feedback-pdf` gera relatorio consolidado
- **Integridade juridica:** Assinatura digital com canvas, data/hora, device, IP

#### 4.8 Chatbot Sofia (IA)
- **Edge function:** `chatbot-message` processa mensagens usando IA
- **Base de conhecimento:** Global (`chatbot_knowledge_base`) + por imovel (`imovel_knowledge_base`)
- **Conversas:** Armazenadas em `conversas_chatbot` com score de qualificacao, intencao detectada
- **Audio:** Text-to-speech via ElevenLabs (`elevenlabs-tts`)
- **Qualificacao automatica:** Detecta orcamento, prazo, intencao de compra

#### 4.9 WhatsApp
- **Dois modos:** API oficial (Business API) ou link wa.me (simples)
- **Edge function:** `send-whatsapp-message` -- autenticada, requer JWT
- **Webhook:** `whatsapp-webhook` para receber mensagens
- **Registro:** Todas as mensagens sao logadas em `whatsapp_messages`
- **Followup automatico:** Apos visita, envia link de feedback por WhatsApp

#### 4.10 Integracoes
- **Tabela:** `integracoes` -- suporta WhatsApp Business, Google Analytics, Facebook Pixel, etc.
- **Por entidade:** Construtora ou imobiliaria podem configurar independentemente
- **Scripts:** `AnalyticsScripts` injeta GA/Pixel/etc na pagina publica do imovel

#### 4.11 Midias Pendentes
- **Fluxo:** Imobiliaria envia fotos/videos > Construtora aprova/rejeita
- **Status:** `pendente` > `aprovada` / `rejeitada`
- **Storage:** Bucket `midias-pendentes` (publico)

#### 4.12 Dominio Customizado
- **Tabela:** `custom_domains` com verificacao DNS
- **Edge function:** `verify-domain` valida registros DNS
- **Hook:** `useDomainResolver` detecta se o acesso e via dominio customizado e resolve entidade

#### 4.13 Empreendimentos
- **Tabela:** `empreendimentos` com localizacao, caracteristicas, precos, design system customizado
- **Paginas publicas:** `/empreendimentos` e `/empreendimento/:slug`

#### 4.14 Demo
- **Rotas publicas:** `/demo`, `/demo/construtora`, `/demo/imobiliaria`
- **Dados ficticios:** `src/data/demo-data.ts` + `DemoContext`

---

### 5. Tabelas Principais do Banco de Dados

| Tabela | Funcao | RLS |
|---|---|---|
| `user_roles` | Mapeia user_id para role | Sim |
| `construtoras` | Perfil da construtora (branding, contato) | Sim -- owner only |
| `imobiliarias` | Perfil da imobiliaria | Sim -- owner + construtoras |
| `imoveis` | Catalogo de imoveis | Sim -- construtora owner + imob com acesso + publico (ativos) |
| `imobiliaria_imovel_access` | Links de acesso (white-label e direto) | Sim -- construtora owner + imob own + publico (ativos) |
| `leads` | Contatos gerados | Sim -- construtora via imovel + imob own |
| `notas_lead` | Notas do CRM | Sim -- via lead ownership |
| `atividades_lead` | Historico de atividades do lead | Sim -- via lead ownership |
| `agendamentos_visitas` | Visitas agendadas | Sim -- construtora + imob + publico insert |
| `feedbacks_visitas` | Feedback pos-visita | Sim -- construtora + imob |
| `feedbacks_visitas_publico` | View publica para token de feedback | View -- sem RLS |
| `conversas_chatbot` | Historico do chatbot | Sim -- construtora + imob + publico insert |
| `disponibilidade_corretor` | Horarios disponiveis | Sim -- imob own + publico read |
| `bloqueios_agenda` | Bloqueios de agenda | Sim -- imob own + publico read |
| `configuracoes_formularios` | Campos customizados de formularios | Sim -- imob own + publico read (ativos) |
| `integracoes` | Configs de integracao (WhatsApp, GA, etc) | Sim -- owner only |
| `midias_pendentes` | Fotos/videos para aprovacao | Sim -- construtora + imob |
| `custom_domains` | Dominios personalizados | Sim -- owner + publico read |
| `imovel_knowledge_base` | Base de conhecimento por imovel | Sim -- construtora owner |
| `chatbot_knowledge_base` | Base de conhecimento global | Sim -- authenticated |
| `empreendimentos` | Empreendimentos | Sim -- construtora + publico |

---

### 6. Edge Functions (Backend)

| Funcao | JWT | Descricao |
|---|---|---|
| `signup-user` | Sim | Cria usuario + role + perfil + email confirmacao |
| `cleanup-user` | Sim | Remove usuario e dados associados |
| `send-lead-notification` | Nao | Envia email de novo lead para construtora/imobiliaria |
| `send-visit-notification` | Nao | Envia email de agendamento de visita |
| `send-visit-reminder` | Nao | Envia lembrete de visita (24h/1h) |
| `send-feedback-request` | Nao | Envia email com link de feedback para cliente |
| `send-feedback-followup` | Nao | Followup de feedback |
| `generate-feedback-pdf` | Nao | Gera PDF do relatorio de feedback |
| `generate-property-copy` | Nao | Gera copy de imovel com IA |
| `chatbot-message` | Sim | Processa mensagem do chatbot Sofia |
| `elevenlabs-tts` | Sim | Converte texto em audio (ElevenLabs) |
| `send-whatsapp-message` | Nao (mas valida JWT internamente) | Envia mensagem WhatsApp |
| `whatsapp-webhook` | Nao | Recebe mensagens WhatsApp |
| `send-demo-request` | Nao | Envia solicitacao de demo |
| `verify-domain` | Nao | Verifica DNS de dominio customizado |
| `extract-pdf-images` | Sim | Extrai imagens de PDFs |
| `process-knowledge-pdf` | Sim | Processa PDF para base de conhecimento |

---

### 7. Storage Buckets

| Bucket | Publico | Uso |
|---|---|---|
| `logos` | Sim | Logos de construtoras e imobiliarias |
| `imoveis` | Sim | Fotos e videos dos imoveis |
| `relatorios` | Sim | PDFs de feedback gerados |
| `documentos-privados` | Nao | Documentos internos |
| `midias-pendentes` | Sim | Midias enviadas por imobiliarias para aprovacao |

---

### 8. Funcoes do Banco (Database Functions)

| Funcao | Tipo | Descricao |
|---|---|---|
| `get_construtora_id(user_id)` | SECURITY DEFINER | Retorna ID da construtora pelo user_id |
| `get_imobiliaria_id(user_id)` | SECURITY DEFINER | Retorna ID da imobiliaria pelo user_id |
| `has_role(user_id, role)` | SECURITY DEFINER | Verifica se usuario tem determinada role |
| `user_owns_imovel(imovel_id)` | SECURITY DEFINER | Verifica se o usuario e dono do imovel |
| `imobiliaria_has_access(imovel_id)` | SECURITY DEFINER | Verifica se imobiliaria tem acesso ao imovel |
| `submit_client_feedback(...)` | SECURITY DEFINER | Submete feedback do cliente (validado por token) |
| `get_feedback_by_token(token)` | SECURITY DEFINER | Busca feedback por token publico |
| `validate_feedback_token(id, token)` | SECURITY DEFINER | Valida token de feedback |
| `check_and_increment_rate_limit(...)` | SECURITY DEFINER | Rate limiting para edge functions |
| `cleanup_old_rate_limits()` | SECURITY DEFINER | Limpeza de rate limits antigos |

---

### 9. Rotas da Aplicacao

**Publicas (sem autenticacao):**
- `/` -- Login
- `/auth/login`, `/auth/register/construtora`, `/auth/register/imobiliaria`
- `/auth/forgot-password`, `/auth/reset-password`
- `/apresentacao` -- Pagina comercial com FAQ
- `/demo`, `/demo/construtora/*`, `/demo/imobiliaria/*`
- `/imovel/:slug` -- Pagina publica do imovel (white-label ou direto)
- `/feedback-visita/:token` -- Formulario de feedback do cliente
- `/templates` -- Showcase de templates
- `/empreendimentos`, `/empreendimento/:slug`

**Construtora (role: construtora):**
- `/dashboard/construtora` -- Dashboard principal + lista de imoveis
- `/dashboard/construtora/novo-imovel` -- Wizard de cadastro
- `/dashboard/construtora/imovel/:id` -- Editar imovel
- `/dashboard/construtora/imovel/:id/acessos` -- Gerenciar links/acessos
- `/dashboard/construtora/leads` -- Listagem de leads
- `/dashboard/construtora/pipeline` -- CRM Kanban
- `/dashboard/construtora/analytics` -- Metricas e graficos
- `/dashboard/construtora/agendamentos` -- Visitas agendadas
- `/dashboard/construtora/feedbacks` -- Feedbacks de visitas
- `/dashboard/construtora/configuracoes` -- Branding, dominio, conta
- `/dashboard/construtora/integracoes` -- WhatsApp, GA, Pixel
- `/dashboard/construtora/aprovar-midias` -- Aprovar fotos de imobiliarias
- `/dashboard/construtora/imobiliarias` -- Ver imobiliarias parceiras

**Imobiliaria (role: imobiliaria):**
- `/dashboard/imobiliaria` -- Dashboard principal
- `/dashboard/imobiliaria/leads` -- Seus leads
- `/dashboard/imobiliaria/pipeline` -- CRM Kanban
- `/dashboard/imobiliaria/analytics` -- Metricas
- `/dashboard/imobiliaria/agendamentos` -- Visitas
- `/dashboard/imobiliaria/feedbacks` -- Feedbacks
- `/dashboard/imobiliaria/visitas/:agendamentoId/feedback` -- Preencher feedback corretor
- `/dashboard/imobiliaria/configuracoes` -- Branding, conta
- `/dashboard/imobiliaria/configuracoes/formularios` -- Formularios customizados
- `/dashboard/imobiliaria/integracoes` -- Integracoes
- `/dashboard/imobiliaria/minhas-midias` -- Enviar midias
- `/dashboard/imobiliaria/meus-links` -- Links de imoveis
- `/dashboard/imobiliaria/configurar-agenda` -- Disponibilidade

**Admin:**
- `/admin/seed-data` -- Dados de teste
- `/admin/diagnostico` -- Diagnostico do sistema
- `/admin/base-conhecimento` -- Base de conhecimento global
- `/admin/usuarios` -- Gerenciar usuarios

---

### 10. Regras de Negocio Criticas

1. **Isolamento multi-tenant:** Toda query e protegida por RLS. Construtora so ve seus imoveis/leads. Imobiliaria so ve o que tem acesso.
2. **Link direto vs white-label:** Se `imobiliaria_id = NULL` no access, usa branding da construtora. Caso contrario, usa branding da imobiliaria.
3. **Pageview deduplicado:** Mesmo visitante so conta 1 view por 24h (localStorage).
4. **Feedback com integridade juridica:** Assinatura digital + timestamp + device + IP. Funcao DB `submit_client_feedback` valida token e status antes de aceitar.
5. **Rate limiting:** Funcoes publicas usam `check_and_increment_rate_limit` para prevenir abuso.
6. **Rollback no signup:** Se qualquer etapa falhar (role, perfil), o usuario auth e deletado.
7. **Email de confirmacao obrigatorio:** Auto-confirm desabilitado. Email enviado via Resend.
8. **Leads com imobiliaria_id nullable:** Links diretos geram leads com `imobiliaria_id = null`, vistos pela construtora normalmente.

