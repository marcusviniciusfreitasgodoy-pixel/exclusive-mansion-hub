

## Ajustar Campos de Valores para Mascara BRL

### Analise

Dos campos de valor na proposta:
- `prop_valor_ofertado` -- ja usa `CurrencyInput` (OK)
- `prop_sinal_entrada` -- usa `Input` texto livre, mas e um valor monetario -- **converter para CurrencyInput**
- `prop_parcelas` -- campo descritivo (ex: "12x de R$ 5.000") -- **manter como Input**, mas separar em dois campos: quantidade de parcelas (numerico) e valor da parcela (CurrencyInput)
- `prop_financiamento` -- campo descritivo (ex: "Financiamento CEF 360 meses") -- **manter como Input texto**

### Alteracoes em `src/pages/feedback/FeedbackClientePublico.tsx`

1. **Campo `prop_sinal_entrada`** (linha 1045-1056): trocar `<Input>` por `<CurrencyInput>`, ajustando `value` e `onChange` para o mesmo padrao do `prop_valor_ofertado`

2. **Campo `prop_parcelas`** (linha 1058-1069): separar em dois campos lado a lado:
   - `prop_parcelas_qtd` -- Input numerico (placeholder: "Ex: 12")
   - `prop_parcelas_valor` -- CurrencyInput (placeholder: "R$ 0")
   - Na logica de submit, concatenar como string: `"12x de R$ 5.000"` para manter compatibilidade com o banco (campo TEXT)

3. **Atualizar schema Zod**: adicionar `prop_parcelas_qtd` e `prop_parcelas_valor` como opcionais, remover `prop_parcelas` original

4. **Atualizar defaultValues**: incluir os novos campos

5. **Atualizar onSubmit**: montar `p_sinal_entrada` parseando o valor numerico do CurrencyInput para string formatada, e `p_parcelas` concatenando qtd + valor

### Detalhes Tecnicos

- `prop_sinal_entrada`: o valor sera armazenado como string formatada (ex: "R$ 50.000") no banco, pois a coluna e TEXT
- `prop_parcelas`: sera montado como "12x de R$ 5.000" a partir dos dois subcampos
- `prop_financiamento`: permanece como texto livre, pois descreve tipo de financiamento e nao apenas um valor

