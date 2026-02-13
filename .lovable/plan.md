

## Plano: Corrigir 3 Itens de Seguranca Pendentes

---

### 1. `propostas_compra` -- Remover INSERT publico irrestrito (ERROR)

**Problema:** A policy `"Permitir insert publico propostas"` usa `WITH CHECK (true)`, permitindo que qualquer pessoa insira qualquer dado diretamente na tabela -- incluindo CPF/CNPJ, assinatura e dados financeiros falsos vinculados a qualquer construtora ou imobiliaria.

**Situacao atual:** O formulario de proposta ja usa a funcao RPC `submit_proposta_compra` (SECURITY DEFINER), que valida o token do feedback antes de inserir. Portanto, a policy de INSERT publico e **completamente desnecessaria** e so cria uma brecha.

**Correcao:** Remover a policy `"Permitir insert publico propostas"` da tabela `propostas_compra`. Os inserts continuam funcionando normalmente via RPC.

```sql
DROP POLICY IF EXISTS "Permitir insert publico propostas" ON public.propostas_compra;
```

**Impacto:** Nenhum. O formulario publico usa RPC, nao INSERT direto.

---

### 2. `leads` -- Validar que INSERT publico e seguro (ERROR)

**Problema identificado no scan:** Exposicao potencial de PII (email, telefone, orcamento).

**Analise:** A policy de INSERT ja valida que o imovel existe e esta ativo, e que a imobiliaria tem acesso ao imovel. As policies de SELECT sao restritas a construtoras e imobiliarias autenticadas. Nao ha SELECT publico.

**Correcao:** Nenhuma alteracao na tabela. Apenas registrar o finding como verificado e seguro no scan, com justificativa detalhada.

---

### 3. `whatsapp_messages` -- Verificar e adicionar policy de UPDATE para webhook (WARN)

**Problema:** O webhook do WhatsApp (`whatsapp-webhook/index.ts`) usa service role para atualizar status de mensagens (entregue, lido, falhou). As policies de INSERT sao restritas a usuarios autenticados. SELECT tambem e restrito. Nao ha policy de UPDATE nem DELETE.

**Analise:**
- INSERT: Restrito a construtoras/imobiliarias autenticadas (correto)
- SELECT: Restrito a construtoras/imobiliarias autenticadas (correto)
- UPDATE: Nao existe policy, mas o webhook usa service role (bypassa RLS) -- ok
- DELETE: Nao existe policy (correto -- mensagens nao devem ser excluidas)

**Correcao:** A tabela ja esta segura. Registrar como verificado no scan. O service role do webhook bypassa RLS por design.

---

### Resumo das Alteracoes

| Tabela | Acao | Risco Atual |
|---|---|---|
| `propostas_compra` | Remover policy INSERT publica | Alto -- qualquer pessoa pode inserir dados falsos |
| `leads` | Marcar como seguro no scan | Baixo -- INSERT validado, SELECT restrito |
| `whatsapp_messages` | Marcar como seguro no scan | Nenhum -- todas as policies estao corretas |

### Detalhes Tecnicos

**Arquivo alterado:** Nenhum arquivo de codigo. Apenas uma migracao SQL para remover a policy perigosa e atualizar os findings do scan.

**Migracao SQL:**
```sql
-- Remove the overly permissive INSERT policy on propostas_compra
-- Inserts are handled securely via the submit_proposta_compra RPC (SECURITY DEFINER)
DROP POLICY IF EXISTS "Permitir insert publico propostas" ON public.propostas_compra;
```

**Atualizacao dos findings:**
- `propostas_compra`: Deletar o finding apos correcao
- `leads`: Atualizar finding existente confirmando que as policies estao corretas
- `whatsapp_messages`: Atualizar finding confirmando seguranca

