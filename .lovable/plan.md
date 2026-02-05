
# Plano: Adicionar Seletor de Templates no Cadastro de Imóvel

## Objetivo
Incluir a etapa de seleção de template visual (Luxo, Moderno, Clássico) com preview no wizard de cadastro de novo imóvel, permitindo que o usuário escolha e visualize o estilo antes de publicar.

---

## Mudanças Necessárias

### 1. Atualizar o arquivo `NovoImovel.tsx`

**Alterações:**

1. **Importar o componente Step6Template**
   - Adicionar import do `Step6Template` e seus tipos

2. **Expandir o array STEPS de 5 para 6 etapas**
   - Inserir "Template" como etapa 5
   - Mover "Revisão" para etapa 6

3. **Ajustar lógica de navegação**
   - Atualizar `handleNext()` para permitir navegação até a etapa 6
   - Atualizar cálculo do progresso para refletir 6 etapas

4. **Adicionar renderização do Step6Template**
   - Incluir o componente quando `currentStep === 5`
   - Passar `formData` e callbacks apropriados

5. **Ajustar Step5Review para etapa 6**
   - Mover renderização para `currentStep === 6`
   - Atualizar descrições e condições

6. **Atualizar botão de publicação**
   - Mover para aparecer apenas na etapa 6

---

## Estrutura Final do Wizard

| Etapa | Título | Componente |
|-------|--------|------------|
| 1 | Informações Básicas | Step1BasicInfo |
| 2 | Especificações | Step2Specifications |
| 3 | Descrição | Step3Description |
| 4 | Mídias | Step4Media |
| 5 | **Template (NOVO)** | **Step6Template** |
| 6 | Revisão | Step5Review |

---

## Detalhes Técnicos

```text
STEPS = [
  { id: 1, title: 'Informações Básicas', icon: '📋' },
  { id: 2, title: 'Especificações', icon: '📐' },
  { id: 3, title: 'Descrição', icon: '📝' },
  { id: 4, title: 'Mídias', icon: '🖼️' },
  { id: 5, title: 'Template', icon: '🎨' },  // NOVO
  { id: 6, title: 'Revisão', icon: '✅' },
]
```

**Funções a atualizar:**
- `handleNext()`: Limite de 5 → 6
- `Progress`: Cálculo `(currentStep / 5)` → `(currentStep / 6)`
- Condicionais de renderização

---

## Resultado Esperado

O usuário poderá:
- Visualizar os 3 templates disponíveis durante o cadastro
- Abrir preview em modal fullscreen
- Personalizar cores e fontes
- Confirmar a escolha antes de revisar e publicar
