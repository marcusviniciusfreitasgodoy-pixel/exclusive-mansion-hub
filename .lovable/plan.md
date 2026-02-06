
# Implementar Efeito UAU Completo

## Resumo
Adicionar ao sistema de feedback pos-visita uma secao "Efeito UAU" que captura quais aspectos do imovel causaram maior impressao no visitante. Inclui coleta no formulario, armazenamento no banco e visualizacao analitica nos dashboards de Construtora e Imobiliaria.

## O que sera feito

### 1. Banco de Dados - Nova migracao
Adicionar duas colunas na tabela `feedbacks_visitas`:
- `efeito_uau` do tipo `text[]` (array de strings) - categorias selecionadas
- `efeito_uau_detalhe` do tipo `text` - comentario livre

### 2. Formulario do Cliente - Coleta
No arquivo `src/pages/feedback/FeedbackClientePublico.tsx`, adicionar uma nova secao (Card) entre as avaliacoes por categoria e a secao de opiniao textual:

- Titulo: "O que mais te impressionou? (Efeito UAU)"
- 10 categorias como botoes toggle (selecao multipla): Vista, Acabamento, Espaco, Iluminacao, Varanda/Area externa, Cozinha, Banheiros, Localizacao, Condominio, Seguranca
- Campo textarea opcional para detalhar o que mais impressionou
- Atualizar o schema zod com `efeito_uau` (array string opcional) e `efeito_uau_detalhe` (string opcional)
- Salvar os dados no submit junto com os demais campos

### 3. Analytics - Grafico de Efeito UAU
No componente `src/components/analytics/VisitFeedbackAnalytics.tsx`:

- Adicionar `efeito_uau` na interface `Feedback`
- Criar um `useMemo` que conta a frequencia de cada categoria UAU em todos os feedbacks
- Renderizar como BarChart horizontal ranqueado por contagem (mesmo estilo do grafico de objecoes)
- Posicionar como um novo card na terceira linha de graficos, ao lado dos graficos existentes

### 4. Queries de Analytics - Incluir efeito_uau
Nos arquivos de Analytics da Construtora e Imobiliaria, adicionar `efeito_uau` na lista de campos selecionados nas queries de feedbacks:
- `src/pages/dashboard/construtora/Analytics.tsx` (VisitFeedbackSection)
- `src/pages/dashboard/imobiliaria/Analytics.tsx` (ImobVisitFeedbackSection)

---

## Detalhes Tecnicos

### Migracao SQL
```sql
ALTER TABLE public.feedbacks_visitas
  ADD COLUMN efeito_uau text[] DEFAULT NULL,
  ADD COLUMN efeito_uau_detalhe text DEFAULT NULL;
```

### Categorias UAU (array constante)
```typescript
const EFEITO_UAU_OPTIONS = [
  { value: "vista", label: "Vista" },
  { value: "acabamento", label: "Acabamento" },
  { value: "espaco", label: "Espaço" },
  { value: "iluminacao", label: "Iluminação" },
  { value: "varanda", label: "Varanda / Área externa" },
  { value: "cozinha", label: "Cozinha" },
  { value: "banheiros", label: "Banheiros" },
  { value: "localizacao", label: "Localização" },
  { value: "condominio", label: "Condomínio" },
  { value: "seguranca", label: "Segurança" },
];
```

### Arquivos a modificar
1. **`src/pages/feedback/FeedbackClientePublico.tsx`** - Adicionar secao UAU no formulario, schema zod e submit
2. **`src/components/analytics/VisitFeedbackAnalytics.tsx`** - Adicionar grafico de Efeito UAU e atualizar interface Feedback
3. **`src/pages/dashboard/construtora/Analytics.tsx`** - Incluir `efeito_uau` na query de feedbacks
4. **`src/pages/dashboard/imobiliaria/Analytics.tsx`** - Incluir `efeito_uau` na query de feedbacks

### Nenhum arquivo novo necessario
Toda a implementacao se encaixa nos componentes e estruturas existentes.
