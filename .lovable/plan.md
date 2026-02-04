

# Plano Revisado: Melhorias Prioritárias da Plataforma

## Itens Mantidos no Escopo

| # | Funcionalidade | Prioridade |
|---|----------------|------------|
| 1 | WhatsApp Business API | Alta |
| 2 | Integração Calendly/Google Calendar | Alta |
| 4 | Onboarding Guiado para Construtoras | Alta |
| 5 | Mobile-First (PWA + Botão Ligar) | Alta |
| 6 | Notificações Inteligentes (Push + Alertas) | Alta |
| 8 | Automação de Marketing (Drip Campaigns) | Média |

---

## Fase 1: Quick Wins (Semana 1)
**Impacto imediato, esforço baixo**

### 1.1 Botão "Ligar Agora" no LeadCard

**Status Atual**: Parcial - existe ação `onQuickAction` com `call`, mas apenas abre `tel:` via handler externo

**Implementação**:
- Modificar `LeadCard.tsx` para usar `<a href="tel:...">` nativo
- Adicionar tooltip explicativo
- Garantir que funcione em mobile

**Arquivos afetados**:
- `src/components/crm/LeadCard.tsx`

**Esforço**: 2 horas

---

### 1.2 PWA Completo

**Status Atual**: Não existe - sem `manifest.json`, sem service worker, sem ícones PWA

**Implementação**:
1. Instalar `vite-plugin-pwa`
2. Criar `manifest.json` com ícones e configurações
3. Configurar service worker para cache offline
4. Adicionar meta tags no `index.html`

**Arquivos a criar**:
- `public/manifest.json`
- `public/icons/` (ícones 192x192, 512x512)

**Arquivos a modificar**:
- `vite.config.ts` - adicionar plugin PWA
- `index.html` - adicionar link para manifest

**Configuração do manifest.json**:
```json
{
  "name": "Godoy Prime Realty",
  "short_name": "GPrime",
  "description": "Plataforma imobiliária de alto padrão",
  "theme_color": "#1e3a5f",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Esforço**: 8 horas

---

## Fase 2: WhatsApp Business API (Semana 2-3)
**Maior impacto para mercado RJ - 90%+ da comunicação é via WhatsApp**

### 2.1 Status Atual

| Aspecto | Status |
|---------|--------|
| Configuração no Hub | ✅ Existe - campos para Phone Number ID, Access Token, Business Account ID |
| Envio automático ao lead entrar | ❌ Não existe |
| Notificações de agendamento via WhatsApp | ❌ Não existe |
| Status "Visualizado" | ❌ Não existe |

### 2.2 Implementação

**Edge Function: `send-whatsapp-message`**

Criar edge function que:
1. Recebe dados do lead/agendamento
2. Busca credenciais da integração WhatsApp na tabela `integracoes`
3. Monta template de mensagem
4. Envia via WhatsApp Cloud API
5. Registra status na tabela

**Arquivos a criar**:
```
supabase/functions/send-whatsapp-message/
├── index.ts
└── deno.json
```

**Estrutura da função**:
```typescript
// Buscar integração ativa
const { data: integracao } = await supabase
  .from('integracoes')
  .select('credenciais')
  .eq('tipo_integracao', 'whatsapp_business')
  .eq('ativa', true)
  .or(`construtora_id.eq.${construtoraId},imobiliaria_id.eq.${imobiliariaId}`)
  .single();

// Enviar via WhatsApp Cloud API
const response = await fetch(
  `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: clientPhone,
      type: 'template',
      template: { name: 'novo_lead', language: { code: 'pt_BR' } }
    })
  }
);
```

**Modificar Edge Functions existentes**:
- `send-lead-notification/index.ts` - adicionar chamada ao WhatsApp após e-mail
- `send-visit-notification/index.ts` - adicionar notificação WhatsApp

**Tabela para tracking (nova migration)**:
```sql
CREATE TABLE whatsapp_message_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,
  phone_to TEXT NOT NULL,
  template_name TEXT,
  status TEXT DEFAULT 'sent', -- sent, delivered, read, failed
  construtora_id UUID REFERENCES construtoras(id),
  imobiliaria_id UUID REFERENCES imobiliarias(id),
  lead_id UUID REFERENCES leads(id),
  agendamento_id UUID REFERENCES agendamentos_visitas(id),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

-- RLS policies
ALTER TABLE whatsapp_message_status ENABLE ROW LEVEL SECURITY;
```

**Webhook para status updates (nova edge function)**:
```
supabase/functions/whatsapp-webhook/index.ts
```
- Recebe callbacks da Meta quando mensagem é delivered/read
- Atualiza tabela `whatsapp_message_status`

**Esforço**: 24 horas

---

## Fase 3: Calendário Inteligente (Semana 4-5)
**Reduz no-shows de 40% para 15%**

### 3.1 Status Atual

| Aspecto | Status |
|---------|--------|
| Campos Calendly no banco | ✅ Existe - `calendly_event_url` e `calendly_event_id` em `agendamentos_visitas` |
| Modal de agendamento | ⚠️ Limitado - pede 2 datas fixas, sem validação de disponibilidade |
| Configuração de agenda do corretor | ❌ Não existe |
| Slots reais disponíveis | ❌ Não existe |
| Sync com Google Calendar | ❌ Não existe |

### 3.2 Implementação

**Tabela de disponibilidade (nova migration)**:
```sql
CREATE TABLE disponibilidade_corretor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imobiliaria_id UUID NOT NULL REFERENCES imobiliarias(id),
  dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=domingo
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bloqueios_agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imobiliaria_id UUID NOT NULL REFERENCES imobiliarias(id),
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Página de configuração de agenda**:
```
src/pages/dashboard/imobiliaria/ConfigurarAgenda.tsx
```
- UI visual para selecionar dias/horários disponíveis
- Cadastro de bloqueios (feriados, férias)

**Refatorar AgendarVisitaModal**:
1. Buscar disponibilidade da imobiliária
2. Calcular slots disponíveis
3. Mostrar calendário com apenas horários livres
4. Remover sistema de "2 opções", usar confirmação direta

**Integração Google Calendar (opcional - via connector)**:
- Usar Gateway Lovable: `https://gateway.lovable.dev/google_calendar/`
- Sincronização bidirecional de eventos

**Arquivos a modificar**:
- `src/components/property/AgendarVisitaModal.tsx`
- `src/App.tsx` (nova rota)

**Arquivos a criar**:
- `src/pages/dashboard/imobiliaria/ConfigurarAgenda.tsx`
- `src/hooks/useDisponibilidade.ts`

**Esforço**: 24 horas

---

## Fase 4: Onboarding Guiado (Semana 6)
**Melhora retenção de novas construtoras**

### 4.1 Status Atual

| Aspecto | Status |
|---------|--------|
| Wizard de cadastro | ✅ Existe - 5 etapas (Step1-5) com auto-save |
| Vídeos tutoriais | ❌ Não existe |
| Checklist de lançamento | ❌ Não existe |
| Sugestão automática de template | ❌ Não existe |

### 4.2 Implementação

**Componente de Checklist de Lançamento**:
```
src/components/wizard/LaunchChecklist.tsx
```

Itens do checklist:
- [ ] Informações básicas preenchidas
- [ ] Pelo menos 5 fotos do imóvel
- [ ] Descrição com mais de 200 caracteres
- [ ] Vídeo do imóvel (opcional)
- [ ] Book digital (opcional)
- [ ] Pelo menos 1 imobiliária parceira
- [ ] Logo da construtora configurado

**Componente de Progress Tracker**:
```tsx
// No topo do Wizard
<div className="flex gap-2">
  {[1,2,3,4,5].map(step => (
    <div key={step} className={cn(
      "w-full h-2 rounded",
      currentStep >= step ? "bg-primary" : "bg-muted"
    )} />
  ))}
</div>
```

**Sugestão automática de template**:
- Valor > R$ 3M → Template "Luxo"
- Valor > R$ 1M → Template "Moderno"
- Valor < R$ 1M → Template "Clássico"

**Arquivos a modificar**:
- `src/pages/dashboard/construtora/NovoImovel.tsx`
- `src/components/wizard/Step5Review.tsx`

**Arquivos a criar**:
- `src/components/wizard/LaunchChecklist.tsx`
- `src/components/wizard/OnboardingProgress.tsx`

**Esforço**: 16 horas

---

## Fase 5: Notificações Inteligentes (Semana 7-8)
**Aumenta velocidade de resposta e conversão**

### 5.1 Status Atual

| Aspecto | Status |
|---------|--------|
| E-mail de lembrete 24h | ✅ Existe - `send-visit-reminder` |
| Push notification lead quente | ❌ Não existe |
| Alerta lead sem contato 24h | ❌ Não existe |
| Notificação abertura de materiais | ❌ Não existe |

### 5.2 Implementação

**Web Push API - Configuração**:

1. Gerar VAPID keys (variáveis de ambiente)
2. Criar service worker com push handler
3. Criar endpoint para registrar subscriptions

**Tabela de subscriptions (nova migration)**:
```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Edge Function: `send-push-notification`**:
```
supabase/functions/send-push-notification/index.ts
```

**Edge Function com Cron: `check-cold-leads`**:
```sql
-- Habilitar pg_cron
SELECT cron.schedule(
  'check-cold-leads',
  '0 */2 * * *', -- a cada 2 horas
  $$
  SELECT net.http_post(
    url:='https://afntqukanvgcwobwvwuo.supabase.co/functions/v1/check-cold-leads',
    headers:='{"Authorization": "Bearer <anon_key>"}'::jsonb
  );
  $$
);
```

Lógica do check-cold-leads:
```typescript
// Buscar leads sem contato há mais de 24h
const { data: coldLeads } = await supabase
  .from('leads')
  .select('*')
  .not('estagio_pipeline', 'in', '("ganho","perdido")')
  .lt('ultimo_contato', new Date(Date.now() - 24*60*60*1000).toISOString());

// Enviar push notification para responsáveis
```

**Componente de permissão de notificações**:
```
src/components/notifications/PushPermissionBanner.tsx
```

**Arquivos a criar**:
- `supabase/functions/send-push-notification/index.ts`
- `supabase/functions/check-cold-leads/index.ts`
- `src/components/notifications/PushPermissionBanner.tsx`
- `src/hooks/usePushNotifications.ts`
- `public/sw-push.js` (service worker)

**Esforço**: 32 horas

---

## Fase 6: Drip Campaigns - Automação de Marketing (Semana 9-10)
**Aumenta conversão de leads "frios" em 25%**

### 6.1 Status Atual

| Aspecto | Status |
|---------|--------|
| Sequências automáticas | ❌ Não existe |
| E-mail pós-visita | ✅ Parcial - existe solicitação de feedback |

### 6.2 Implementação

**Tabelas (nova migration)**:
```sql
CREATE TABLE campanhas_drip (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  construtora_id UUID REFERENCES construtoras(id),
  imobiliaria_id UUID REFERENCES imobiliarias(id),
  nome TEXT NOT NULL,
  trigger_evento TEXT NOT NULL, -- 'novo_lead', 'pos_visita', 'sem_resposta_7d'
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campanha_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id UUID NOT NULL REFERENCES campanhas_drip(id) ON DELETE CASCADE,
  ordem INT NOT NULL,
  delay_horas INT NOT NULL, -- horas após step anterior
  tipo TEXT NOT NULL, -- 'email', 'whatsapp'
  assunto TEXT,
  conteudo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campanha_execucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id UUID NOT NULL REFERENCES campanhas_drip(id),
  lead_id UUID NOT NULL REFERENCES leads(id),
  step_atual INT DEFAULT 0,
  proximo_envio TIMESTAMPTZ,
  status TEXT DEFAULT 'ativa', -- 'ativa', 'pausada', 'concluida', 'cancelada'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Edge Function com Cron: `process-drip-campaigns`**:
- Executa a cada hora
- Busca execuções onde `proximo_envio <= NOW()`
- Envia mensagem do step atual
- Atualiza para próximo step

**UI de configuração de campanhas**:
```
src/pages/dashboard/construtora/Campanhas.tsx
src/pages/dashboard/imobiliaria/Campanhas.tsx
```

**Templates prontos**:
1. Boas-vindas (D+0, D+2, D+5)
2. Pós-visita sem proposta (D+1, D+7, D+14)
3. Lead frio reengajamento (D+30, D+45, D+60)

**Esforço**: 40 horas

---

## Resumo do Plano

```text
┌─────────────────────────────────────────────────────────────────┐
│                    CRONOGRAMA DE IMPLEMENTAÇÃO                  │
├─────────────────────────────────────────────────────────────────┤
│ FASE │ FUNCIONALIDADE              │ SEMANA  │ ESFORÇO │ STATUS │
├─────────────────────────────────────────────────────────────────┤
│  1   │ Quick Wins (PWA + Ligar)    │ 1       │ 10h     │ ✅     │
│  2   │ WhatsApp Business API       │ 2-3     │ 24h     │ ✅     │
│  3   │ Calendário Inteligente      │ 4-5     │ 24h     │ ✅     │
│  4   │ Onboarding Guiado           │ 6       │ 16h     │ ⬜     │
│  5   │ Notificações Push           │ 7-8     │ 32h     │ ⬜     │
│  6   │ Drip Campaigns              │ 9-10    │ 40h     │ ⬜     │
├─────────────────────────────────────────────────────────────────┤
│      │ TOTAL                       │ 10 sem  │ 146h    │        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Dependências Externas

| Funcionalidade | Dependência | Custo |
|---------------|-------------|-------|
| WhatsApp Business API | Meta Business Account + número verificado | $0.05-0.09/msg |
| Google Calendar | Connector Lovable (Google Calendar) | Gratuito |
| Push Notifications | VAPID keys (auto-geradas) | Gratuito |
| PWA | vite-plugin-pwa | Gratuito |

---

## Próximo Passo Recomendado

Começar pela **Fase 1 (Quick Wins)** pois:
1. Demonstra progresso imediato
2. PWA melhora experiência mobile instantaneamente
3. Prepara infraestrutura para Push Notifications
4. Não requer integrações externas

**Posso iniciar a implementação por qual fase?**

