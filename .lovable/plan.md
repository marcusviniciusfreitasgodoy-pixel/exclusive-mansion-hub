
# Plano: Agente de IA para Criação de Descrições de Imóveis

## Visão Geral

Implementar um assistente de IA integrado na seção de Descrição (Step 3) que ajuda o usuário a criar textos persuasivos para imóveis de alto padrão, utilizando o Lovable AI Gateway.

## Análise do Prompt Fornecido

Seu prompt está excelente! Algumas sugestões de refinamento:

| Aspecto | Status | Sugestão |
|---------|--------|----------|
| Foco no mercado | OK | Manter foco no Rio de Janeiro alto padrão |
| Objetivo claro | OK | Gerar interesse para visitas |
| Anti-clichês | Excelente | Evitar "espetacular", "maravilhoso" |
| Estrutura | OK | Adicionar formato JSON para facilitar parsing |
| Contexto dinâmico | Melhorar | Injetar automaticamente dados do imóvel no prompt |

### Prompt Refinado Proposto

O prompt será enriquecido automaticamente com:
- Dados do imóvel já preenchidos (título, bairro, área, suítes, valor)
- Diferenciais adicionados pelo usuário
- Tipo de texto desejado (descrição completa, headline, copy curta)

## Arquitetura da Solução

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Step3Description.tsx                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Card "Assistente de Copywriting"                       │   │
│  │  ┌─────────────────────────────────────────────────────┐│   │
│  │  │  🤖 Ícone + Título                                  ││   │
│  │  ├─────────────────────────────────────────────────────┤│   │
│  │  │  [Tipo de Texto] Dropdown                          ││   │
│  │  │  • Descrição Completa                              ││   │
│  │  │  • Headline Impactante                             ││   │
│  │  │  • Copy para Anúncio                               ││   │
│  │  ├─────────────────────────────────────────────────────┤│   │
│  │  │  [Palavras-chave Adicionais] Input opcional        ││   │
│  │  ├─────────────────────────────────────────────────────┤│   │
│  │  │  [✨ Gerar com IA] Botão Principal                  ││   │
│  │  ├─────────────────────────────────────────────────────┤│   │
│  │  │  📝 Resultado Gerado                               ││   │
│  │  │  [Usar Este Texto] [Gerar Outro]                   ││   │
│  │  └─────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Descrição Geral * (Textarea - preenchido pela IA)             │
│  Diferenciais Exclusivos * (Tags)                              │
│  Memorial Descritivo                                           │
│  ...                                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `supabase/functions/generate-property-copy/index.ts` | Criar | Edge function para chamada ao Lovable AI |
| `src/components/wizard/Step3Description.tsx` | Modificar | Adicionar UI do assistente de IA |
| `src/components/wizard/CopywriterAssistant.tsx` | Criar | Componente isolado do assistente |

## Implementação Detalhada

### 1. Edge Function: generate-property-copy

```typescript
// Estrutura do request
{
  tipo: "descricao" | "headline" | "copy_anuncio",
  dados_imovel: {
    titulo: string,
    bairro: string,
    cidade: string,
    area_total: number,
    suites: number,
    vagas: number,
    valor: number,
    diferenciais: string[],
    palavras_chave_adicionais?: string
  }
}

// Estrutura da resposta
{
  success: true,
  texto_gerado: string,
  tipo: string
}
```

### 2. System Prompt para o Agente

O prompt será construído dinamicamente com base no seu texto original, adicionando:

```text
CONTEXTO DO IMÓVEL:
- Título: {titulo}
- Localização: {bairro}, {cidade}
- Área: {area_total}m²
- Configuração: {suites} suítes, {vagas} vagas
- Valor: R$ {valor}
- Diferenciais: {diferenciais}
- Palavras-chave extras: {palavras_chave}

TIPO DE TEXTO SOLICITADO: {tipo}

{Seu prompt de copywriting aqui}

FORMATO DE RESPOSTA:
Retorne APENAS o texto solicitado, sem marcações ou explicações adicionais.
```

### 3. Tipos de Texto Disponíveis

| Tipo | Descrição | Uso |
|------|-----------|-----|
| `descricao` | Texto completo (3-4 parágrafos) | Campo "Descrição Geral" |
| `headline` | Frase impactante (max 100 caracteres) | Hero section do site |
| `copy_anuncio` | Texto curto para anúncios (2-3 frases) | Redes sociais, portais |

### 4. Componente CopywriterAssistant

Props necessárias:
- `dadosImovel`: Dados dos Steps 1 e 2
- `diferenciais`: Array de diferenciais do Step 3
- `onTextGenerated`: Callback para inserir texto no formulário

Estados:
- `tipoTexto`: Tipo selecionado
- `palavrasChaveExtra`: Input adicional
- `isLoading`: Estado de loading
- `textoGerado`: Resultado da IA
- `error`: Mensagem de erro

### 5. Modificações no Step3Description

O componente precisa receber dados dos steps anteriores para alimentar o agente:

```typescript
interface Step3Props {
  defaultValues?: Partial<Step3Data>;
  propertyData?: {
    titulo?: string;
    bairro?: string;
    cidade?: string;
    areaTotal?: number;
    suites?: number;
    vagas?: number;
    valor?: number;
  };
  onComplete: (data: Step3Data) => void;
}
```

### 6. Fluxo de Uso

```text
1. Usuário chega no Step 3 (Descrição)
2. Visualiza o card "Assistente de Copywriting"
3. Adiciona alguns diferenciais (requisito mínimo: 1)
4. Seleciona tipo de texto: "Descrição Completa"
5. Opcionalmente adiciona palavras-chave extras
6. Clica em "✨ Gerar com IA"
7. Aguarda loading (~3-5 segundos)
8. Visualiza texto gerado em área de preview
9. Opções:
   - "Usar Este Texto" → Insere no campo Descrição
   - "Gerar Outro" → Nova geração
   - "Editar" → Copia para o campo e permite edição
```

## Wireframe Visual

```text
┌──────────────────────────────────────────────────────────────┐
│  🤖 Assistente de Copywriting                          [?]  │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  Deixe a IA criar descrições persuasivas baseadas nos       │
│  dados e diferenciais do seu imóvel.                        │
│                                                              │
│  Tipo de Texto                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Descrição Completa                            ▼   │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Palavras-chave adicionais (opcional)                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Ex: sustentabilidade, família, home office         │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Diferenciais detectados: 6 ✓                               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │              ✨ Gerar com IA                       │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📝 Texto Gerado                                        │ │
│  │                                                         │ │
│  │ "Onde o horizonte se funde com o mar, esta cobertura  │ │
│  │  duplex redefine o conceito de viver bem na Barra da  │ │
│  │  Tijuca..."                                            │ │
│  │                                                         │ │
│  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │ │
│  │ │ ✓ Usar Texto │ │ 🔄 Gerar    │ │ 📋 Copiar   │     │ │
│  │ └──────────────┘ │    Outro     │ └──────────────┘     │ │
│  │                  └──────────────┘                       │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Detalhes Técnicos

### Edge Function - Tratamento de Erros

```typescript
// Tratamento de rate limit e pagamento
if (response.status === 429) {
  return Response({ error: "rate_limit", message: "..." }, 429);
}
if (response.status === 402) {
  return Response({ error: "payment_required", message: "..." }, 402);
}
```

### Modelo de IA Utilizado

Será usado `google/gemini-3-flash-preview` (padrão recomendado):
- Rápido para geração de texto
- Bom custo-benefício
- Suporta instruções complexas de formatação

### Passagem de Dados Entre Steps

Modificação em `NovoImovel.tsx` e `EditarImovel.tsx`:

```typescript
{currentStep === 3 && (
  <Step3Description
    defaultValues={formData}
    propertyData={{
      titulo: formData.titulo,
      bairro: formData.bairro,
      cidade: formData.cidade,
      areaTotal: formData.areaTotal,
      suites: formData.suites,
      vagas: formData.vagas,
      valor: formData.valor,
    }}
    onComplete={(data) => {
      handleStepComplete(data);
      handleNext();
    }}
  />
)}
```

## Resumo de Arquivos

| Arquivo | Tipo | Linhas Estimadas |
|---------|------|------------------|
| `supabase/functions/generate-property-copy/index.ts` | Novo | ~120 linhas |
| `src/components/wizard/CopywriterAssistant.tsx` | Novo | ~250 linhas |
| `src/components/wizard/Step3Description.tsx` | Edição | +30 linhas |
| `src/pages/dashboard/construtora/NovoImovel.tsx` | Edição | +10 linhas |
| `src/pages/dashboard/construtora/EditarImovel.tsx` | Edição | +10 linhas |
| `supabase/config.toml` | Edição | +3 linhas |

## Resultado Esperado

1. Usuário acessa Step 3 do cadastro/edição de imóvel
2. Visualiza assistente de IA acima do campo de descrição
3. Pode gerar descrições, headlines ou copys de anúncio
4. IA usa dados do imóvel + diferenciais automaticamente
5. Textos gerados seguem as diretrizes de marketing de alto padrão
6. Usuário pode usar, regenerar ou editar os textos
