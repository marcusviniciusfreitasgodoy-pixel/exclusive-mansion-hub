
# Plano de Redesign dos Templates Luxo e Moderno

## Resumo Executivo

Este plano detalha a substituição dos templates **Luxo** e **Moderno** por novos designs baseados nos padrões visuais de **Sotheby's International Realty** (Luxo) e **The Agency RE** (Moderno), mantendo o template Clássico atual que já está em uso.

---

## Comparativo: Estado Atual vs Novo Design

### Template Luxo

| Característica | Atual | Novo (Sotheby's Style) |
|---|---|---|
| Paleta | Preto + Dourado | Branco + Dourado #D4AF37 |
| Tipografia | Playfair Display | Times New Roman (serif elegante) |
| Hero | 100vh, fundo escuro | 70vh, imagem com overlay preto 50% |
| Layout | Grid simples | Grid 12 colunas com margens premium |
| Animações | 600ms ease-in-out | Parallax + Fade-in em scroll |
| Galeria | Carousel simples | Grid 1/3/4 colunas + zoom hover |
| Detalhes | Lista simples | 2 colunas com mapa integrado |
| Footer | Minimalista | 4 colunas com newsletter |

### Template Moderno

| Característica | Atual | Novo (The Agency Style) |
|---|---|---|
| Paleta | Azul + Verde | Azul profundo #1E3A8A + Verde natural #10B981 |
| Tipografia | Inter/Poppins | Montserrat (sans-serif moderna) |
| Hero | 70vh | 60vh, texto à esquerda |
| Layout | Cards arredondados | Grid 12 colunas com espaçamentos amplos |
| Animações | 300ms rápidas | Scroll-triggered + micro-interações |
| Galeria | Carousel | Slider com autoplay 3s |
| Detalhes | 2 colunas | 3 colunas lifestyle-focused |
| Footer | Simples | 3 colunas com fundo azul claro |

---

## Arquivos a Modificar

```text
src/
├── components/
│   ├── templates/
│   │   ├── TemplateLuxo.tsx        [REESCREVER]
│   │   ├── TemplateModerno.tsx     [REESCREVER]
│   │   ├── templateStyles.ts       [ATUALIZAR]
│   │   └── TemplateWrapper.tsx     [ATUALIZAR fontes]
│   └── property/
│       ├── LuxoHero.tsx            [CRIAR]
│       ├── LuxoGallery.tsx         [CRIAR]
│       ├── LuxoDetailsGrid.tsx     [CRIAR]
│       ├── LuxoFooter.tsx          [CRIAR]
│       ├── ModernoHero.tsx         [CRIAR]
│       ├── ModernoGallery.tsx      [CRIAR]
│       ├── ModernoDetailsGrid.tsx  [CRIAR]
│       └── ModernoFooter.tsx       [CRIAR]
└── index.css                       [ADICIONAR novas variáveis]
```

---

## Detalhamento Técnico

### Etapa 1: Variáveis CSS e Estilos Base

Adicionar novas variáveis CSS globais em `index.css`:

```css
:root {
  /* Template Luxo (Sotheby's) */
  --luxo-gold: 43 48% 52%;
  --luxo-black: 0 0% 0%;
  --luxo-white: 0 0% 100%;
  --luxo-text: 0 0% 20%;
  --luxo-background: 0 0% 97%;
  
  /* Template Moderno (The Agency) */
  --moderno-blue: 217 78% 33%;
  --moderno-green: 160 84% 39%;
  --moderno-text: 215 16% 42%;
  --moderno-background: 210 17% 98%;
}
```

### Etapa 2: Template Luxo (Sotheby's Style)

**Componentes específicos a criar:**

1. **LuxoHero.tsx** - Hero 70vh com:
   - Imagem fullwidth com overlay preto 50%
   - Título em H1 serif dourado, maiúsculo
   - Preço em H2 branco
   - CTA "Contact Agent" retangular dourado

2. **LuxoGallery.tsx** - Galeria grid responsiva:
   - Thumbnails 300x300px
   - 1 col mobile / 3 tablet / 4 desktop
   - Zoom 1.1x no hover
   - Navegação com setas e dots

3. **LuxoDetailsGrid.tsx** - Layout 2 colunas:
   - Descrição narrativa (18px serif)
   - Lista de amenidades com ícones
   - Mapa integrado

4. **LuxoFooter.tsx** - Footer 4 colunas:
   - Links de navegação
   - Contato
   - Redes sociais (ícones dourados)
   - Newsletter signup

**Estilos principais:**
- Fundo branco #FFFFFF
- Header fixo 80px com logo serif dourado
- Botões retangulares 8px radius, fundo dourado
- Animações: fade-in 0.5s, parallax leve, hover zoom

### Etapa 3: Template Moderno (The Agency Style)

**Componentes específicos a criar:**

1. **ModernoHero.tsx** - Hero 60vh com:
   - Overlay branco minimal 30%
   - Título sans-serif azul, lowercase
   - Preço em verde
   - CTA "Request Info" arredondado 12px

2. **ModernoGallery.tsx** - Slider horizontal:
   - Imagens 400x250px arredondadas 8px
   - Autoplay 3s
   - Dots azuis
   - 1/2/3 colunas responsivo

3. **ModernoDetailsGrid.tsx** - Layout 3 colunas:
   - Descrição lifestyle (line-height 1.6)
   - Specs técnicos com ícones verdes
   - Mapa e amenidades

4. **ModernoFooter.tsx** - Footer 3 colunas:
   - Fundo azul claro #E0F2FE
   - Newsletter com botão azul
   - Redes sociais verdes

**Estilos principais:**
- Fundo branco #FFFFFF
- Header sticky 70px com logo Montserrat azul
- Botões arredondados 12px, azul com sombra
- Animações: scroll-triggered 0.3s, pulse em CTAs

### Etapa 4: Atualizar templateStyles.ts

```typescript
export const templateDefaults: Record<TemplateType, TemplateStyles> = {
  luxo: {
    colorPrimary: "#D4AF37",    // Dourado
    colorSecondary: "#000000",  // Preto
    colorText: "#333333",
    fontHeading: "'Times New Roman', 'Georgia', serif",
    fontBody: "'Helvetica', 'Arial', sans-serif",
    heroHeight: "70vh",
    sectionPadding: "80px",
    buttonRadius: "8px",
    transitionDuration: "500ms",
    transitionEasing: "ease-out",
    animationsEnabled: true,
  },
  moderno: {
    colorPrimary: "#1E3A8A",    // Azul profundo
    colorSecondary: "#10B981",  // Verde natural
    colorText: "#374151",
    fontHeading: "'Montserrat', sans-serif",
    fontBody: "'Montserrat', sans-serif",
    heroHeight: "60vh",
    sectionPadding: "48px",
    buttonRadius: "12px",
    transitionDuration: "300ms",
    transitionEasing: "ease-in-out",
    animationsEnabled: true,
  },
  // classico permanece igual
};
```

### Etapa 5: Carregamento de Fontes

Atualizar `TemplateWrapper.tsx` para carregar:
- **Luxo**: Times New Roman (sistema) + Helvetica
- **Moderno**: Montserrat via Google Fonts

---

## Sequência de Implementação

1. **Variáveis CSS** - Adicionar variáveis globais em index.css
2. **templateStyles.ts** - Atualizar defaults dos templates
3. **TemplateWrapper.tsx** - Configurar carregamento de fontes
4. **Componentes Luxo** - Criar Hero, Gallery, Details, Footer
5. **TemplateLuxo.tsx** - Reescrever usando novos componentes
6. **Componentes Moderno** - Criar Hero, Gallery, Details, Footer
7. **TemplateModerno.tsx** - Reescrever usando novos componentes
8. **Testes visuais** - Verificar responsividade e animações

---

## Considerações de Acessibilidade

- Contraste de cores testado para padrão AA
- Tamanhos de fonte adequados (mínimo 16px para corpo)
- Foco visível em elementos interativos
- Alt text em todas as imagens
- Navegação por teclado funcional

---

## Estimativa de Esforço

| Tarefa | Complexidade |
|---|---|
| Variáveis CSS | Baixa |
| templateStyles.ts | Baixa |
| Componentes Luxo (4) | Alta |
| TemplateLuxo.tsx | Média |
| Componentes Moderno (4) | Alta |
| TemplateModerno.tsx | Média |
| Testes e ajustes | Média |

**Total estimado**: Implementação completa requer múltiplas iterações para garantir fidelidade aos designs de referência.
