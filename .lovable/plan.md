

## Ajuste de Identidade Visual do One-Pager

### Problema Atual
O one-pager usa cores genericas (slate, emerald, amber) que nao correspondem a identidade visual da Godoy Prime. O logo tambem esta com filtro CSS (`brightness-0 invert`) que reduz a qualidade visual.

### Mudancas no arquivo `src/pages/OnePager.tsx`

**1. Logo em alta resolucao**
- Trocar de `logo-principal.png` (versao escura) para `logo-negativo.png` (versao branca para fundo escuro)
- Remover o filtro `brightness-0 invert` que degrada a imagem
- Aumentar o tamanho do logo de `h-12` para `h-14`

**2. Header e Footer - Navy da marca**
- Substituir `from-slate-900 to-slate-800` por gradiente usando o navy da marca: `from-[#0C2340] to-[#102a4a]`
- Footer CTA: mesmo tratamento navy

**3. Secao "Solucao" - Fundo cream da marca**
- Trocar `bg-slate-50` por um tom cream alinhado com a paleta (`bg-[#faf8f3]`)

**4. Acentos Gold no lugar de emerald/amber**
- Titulos de secao: trocar `text-emerald-700` por `text-[#0C2340]` (navy)
- Icones de destaque: trocar `text-amber-500` e `text-blue-500` por `text-[#D4AF37]` (gold)
- ROI box: trocar `bg-emerald-50`, `border-emerald-200`, `text-emerald-700` por tons gold (`bg-[#fdf8e8]`, `border-[#D4AF37]/30`, `text-[#0C2340]`)
- Metricas ROI: bordas e valores em gold/navy
- Botao WhatsApp CTA: trocar `bg-emerald-600` por gold `bg-[#D4AF37]` com texto navy

**5. Detalhes tipograficos**
- Subtitulo header: trocar `text-slate-300/400` por tons gold claros (`text-[#D4AF37]/80`)
- Bullets do problema: manter `bg-red-500` (semanticamente correto para "problemas")
- Titulos de secao: aplicar navy (`text-[#0C2340]`) em vez de slate

**6. Bordas e separadores**
- Trocar `border-slate-200` por `border-[#0C2340]/10` para consistencia

### Resultado esperado
Um documento visualmente coeso com a marca Godoy Prime: navy profundo nos cabecalhos, gold nos acentos e destaques, cream nos fundos alternados, e o logo em alta resolucao sem filtros CSS.
