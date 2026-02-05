
# Plano: Adicionar Template Alto Padrao e Preview no Seletor

## Problema Identificado
O componente `TemplateSelector.tsx` apresenta apenas 3 templates (Luxo, Moderno, Classico), faltando o template **Alto Padrao**. Alem disso, nao ha funcionalidade de preview/visualizacao dos templates antes de seleciona-los.

## Alteracoes Necessarias

### 1. Corrigir Tipo no database.ts
**Arquivo:** `src/types/database.ts`

O campo `template_escolhido` na interface `Imovel` esta limitado a 3 opcoes:
```typescript
template_escolhido: 'luxo' | 'moderno' | 'classico';
```

Precisa ser atualizado para:
```typescript
template_escolhido: TemplateType;
```

Isso permitira usar o tipo `TemplateType` que ja inclui `alto_padrao`.

### 2. Adicionar Template Alto Padrao no Seletor
**Arquivo:** `src/components/templates/TemplateSelector.tsx`

Adicionar o quarto template na lista:
```typescript
{
  id: "alto_padrao",
  name: "Alto Padrao",
  description: "Ocean e natureza",
  target: "Golf, praia, resorts exclusivos",
  icon: <Building2 className="h-5 w-5" />,
  preview: {
    bg: "bg-sky-900",
    accent: "bg-green-500",
  },
}
```

Ajustar o grid para 4 colunas:
```typescript
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
```

### 3. Adicionar Botao de Preview
**Arquivo:** `src/components/templates/TemplateSelector.tsx`

Adicionar um botao "Visualizar Templates" que abre o showcase:
- Link para `/templates` em nova aba
- Ou modal com preview embutido

**Opcao escolhida:** Link externo para `/templates` (reutiliza a pagina de showcase existente)

```typescript
<div className="flex gap-2">
  <Button
    type="button"
    variant="outline"
    onClick={() => setShowCustomization(true)}
  >
    <Palette className="mr-2 h-4 w-4" />
    Personalizar Cores
  </Button>
  <Button
    type="button"
    variant="ghost"
    onClick={() => window.open("/templates", "_blank")}
  >
    <Eye className="mr-2 h-4 w-4" />
    Ver Preview
  </Button>
</div>
```

## Resumo de Arquivos

| Arquivo | Alteracao |
|---------|-----------|
| `src/types/database.ts` | Atualizar `template_escolhido` para usar `TemplateType` |
| `src/components/templates/TemplateSelector.tsx` | Adicionar template Alto Padrao + botao preview |

## Resultado Final
- 4 templates visiveis no seletor (Luxo, Moderno, Classico, Alto Padrao)
- Cada template com icone, descricao e indicacao de uso
- Botao para visualizar preview completo dos templates na pagina /templates
- Grid responsivo 1-2-4 colunas conforme tela
