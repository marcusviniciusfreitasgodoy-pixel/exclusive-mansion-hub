

## Sincronizar dores entre One-Pager e Apresentacao

### Alteracao unica

**Arquivo: `src/pages/OnePager.tsx` (linha 37-38)**

Adicionar a 6a dor que ja existe na Apresentacao mas falta no One-Pager:

```text
Antes (5 itens):
1. Contatos esfriam sem resposta rapida — perda de oportunidades
2. Zero visibilidade sobre o desempenho das imobiliarias parceiras
3. Materiais de venda despadronizados e desatualizados
4. Visitas sem registro, avaliacao ou rastreabilidade
5. Decisoes estrategicas sem dados concretos

Depois (6 itens — sincronizado com Apresentacao):
1. Contatos esfriam sem resposta rapida — perda de oportunidades
2. Zero visibilidade sobre o desempenho das imobiliarias parceiras
3. Materiais de venda despadronizados e desatualizados
4. Visitas sem registro, avaliacao ou rastreabilidade
5. Decisoes estrategicas sem dados concretos
6. Profissionais que visitam o imovel sem conhecer seus detalhes e diferenciais  ← NOVO
```

### Detalhes tecnicos
- Apenas uma linha adicionada ao array `problemas` em `src/pages/OnePager.tsx`
- A pagina de Apresentacao (`src/pages/Apresentacao.tsx`) ja possui as 6 dores — nenhuma alteracao necessaria nela
- O layout da secao "O Problema" no One-Pager comporta 6 itens sem necessidade de ajuste de espacamento
