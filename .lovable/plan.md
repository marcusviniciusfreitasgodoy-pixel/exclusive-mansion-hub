
# Plano: Base de Conhecimento por Imovel para Agente de IA

## Status: ✅ IMPLEMENTADO

## Resumo
Sistema de base de conhecimento específica para cada imóvel implementado, permitindo upload de documentos PDF e textos que alimentam o chatbot Sofia com informações detalhadas sobre aquele imóvel específico.

## O que foi implementado

### 1. ✅ Migração de Banco de Dados

**Nova tabela: `imovel_knowledge_base`** criada com:
- id, imovel_id, categoria, titulo, conteudo
- fonte_tipo (manual, pdf_extraido), fonte_arquivo_url, fonte_arquivo_nome
- tags, ativo, prioridade, created_at, updated_at
- Índices otimizados e RLS configurado

### 2. ✅ Nova Edge Function: `process-knowledge-pdf`

Processa PDFs enviados via Gemini Vision e extrai informações estruturadas automaticamente.

### 3. ✅ Novo Componente: `Step4KnowledgeBase.tsx`

Interface para gerenciar a base de conhecimento com:
- Upload de PDFs com extração automática via IA
- Adição manual de entradas
- Edição/exclusão de entradas
- Toggle ativo/inativo

### 4. ✅ Integração no Wizard (NovoImovel.tsx)

Step 4 (Mídias) agora tem duas abas:
- **Mídias**: Upload de imagens, vídeos, tour 360°
- **Base de Conhecimento IA**: Gerenciamento da KB

### 5. ✅ Edge Function `chatbot-message` Atualizada

Agora busca a `imovel_knowledge_base` além da base global.

## Arquivos Criados/Modificados

**Novos:**
- `src/types/knowledge-base.ts`
- `src/components/wizard/Step4KnowledgeBase.tsx`
- `supabase/functions/process-knowledge-pdf/index.ts`

**Modificados:**
- `src/components/wizard/Step4Media.tsx`
- `src/pages/dashboard/construtora/NovoImovel.tsx`
- `supabase/functions/chatbot-message/index.ts`
