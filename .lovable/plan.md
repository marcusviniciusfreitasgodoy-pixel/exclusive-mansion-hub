

## Plano: Resolver Findings de Seguranca Nivel "Error"

### Diagnostico

Os 2 findings de nivel "error" do scanner `supabase_lov` sao **falsos positivos**:

| Tabela | Finding | Realidade |
|---|---|---|
| `agendamentos_visitas` | "Publicly readable" | SELECT restrito a `authenticated` com filtro por `construtora_id` ou `imobiliaria_id` |
| `conversas_chatbot` | "Publicly readable" | SELECT restrito a `authenticated` com filtro por `construtora_id` ou `imobiliaria_id` |

Ambas as tabelas permitem INSERT publico (necessario para formularios e chatbot), mas **nenhum usuario anonimo consegue ler os dados**. O scanner provavelmente confundiu o INSERT publico com acesso de leitura.

### Acao

Como as policies ja estao corretas, a unica acao necessaria e **marcar os findings como falsos positivos verificados** no sistema de scan, com justificativa tecnica detalhada. Isso evita que aparecam novamente como pendencias.

Nenhuma migracao SQL ou alteracao de codigo sera necessaria.

### Detalhes Tecnicos

Sera utilizada a ferramenta de gestao de findings para atualizar os 2 registros:

1. **`agendamentos_visitas_public_exposure`** -- Marcar com `ignore: true` e justificativa: SELECT e exclusivamente para `authenticated` com validacao de ownership via `get_construtora_id()` / `get_imobiliaria_id()`.

2. **`conversas_chatbot_public_exposure`** -- Marcar com `ignore: true` e justificativa: SELECT e exclusivamente para `authenticated` com validacao de ownership.

