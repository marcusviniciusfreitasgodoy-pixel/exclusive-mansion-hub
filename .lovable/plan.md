

# Melhorar Visualizacao e Responsividade dos Cards da Plataforma

## Resumo
Aprimorar os cards da secao "Tudo o que voce precisa em uma unica plataforma" para melhor hierarquia visual e experiencia mobile.

## Alteracoes

### Arquivo: `src/pages/Apresentacao.tsx`

**Cards (linhas 189-207):**

1. **Layout responsivo melhorado:**
   - Mobile: grid de 1 coluna com cards mais compactos (`grid-cols-1`)
   - Tablet: 2 colunas (`sm:grid-cols-2`)
   - Desktop: 3 colunas (`lg:grid-cols-3`)
   - Reduzir gap no mobile (`gap-4 md:gap-6`)

2. **Visual dos cards aprimorado:**
   - Adicionar altura minima uniforme para alinhar os cards (`flex flex-col h-full`)
   - Empurrar os badges para o rodape do card com `mt-auto` para alinhamento consistente
   - Borda lateral colorida sutil: borda esquerda dourada de 3px (`border-l-[3px] border-l-secondary`) para destaque visual
   - Padding ajustado no mobile (`p-4 md:p-6`)
   - Sombra hover mais pronunciada

3. **Icone:**
   - Fundo circular em vez de quadrado arredondado para mais elegancia (`rounded-full`)
   - Tamanho levemente maior no desktop

4. **Badges:**
   - Envolver em `flex flex-wrap` para nao quebrar layout em telas pequenas
   - Texto ligeiramente menor no mobile

5. **Legenda (Construtora/Imobiliaria):**
   - Manter a legenda com os circulos coloridos acima do grid

### Nenhum arquivo novo, nenhuma dependencia nova

