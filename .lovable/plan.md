
# Plano: Chatbot Sofia com Suporte a Voz e Base de Conhecimento

## Objetivo
Transformar o chatbot da Sofia em um assistente multimodal que responde por texto quando o cliente escreve e por voz quando o cliente fala, com uma base de conhecimento centralizada gerenciada exclusivamente pelo desenvolvedor.

---

## Parte 1: Remover HeyGen

### 1.1 Limpar `index.html`
- Remover o script do HeyGen (linhas 26-64)
- Remover a função `window.openSofiaChat`

### 1.2 Atualizar `SofiaAssistentSection.tsx`
- Modificar o botão "Conversar com Sofia" para abrir o chatbot Lovable AI
- O botão passará a abrir o `ChatbotWidget` ao invés de expandir o HeyGen

---

## Parte 2: Adicionar Voz ao Chatbot

### 2.1 Speech-to-Text (Entrada de Voz)
Utilizando a Web Speech API nativa do navegador (grátis, sem API key):
- Adicionar botão de microfone no `ChatbotWidget`
- Quando o usuário clicar, ativar reconhecimento de voz
- Transcrever a fala para texto e enviar como mensagem normal
- Marcar a mensagem como `inputType: "voice"` para saber que deve responder por voz

### 2.2 Text-to-Speech (Saída de Voz)
Utilizando ElevenLabs para voz de alta qualidade:
- Criar edge function `elevenlabs-tts` para converter texto em áudio
- Quando a mensagem do usuário for de voz, a resposta da IA será lida em áudio
- Adicionar player de áudio inline nas mensagens do assistente

### 2.3 Fluxo de Interação
```
Usuário digita → Resposta em texto apenas
Usuário fala → Resposta em texto + áudio automático
```

---

## Parte 3: Base de Conhecimento

### 3.1 Estrutura da Base de Conhecimento
A base de conhecimento será alimentada de **3 formas**:

#### Nível 1: Dados Dinâmicos (Automático)
- Dados do imóvel (já implementado)
- Dados da empresa (já implementado)
- Histórico da conversa (já implementado)

#### Nível 2: Conhecimento Global (Nova tabela)
- Criar tabela `chatbot_knowledge_base` para armazenar:
  - FAQs genéricas
  - Informações de financiamento
  - Processos de compra
  - Materiais e acabamentos padrão
  - Políticas gerais

#### Nível 3: Conhecimento por Imóvel (Opcional)
- Campo `contexto_adicional_ia` na tabela `imoveis` para informações específicas

### 3.2 Nova Tabela: `chatbot_knowledge_base`
```sql
CREATE TABLE chatbot_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria VARCHAR(100) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  tags TEXT[],
  ativo BOOLEAN DEFAULT true,
  prioridade INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS**: Nenhuma policy pública - acesso apenas via service role key (edge functions)

### 3.3 Página de Administração (Apenas Desenvolvedor)
- Criar rota protegida `/admin/base-conhecimento`
- Proteger com verificação de email específico do desenvolvedor
- Interface CRUD para gerenciar entradas da base de conhecimento
- Categorias: FAQ, Financiamento, Materiais, Processos, Outros

---

## Parte 4: Atualizar Edge Function

### 4.1 Modificar `chatbot-message/index.ts`
- Buscar dados da `chatbot_knowledge_base` ativa
- Adicionar ao system prompt
- Detectar `inputType: "voice"` para saber quando gerar áudio
- Retornar flag `should_speak: true` quando apropriado

### 4.2 Nova Edge Function `elevenlabs-tts`
- Receber texto e converter em áudio usando ElevenLabs API
- Voz: Sofia (ou voz feminina brasileira profissional)
- Retornar áudio base64 para playback no cliente

---

## Parte 5: Atualizar UI do ChatbotWidget

### 5.1 Novos Componentes
- Botão de microfone com estado de gravação
- Player de áudio inline para respostas
- Indicador visual de "ouvindo" e "falando"

### 5.2 Estado de Interação
- `isListening`: Microfone ativo
- `isSpeaking`: Áudio sendo reproduzido
- `inputType`: "text" | "voice"

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `index.html` | Remover HeyGen |
| `src/components/property/SofiaAssistentSection.tsx` | Conectar ao ChatbotWidget |
| `src/components/chatbot/ChatbotWidget.tsx` | Adicionar voz |
| `src/components/chatbot/VoiceRecorder.tsx` | Novo - Controle de microfone |
| `src/components/chatbot/AudioPlayer.tsx` | Novo - Player de resposta |
| `supabase/functions/chatbot-message/index.ts` | Buscar base de conhecimento |
| `supabase/functions/elevenlabs-tts/index.ts` | Novo - TTS |
| `src/pages/admin/BaseConhecimento.tsx` | Novo - CRUD admin |
| `supabase/migrations/...` | Nova tabela |

---

## Requisitos

### Secrets Necessários
- `ELEVENLABS_API_KEY` - Para Text-to-Speech de alta qualidade

### Sem Custo Adicional
- Speech-to-Text usa Web Speech API do navegador (grátis)
- Lovable AI Gateway já está configurado

---

## Segurança

### Base de Conhecimento
- Tabela sem RLS público
- Acesso apenas via service role nas edge functions
- Página admin protegida por verificação de email do desenvolvedor

### Dados do Cliente
- Continua usando o fluxo existente de captura de leads
- Nenhum dado de voz é armazenado (processado em memória)

---

## Resumo Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE NA PÁGINA                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [Chat Widget] ────────────────────────────────────────    │
│   │                                                     │   │
│   │  ┌─────────────────────────────────────────────┐   │   │
│   │  │ Sofia: Como posso ajudar? 🎧                │   │   │
│   │  └─────────────────────────────────────────────┘   │   │
│   │                                                     │   │
│   │  ┌─────────────────────────────────────────────┐   │   │
│   │  │ Você: [texto ou transcrição de voz]        │   │   │
│   │  └─────────────────────────────────────────────┘   │   │
│   │                                                     │   │
│   │  ┌───────────────────┬─────────┐                   │   │
│   │  │ Digite...        │ 🎤 │ ➤ │                   │   │
│   │  └───────────────────┴─────────┘                   │   │
│   └─────────────────────────────────────────────────────    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    EDGE FUNCTION                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Busca dados do imóvel (dinâmico)                       │
│  2. Busca base de conhecimento global                      │
│  3. Monta system prompt completo                           │
│  4. Chama Lovable AI Gateway                               │
│  5. Se inputType="voice" → Chama ElevenLabs TTS            │
│  6. Retorna { resposta, audioBase64? }                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 ADMIN (SÓ DESENVOLVEDOR)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  /admin/base-conhecimento                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ + Nova Entrada                                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ [FAQ] O que é ITBI?               ✏️ 🗑️            │   │
│  │ [Financiamento] Como funciona...  ✏️ 🗑️            │   │
│  │ [Materiais] Porcelanato usado...  ✏️ 🗑️            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
