

## Adicionar Imagens de Teste nos Imoveis

### Problema

Tres dos 6 imoveis ja possuem imagens do Unsplash que funcionam corretamente. Os outros 3 usam URLs de storage ou caminhos locais que podem nao estar carregando:

| Imovel | Imagens atuais |
|---|---|
| Apartamento 4 Suites | Unsplash (OK) |
| Cobertura Duplex Frente-Mar | Unsplash (OK) |
| Penthouse Vista Mar | Unsplash (OK) |
| Linda Cobertura Lucio Costa | URLs do storage (podem nao carregar) |
| GRID Residencial - Unidade 201 | Caminho local `/materiais/...` |
| Mansao no Condominio Malibu | URLs do storage (podem nao carregar) |

### O que sera feito

Atualizar o campo `imagens` (JSONB) dos 3 imoveis que nao usam Unsplash, adicionando 4-5 imagens de teste do Unsplash cada, com temas coerentes (fachada, sala, suite, varanda, piscina). As imagens existentes do storage serao preservadas -- as novas serao adicionadas ao inicio do array para aparecerem como thumbnail no dashboard.

### Secao tecnica

Serao executados 3 comandos UPDATE diretamente no banco, um para cada imovel, usando `jsonb_build_array()` para montar o array de imagens com URLs do Unsplash no formato `https://images.unsplash.com/photo-XXXXX?w=1200`. Nenhuma alteracao de codigo necessaria -- apenas dados.

