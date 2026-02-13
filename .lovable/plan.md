

## Plano: Corrigir Vulnerabilidade de Exaustao de Memoria em Edge Functions

### Problema Identificado

Duas funcoes fazem download de PDFs de URLs arbitrarias e carregam o conteudo inteiro na memoria como base64, sem limite de tamanho e sem autenticacao:

1. **`extract-pdf-images`** -- Baixa PDF de qualquer URL, converte para base64 em memoria. Sem autenticacao, sem limite de tamanho, sem rate limiting.
2. **`process-knowledge-pdf`** -- Mesmo padrao: baixa PDF de URL, converte para base64. Sem autenticacao, sem rate limiting.

Um atacante pode enviar uma URL apontando para um arquivo de centenas de MB, causando crash da funcao por exceder o limite de 150MB de memoria do Edge Runtime.

### Funcoes Seguras (sem acao necessaria)

- `chatbot-message` -- Tem rate limiting e limita historico a 10 mensagens
- `elevenlabs-tts` -- Tem autenticacao, rate limiting e texto limitado a 1000 chars
- `generate-property-copy` -- Tem autenticacao, verificacao de role e rate limiting
- `send-whatsapp-message` -- Tem autenticacao e validacao de usuario
- Demais funcoes de notificacao -- Processam apenas dados pequenos do banco

### Correcoes Planejadas

**Etapa 1 -- `extract-pdf-images/index.ts`**

Adicionar as seguintes protecoes:
- Autenticacao obrigatoria (verificar JWT via `supabase.auth.getUser()`)
- Verificacao de role (`construtora`)
- Limite de tamanho do PDF: maximo 10MB (verificar via `Content-Length` do fetch antes de baixar)
- Rate limiting usando o modulo compartilhado existente
- Validacao de URL (aceitar apenas URLs do proprio storage do projeto ou dominios confiavel)
- Atualizar CORS headers para o padrao completo do projeto

**Etapa 2 -- `process-knowledge-pdf/index.ts`**

Adicionar as seguintes protecoes:
- Autenticacao obrigatoria (verificar JWT)
- Verificacao de role (`construtora`)
- Limite de tamanho do PDF: maximo 10MB
- Rate limiting usando o modulo compartilhado
- Validacao de `imovel_id` como UUID valido
- Validacao de URL

**Etapa 3 -- Validacao de tamanho com streaming parcial**

Em ambas as funcoes, antes de carregar o arquivo inteiro, verificar o tamanho:

```text
1. Fazer fetch da URL
2. Verificar header Content-Length
3. Se > 10MB, rejeitar com erro 413 (Payload Too Large)
4. Se Content-Length nao disponivel, ler com limite: abortar se ultrapassar 10MB durante a leitura
5. Converter para base64 apenas apos validacao
```

### Detalhes Tecnicos

**Arquivos modificados:**
- `supabase/functions/extract-pdf-images/index.ts`
- `supabase/functions/process-knowledge-pdf/index.ts`

**Nenhum arquivo novo necessario** -- reutiliza os modulos compartilhados `_shared/rate-limiter.ts` e `_shared/security.ts` ja existentes.

**Nenhuma migracao SQL necessaria.**

### Resumo das Protecoes por Funcao

```text
Funcao                   | Auth | Role  | Rate Limit | Max Size | URL Check
-------------------------|------|-------|------------|----------|----------
extract-pdf-images       | +    | +     | +          | 10MB     | +
process-knowledge-pdf    | +    | +     | +          | 10MB     | +
```

Legenda: (+) sera adicionado nesta correcao

