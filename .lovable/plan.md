
# Plano: Restringir Campo "Contexto para Sofia" ao Desenvolvedor

## Objetivo

O campo "Contexto Adicional para Sofia (IA)" será visível e editável **apenas** para usuários autorizados que inserirem a senha de desenvolvedor. Construtoras e imobiliárias regulares não verão este campo.

## Abordagem Escolhida

Implementar **verificação por senha de desenvolvedor** que o usuário pode digitar ao acessar o Step 3. Uma vez autenticado na sessão, o campo ficará visível.

```
Fluxo Normal (sem senha):
┌─────────────────────────────────────────┐
│  📝 Descrição do Imóvel                 │
│                                         │
│  Descrição Geral *                      │
│  Diferenciais Exclusivos *              │
│  Memorial Descritivo                    │
│  Condições de Pagamento                 │
│                                         │
│  ❌ Campo Sofia NÃO VISÍVEL             │
└─────────────────────────────────────────┘

Fluxo Desenvolvedor (com senha):
┌─────────────────────────────────────────┐
│  📝 Descrição do Imóvel                 │
│                                         │
│  Descrição Geral *                      │
│  Diferenciais Exclusivos *              │
│  Memorial Descritivo                    │
│  Condições de Pagamento                 │
│                                         │
│  🔓 [Desbloquear área Dev] ← Botão      │
│                                         │
│  ✅ Campo Sofia VISÍVEL após senha      │
└─────────────────────────────────────────┘
```

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/wizard/Step3Description.tsx` | Adicionar lógica de verificação de senha e renderização condicional |

## Implementação Detalhada

### 1. Adicionar Estado e Constante de Senha

```typescript
// Senha do desenvolvedor (pode ser movida para .env futuramente)
const DEVELOPER_PASSWORD = "sofia2024dev";

// Estados
const [isDevUnlocked, setIsDevUnlocked] = useState(false);
const [showPasswordDialog, setShowPasswordDialog] = useState(false);
const [passwordInput, setPasswordInput] = useState('');
const [passwordError, setPasswordError] = useState('');
```

### 2. Função de Verificação

```typescript
const handleUnlockDev = () => {
  if (passwordInput === DEVELOPER_PASSWORD) {
    setIsDevUnlocked(true);
    setShowPasswordDialog(false);
    setPasswordError('');
    // Persiste na sessão
    sessionStorage.setItem('dev_unlocked', 'true');
  } else {
    setPasswordError('Senha incorreta');
  }
};
```

### 3. Verificação na Montagem

```typescript
useEffect(() => {
  // Verificar se já foi desbloqueado na sessão
  const unlocked = sessionStorage.getItem('dev_unlocked');
  if (unlocked === 'true') {
    setIsDevUnlocked(true);
  }
}, []);
```

### 4. UI Condicional

```tsx
{/* Seção Desenvolvedor - Apenas se autenticado */}
{isDevUnlocked ? (
  <Card className="border-primary/20 bg-primary/5">
    <CardContent className="pt-6">
      {/* Campo contextoAdicionalIA existente */}
    </CardContent>
  </Card>
) : (
  <Card className="border-dashed border-muted">
    <CardContent className="pt-6 text-center">
      <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground mb-3">
        Área restrita ao desenvolvedor
      </p>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setShowPasswordDialog(true)}
      >
        <Key className="h-4 w-4 mr-2" />
        Desbloquear
      </Button>
    </CardContent>
  </Card>
)}
```

### 5. Dialog de Senha

```tsx
<Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
  <DialogContent className="sm:max-w-[400px]">
    <DialogHeader>
      <DialogTitle>Acesso Desenvolvedor</DialogTitle>
      <DialogDescription>
        Digite a senha para acessar o campo de contexto da IA
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <Input
        type="password"
        placeholder="Senha do desenvolvedor"
        value={passwordInput}
        onChange={(e) => setPasswordInput(e.target.value)}
      />
      {passwordError && (
        <p className="text-sm text-destructive">{passwordError}</p>
      )}
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
        Cancelar
      </Button>
      <Button onClick={handleUnlockDev}>
        Desbloquear
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Correção Adicional: Salvamento no NovoImovel.tsx

Como identificado anteriormente, também é necessário adicionar os campos `condicoes_pagamento` e `contexto_adicional_ia` ao objeto de inserção:

**Arquivo**: `src/pages/dashboard/construtora/NovoImovel.tsx`

```typescript
// Linha ~160, adicionar ao imovelData:
condicoes_pagamento: formData.condicoesPagamento || null,
contexto_adicional_ia: formData.contextoAdicionalIA || null,
```

## Segurança

| Aspecto | Implementação |
|---------|---------------|
| Senha hardcoded | Armazenada no código, pode ser movida para variável de ambiente |
| Persistência | `sessionStorage` - válido apenas na aba atual |
| Visibilidade | Campo oculto por padrão, mesmo dados existentes não aparecem |
| Salvamento | Dados são salvos independentemente da visualização |

## Resultado Esperado

1. Usuários regulares não verão o campo "Contexto para Sofia"
2. Ao clicar em "Desbloquear", aparece dialog pedindo senha
3. Com senha correta, campo fica visível para edição
4. Estado persiste durante a sessão do navegador
5. Dados são salvos corretamente no banco de dados

## Componentes Utilizados

- `Dialog` (Radix UI) - Para o modal de senha
- `Lock`, `Key` (Lucide) - Ícones visuais
- `sessionStorage` - Persistência temporária
