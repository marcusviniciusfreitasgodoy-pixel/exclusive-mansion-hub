

## Plano: Desabilitar Exposicao do Schema OpenAPI (PostgREST)

### Problema

O endpoint raiz da API REST (`/rest/v1/`) expoe a estrutura completa do banco de dados -- nomes de tabelas, colunas, tipos e relacionamentos. Qualquer pessoa com a chave anonima (publica) pode ver esse "mapa" e planejar ataques direcionados.

### Correcao

**Etapa unica -- Migracao SQL**

Executar a seguinte migracao para desabilitar o modo OpenAPI do PostgREST:

```sql
ALTER ROLE authenticator SET pgrst.openapi_mode = 'disabled';
NOTIFY pgrst, 'reload config';
```

Isso faz com que o endpoint `/rest/v1/` retorne uma resposta vazia em vez do schema completo. Todas as operacoes normais de CRUD via Supabase client continuam funcionando normalmente -- apenas a auto-documentacao e desabilitada.

### Impacto

- **Sem impacto no app**: O codigo do projeto usa apenas o Supabase JS client para queries tipadas. Nenhum componente depende do endpoint OpenAPI.
- **Sem impacto em Edge Functions**: As funcoes usam o client Supabase, nao o endpoint de schema.
- **Reversivel**: Caso necessario, basta executar `ALTER ROLE authenticator SET pgrst.openapi_mode = 'follow-privileges';` para restaurar.

### Detalhes Tecnicos

**Nenhum arquivo de codigo modificado.**

**Uma migracao SQL necessaria** com os dois comandos acima.

