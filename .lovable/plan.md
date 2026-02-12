
## Corrigir Campos Vazios nos Formularios de Feedback

### Problema
Os formularios de Feedback do Cliente e Feedback do Corretor mostram "Nenhum campo configurado" porque existem registros no banco de dados com `campos: []` (array vazio). O codigo atual so carrega os campos padrao quando nao existe nenhum registro -- mas como existe um registro com array vazio, ele usa o array vazio ao inves de carregar os defaults.

### Causa raiz
No arquivo `src/pages/dashboard/imobiliaria/EditarFormulario.tsx`, linhas 86-92:

```typescript
if (config) {
  setCampos((config.campos as unknown as CampoFormulario[]) || []);
} else if (tipo) {
  setCampos(getDefaultCampos(tipo as TipoFormulario));
}
```

`config` existe (nao e null), mas `config.campos` e `[]`. Como `[]` e truthy em JavaScript, o fallback `|| []` nao ajuda, e o sistema nunca chega no `else` que carregaria os campos padrao.

### Solucao
Alterar a logica para verificar se o array de campos tem conteudo. Se `config` existe mas `campos` esta vazio, carregar os campos padrao:

```typescript
if (config) {
  const camposSalvos = config.campos as unknown as CampoFormulario[];
  if (camposSalvos && camposSalvos.length > 0) {
    setCampos(camposSalvos);
  } else if (tipo) {
    setCampos(getDefaultCampos(tipo as TipoFormulario));
  }
} else if (tipo) {
  setCampos(getDefaultCampos(tipo as TipoFormulario));
}
```

### Arquivo modificado
- `src/pages/dashboard/imobiliaria/EditarFormulario.tsx` -- correcao no useEffect (linhas 86-92)

Apenas uma alteracao de 6 linhas. Nenhum outro arquivo precisa ser modificado.
