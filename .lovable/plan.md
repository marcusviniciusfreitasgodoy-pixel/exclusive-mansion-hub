

## Ajustes para Link Direto: Leads, Agendamentos e Chatbot

### Resumo

A funcionalidade de link direto da construtora ja esta implementada e funciona para a maioria dos cenarios. Porem, ha um problema tecnico em alguns componentes que passam `imobiliariaId` como string vazia (`""`) ao inves de `null`, o que pode causar erros de chave estrangeira no banco de dados.

### O que ja funciona corretamente

- **Leads via formulario de contato** -- Ja converte string vazia para `null` antes de inserir
- **Pageviews** -- Ja trata corretamente com `|| null`
- **Notificacoes por email** -- A construtora ja recebe o email de novo lead; a imobiliaria so recebe se houver email configurado
- **Dashboard de Leads da construtora** -- Consulta por `imovel_id` (via imoveis da construtora), entao leads de links diretos aparecem normalmente
- **Pipeline/CRM** -- Funciona da mesma forma, baseado nos imoveis da construtora
- **Analytics** -- Pageviews com `imobiliaria_id = null` sao contabilizados como "Trafego Direto"

### Problemas encontrados (bugs a corrigir)

#### 1. AgendarVisitaModal -- imobiliaria_id recebe string vazia

No arquivo `src/components/property/AgendarVisitaModal.tsx` (linha 232), o `imobiliariaId` e inserido diretamente sem conversao. Quando vem de um link direto, o valor e `""` (string vazia), o que causa erro de chave estrangeira.

**Correcao:** Trocar `imobiliaria_id: imobiliariaId` por `imobiliaria_id: imobiliariaId || null`

#### 2. ChatbotWidget -- imobiliaria_id recebe string vazia

No arquivo `src/components/chatbot/ChatbotWidget.tsx` (linha 174), mesmo problema. O `imobiliariaId` e passado diretamente na insercao da tabela `conversas_chatbot`.

**Correcao:** Trocar `imobiliaria_id: imobiliariaId` por `imobiliaria_id: imobiliariaId || null`

#### 3. send-visit-notification -- imobiliariaId pode ser string vazia

A edge function recebe `imobiliariaId` no body e pode tentar buscar dados de imobiliaria com string vazia.

**Correcao:** Adicionar tratamento `const effectiveImobiliariaId = body.imobiliariaId || null` no inicio da funcao.

### Detalhes Tecnicos

**Arquivos modificados:**
- `src/components/property/AgendarVisitaModal.tsx` -- converter `imobiliariaId` vazio para `null` na insercao
- `src/components/chatbot/ChatbotWidget.tsx` -- converter `imobiliariaId` vazio para `null` na insercao
- `supabase/functions/send-visit-notification/index.ts` -- tratar `imobiliariaId` vazio

**Nenhum arquivo novo. Nenhuma migration. Nenhuma dependencia adicional.**

### Resultado final

Apos essas correcoes, a construtora sem imobiliarias parceiras tera acesso completo a:
- Recebimento de leads (formulario + chatbot)
- Notificacoes por email de novos leads
- Agendamento de visitas pelos clientes
- Metricas de visualizacoes e leads no dashboard
- Pipeline/CRM com todos os leads
- Analytics consolidado (leads diretos aparecem como "Trafego Direto")
- Chatbot Sofia funcionando normalmente

