

# Plano: Corrigir IA para NÃO Inventar Informações

## Problema Identificado

A IA está gerando informações incorretas (ex: descrevendo uma cobertura **duplex** como **linear**) porque:

1. O prompt não recebe informações cruciais como **tipo do imóvel**
2. Não há instruções explícitas proibindo a IA de inventar dados
3. O prompt incentiva "criatividade" sem restringir à fidelidade dos dados

## Solução em 3 Frentes

### 1. Modificar o System Prompt (Edge Function)

Adicionar restrições explícitas e enfáticas:

```text
REGRAS ABSOLUTAS (NUNCA VIOLE):
1. Use APENAS as informações fornecidas no contexto do imóvel
2. NÃO invente características que não foram mencionadas
3. NÃO altere dados factuais (tipo, metragem, localização, número de quartos)
4. Se uma informação não foi fornecida, NÃO a mencione
5. O título do imóvel geralmente indica o tipo (duplex, linear, casa, etc.) - RESPEITE

EXEMPLOS DO QUE VOCÊ NÃO DEVE FAZER:
- Se o título diz "Cobertura Duplex", NÃO descreva como "linear" ou "térreo"
- Se tem 4 suítes, NÃO mencione "5 amplos dormitórios"
- Se não foi informada piscina, NÃO mencione piscina
```

### 2. Enviar Mais Contexto para a IA

Atualizar o `CopywriterAssistant` e a Edge Function para incluir:

| Dado Atual | Novo Dado a Incluir |
|------------|---------------------|
| titulo | **property_type** (tipo do imóvel) |
| bairro | **estilo_arquitetonico** |
| area_total | **area_privativa** |
| suites | **banheiros** |
| valor | **vista** (se disponível) |
| diferenciais | **headline** (se existir) |

### 3. Reestruturar o User Prompt

Deixar claro que os dados são FATOS, não sugestões:

```text
DADOS FACTUAIS DO IMÓVEL (OBRIGATÓRIO RESPEITAR):
- Tipo: Cobertura Duplex  ← NÃO ALTERE
- Área Total: 450m²       ← NÃO ALTERE
- Suítes: 4               ← NÃO ALTERE
...

DIFERENCIAIS REAIS DO IMÓVEL:
- Vista frontal para o mar
- Piscina privativa
- Elevador privativo
...

INSTRUÇÕES:
Crie um texto persuasivo usando EXCLUSIVAMENTE os dados acima.
NÃO invente características adicionais.
```

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/generate-property-copy/index.ts` | Atualizar SYSTEM_PROMPT com restrições; Expandir dados recebidos |
| `src/components/wizard/CopywriterAssistant.tsx` | Enviar mais campos do imóvel |
| `src/pages/dashboard/construtora/NovoImovel.tsx` | Passar mais dados para Step3 |
| `src/pages/dashboard/construtora/EditarImovel.tsx` | Passar mais dados para Step3 |

## Implementação Detalhada

### 1. Novo System Prompt (Edge Function)

```typescript
const SYSTEM_PROMPT = `Aja como um especialista em marketing imobiliário de alto padrão, com foco exclusivo no mercado do Rio de Janeiro.

**REGRAS CRÍTICAS - VIOLAÇÃO É PROIBIDA:**
1. Use SOMENTE as informações fornecidas no contexto do imóvel
2. NUNCA invente ou altere características (tipo, metragem, quartos, localização)
3. Se o título indica "Duplex", a descrição DEVE mencionar "duplex" - JAMAIS "linear"
4. Se o título indica "Cobertura", NÃO descreva como "apartamento térreo"
5. Se uma característica NÃO foi informada, NÃO a mencione no texto
6. Números são EXATOS: se tem 4 suítes, escreva "4 suítes", não "5 amplos quartos"
7. Bairros devem ser mencionados EXATAMENTE como informados

**Objetivo:** Criar descrições persuasivas que despertem interesse para visitas.

**Estilo de Escrita:**
- Evite clichês ("espetacular", "maravilhosa", "incrível", "deslumbrante")
- Use linguagem sofisticada e exclusiva
- Foque nos diferenciais REAIS fornecidos
- Textos envolventes mas FIÉIS aos dados

**Formato de Resposta:**
Retorne APENAS o texto solicitado, sem marcações, aspas ou explicações.`;
```

### 2. Novo User Prompt com Dados Expandidos

```typescript
const userPrompt = `
═══════════════════════════════════════════════════════════
DADOS FACTUAIS DO IMÓVEL - NÃO ALTERE NENHUM DESTES DADOS
═══════════════════════════════════════════════════════════

IDENTIFICAÇÃO:
- Título EXATO: ${dados_imovel.titulo || 'Não informado'}
- Tipo do Imóvel: ${dados_imovel.property_type || 'Extrair do título'}

LOCALIZAÇÃO:
- Bairro: ${dados_imovel.bairro || 'Não informado'}
- Cidade: ${dados_imovel.cidade || 'Rio de Janeiro'}

METRAGENS (números exatos):
- Área Total: ${dados_imovel.area_total ? `${dados_imovel.area_total}m²` : 'Não informada'}
- Área Privativa: ${dados_imovel.area_privativa ? `${dados_imovel.area_privativa}m²` : 'Não informada'}

CONFIGURAÇÃO (números exatos):
- Suítes: ${dados_imovel.suites || 0}
- Banheiros: ${dados_imovel.banheiros || 0}
- Vagas: ${dados_imovel.vagas || 0}

VALOR:
- ${valorFormatado}

DIFERENCIAIS REAIS (use apenas estes):
${diferenciais}

${dados_imovel.palavras_chave_adicionais ? `PALAVRAS-CHAVE EXTRAS:\n${dados_imovel.palavras_chave_adicionais}` : ''}

═══════════════════════════════════════════════════════════
INSTRUÇÕES DE GERAÇÃO
═══════════════════════════════════════════════════════════

${tipoInstrucao}

LEMBRE-SE: Use APENAS os dados acima. NÃO invente informações.
Se o título diz "Duplex", o texto DEVE dizer "duplex".
Se o título diz "Linear", o texto DEVE dizer "linear".
`;
```

### 3. Expandir PropertyData Interface

```typescript
interface PropertyData {
  titulo?: string;
  propertyType?: string;  // NOVO
  bairro?: string;
  cidade?: string;
  areaTotal?: number;
  areaPrivativa?: number; // NOVO
  suites?: number;
  banheiros?: number;     // NOVO
  vagas?: number;
  valor?: number;
  vista?: string[];       // NOVO (opcional)
  estiloArquitetonico?: string; // NOVO (opcional)
}
```

### 4. Atualizar Passagem de Dados

Em `NovoImovel.tsx` e `EditarImovel.tsx`:

```typescript
propertyData={{
  titulo: formData.titulo,
  propertyType: formData.propertyType,
  bairro: formData.bairro,
  cidade: formData.cidade,
  areaTotal: formData.areaTotal,
  areaPrivativa: formData.areaPrivativa,
  suites: formData.suites,
  banheiros: formData.banheiros,
  vagas: formData.vagas,
  valor: formData.valor,
}}
```

## Resultado Esperado

| Antes | Depois |
|-------|--------|
| "Esta cobertura linear oferece..." | "Esta cobertura duplex oferece..." |
| IA inventa "5 amplos quartos" | "4 suítes espaçosas" (exatamente como informado) |
| IA menciona "jardim" não informado | Menciona apenas diferenciais fornecidos |

## Fluxo de Verificação

```text
1. Usuário cadastra "Cobertura Duplex Frente-Mar"
2. Adiciona diferenciais: piscina, vista mar, elevador
3. Clica "Gerar com IA"
4. IA recebe:
   - Título: "Cobertura Duplex Frente-Mar" → DEVE usar "duplex"
   - Diferenciais: piscina, vista mar, elevador → SÓ pode mencionar estes
5. IA gera texto FIEL aos dados
```

