

## Plano: Documentação Técnica Completa para Migração

Vou gerar um conjunto de documentos detalhados em PDF/Markdown cobrindo **toda a plataforma**, para que a equipe de implantação consiga replicar o sistema em outra infraestrutura sem depender do Lovable ou do Supabase atual.

### Documentos que serão gerados

**1. Visão Geral da Arquitetura** (~5 páginas)
- Descrição do modelo SaaS multi-tenant (Construtora > Imobiliária > Corretor)
- Stack tecnológico: React 18, Vite, TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth + Edge Functions + Storage)
- Diagrama de componentes e fluxo de dados
- Sistema de roles e permissões (construtora, imobiliaria, admin)

**2. Esquema Completo do Banco de Dados** (~15 páginas)
- Todas as 22+ tabelas com colunas, tipos, defaults e constraints
- Todas as políticas RLS (Row-Level Security) por tabela
- Todas as funções do banco (16 functions) com código SQL completo
- Triggers, views materializadas, enums customizados
- Todas as 70 migrações SQL (referência para recriar o banco do zero)
- Storage buckets e configurações de acesso

**3. Mapa de Funcionalidades** (~10 páginas)
- 17 funcionalidades organizadas por categoria (Vendas, Marketing, IA, Dados)
- Para cada funcionalidade: descrição, tabelas envolvidas, componentes frontend, edge functions relacionadas
- Fluxos de usuário detalhados (registro, login, cadastro de imóvel, agendamento, feedback, pipeline CRM, etc.)

**4. API Backend - Edge Functions** (~12 páginas)
- Documentação de cada uma das 19 Edge Functions:
  - `signup-user` - Registro de usuários
  - `chatbot-message` - IA Sofia (chatbot)
  - `send-whatsapp-message` - Envio Z-API
  - `whatsapp-webhook` - Recebimento de status
  - `send-visit-notification` - Notificação de visita
  - `send-feedback-request/confirmation/followup` - Fluxo de feedback
  - `send-visit-reminder` - Lembrete de visita
  - `send-lead-notification` - Notificação de lead
  - `generate-property-copy` - Geração de texto com IA
  - `generate-feedback-pdf` - Geração de PDF
  - `elevenlabs-tts` - Text-to-speech
  - `extract-pdf-images` / `process-knowledge-pdf` - Processamento de PDFs
  - `verify-domain` - Verificação de domínio customizado
  - `cleanup-user` - Limpeza de usuário
  - `send-demo-request` - Solicitação de demo
- Para cada: endpoint, parâmetros, lógica interna, dependências externas, secrets necessários

**5. Integrações Externas** (~4 páginas)
- Z-API (WhatsApp): credenciais, endpoints, webhook
- Resend (Email): templates, envios
- ElevenLabs (TTS): geração de áudio
- Lovable AI Gateway (IA): modelos utilizados
- Google Analytics, Meta Pixel, GTM (tracking)

**6. Mapa de Rotas e Permissões** (~5 páginas)
- Todas as rotas da aplicação (40+ rotas)
- Qual role tem acesso a cada rota
- Páginas públicas vs protegidas

**7. Segurança e Compliance** (~4 páginas)
- Proteção de PII via RPCs SECURITY DEFINER
- Rate limiting
- Validação de inputs (triggers de banco)
- Signup público desativado
- MFA

**8. Secrets e Variáveis de Ambiente** (~2 páginas)
- Lista completa de secrets necessários
- Onde cada um é utilizado
- Como configurar

### Formato de entrega

Todos os documentos serão gerados como **arquivos Markdown** organizados e um **documento PDF consolidado**, salvos em `/mnt/documents/` para download imediato.

### Escopo técnico

- Leitura de todos os arquivos do projeto (edge functions, componentes, hooks, tipos, migrações)
- Extração do esquema SQL completo das migrações
- Mapeamento de todas as dependências (package.json)
- Documentação do código-fonte das edge functions

