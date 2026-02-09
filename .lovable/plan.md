
## Implementar Suporte a Dominios Customizados

### Visao Geral

Cada construtora e imobiliaria podera configurar seu proprio dominio customizado (ex: `imoveis.construtoraxyz.com.br`) apontando via CNAME para a plataforma. Quando um visitante acessar esse dominio, a aplicacao detecta automaticamente qual empresa e proprietaria e exibe o conteudo adequado.

### Como Funciona para o Usuario

1. A construtora/imobiliaria acessa **Configuracoes** no dashboard
2. Insere o dominio desejado (ex: `imoveis.minhaempresa.com.br`)
3. O sistema exibe instrucoes de DNS: criar um registro CNAME apontando para `whitelabel.godoyprime.com.br`
4. Apos configurar o DNS, o status e verificado automaticamente
5. Visitantes que acessam o dominio customizado veem o conteudo da empresa

### Alteracoes no Banco de Dados

**Tabela `imobiliarias`** - Adicionar coluna:
- `dominio_customizado` (text, nullable, unique) - a tabela `construtoras` ja possui esta coluna

**Nova tabela `custom_domains`** - Registro centralizado de dominios:
- `id` (uuid, PK)
- `domain` (text, unique, not null) - o dominio configurado
- `entity_type` (text, not null) - 'construtora' ou 'imobiliaria'
- `entity_id` (uuid, not null) - ID da construtora ou imobiliaria
- `status` (text, default 'pending') - 'pending', 'verified', 'active', 'failed'
- `verified_at` (timestamptz, nullable)
- `created_at` (timestamptz, default now())
- RLS: leitura publica (para resolucao de dominio), escrita restrita ao proprietario

### Alteracoes no Frontend

**1. Hook `useDomainResolver` (novo)**
- Detecta o hostname atual (`window.location.hostname`)
- Se nao for o dominio principal da plataforma, consulta a tabela `custom_domains`
- Retorna o tipo e ID da entidade proprietaria do dominio
- Armazena em cache para evitar consultas repetidas

**2. Componente `DomainRouter` (novo)**
- Wrapper no `App.tsx` que usa o `useDomainResolver`
- Se um dominio customizado for detectado:
  - Para **imobiliarias**: redireciona para listagem de imoveis disponiveis daquela imobiliaria
  - Para **construtoras**: exibe pagina institucional/portfolio da construtora
- Se nao for dominio customizado, usa o roteamento normal

**3. Pagina de Configuracoes da Construtora** (`Configuracoes.tsx`)
- Novo card "Dominio Customizado" com:
  - Campo para inserir o dominio
  - Instrucoes de DNS (CNAME para `whitelabel.godoyprime.com.br`)
  - Indicador de status (pendente/verificado/ativo)
  - Botao "Verificar DNS"

**4. Pagina de Configuracoes da Imobiliaria** (`Configuracoes.tsx`)
- Mesmo card de dominio customizado adaptado para imobiliarias

**5. Edge Function `verify-domain` (nova)**
- Recebe o dominio como parametro
- Faz lookup DNS para verificar se o CNAME aponta corretamente
- Atualiza o status na tabela `custom_domains`

**6. Pagina publica por dominio customizado**
- Quando acessado via dominio de imobiliaria: lista os imoveis vinculados com branding da imobiliaria
- Quando acessado via dominio de construtora: mostra portfolio de imoveis com branding da construtora

### Detalhes Tecnicos

**Resolucao de dominio (frontend):**
```text
Visitante acessa imoveis.empresa.com.br
        |
        v
App detecta hostname != dominio principal
        |
        v
Consulta custom_domains WHERE domain = hostname
        |
        v
Retorna entity_type + entity_id
        |
        v
Renderiza conteudo da entidade com branding
```

**Instrucoes DNS exibidas ao usuario:**
- Tipo: CNAME
- Nome: subdominio escolhido (ex: `imoveis`)
- Valor: `whitelabel.godoyprime.com.br`
- TTL: 3600

**Dominios da plataforma (ignorados na resolucao):**
- `localhost`
- `*.lovable.app`
- `whitelabel.godoyprime.com.br`

**Arquivos a criar:**
- `src/hooks/useDomainResolver.ts`
- `src/components/dashboard/DomainConfigCard.tsx`
- `supabase/functions/verify-domain/index.ts`

**Arquivos a modificar:**
- `src/App.tsx` - integrar DomainRouter
- `src/pages/dashboard/construtora/Configuracoes.tsx` - adicionar card de dominio
- `src/pages/dashboard/imobiliaria/Configuracoes.tsx` - adicionar card de dominio
