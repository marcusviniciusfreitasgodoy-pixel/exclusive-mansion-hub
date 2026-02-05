
# Plano: Implementar Rate Limiting nas Edge Functions

## Visao Geral
Implementar um sistema de rate limiting usando o banco de dados PostgreSQL como contador persistente, protegendo as Edge Functions contra abuso de requisicoes.

## Abordagem Tecnica

### Por que usar o banco de dados ao inves de Redis?
- Nao requer servico externo adicional
- Aproveitamos a infraestrutura existente do Lovable Cloud
- Simplicidade de implementacao
- Funciona bem para o volume de requisicoes esperado

### Arquitetura

```text
+------------------+     +-------------------+     +------------------+
|   Cliente        | --> |  Edge Function    | --> |  rate_limits     |
|   (Browser)      |     |  (com middleware) |     |  (tabela PG)     |
+------------------+     +-------------------+     +------------------+
                               |
                               v
                         Verifica limite
                         Incrementa contador
                         Limpa entradas antigas
```

## Alteracoes

### 1. Criar Tabela de Rate Limiting

**Nova tabela: `rate_limits`**
```sql
CREATE TABLE public.rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,           -- IP, session_id, ou user_id
  function_name text NOT NULL,        -- Nome da edge function
  request_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(identifier, function_name)
);

-- Indice para consultas rapidas
CREATE INDEX idx_rate_limits_lookup ON public.rate_limits(identifier, function_name, window_start);

-- Funcao para limpar registros antigos (executa periodicamente)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - interval '1 hour';
$$;
```

### 2. Criar Modulo Compartilhado de Rate Limiting

**Novo arquivo: `supabase/functions/_shared/rate-limiter.ts`**

```typescript
import { createClient } from "npm:@supabase/supabase-js@2";

interface RateLimitConfig {
  maxRequests: number;      // Maximo de requisicoes
  windowSeconds: number;    // Janela de tempo em segundos
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  "chatbot-message": { maxRequests: 20, windowSeconds: 60 },    // 20 msgs/min
  "elevenlabs-tts": { maxRequests: 10, windowSeconds: 60 },     // 10 audios/min
  "generate-property-copy": { maxRequests: 5, windowSeconds: 60 }, // 5 copys/min
  "send-lead-notification": { maxRequests: 10, windowSeconds: 60 },
  "send-visit-notification": { maxRequests: 10, windowSeconds: 60 },
  "send-feedback-request": { maxRequests: 10, windowSeconds: 60 },
  "default": { maxRequests: 30, windowSeconds: 60 }
};

export async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  identifier: string,
  functionName: string,
  customConfig?: RateLimitConfig
): Promise<RateLimitResult> {
  const config = customConfig || DEFAULT_CONFIGS[functionName] || DEFAULT_CONFIGS["default"];
  const windowStart = new Date(Date.now() - config.windowSeconds * 1000);

  // Upsert com incremento atomico
  const { data, error } = await supabase.rpc("check_and_increment_rate_limit", {
    p_identifier: identifier,
    p_function_name: functionName,
    p_window_seconds: config.windowSeconds,
    p_max_requests: config.maxRequests
  });

  if (error) {
    console.error("Rate limit check error:", error);
    // Em caso de erro, permite a requisicao (fail-open)
    return { allowed: true, remaining: config.maxRequests, resetAt: new Date() };
  }

  return {
    allowed: data.allowed,
    remaining: data.remaining,
    resetAt: new Date(data.reset_at)
  };
}

export function rateLimitResponse(resetAt: Date): Response {
  const retryAfter = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
  return new Response(
    JSON.stringify({
      error: "rate_limit_exceeded",
      message: "Muitas requisicoes. Por favor, aguarde antes de tentar novamente.",
      retry_after_seconds: retryAfter
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    }
  );
}

export function getClientIdentifier(req: Request): string {
  // Prioridade: header X-Forwarded-For > X-Real-IP > fallback
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  
  // Fallback para identificador generico
  return "unknown-client";
}
```

### 3. Criar Funcao PostgreSQL para Verificacao Atomica

**Nova funcao: `check_and_increment_rate_limit`**

```sql
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_identifier text,
  p_function_name text,
  p_window_seconds integer,
  p_max_requests integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamptz;
  v_current_count integer;
  v_allowed boolean;
  v_remaining integer;
  v_reset_at timestamptz;
BEGIN
  v_window_start := now() - (p_window_seconds || ' seconds')::interval;
  v_reset_at := now() + (p_window_seconds || ' seconds')::interval;
  
  -- Inserir ou atualizar atomicamente
  INSERT INTO public.rate_limits (identifier, function_name, request_count, window_start)
  VALUES (p_identifier, p_function_name, 1, now())
  ON CONFLICT (identifier, function_name) DO UPDATE
  SET 
    request_count = CASE 
      WHEN rate_limits.window_start < v_window_start THEN 1
      ELSE rate_limits.request_count + 1
    END,
    window_start = CASE 
      WHEN rate_limits.window_start < v_window_start THEN now()
      ELSE rate_limits.window_start
    END
  RETURNING request_count, window_start + (p_window_seconds || ' seconds')::interval
  INTO v_current_count, v_reset_at;
  
  v_allowed := v_current_count <= p_max_requests;
  v_remaining := GREATEST(0, p_max_requests - v_current_count);
  
  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'remaining', v_remaining,
    'reset_at', v_reset_at,
    'current_count', v_current_count
  );
END;
$$;
```

### 4. Integrar Rate Limiting nas Edge Functions

**Arquivo: `supabase/functions/chatbot-message/index.ts`**

Adicionar apos as verificacoes iniciais:
```typescript
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from "../_shared/rate-limiter.ts";

// Dentro do handler, apos o parse do JSON:
const clientId = session_id || getClientIdentifier(req);
const rateLimitResult = await checkRateLimit(supabase, clientId, "chatbot-message");

if (!rateLimitResult.allowed) {
  return rateLimitResponse(rateLimitResult.resetAt);
}
```

**Arquivo: `supabase/functions/elevenlabs-tts/index.ts`**

```typescript
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from "../_shared/rate-limiter.ts";

// Adicionar verificacao no inicio do handler
const clientId = getClientIdentifier(req);
const rateLimitResult = await checkRateLimit(supabase, clientId, "elevenlabs-tts");

if (!rateLimitResult.allowed) {
  return rateLimitResponse(rateLimitResult.resetAt);
}
```

**Arquivo: `supabase/functions/generate-property-copy/index.ts`**

```typescript
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from "../_shared/rate-limiter.ts";

// Adicionar verificacao no inicio do handler
const clientId = getClientIdentifier(req);
const rateLimitResult = await checkRateLimit(supabase, clientId, "generate-property-copy");

if (!rateLimitResult.allowed) {
  return rateLimitResponse(rateLimitResult.resetAt);
}
```

### 5. Edge Functions a Serem Atualizadas

| Funcao | Limite | Janela | Identificador |
|--------|--------|--------|---------------|
| chatbot-message | 20 req | 60s | session_id |
| elevenlabs-tts | 10 req | 60s | IP |
| generate-property-copy | 5 req | 60s | IP |
| send-lead-notification | 10 req | 60s | IP |
| send-visit-notification | 10 req | 60s | IP |
| send-feedback-request | 10 req | 60s | IP |

## Resumo de Arquivos

**Novos arquivos:**
- `supabase/functions/_shared/rate-limiter.ts`

**Arquivos modificados:**
- `supabase/functions/chatbot-message/index.ts`
- `supabase/functions/elevenlabs-tts/index.ts`
- `supabase/functions/generate-property-copy/index.ts`
- `supabase/functions/send-lead-notification/index.ts`
- `supabase/functions/send-visit-notification/index.ts`
- `supabase/functions/send-feedback-request/index.ts`

**Migracao SQL:**
- Criar tabela `rate_limits`
- Criar funcao `check_and_increment_rate_limit`
- Criar funcao `cleanup_old_rate_limits`

## Beneficios

1. **Protecao contra abuso**: Limita requisicoes excessivas por IP/sessao
2. **Economia de recursos**: Reduz custos com APIs externas (ElevenLabs, Lovable AI)
3. **Persistencia**: Contadores sobrevivem reinicializacao das funcoes
4. **Atomicidade**: Operacoes UPSERT previnem race conditions
5. **Resposta padronizada**: Header `Retry-After` permite clientes esperarem corretamente
