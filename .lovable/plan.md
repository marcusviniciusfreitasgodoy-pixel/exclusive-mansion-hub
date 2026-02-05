
# Plano: HeyGen LiveAvatar Exclusivo para Casa Malibu

## Objetivo
Adicionar o avatar visual interativo da HeyGen apenas na página da **Casa Triplex no Condomínio Malibu**, mantendo o avatar estático padrão para os demais imóveis.

## Identificação do Imóvel
- **Título:** Casa Triplex no Condomínio Malibu
- **ID:** `996ec17b-a35c-4070-b74e-63194b5096a8`

## Alterações Necessárias

### 1. Criar Componente HeyGenAvatar
**Arquivo:** `src/components/property/HeyGenAvatar.tsx`

Componente encapsulado para o iframe do LiveAvatar:
- Aspect ratio 16:9 responsivo
- Permissão de microfone habilitada
- Estilização integrada com o design atual

### 2. Atualizar SofiaAssistentSection
**Arquivo:** `src/components/property/SofiaAssistentSection.tsx`

Adicionar lógica condicional baseada no `imovelId`:

```text
SE imovelId === "996ec17b-a35c-4070-b74e-63194b5096a8"
  → Renderiza HeyGenAvatar (iframe visual animado)
SENÃO
  → Renderiza avatar estático padrão (círculo com "S")
```

## Código Proposto

### HeyGenAvatar.tsx (Novo arquivo)
```typescript
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface HeyGenAvatarProps {
  agentId?: string;
  className?: string;
}

const DEFAULT_AGENT_ID = "2f42c097-5fdf-4e1c-9b3e-263c5652e92e";

export function HeyGenAvatar({ 
  agentId = DEFAULT_AGENT_ID, 
  className 
}: HeyGenAvatarProps) {
  return (
    <div className={className}>
      <AspectRatio ratio={16 / 9}>
        <iframe
          src={`https://embed.liveavatar.com/v1/${agentId}`}
          allow="microphone"
          title="Assistente Virtual Sofia"
          className="w-full h-full rounded-2xl shadow-2xl border-2 border-accent/20"
        />
      </AspectRatio>
    </div>
  );
}
```

### SofiaAssistentSection.tsx (Edição)
Substituir o bloco do avatar (linhas 108-135) por renderização condicional:

```typescript
// ID do imóvel Casa Malibu
const MALIBU_PROPERTY_ID = "996ec17b-a35c-4070-b74e-63194b5096a8";
const showHeyGenAvatar = imovelId === MALIBU_PROPERTY_ID;

// Na renderização:
{showHeyGenAvatar ? (
  <div className="order-1 lg:order-2 flex justify-center">
    <div className="relative w-full max-w-md lg:max-w-lg">
      <HeyGenAvatar />
      <div className="absolute -top-2 -right-2 bg-green-600 ...">
        Online
      </div>
    </div>
  </div>
) : (
  // Avatar estático atual (círculo com S)
  <div className="order-1 lg:order-2 ...">
    ...código existente...
  </div>
)}
```

## Resumo de Arquivos

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/property/HeyGenAvatar.tsx` | Criar | Componente do iframe HeyGen |
| `src/components/property/SofiaAssistentSection.tsx` | Editar | Renderização condicional por imovelId |

## Resultado Final
- **Casa Malibu**: Avatar visual animado da HeyGen (iframe interativo)
- **Demais imóveis**: Avatar estático padrão (círculo com "S")
- Chatbot de texto/voz funciona normalmente em ambos os casos
