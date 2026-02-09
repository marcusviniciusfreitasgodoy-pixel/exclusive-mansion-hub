

## Adicionar Indicador Visual de Progresso ao DomainConfigCard

### O que sera feito

Adicionar um stepper horizontal com 3 passos no topo do card de dominio customizado, mostrando visualmente em qual etapa o usuario esta:

1. **Salvar dominio** -- concluido quando `existingDomain` existe
2. **Configurar DNS** -- concluido quando o status e `verified` ou `active`
3. **Verificar e ativar** -- concluido quando o status e `active`

Cada passo tera um circulo numerado (ou icone de check quando concluido), titulo e uma linha conectora entre os passos. O passo atual sera destacado com cor primaria, os concluidos em verde e os pendentes em cinza.

### Detalhes Tecnicos

**Arquivo modificado:** `src/components/dashboard/DomainConfigCard.tsx`

**Mudancas:**
- Criar um componente interno `StepIndicator` com 3 passos conectados por linhas horizontais
- Calcular o passo atual baseado no estado:
  - Sem dominio salvo: passo 1 ativo
  - Dominio salvo, status `pending` ou `failed`: passo 2 ativo
  - Status `verified`: passo 3 ativo
  - Status `active`: todos concluidos
- Renderizar o stepper entre o `CardHeader` e o conteudo existente
- Usar icones `CheckCircle2` (concluido) e numeros (pendente/ativo)
- Cores: verde (`text-green-600`) para concluidos, primaria para ativo, `text-muted-foreground` para pendentes
- Linhas conectoras colorem de acordo com progresso

Nenhum arquivo novo sera criado. Nenhuma dependencia adicional necessaria.

