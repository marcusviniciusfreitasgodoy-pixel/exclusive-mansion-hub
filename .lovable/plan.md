

## Proposta Inline no Formulario de Feedback

### O que muda

Atualmente, o formulario de proposta so aparece **apos** o feedback ser enviado, em uma tela separada. Conforme o print de referencia, o fluxo correto e:

1. Na secao "Interesse e Proposta" do feedback, o cliente seleciona o nivel de interesse (Baixo / Medio / Alto / Muito Alto)
2. Seleciona a percepcao de valor (Abaixo do mercado / Preco justo / Acima do mercado)
3. Marca um checkbox "Gostaria de fazer uma proposta?"
4. Ao marcar, os campos da proposta aparecem **inline**, dentro do mesmo formulario
5. O cliente preenche tudo (proposta + feedback) e envia com um unico botao "Enviar Feedback"

### Alteracoes

**Arquivo: `src/pages/feedback/FeedbackClientePublico.tsx`**

1. Adicionar campo `percepcao_valor` ao schema (radio: "Abaixo do mercado", "Preco justo", "Acima do mercado")
2. Adicionar campo `gostaria_fazer_proposta` (checkbox booleano) ao schema
3. Adicionar campos da proposta ao schema (condicionais -- so validados se checkbox marcado):
   - `prop_nome_completo`, `prop_cpf_cnpj`, `prop_telefone`, `prop_email`
   - `prop_endereco_resumido`, `prop_unidade`, `prop_matricula`
   - `prop_valor_ofertado`, `prop_sinal_entrada`, `prop_parcelas`, `prop_financiamento`, `prop_outras_condicoes`
   - `prop_cidade_uf`, `prop_validade_proposta`, `prop_forma_aceite`
4. Na secao "Interesse e Proposta":
   - Reorganizar para mostrar radio de nivel de interesse em grid 2x2 (Baixo/Medio/Alto/Muito Alto)
   - Adicionar radio de percepcao de valor
   - Adicionar checkbox "Gostaria de fazer uma proposta?"
   - Quando marcado, renderizar inline as secoes: Identificacao do Proponente, Identificacao do Imovel, Valor e Condicoes, Validade e Aceite, Clausula, Upload CNH + Assinatura do Proponente (lado a lado conforme print)
5. No `onSubmit`: se `gostaria_fazer_proposta` estiver marcado, chamar `submit_proposta_compra` RPC alem do `submit_client_feedback`
6. Remover a secao pos-feedback que mostrava o CTA separado de proposta (linhas 276-336), ja que a proposta sera enviada junto

**Arquivo: `src/components/proposta/ProposalForm.tsx`** -- manter como esta para uso na rota `/proposta/:token` (acesso direto)

**Arquivo: `src/components/proposta/CNHUpload.tsx`** -- reutilizar no feedback inline (importar diretamente)

### Layout conforme o print

A secao "Interesse e Proposta" tera:
- Radio buttons de nivel de interesse em grid 2x2
- Radio de percepcao de valor (3 opcoes verticais)
- Checkbox "Gostaria de fazer uma proposta?"
- Se marcado, sub-secoes com borda/indentacao:
  - **Identificacao do Proponente**: nome, CPF/CNPJ + telefone (grid 2 cols), email
  - **Identificacao do Imovel**: descricao pre-preenchida, endereco (pre-preenchido), unidade + matricula (grid 2 cols)
  - **Valor Ofertado e Condicoes de Pagamento**: valor com CurrencyInput, sinal/entrada, parcelas, financiamento, outras condicoes
  - **Validade e Aceite**: cidade/UF + validade (grid 2 cols), radio forma de aceite
  - **Clausula de Documento Posterior**: texto juridico informativo
  - **Upload CNH + Assinatura do Proponente**: lado a lado (grid 2 cols no desktop)

### Detalhes Tecnicos

- O schema Zod usara `.superRefine()` para validar campos da proposta apenas quando `gostaria_fazer_proposta === true`
- Os campos do imovel serao pre-preenchidos com dados do feedback (endereco, titulo)
- A assinatura do proponente sera separada da assinatura do feedback -- usara um segundo `SignaturePad` ref
- O `onSubmit` fara duas chamadas sequenciais: primeiro `submit_client_feedback`, depois `submit_proposta_compra` (se proposta marcada)
- Dados de `percepcao_valor` serao passados como campo adicional ao RPC de feedback (precisara de migration para adicionar coluna `percepcao_valor` em `feedbacks_visitas` se nao existir)

### Migration SQL necessaria

- Adicionar coluna `percepcao_valor TEXT` na tabela `feedbacks_visitas` (se nao existir)
- Atualizar RPC `submit_client_feedback` para aceitar e salvar `percepcao_valor`

