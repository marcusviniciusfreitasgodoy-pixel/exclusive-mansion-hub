

# Consolidar Secoes de Funcionalidades e Beneficios na Apresentacao

## Resumo
Unificar as secoes "Funcionalidades que transformam resultados" e "Para cada perfil, beneficios especificos" em uma unica secao organizada por funcionalidade, indicando visualmente qual publico (Construtora, Imobiliaria ou ambos) se beneficia de cada item. Isso elimina repeticoes e torna a pagina mais limpa e alinhada ao manual da marca (Navy #0C2340 + Gold #D4AF37).

## Estrutura da nova secao

**Titulo:** "Tudo o que voce precisa em uma unica plataforma"
**Subtitulo:** "Funcionalidades para Construtoras e Imobiliarias — sem repeticao, sem lacunas."

Cada card tera:
- Icone (estilo atual)
- Titulo da funcionalidade
- Descricao
- Badges indicando o publico: "Construtora", "Imobiliaria" ou ambos

### Lista consolidada (sem repeticoes):

| Funcionalidade | Publico |
|---|---|
| Links White-Label — Paginas personalizadas por imobiliaria com rastreamento individual | Imobiliaria |
| Analytics em Tempo Real — Funil de conversao, heatmap, metricas individuais por imovel | Ambos |
| CRM e Pipeline Visual — 8 etapas de venda, score de leads, historico de interacoes | Ambos |
| Agendamento Inteligente — Validacao de disponibilidade, identificacao por CNH, lembretes automaticos | Ambos |
| Feedback Digital de Visitas — NPS, assinatura digital, PDF com validade juridica | Ambos |
| Chatbot com IA — Assistente treinado na base de conhecimento para qualificacao 24/7 | Construtora |
| Efeito UAU — Ranking dos aspectos que mais impressionam visitantes, com graficos de satisfacao | Ambos |
| Gestao de Parceiros — Visao consolidada de todas as imobiliarias e suas metricas | Construtora |
| Relatorios e Exportacao — PDF profissional para proprietarios e clientes | Ambos |
| Seguranca Juridica — Relatorio de visita com assinatura digital e rastreabilidade | Imobiliaria |

## Detalhes Tecnicos

### Arquivo: `src/pages/Apresentacao.tsx`

1. **Remover** o array `FEATURES` (linhas 17-53)
2. **Criar** um novo array `PLATFORM_FEATURES` com os campos: `icon`, `title`, `desc`, `audience` (array de `'construtora' | 'imobiliaria'`)
3. **Substituir** as duas secoes (linhas 149-237) por uma unica secao que renderiza os cards com badges de publico
4. Os badges usarao as cores da marca:
   - "Construtora" — fundo Navy (`bg-primary text-primary-foreground`)
   - "Imobiliaria" — fundo Gold (`bg-secondary text-secondary-foreground`)

### Nenhum arquivo novo, nenhuma dependencia nova

