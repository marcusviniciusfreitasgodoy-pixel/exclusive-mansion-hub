
# Plano: Criar Template "Empreendimento Alto Padrão"

## Objetivo
Criar um novo template de landing page chamado **"Empreendimento Alto Padrão"** (código interno: `alto_padrao`) com design tokens customizados inspirados em temas oceânicos (azul marinho) e de natureza/golf (verde), utilizando fontes Montserrat e Roboto.

---

## Arquitetura do Template

O template seguirá o mesmo padrão dos templates existentes (Luxo, Moderno, Clássico):

```text
src/components/property/altopadrao/
├── AltoPadraoHero.tsx       (Hero com carrossel, overlay, CTAs)
├── AltoPadraoDetailsGrid.tsx (Grid de especificações e descrição)
├── AltoPadraoGallery.tsx    (Galeria com lightbox)
├── AltoPadraoFooter.tsx     (Rodapé 4 colunas)
└── index.ts                  (Exports)

src/components/templates/
├── TemplateAltoPadrao.tsx    (Componente principal)
```

---

## Design Tokens a Implementar

### Paleta de Cores
| Token | Valor | Uso |
|-------|-------|-----|
| primary-500 | #0284c7 | Azul marinho (botões, headings) |
| primary-800 | #0c4a6e | Azul escuro (backgrounds, texto heading) |
| secondary-500 | #22c55e | Verde natureza (acentos, preços, ícones) |
| neutral-800 | #262626 | Texto body |
| neutral-500 | #737373 | Texto muted |
| background-light | #ffffff | Fundo claro |
| background-dark | #0c4a6e | Fundo escuro (hero, footer) |

### Tipografia
- **Fonte Primária**: Montserrat (headings)
- **Fonte Secundária**: Roboto (body text)
- **Pesos**: 300-700
- **Tamanhos**: xs (12px) até 6xl (60px)

### Espaçamentos (base 8px)
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px, 4xl: 96px

### Borders
- Radius: sm (4px), md (8px), lg (12px), xl (16px), full (9999px)

### Shadows
- sm, md, lg, xl com opacidades suaves

---

## Arquivos a Criar/Modificar

### 1. Componentes do Template Alto Padrão

**`src/components/property/altopadrao/AltoPadraoHero.tsx`**
- Hero com altura 70vh
- Carrossel automático de imagens
- Overlay azul escuro (#0c4a6e) com 50% opacidade
- Título em Montserrat bold, cor primary-500
- Preço em verde secondary-500
- Botão CTA com border-radius: 12px
- Contadores de mídia (fotos, vídeos, 360°)

**`src/components/property/altopadrao/AltoPadraoDetailsGrid.tsx`**
- Layout 2 colunas
- Descrição narrativa à esquerda
- Especificações em cards à direita
- Ícones em verde secondary-500
- Headers em Montserrat semibold

**`src/components/property/altopadrao/AltoPadraoGallery.tsx`**
- Grid responsivo (1/3/4 colunas)
- Hover com scale e overlay verde
- Lightbox fullscreen

**`src/components/property/altopadrao/AltoPadraoFooter.tsx`**
- Background primary-800 (#0c4a6e)
- 4 colunas: navegação, contato, social, newsletter
- Destaques em verde secondary-500
- Logo da imobiliária + "Tecnologia Godoy Prime"

**`src/components/property/altopadrao/index.ts`**
- Exports de todos os componentes

### 2. Template Principal

**`src/components/templates/TemplateAltoPadrao.tsx`**
- Estrutura similar ao TemplateLuxo/TemplateModerno
- Carrega fontes Montserrat e Roboto via Google Fonts
- Estilos scoped com data-template="altopadrao"
- CSS customizado com os design tokens
- Integração com todos os componentes existentes (Navbar, ContactSection, Sofia, etc.)

### 3. Atualizações de Configuração

**`src/types/database.ts`**
- Adicionar `'alto_padrao'` ao type `TemplateType`

**`src/components/templates/templateStyles.ts`**
- Adicionar entrada `alto_padrao` em `templateDefaults`
- Configurar: colorPrimary (#0284c7), colorSecondary (#22c55e), fontes Montserrat/Roboto

**`src/components/templates/index.ts`**
- Exportar `TemplateAltoPadrao`

**`src/components/wizard/Step6Template.tsx`**
- Adicionar opção "Alto Padrão" com ícone (Building2) e descrição
- Preview colors: bg-sky-900, accent-emerald-500

**`src/pages/TemplatesShowcase.tsx`**
- Adicionar preview do template Alto Padrão

**`src/pages/imovel/PropertyPage.tsx`**
- Adicionar case para renderizar TemplateAltoPadrao

---

## Detalhes de Implementação CSS

Os estilos scoped serão injetados no componente:

```css
[data-template="altopadrao"] {
  font-family: 'Roboto', sans-serif;
  color: #262626;
}
[data-template="altopadrao"] h1,
[data-template="altopadrao"] h2,
[data-template="altopadrao"] h3,
[data-template="altopadrao"] h4 {
  font-family: 'Montserrat', sans-serif;
  color: #0c4a6e;
}
[data-template="altopadrao"] .btn-altopadrao {
  background: #0284c7;
  color: white;
  border-radius: 12px;
  transition: all 300ms ease-in-out;
}
[data-template="altopadrao"] .btn-altopadrao:hover {
  box-shadow: 0 4px 20px rgba(2, 132, 199, 0.4);
  transform: translateY(-2px);
}
[data-template="altopadrao"] .icon-accent {
  color: #22c55e;
}
```

---

## Resultado Esperado

- Novo template disponível no wizard de cadastro/edição de imóveis
- Preview visual na página /templates
- Estilo inspirado em empreendimentos de golf/praia
- Paleta azul oceânico + verde natureza
- Tipografia moderna (Montserrat + Roboto)
- Todos os componentes reutilizados (contato, chatbot, materiais promocionais, etc.)

---

## Próximos Passos Após Aprovação

1. Criar pasta e componentes do template Alto Padrão
2. Atualizar types e configurações
3. Integrar ao wizard de seleção de templates
4. Adicionar preview na showcase
5. Testar end-to-end

Quando aprovar, implementarei esta primeira etapa. Depois, você poderá enviar instruções adicionais para ajustes de layout ou seções específicas.
