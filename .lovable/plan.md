
# Plano: Sistema de Envio de Mídia pela Imobiliária com Aprovação

## Objetivo
Permitir que imobiliárias enviem imagens e vídeos adicionais para os imóveis que têm acesso, criando um fluxo de aprovação onde a construtora revisa e aprova/rejeita o material antes de ele aparecer na página pública.

---

## Arquitetura do Fluxo

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUXO DE APROVAÇÃO                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  IMOBILIÁRIA                    CONSTRUTORA                   PÁGINA        │
│  ──────────                     ───────────                   ──────        │
│                                                                             │
│  1. Acessa imóvel          ──────────────────────────────────────────────   │
│  2. Clica "Enviar Mídia"   ──────────────────────────────────────────────   │
│  3. Faz upload de          ──────────────────────────────────────────────   │
│     imagens/vídeos                                                          │
│                                                                             │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────┐                                                        │
│  │ Salva em        │                                                        │
│  │ midias_pendentes│                                                        │
│  │ status=pendente │                                                        │
│  └────────┬────────┘                                                        │
│           │                                                                 │
│           │ (Notificação visual)                                            │
│           ▼                                                                 │
│                               4. Vê badge "X pendentes"                     │
│                               5. Acessa painel de aprovação                 │
│                               6. Visualiza mídia                            │
│                               7. Aprova ✓ ou Rejeita ✗                      │
│                                                                             │
│                                       │                                     │
│                                       ▼                                     │
│                               ┌───────────────────┐                         │
│                               │ Se APROVADO:      │                         │
│                               │ - Copia para      │                         │
│                               │   imoveis.imagens │                         │
│                               │ - status=aprovado │                         │
│                               └────────┬──────────┘                         │
│                                        │                                    │
│                                        ▼                                    │
│                                                        8. Mídia aparece     │
│                                                           na página         │
│                                                           pública           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Parte 1: Nova Tabela `midias_pendentes`

Criar tabela para armazenar as mídias enviadas pelas imobiliárias aguardando aprovação.

```sql
CREATE TYPE midia_tipo AS ENUM ('imagem', 'video');
CREATE TYPE midia_status AS ENUM ('pendente', 'aprovado', 'rejeitado');

CREATE TABLE midias_pendentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamentos
  imovel_id UUID NOT NULL REFERENCES imoveis(id) ON DELETE CASCADE,
  imobiliaria_id UUID NOT NULL REFERENCES imobiliarias(id) ON DELETE CASCADE,
  access_id UUID NOT NULL REFERENCES imobiliaria_imovel_access(id) ON DELETE CASCADE,
  
  -- Dados da mídia
  tipo midia_tipo NOT NULL,
  url TEXT NOT NULL,                    -- URL do storage
  alt TEXT,                             -- Descrição (para imagens)
  video_tipo TEXT,                      -- youtube/vimeo (para vídeos)
  
  -- Status e workflow
  status midia_status DEFAULT 'pendente',
  enviado_em TIMESTAMPTZ DEFAULT now(),
  revisado_em TIMESTAMPTZ,
  revisado_por UUID,                    -- user_id do aprovador
  motivo_rejeicao TEXT,
  
  -- Metadata
  nome_arquivo_original TEXT,
  tamanho_bytes INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_midias_pendentes_imovel ON midias_pendentes(imovel_id);
CREATE INDEX idx_midias_pendentes_status ON midias_pendentes(status);
CREATE INDEX idx_midias_pendentes_imobiliaria ON midias_pendentes(imobiliaria_id);
```

### Políticas RLS

```sql
-- Imobiliárias podem inserir mídias para imóveis que têm acesso
CREATE POLICY "Imobiliarias podem enviar midias"
ON midias_pendentes FOR INSERT
WITH CHECK (
  imobiliaria_id = get_imobiliaria_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM imobiliaria_imovel_access
    WHERE id = midias_pendentes.access_id
    AND imobiliaria_id = midias_pendentes.imobiliaria_id
    AND imovel_id = midias_pendentes.imovel_id
    AND status = 'active'
  )
);

-- Imobiliárias podem ver suas próprias mídias
CREATE POLICY "Imobiliarias podem ver suas midias"
ON midias_pendentes FOR SELECT
USING (imobiliaria_id = get_imobiliaria_id(auth.uid()));

-- Construtoras podem ver mídias de seus imóveis
CREATE POLICY "Construtoras podem ver midias de seus imoveis"
ON midias_pendentes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM imoveis
    WHERE id = midias_pendentes.imovel_id
    AND construtora_id = get_construtora_id(auth.uid())
  )
);

-- Construtoras podem atualizar status (aprovar/rejeitar)
CREATE POLICY "Construtoras podem aprovar ou rejeitar"
ON midias_pendentes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM imoveis
    WHERE id = midias_pendentes.imovel_id
    AND construtora_id = get_construtora_id(auth.uid())
  )
);
```

---

## Parte 2: Storage Bucket

Criar bucket dedicado para mídias pendentes:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('midias-pendentes', 'midias-pendentes', true, 20971520)  -- 20MB
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Imobiliarias podem fazer upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'midias-pendentes'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Leitura publica de midias pendentes"
ON storage.objects FOR SELECT
USING (bucket_id = 'midias-pendentes');
```

---

## Parte 3: Interface da Imobiliária

### 3.1 Novo Componente: `EnviarMidiaModal.tsx`

Modal para upload de imagens e vídeos com:
- Área de drag & drop para imagens (reutilizando lógica do Step4Media)
- Campo para URL de vídeo (YouTube/Vimeo)
- Preview das mídias selecionadas
- Otimização automática WebP
- Status de upload

### 3.2 Modificar Dashboard da Imobiliária

Adicionar botão "Enviar Material" em cada card de imóvel:
- Abre o modal de upload
- Mostra contador de mídias enviadas/pendentes/aprovadas

### 3.3 Nova Página: `MinhasMidias.tsx`

Listar todas as mídias enviadas pela imobiliária com status:
- 🟡 Pendente (aguardando aprovação)
- 🟢 Aprovado (já aparece na página)
- 🔴 Rejeitado (com motivo)

---

## Parte 4: Interface da Construtora

### 4.1 Badge de Notificação no Menu

Mostrar contador de mídias pendentes no sidebar:
- Ao lado do item "Imóveis" ou novo item "Aprovações"
- Badge vermelho com número

### 4.2 Nova Página: `AprovarMidias.tsx`

Painel de aprovação com:
- Lista de mídias pendentes agrupadas por imóvel
- Preview da imagem/thumbnail do vídeo
- Informações: imobiliária que enviou, data, nome do arquivo
- Botões: ✓ Aprovar | ✗ Rejeitar (com campo para motivo)

### 4.3 Lógica de Aprovação

Quando aprovada:
1. Atualiza status para `aprovado`
2. Adiciona a mídia ao array `imagens` ou `videos` do imóvel
3. (Opcional) Move arquivo de `midias-pendentes` para `imoveis`

Quando rejeitada:
1. Atualiza status para `rejeitado`
2. Salva motivo da rejeição
3. Mídia permanece no bucket (pode ser removida após X dias)

---

## Parte 5: Notificações (Opcional - Fase 2)

Enviar e-mail quando:
- Imobiliária envia nova mídia → notifica construtora
- Construtora aprova/rejeita → notifica imobiliária

---

## Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `supabase/migrations/...` | Criar | Nova tabela e políticas |
| `src/components/imobiliaria/EnviarMidiaModal.tsx` | Criar | Modal de upload |
| `src/pages/dashboard/imobiliaria/index.tsx` | Modificar | Adicionar botão "Enviar Material" |
| `src/pages/dashboard/imobiliaria/MinhasMidias.tsx` | Criar | Lista de mídias enviadas |
| `src/pages/dashboard/construtora/AprovarMidias.tsx` | Criar | Painel de aprovação |
| `src/components/dashboard/DashboardSidebar.tsx` | Modificar | Badge de pendentes |
| `src/App.tsx` | Modificar | Novas rotas |
| `src/types/database.ts` | Modificar | Novos tipos |

---

## Segurança

### Validações
- Imobiliária só pode enviar mídia para imóveis que tem acesso ativo
- Construtora só pode aprovar/rejeitar mídias de seus próprios imóveis
- Limite de tamanho: 20MB por arquivo
- Tipos permitidos: JPG, PNG, WebP (imagens) + URLs YouTube/Vimeo (vídeos)

### RLS
- Todas as operações protegidas por RLS
- Nenhum acesso público à tabela `midias_pendentes`
- Storage com políticas específicas por bucket

---

## Experiência do Usuário

### Para a Imobiliária
1. Acessa o dashboard
2. Vê lista de imóveis autorizados
3. Clica em "Enviar Material" no imóvel desejado
4. Faz upload de fotos ou adiciona link de vídeo
5. Recebe confirmação: "Material enviado para aprovação"
6. Pode acompanhar status em "Minhas Mídias"

### Para a Construtora
1. Vê badge "3 pendentes" no menu
2. Acessa "Aprovar Mídias"
3. Visualiza cada mídia com informações da origem
4. Aprova ou rejeita com um clique
5. Mídia aprovada aparece automaticamente na página do imóvel

---

## Resumo Visual da Interface

```text
DASHBOARD IMOBILIÁRIA
┌─────────────────────────────────────────────────────────────────────────────┐
│  Imóveis Disponíveis                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │ [Foto Imóvel]    │  │ [Foto Imóvel]    │  │ [Foto Imóvel]    │          │
│  │ Casa Alto Padrão │  │ Apartamento...   │  │ Penthouse...     │          │
│  │ R$ 2.500.000     │  │ R$ 1.200.000     │  │ R$ 5.000.000     │          │
│  │                  │  │                  │  │                  │          │
│  │ [Copiar] [Abrir] │  │ [Copiar] [Abrir] │  │ [Copiar] [Abrir] │          │
│  │ [📷 Enviar Mídia]│  │ [📷 Enviar Mídia]│  │ [📷 Enviar Mídia]│          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘

MODAL ENVIAR MÍDIA
┌─────────────────────────────────────────────────────────────────────────────┐
│  Enviar Material - Casa Alto Padrão                               [X]      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📷 Imagens                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  [+] Arraste imagens aqui ou clique para selecionar                │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  🎬 Vídeo (YouTube/Vimeo)                                                   │
│  [ https://youtube.com/watch?v=...                        ] [+ Adicionar]  │
│                                                                             │
│  Preview:                                                                   │
│  ┌─────┐ ┌─────┐ ┌─────┐                                                   │
│  │ img │ │ img │ │ vid │                                                   │
│  └─────┘ └─────┘ └─────┘                                                   │
│                                                                             │
│                                        [ Cancelar ]  [ Enviar para Aprovação ]│
└─────────────────────────────────────────────────────────────────────────────┘

DASHBOARD CONSTRUTORA - APROVAR MÍDIAS
┌─────────────────────────────────────────────────────────────────────────────┐
│  Aprovar Mídias                                          🔴 5 pendentes    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Casa Alto Padrão - Barra da Tijuca                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ┌─────────┐  Enviado por: Imobiliária XYZ                           │   │
│  │ │         │  Data: 03/02/2026 às 14:30                              │   │
│  │ │  [IMG]  │  Arquivo: foto-varanda.jpg (2.1 MB)                     │   │
│  │ │         │                                                         │   │
│  │ └─────────┘  [ ✓ Aprovar ]  [ ✗ Rejeitar ]                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ┌─────────┐  Enviado por: Imobiliária ABC                           │   │
│  │ │         │  Data: 03/02/2026 às 15:00                              │   │
│  │ │  [VID]  │  YouTube: Tour Virtual 4K                               │   │
│  │ │         │                                                         │   │
│  │ └─────────┘  [ ✓ Aprovar ]  [ ✗ Rejeitar ]                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
