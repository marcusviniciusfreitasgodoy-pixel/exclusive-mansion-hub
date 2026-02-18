

## Correcao: Finding de Nivel ERROR -- `agendamentos_visitas`

### Analise da Vulnerabilidade

O scanner reportou que a tabela `agendamentos_visitas` esta "publicamente legivel". Porem, ao inspecionar as politicas RLS reais no banco:

- **SELECT**: Duas politicas PERMISSIVAS, ambas restritas ao role `authenticated`, verificando `construtora_id = get_construtora_id(auth.uid())` e `imobiliaria_id = get_imobiliaria_id(auth.uid())`.
- **INSERT**: Uma politica permitindo insercao publica (role `{-}` = todos), condicionada a imovel ativo. Isso e necessario para o formulario publico de agendamento.
- **UPDATE**: Restrito a construtoras e imobiliarias autenticadas.
- **DELETE**: Nenhuma politica (ninguem pode deletar).

**Conclusao**: A tabela NAO e publicamente legivel. Usuarios anonimos nao conseguem fazer SELECT pois nao ha politica SELECT que os cubra. O finding e um falso positivo para a preocupacao de "leitura publica".

### Risco Real Identificado

Apesar de nao haver exposicao de leitura, ha um risco menor no INSERT publico: campos como `documento_identificacao_url`, `respostas_customizadas` e `observacoes` aceitam dados sem validacao de comprimento, similar ao que foi corrigido em `propostas_compra` e `feedbacks_visitas`.

### Plano de Acao

**Etapa 1 -- Adicionar validacao de texto na tabela `agendamentos_visitas`**

Criar um trigger de validacao (mesmo padrao ja usado em `propostas_compra` e `feedbacks_visitas`) para limitar comprimento de campos de PII:

- `cliente_nome`: max 200 caracteres
- `cliente_email`: max 255 caracteres
- `cliente_telefone`: max 20 caracteres
- `observacoes`: max 5000 caracteres
- `motivo_cancelamento`: max 2000 caracteres
- `corretor_nome`: max 200 caracteres
- `corretor_email`: max 255 caracteres

Isso sera feito ampliando a funcao `validate_text_length()` existente para cobrir a tabela `agendamentos_visitas`.

**Etapa 2 -- Marcar o finding como resolvido**

Atualizar o registro do scan com a justificativa tecnica de que:
1. SELECT ja esta restrito a authenticated + owner check
2. INSERT publico e necessario por design (formulario de agendamento)
3. Validacao de input adicionada via trigger

### Detalhes Tecnicos

**Uma migracao SQL** para:

```sql
-- Ampliar validate_text_length para agendamentos_visitas
CREATE OR REPLACE FUNCTION public.validate_text_length()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validacoes existentes para propostas_compra e feedbacks_visitas...
  -- (manter codigo atual)

  -- Nova validacao para agendamentos_visitas
  IF TG_TABLE_NAME = 'agendamentos_visitas' THEN
    IF length(COALESCE(NEW.cliente_nome, '')) > 200 THEN
      RAISE EXCEPTION 'cliente_nome excede 200 caracteres';
    END IF;
    IF length(COALESCE(NEW.cliente_email, '')) > 255 THEN
      RAISE EXCEPTION 'cliente_email excede 255 caracteres';
    END IF;
    IF length(COALESCE(NEW.cliente_telefone, '')) > 20 THEN
      RAISE EXCEPTION 'cliente_telefone excede 20 caracteres';
    END IF;
    IF length(COALESCE(NEW.observacoes, '')) > 5000 THEN
      RAISE EXCEPTION 'observacoes excede 5000 caracteres';
    END IF;
    IF length(COALESCE(NEW.motivo_cancelamento, '')) > 2000 THEN
      RAISE EXCEPTION 'motivo_cancelamento excede 2000 caracteres';
    END IF;
    IF length(COALESCE(NEW.corretor_nome, '')) > 200 THEN
      RAISE EXCEPTION 'corretor_nome excede 200 caracteres';
    END IF;
    IF length(COALESCE(NEW.corretor_email, '')) > 255 THEN
      RAISE EXCEPTION 'corretor_email excede 255 caracteres';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Aplicar trigger
CREATE TRIGGER validate_agendamentos_text
  BEFORE INSERT OR UPDATE ON public.agendamentos_visitas
  FOR EACH ROW EXECUTE FUNCTION public.validate_text_length();
```

**Nenhum arquivo de codigo modificado.**

