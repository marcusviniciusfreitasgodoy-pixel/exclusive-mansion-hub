
# Corrigir Link "Voltar para o site" na Página de Login

## Problema Identificado
O link "Voltar para o site" na página de login aponta para `/`, que redireciona de volta para `/login`, criando um loop circular.

## Solução
Alterar o link para apontar diretamente para a landing page do imóvel: `/imovel/cobertura-lucio-costa-godoyprime`

## Alteração

### Arquivo: `src/pages/auth/Login.tsx`

**Linha 145** - Alterar o destino do Link:

```tsx
// De:
<Link to="/" className="hover:text-primary">
  ← Voltar para o site
</Link>

// Para:
<Link to="/imovel/cobertura-lucio-costa-godoyprime" className="hover:text-primary">
  ← Voltar para o site
</Link>
```

---

## Detalhes Técnicos
- Alteração mínima: apenas 1 linha modificada
- Sem impacto em outras funcionalidades
- O link levará o usuário diretamente para a landing page white-label do imóvel principal
