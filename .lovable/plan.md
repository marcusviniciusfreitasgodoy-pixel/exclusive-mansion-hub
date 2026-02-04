

# Plano: Criar Imóvel GRID Residencial com Materiais Completos

## Objetivo

Inserir um novo imóvel completo no banco de dados com todos os materiais promocionais fornecidos para visualização do site final.

## Dados do Imóvel (Extraídos dos Materiais)

| Campo | Valor |
|-------|-------|
| Título | GRID Residencial - Unidade 201 |
| Headline | Viva em harmonia no coração da Gávea |
| Endereço | Rua General Rabelo, 51 |
| Bairro | Gávea |
| Cidade | Rio de Janeiro |
| Estado | RJ |
| Valor | R$ 1.400.000,00 |
| Área Privativa | 54,50 m² |
| Suítes | 1 |
| Banheiros | 1 |
| Vagas | 1 |

## Descrição (Gerada a partir do Book)

> Apartamento moderno no GRID Residencial, empreendimento exclusivo localizado no coração da Gávea. Design contemporâneo com fachada em tom madeira e varandas com filtros transparentes que fazem a intermediação entre os apartamentos e a cidade.

> A unidade 201 conta com 54,50m² de área privativa, incluindo vaga de garagem (nº 5), eletrodomésticos (fogão, geladeira, máquina de lavar e secar, microondas) e armários em todos os ambientes.

> Localização estratégica próxima à PUC-Rio, Shopping da Gávea, Lagoa, Leblon e Jardim Botânico, com acesso privilegiado a cultura, gastronomia e serviços.

## Diferenciais

- Espaço de coworking
- Horta coletiva
- Entregue parcialmente mobiliado
- Eletrodomésticos inclusos
- Design arquitetônico contemporâneo
- Última unidade disponível

## Materiais Promocionais

| Material | Arquivo | Destino Storage |
|----------|---------|-----------------|
| Book Digital | `book_grid_DIGITAL-2.pdf` | `imoveis/grid-201/book-digital.pdf` |
| Estudo ROI | `Estudo_ROI_Grid-2.jpg` | `imoveis/grid-201/estudo-roi.jpg` |
| Tabela Vendas | `TABELA_DE_VENDAS_-_GRID_-_JANEIRO_26-2.pdf` | `imoveis/grid-201/tabela-vendas.pdf` |
| Planta Unidade | `GRID_UNIDADE_201-2.pdf` | `imoveis/grid-201/planta-unidade.pdf` |

## Imagem Principal

A imagem do empreendimento (`image-25.png`) será usada como imagem principal do imóvel.

## Vídeos

Os dois vídeos serão adicionados à galeria de vídeos do imóvel.

## Estrutura JSON materiais_promocionais

```json
{
  "bookDigital": {
    "url": "[URL do Storage]",
    "nome": "Book Digital - GRID Residencial",
    "tipo": "pdf"
  },
  "estudoRentabilidade": {
    "url": "[URL do Storage]",
    "nome": "Estudo de Rentabilidade Short Stay",
    "tipo": "image"
  },
  "tabelaVendas": {
    "url": "[URL do Storage]",
    "nome": "Tabela de Vendas - Janeiro 2026",
    "tipo": "pdf"
  },
  "plantaUnidade": {
    "url": "[URL do Storage]",
    "nome": "Planta Unidade 201 - 54,50m²",
    "tipo": "pdf"
  },
  "personalizacao": [
    { "titulo": "Armários", "disponivel": true },
    { "titulo": "Revestimentos", "disponivel": false },
    { "titulo": "Bancadas", "disponivel": false }
  ],
  "seguranca": [
    "Portaria 24 horas",
    "Câmeras de segurança",
    "Controle de acesso"
  ],
  "sustentabilidade": [
    "Sistema de reúso de água",
    "Iluminação LED nas áreas comuns",
    "Coleta seletiva"
  ],
  "infraestrutura": [
    "Espaço de coworking",
    "Horta coletiva",
    "Bicicletário"
  ]
}
```

## Etapas de Implementação

### Etapa 1: Upload dos Arquivos para Storage

Criar bucket `materiais-imoveis` (se não existir) e fazer upload de:
1. Imagem principal do empreendimento
2. Book Digital PDF
3. Estudo de Rentabilidade JPG
4. Tabela de Vendas PDF
5. Planta da Unidade PDF
6. 2 Vídeos promocionais

### Etapa 2: Inserir o Imóvel no Banco

```sql
INSERT INTO imoveis (
  construtora_id,
  titulo,
  headline,
  endereco,
  bairro,
  cidade,
  estado,
  valor,
  area_privativa,
  suites,
  banheiros,
  vagas,
  descricao,
  diferenciais,
  imagens,
  videos,
  status,
  template_escolhido,
  materiais_promocionais,
  flag_lancamento,
  flag_exclusividade
) VALUES (
  '8de22a19-9ce7-41a6-a1dc-deab3ad6d275',
  'GRID Residencial - Unidade 201',
  'Viva em harmonia no coração da Gávea',
  'Rua General Rabelo, 51',
  'Gávea',
  'Rio de Janeiro',
  'RJ',
  1400000,
  54.50,
  1,
  1,
  1,
  '[descrição completa]',
  '["Espaço de coworking", "Horta coletiva", ...]',
  '[{"url": "...", "isPrimary": true}]',
  '[{"url": "...", "tipo": "video/mp4"}]',
  'ativo',
  'moderno',
  '[JSON dos materiais]',
  true,
  true
);
```

### Etapa 3: Criar Acesso Público

```sql
INSERT INTO imobiliaria_imovel_access (
  imobiliaria_id,
  imovel_id,
  url_slug,
  status
) VALUES (
  '0808cf71-aa0c-4531-94f3-a3741a2efea0',
  '[ID do imóvel criado]',
  'grid-residencial-gavea-201',
  'active'
);
```

## Resultado Final

Após a implementação, você poderá acessar a página completa do imóvel em:

```
/imovel/grid-residencial-gavea-201
```

A página exibirá:

1. **Hero** com imagem principal e título
2. **Resumo** com preço, área e especificações
3. **Galeria de Vídeos** com os 2 vídeos promocionais
4. **Descrição** completa do empreendimento
5. **Book Digital** - Seção para abrir/baixar o PDF
6. **Estudo de Rentabilidade** - Imagem com zoom
7. **Tabela de Vendas** - Download do PDF
8. **Planta da Unidade** - Visualização da planta
9. **Infraestrutura** - Lista de amenidades
10. **Segurança** - Recursos de segurança
11. **Sustentabilidade** - Iniciativas sustentáveis
12. **Personalização** - Opções disponíveis

## Arquivos Necessários

| Ação | Arquivo |
|------|---------|
| Copiar para assets | `user-uploads://image-25.png` |
| Upload Storage | `user-uploads://book_grid_DIGITAL-2.pdf` |
| Upload Storage | `user-uploads://Estudo_ROI_Grid-2.jpg` |
| Upload Storage | `user-uploads://TABELA_DE_VENDAS_-_GRID_-_JANEIRO_26-2.pdf` |
| Upload Storage | `user-uploads://GRID_UNIDADE_201-2.pdf` |
| Upload Storage | `user-uploads://Cópia_de_GRID_-_Post_1080x1080_-_15seg.mp4` |
| Upload Storage | `user-uploads://Cópia_de_GRID_-_Storie_1080x1920_-_15seg_2.mp4` |

## Template Escolhido

O imóvel será criado com o template **Moderno** que combina bem com o estilo contemporâneo do GRID Residencial.

