
# Plano: Otimização do Footer e Elementos Flutuantes no Mobile

## Problemas Identificados

Analisando o print e o código, identifiquei os seguintes problemas:

1. **Avatar HeyGen muito grande**: O widget está configurado com 200x200px fixos no mobile, ocupando muito espaço
2. **Logo Godoy Prime quase invisível**: Está com opacidade de apenas 60% sobre fundo escuro
3. **Botões sobrepostos**: WhatsApp, "Voltar ao Topo" e HeyGen competem pelo mesmo espaço no canto inferior
4. **Links do rodapé mal formatados**: Política de Privacidade e Termos de Uso não quebram bem em telas pequenas

---

## Solução Proposta

### 1. Reduzir Avatar HeyGen no Mobile

**Arquivo:** `index.html`

Ajustar o CSS do widget HeyGen para:
- Mobile: 120x120px (era 200x200px)
- Posição: `left: 16px; bottom: 120px` para não sobrepor o footer
- Ajustar o estado expandido para funcionar melhor em telas pequenas

### 2. Melhorar Visibilidade do Logo

**Arquivo:** `src/components/property/DynamicFooter.tsx`

- Aumentar opacidade do logo de 60% para 100%
- Adicionar filtro de brilho para destacar
- Aumentar tamanho do logo de `h-8` para `h-10` no mobile

### 3. Reposicionar Botões Flutuantes

**Arquivo:** `src/components/FloatingWhatsApp.tsx`
- Mover para o lado direito: `right: 16px; bottom: 24px`

**Arquivo:** `src/components/ScrollToTop.tsx`
- Mover para cima do WhatsApp: `right: 16px; bottom: 100px`
- Ajustar para não colidir com HeyGen no lado esquerdo

### 4. Corrigir Layout dos Links do Footer

**Arquivo:** `src/components/property/DynamicFooter.tsx`

- Empilhar links verticalmente em telas muito pequenas
- Adicionar espaçamento adequado
- Melhorar contraste do texto

---

## Alterações Técnicas

### index.html - CSS do HeyGen Widget

```css
#heygen-streaming-embed {
  /* Reduzir de 200px para 120px em mobile */
  width: 120px;
  height: 120px;
  left: 16px;
  bottom: 100px; /* Subir para não sobrepor footer */
}

/* Media query para desktop */
@media (min-width: 768px) {
  #heygen-streaming-embed {
    width: 160px;
    height: 160px;
    left: 40px;
    bottom: 40px;
  }
}
```

### DynamicFooter.tsx - Melhorias

```tsx
{/* Logo com mais destaque */}
<img
  src={logoWhite}
  alt="Godoy Prime Realty"
  className="h-10 md:h-12 object-contain brightness-110"
/>

{/* Links empilhados no mobile */}
<div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs">
  <a href="..." className="text-white/60 hover:text-accent">
    Política de Privacidade
  </a>
  <span className="hidden sm:inline text-white/40">•</span>
  <a href="..." className="text-white/60 hover:text-accent">
    Termos de Uso
  </a>
</div>
```

### FloatingWhatsApp.tsx e ScrollToTop.tsx

Reposicionar para evitar sobreposição:
- WhatsApp: `bottom-6 right-4` (mobile)
- ScrollToTop: `bottom-20 right-4` (mobile) - acima do WhatsApp

---

## Resultado Esperado

1. Avatar HeyGen menor e melhor posicionado
2. Logo Godoy Prime visível e destacado
3. Botões organizados sem sobreposição
4. Links de rodapé legíveis em qualquer tamanho de tela
