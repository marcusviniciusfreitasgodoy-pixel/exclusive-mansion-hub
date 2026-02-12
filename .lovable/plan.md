
## Corrigir Contagem de Campos nos Formularios de Feedback

### Problema
Na pagina de listagem de formularios, "Feedback do Cliente" e "Feedback do Corretor" mostram "Perguntas configuradas: 0". Isso acontece porque existem registros no banco com `campos: []` (array vazio), e o codigo trata array vazio como valor valido sem usar os campos padrao.

### Causa
Arquivo `src/pages/dashboard/imobiliaria/ConfiguracoesFormularios.tsx`, linha 102:

```text
const campos = (config?.campos as unknown as CampoFormulario[]) || getDefaultCampos(tipo);
```

`[]` e truthy em JavaScript, entao o fallback `getDefaultCampos(tipo)` nunca executa.

### Solucao
Alterar a linha 102 para verificar se o array tem conteudo:

```typescript
const camposSalvos = config?.campos as unknown as CampoFormulario[];
const campos = (camposSalvos && camposSalvos.length > 0) ? camposSalvos : getDefaultCampos(tipo);
```

### Arquivo modificado
- `src/pages/dashboard/imobiliaria/ConfiguracoesFormularios.tsx` -- linha 102, mesma correcao de array vazio

Alteracao de 2 linhas. A correcao anterior no `EditarFormulario.tsx` ja esta feita e continua valida.
