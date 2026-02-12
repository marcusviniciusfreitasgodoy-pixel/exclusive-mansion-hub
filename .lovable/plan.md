
# Documentacao Completa: Sistema de Configuracao de Formularios Customizaveis

## Visao Geral

Sistema que permite que imobiliarias customizem formularios de agendamento de visita e feedbacks (cliente e corretor) atraves de um editor drag-and-drop, suportando diversos tipos de campos e logica condicional em cascata.

---

## 1. Arquitetura

### Tabela no Banco de Dados

```sql
CREATE TABLE configuracoes_formularios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imobiliaria_id UUID NOT NULL REFERENCES imobiliarias(id),
  tipo_formulario VARCHAR NOT NULL, -- 'agendamento_visita' | 'feedback_cliente' | 'feedback_corretor'
  nome_formulario VARCHAR,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  campos JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);
```

A coluna `campos` armazena um array JSON com a definicao de cada campo do formulario. As respostas dos usuarios sao persistidas em colunas `respostas_customizadas` (JSONB) nas tabelas de agendamentos e feedbacks.

### Estrutura de Arquivos

```text
src/
  types/
    form-config.ts              -- Tipos, interfaces e campos padrao
  lib/
    form-helpers.ts             -- Funcoes utilitarias (CRUD, validacao, CSV export)
  components/
    forms/
      DynamicFormRenderer.tsx    -- Renderiza formulario dinamico para o usuario final
      FieldModal.tsx             -- Modal para adicionar/editar campo (admin)
      FieldPreview.tsx           -- Preview individual de um campo (admin)
      SortableFieldItem.tsx      -- Item arrastavel na lista de campos (admin)
      RespostasCustomizadas.tsx  -- Exibe respostas salvas com labels mapeados
    feedback/
      StarRating.tsx             -- Componente de avaliacao por estrelas (1-5)
      NPSScale.tsx               -- Escala NPS (0-10) com cores
      SignaturePad.tsx           -- Assinatura digital com canvas
  pages/
    dashboard/imobiliaria/
      ConfiguracoesFormularios.tsx -- Listagem dos 3 tipos de formulario
      EditarFormulario.tsx         -- Editor drag-and-drop com preview ao vivo
```

### Rotas

```text
/dashboard/imobiliaria/configuracoes/formularios          -- Listagem
/dashboard/imobiliaria/configuracoes/formularios/:tipo/editar  -- Editor
/dashboard/imobiliaria/configuracoes/formularios/:tipo/preview -- Preview (somente leitura)
```

---

## 2. Types e Interfaces (`src/types/form-config.ts`)

### TipoFormulario
```typescript
type TipoFormulario = 'agendamento_visita' | 'feedback_corretor' | 'feedback_cliente';
```

### TipoCampo (12 tipos suportados)
```typescript
type TipoCampo = 
  | 'text'        // Texto curto
  | 'textarea'    // Texto longo
  | 'select'      // Dropdown de selecao unica
  | 'radio'       // Multipla escolha (botoes radio)
  | 'checkbox'    // Caixas de selecao (multiplas)
  | 'number'      // Numero
  | 'date'        // Data/hora (datetime-local)
  | 'email'       // E-mail
  | 'telefone'    // Telefone
  | 'rating'      // Estrelas 1-5
  | 'escala_nps'  // NPS 0-10
  | 'assinatura'; // Assinatura digital (canvas)
```

### CampoFormulario (interface principal)
```typescript
interface CampoFormulario {
  id: string;              // UUID unico
  tipo: TipoCampo;         // Tipo do campo
  nome: string;            // Nome interno (snake_case, usado como chave no JSONB)
  label: string;           // Texto visivel ao usuario
  placeholder?: string;    // Texto placeholder
  texto_ajuda?: string;    // Texto de ajuda abaixo do campo
  obrigatorio: boolean;    // Se e obrigatorio
  ordem: number;           // Posicao no formulario
  opcoes?: string[];       // Opcoes para select/radio/checkbox
  validacao?: {
    min?: number;          // Min caracteres (text/textarea) ou valor (number)
    max?: number;          // Max caracteres (text/textarea) ou valor (number)
    regex?: string;        // Regex de validacao (reservado)
  };
  condicional?: {
    campo_id: string;      // ID do campo de referencia
    valor: string;         // Valor esperado
    mostrar_se: 'igual' | 'diferente' | 'contem'; // Operador
  };
  bloqueado?: boolean;     // Campos do sistema nao podem ser excluidos
}
```

### ConfiguracaoFormulario
```typescript
interface ConfiguracaoFormulario {
  id: string;
  imobiliaria_id: string;
  tipo_formulario: TipoFormulario;
  nome_formulario: string | null;
  descricao: string | null;
  ativo: boolean;
  campos: CampoFormulario[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
}
```

### Campos Padrao

O arquivo exporta 3 constantes com os campos padrao de cada tipo:
- `CAMPOS_PADRAO_AGENDAMENTO` (5 campos: nome, email, telefone, 2 datas)
- `CAMPOS_PADRAO_FEEDBACK_CLIENTE` (11 campos: NPS, 5 avaliacoes por estrelas, interesse, pontos positivos/negativos, sugestoes, assinatura)
- `CAMPOS_PADRAO_FEEDBACK_CORRETOR` (8 campos: qualificacao lead, poder decisao, prazo, orcamento, forma pagamento, observacoes, proximos passos, assinatura)

Campos com `bloqueado: true` nao podem ser removidos pelo usuario. Isso garante que dados essenciais para relatorios e processos de negocio sempre sejam coletados.

### Labels de Exibicao

```typescript
const TIPO_FORMULARIO_LABELS: Record<TipoFormulario, { nome: string; descricao: string }>;
const TIPO_CAMPO_LABELS: Record<TipoCampo, string>;
```

---

## 3. Componentes

### 3.1 DynamicFormRenderer

Componente principal que renderiza o formulario para o usuario final. Busca automaticamente a configuracao customizada da imobiliaria; se nao existir, usa os campos padrao.

**Props:**
```typescript
interface DynamicFormRendererProps {
  tipoFormulario: TipoFormulario;
  imobiliariaId?: string;       // Busca config customizada se fornecido
  initialData?: Record<string, unknown>;
  onChange?: (data: Record<string, unknown>) => void;
  disabled?: boolean;
  showSignatureFor?: 'cliente' | 'corretor'; // Filtra campo de assinatura
  onSignatureChange?: (signature: string) => void;
}
```

**Funcionalidades:**
- Fetch automatico da configuracao via React Query
- Fallback para campos padrao se nao houver config
- Logica condicional em cascata (campo C depende de B que depende de A)
- Limpeza automatica de dados de campos ocultos
- Hook `useFormValidation` exportado para validacao externa

### 3.2 FieldModal

Modal para adicionar ou editar um campo. Usa react-hook-form + zod para validacao.

**Props:**
```typescript
interface FieldModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: CampoFormulario | null;  // null = novo campo
  existingNames: string[];        // Para validar nomes duplicados
  existingFields?: CampoFormulario[]; // Para logica condicional
  onSave: (field: CampoFormulario) => void;
}
```

**Funcionalidades:**
- Selecao de tipo de campo
- Nome interno (validacao: apenas `[a-z0-9_]`)
- Label, placeholder, texto de ajuda
- Flag de obrigatorio
- Opcoes dinamicas para select/radio/checkbox (minimo 2)
- Validacao min/max para texto e numeros
- Logica condicional: campo de referencia + operador + valor esperado
- Se o campo de referencia tem opcoes, mostra dropdown; senao, input livre
- Alerta ao renomear campos existentes (pode causar perda de dados)
- Campos bloqueados: tipo e nome nao podem ser alterados

**Workaround importante:** O fechamento do modal usa `setTimeout(0)` para evitar crash causado por conflito entre portais do Radix UI Select e a desmontagem do Dialog.

### 3.3 FieldPreview

Renderiza um campo individual para preview no editor (admin). Aceita `disabled` para modo somente leitura ou `disabled={false}` para interacao no preview.

### 3.4 SortableFieldItem

Item arrastavel usando `@dnd-kit/sortable`. Mostra label, tipo, nome interno, badge de bloqueado/obrigatorio, e botoes de editar/excluir.

### 3.5 RespostasCustomizadas

Exibe respostas salvas de campos customizados com labels corretos. Busca a configuracao da imobiliaria para mapear nomes internos para labels legiveis.

### 3.6 StarRating

Componente de avaliacao 1-5 estrelas com hover, 3 tamanhos (sm/md/lg), e suporte a disabled.

### 3.7 NPSScale

Escala 0-10 com cores semanticas: vermelho (0-6 detrator), amarelo (7-8 neutro), verde (9-10 promotor).

### 3.8 SignaturePad

Usa `react-signature-canvas`. Exporta ref com `isEmpty()`, `getSignatureData()` (base64 PNG), e `clear()`.

---

## 4. Funcoes Utilitarias (`src/lib/form-helpers.ts`)

```typescript
// Retorna campos padrao por tipo
getDefaultCampos(tipo: TipoFormulario): CampoFormulario[]

// Cria configs padrao para nova imobiliaria (chama insert no banco)
criarConfiguracoesFormularioPadrao(imobiliariaId, userId): Promise<{success, error?}>

// Coleta respostas do formulario (exclui assinaturas, tratadas separadamente)
coletarRespostasFormulario(campos, formData): Record<string, unknown>

// Formata valor para exibicao (arrays -> join, datas -> dd/MM, rating -> estrelas, NPS -> label)
formatarValor(valor, tipo?): string

// Mapeia respostas com labels para exibicao/PDF
mapearRespostasComLabels(respostas, tipoFormulario, imobiliariaId): Promise<RespostaMapeada[]>

// Busca config do banco com fallback para padrao
buscarConfiguracaoFormulario(imobiliariaId, tipoFormulario): Promise<CampoFormulario[]>

// Valida dados contra config (required, min/max)
validarFormulario(campos, formData): {valid, errors}

// Headers de campos custom para CSV
getCustomFieldsForCSV(imobiliariaId, tipoFormulario): Promise<{nome, label}[]>

// Exporta leads para CSV com campos dinamicos
exportarLeadsCSV(leads, imobiliariaId, tipoFormulario): Promise<{blob, filename}>
```

---

## 5. Paginas

### ConfiguracoesFormularios (listagem)

Mostra cards para os 3 tipos de formulario com:
- Icone por tipo (Calendar, MessageSquare, ClipboardCheck)
- Contagem de perguntas configuradas
- Ultima edicao
- Status (ativo/inativo)
- Botoes Editar e Preview

**Bug fix importante:** A contagem de campos verifica `camposSalvos.length > 0` antes de usar os dados do banco, pois `[]` (array vazio) e truthy em JavaScript.

### EditarFormulario (editor)

Layout em 2 colunas (60/40):
- Esquerda: lista de campos arrastavel (dnd-kit)
- Direita: preview interativo (desktop/mobile toggle)

**Funcionalidades:**
- Drag-and-drop para reordenar campos
- Adicionar/editar/excluir campos via modal
- Preview ao vivo com logica condicional funcional
- Salvar para Supabase (upsert)
- Botao "Voltar" e indicador de alteracoes nao salvas

---

## 6. Dependencias Necessarias

```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2",
  "@hookform/resolvers": "^3.10.0",
  "@radix-ui/react-accordion": "^1.2.11",
  "@radix-ui/react-checkbox": "^1.3.2",
  "@radix-ui/react-dialog": "^1.1.14",
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-radio-group": "^1.3.7",
  "@radix-ui/react-scroll-area": "^1.2.9",
  "@radix-ui/react-select": "^2.2.5",
  "@radix-ui/react-tabs": "^1.1.12",
  "@radix-ui/react-tooltip": "^1.2.7",
  "@supabase/supabase-js": "^2.93.3",
  "@tanstack/react-query": "^5.83.0",
  "date-fns": "^3.6.0",
  "lucide-react": "^0.462.0",
  "react-hook-form": "^7.61.1",
  "react-signature-canvas": "^1.1.0-alpha.2",
  "sonner": "^1.7.4",
  "zod": "^3.25.76"
}
```

---

## 7. Logica Condicional em Cascata

O sistema suporta dependencias aninhadas. Exemplo:

```text
Campo A: "Interesse" (radio: Sim/Nao)
Campo B: "Tipo de interesse" (select) -- aparece se A = "Sim"
Campo C: "Detalhes" (textarea) -- aparece se B = "Investimento"
```

A funcao `isFieldVisible` verifica recursivamente se o campo de referencia tambem esta visivel antes de avaliar a condicao. Quando um campo se torna oculto, seus dados sao automaticamente removidos do `formData`.

---

## 8. Fluxo de Dados

```text
1. Imobiliaria acessa /configuracoes/formularios
2. Seleciona tipo e clica "Editar"
3. Editor carrega config do banco OU campos padrao
4. Imobiliaria arrasta, adiciona, edita campos
5. Clica "Salvar" -> upsert no banco (INSERT ou UPDATE)
6. No formulario publico, DynamicFormRenderer busca config
7. Usuario preenche -> dados em Record<string,unknown>
8. coletarRespostasFormulario() extrai apenas campos nao-assinatura
9. Salvo como JSONB em respostas_customizadas na tabela destino
10. RespostasCustomizadas mapeia nomes -> labels para exibicao
```

---

## 9. ErrorBoundary (workaround Radix)

O ErrorBoundary ignora erros de `DOMException` com `removeChild`/`replaceChild` que ocorrem quando portais do Radix UI Select sao desmontados junto com o Dialog pai. Este e um problema conhecido e o workaround e seguro pois esses erros nao afetam o estado da aplicacao.

```typescript
public static getDerivedStateFromError(error: Error): State {
  if (error instanceof DOMException && 
      (error.message.includes('removeChild') || error.message.includes('replaceChild'))) {
    return { hasError: false, error: null, errorInfo: null };
  }
  return { hasError: true, error, errorInfo: null };
}
```
