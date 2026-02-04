
# Plano: Implementar Campo CEP com Formatação e Busca de Endereço

## Funcionalidades a Implementar

| Funcionalidade | Descrição |
|----------------|-----------|
| Máscara de entrada | Formatação automática no padrão 00000-000 |
| Busca de endereço | Integração com API ViaCEP para preencher campos automaticamente |
| Validação | Verificar se o CEP tem formato válido |
| Feedback visual | Indicador de carregamento durante a busca |

## API Utilizada

A **ViaCEP** é uma API pública brasileira gratuita que não requer autenticação:
- URL: `https://viacep.com.br/ws/{cep}/json/`
- Retorna: logradouro, bairro, localidade (cidade), uf (estado)

## Alterações no Arquivo

**Arquivo**: `src/components/wizard/Step1BasicInfo.tsx`

### 1. Adicionar Estados para Controle

```text
- isLoadingCep: boolean → Indica quando está buscando dados
- cepError: string | null → Mensagem de erro se CEP inválido
```

### 2. Criar Funções Auxiliares

```text
formatCep(value: string): string
  - Remove caracteres não numéricos
  - Adiciona hífen após o 5º dígito
  - Retorna no formato 00000-000

fetchAddressByCep(cep: string): Promise
  - Limpa CEP (remove hífen)
  - Verifica se tem 8 dígitos
  - Chama API ViaCEP
  - Preenche campos: endereco, bairro, cidade, estado
```

### 3. Atualizar Validação Zod

```typescript
cep: z.string()
  .optional()
  .refine(
    (val) => !val || /^\d{5}-?\d{3}$/.test(val),
    { message: 'CEP inválido (formato: 00000-000)' }
  ),
```

### 4. Modificar Campo CEP no Formulário

```text
- Adicionar máscara de formatação no onChange
- Chamar busca de endereço quando CEP tiver 9 caracteres (00000-000)
- Exibir loading spinner durante a busca
- Mostrar mensagem de erro se CEP não encontrado
```

## Fluxo de Uso

```text
1. Usuário digita CEP: "22630010"
2. Sistema formata automaticamente: "22630-010"
3. Ao completar 9 caracteres, sistema busca na API ViaCEP
4. Se encontrado:
   - Preenche automaticamente: Rua, Bairro, Cidade, Estado
   - Usuário pode ajustar se necessário
5. Se não encontrado:
   - Mostra mensagem "CEP não encontrado"
   - Mantém campos editáveis para preenchimento manual
```

## Exemplo Visual

```text
┌─────────────────────────────────────────┐
│  CEP                                    │
│  ┌─────────────────┐                    │
│  │ 22630-010   🔄  │  ← Loading spinner │
│  └─────────────────┘                    │
│  ✓ Endereço encontrado e preenchido!   │
│                                         │
│  Rua/Avenida *                          │
│  ┌─────────────────────────────────────┐│
│  │ Avenida Lúcio Costa                 ││  ← Preenchido
│  └─────────────────────────────────────┘│
│                                         │
│  Bairro *           Cidade *            │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │ Barra da     │  │ Rio de Janeiro   │ │  ← Preenchido
│  │ Tijuca       │  │                  │ │
│  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────┘
```

## Detalhes Técnicos

### Ordem dos Campos Atualizada

Para melhor UX, o CEP será movido para ser o **primeiro campo de endereço**:

```text
Antes: Rua → Número → Complemento → Bairro → CEP → Cidade → Estado
Depois: CEP → Rua → Número → Complemento → Bairro → Cidade → Estado
```

### Armazenamento no Banco

O CEP será armazenado **com hífen** (formato 00000-000) no campo `text` existente.

### Código da Busca

```typescript
const fetchAddressByCep = async (cep: string) => {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return;
  
  setIsLoadingCep(true);
  setCepError(null);
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      setCepError('CEP não encontrado');
      return;
    }
    
    // Preenche os campos automaticamente
    form.setValue('endereco', data.logradouro || '');
    form.setValue('bairro', data.bairro || '');
    form.setValue('cidade', data.localidade || '');
    form.setValue('estado', data.uf || '');
  } catch {
    setCepError('Erro ao buscar CEP');
  } finally {
    setIsLoadingCep(false);
  }
};
```

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/wizard/Step1BasicInfo.tsx` | Adicionar formatação, validação e busca de CEP |

## Resultado Esperado

- Campo CEP com máscara automática 00000-000
- Busca automática de endereço ao digitar CEP completo
- Preenchimento automático de Rua, Bairro, Cidade e Estado
- Validação visual com feedback de sucesso ou erro
- Dados armazenados corretamente no banco
