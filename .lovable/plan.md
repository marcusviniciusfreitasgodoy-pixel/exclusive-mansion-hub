
# Plano: Corrigir Edição de Imóvel da Construtora

## Diagnóstico

Após análise detalhada, verifiquei que o problema de campos vazios na edição **afeta apenas o fluxo da construtora**, não das imobiliárias.

### Por que apenas a Construtora?
| Fluxo | Página | Problema? | Motivo |
|-------|--------|-----------|--------|
| Construtora | `EditarImovel.tsx` | **Sim** | Usa wizard Steps com `useForm` + `defaultValues` fixos na inicialização |
| Imobiliária | `Configuracoes.tsx` | Não | Usa `form.reset()` no `useEffect` (abordagem correta) |
| Imobiliária | `EditarFormulario.tsx` | Não | Usa `useState` + `setCampos` (atualiza dinamicamente) |

### Causa Raiz no EditarImovel.tsx
Os componentes Step1, Step2, Step3, Step4 usam `useForm` do React Hook Form com `defaultValues` que são definidos **apenas na montagem do componente**. Quando as props `defaultValues` mudam depois do carregamento assíncrono, os formulários já estão inicializados com valores vazios.

```text
Fluxo Atual (Problemático):
1. EditarImovel renderiza -> formData = {}
2. Steps são montados -> useForm inicializa com {}
3. Query carrega imóvel do banco
4. useEffect popula formData com dados do imóvel
5. Mas os forms já estão inicializados com valores vazios
```

## Solução

Aguardar o carregamento completo dos dados **antes** de renderizar os componentes de Step. Assim, quando os formulários forem inicializados, receberão os valores corretos.

### Alterações no EditarImovel.tsx

```text
1. Adicionar estado isDataLoaded inicializado como false
2. No useEffect que popula formData, definir isDataLoaded = true ao final
3. Exibir loading spinner enquanto isLoading || !isDataLoaded
4. Renderizar Steps apenas quando dados estiverem prontos
```

### Código a Implementar

```typescript
// Novo estado
const [isDataLoaded, setIsDataLoaded] = useState(false);

// Atualizar useEffect existente (linhas 43-74)
useEffect(() => {
  if (imovel) {
    // ... mapeamento existente mantido ...
    setFormData(mapped);
    setIsDataLoaded(true);  // <- Adicionar
  }
}, [imovel]);

// Condição de loading atualizada
if (isLoading || !isDataLoaded) {
  return (
    <DashboardLayout title="Carregando...">
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </DashboardLayout>
  );
}
```

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/dashboard/construtora/EditarImovel.tsx` | Adicionar controle `isDataLoaded` para aguardar carregamento |

## Benefícios

- Solução simples e localizada (não altera os componentes Step)
- Garante que os formulários sempre iniciem com dados corretos do banco
- Mantém compatibilidade com o fluxo de criação de novo imóvel
- Melhora a experiência do usuário com feedback visual de carregamento

## Validação

Após implementação, testar:
1. Acessar a edição de um imóvel existente
2. Verificar se todos os campos aparecem preenchidos corretamente
3. Confirmar que todas as etapas (1-5) mostram os dados salvos
4. Testar que imagens, vídeos e documentos aparecem na etapa de mídias
