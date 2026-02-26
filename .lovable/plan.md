

## Incluir "17 funcionalidades em uma unica plataforma" no One-Pager PDF

### Objetivo
Atualizar a secao de Funcionalidades do One-Pager PDF para refletir todas as 17 funcionalidades presentes na pagina de Apresentacao, incluindo o titulo "17 funcionalidades em uma unica plataforma" e as 2 funcionalidades que faltam (Efeito UAU e Gestao de Parceiros).

### O que muda em `src/pages/OnePager.tsx`

**1. Titulo da secao**
- De: "Funcionalidades"
- Para: "17 funcionalidades em uma unica plataforma"
- Subtitulo compacto: "Organizadas por categoria de valor"

**2. Adicionar 2 funcionalidades que faltam na categoria "Dados e Gestao"**
- **Efeito UAU** — Ranking dos aspectos que mais impressionam visitantes
- **Gestao de Parceiros** — Visao consolidada de todas as imobiliarias parceiras

**3. Ajustar layout para caber as 17 funcionalidades no A4**
- Usar um grid 2x2 mais compacto com `text-[10px]` nas descricoes
- Reduzir `gap-y` e `space-y` para acomodar os 2 itens extras
- Manter o formato: icone gold + titulo da categoria + lista com bullet gold + nome bold + descricao

### Conteudo final das 4 categorias (17 itens)

**Vendas e Gestao de Clientes** (4 itens - sem mudanca)
- Funil Visual (Kanban), Propostas formais, Fichas de visita, Agendamento inteligente

**Marketing e Marca** (4 itens - sem mudanca)
- Sites com marca propria, Modelos exclusivos, Dominio personalizado, Aprovacao de midias

**IA e Atendimento** (3 itens - sem mudanca)
- Sofia IA 24/7, Base de conhecimento, Resposta instantanea

**Dados e Gestao** (6 itens - adicionar 2)
- Pesquisa de Satisfacao (NPS), Painel de Indicadores, Multiempresa, Central de integracoes
- **NOVO:** Efeito UAU — Ranking dos aspectos que mais impressionam visitantes
- **NOVO:** Gestao de Parceiros — Visao consolidada de todas as imobiliarias parceiras

### Detalhes tecnicos
- Apenas alteracoes textuais e de espacamento no arquivo `src/pages/OnePager.tsx`
- Nenhuma mudanca em logica, exportacao PDF ou outros componentes
- Reducao de `py-5` para `py-4` e `space-y-1` para `space-y-0.5` na secao de funcionalidades para acomodar os itens extras

