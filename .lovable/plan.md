
# Plano: Criar Página de Leads para Imobiliária

## Problema Identificado
A rota `/dashboard/imobiliaria/leads` aparece no menu lateral "Meus Leads", porém:
- A página correspondente não existe
- A rota não está configurada no sistema de rotas

## Solução

### 1. Criar a Página de Leads da Imobiliária
Criar o arquivo `src/pages/dashboard/imobiliaria/Leads.tsx` com funcionalidades:

- **Listagem de Leads**: Exibir todos os leads vinculados à imobiliária logada
- **Filtros**: Por status, por imóvel, por período (7/30/90 dias)
- **Busca**: Por nome, e-mail ou telefone
- **Cards de Resumo**:
  - Total de leads
  - Leads novos (últimas 24h)
  - Taxa de conversão
- **Tabela de Leads**: Com colunas de data, nome, e-mail, telefone, imóvel, status
- **Ações Rápidas**:
  - Atualizar status do lead
  - Copiar e-mail
  - Abrir WhatsApp
  - Ver detalhes
- **Exportar CSV**: Download dos leads filtrados
- **Modal de Detalhes**: Visualização completa das informações do lead

### 2. Configurar a Rota no App.tsx
Adicionar no arquivo `src/App.tsx`:
- Import lazy do componente
- Rota protegida para perfil `imobiliaria`

---

## Detalhes Técnicos

### Estrutura de Dados (já existente)
A tabela `leads` possui:
- `imobiliaria_id` - filtragem por imobiliária
- `imovel_id` - referência ao imóvel
- `access_id` - referência ao link white-label
- `status` - enum com valores: novo, contatado, qualificado, visita_agendada, perdido
- `origem` - origem do lead

### Queries Supabase
```text
1. Buscar leads da imobiliária:
   SELECT * FROM leads WHERE imobiliaria_id = {id}
   
2. Contar leads novos (24h):
   SELECT COUNT(*) FROM leads 
   WHERE imobiliaria_id = {id} AND status = 'novo' 
   AND created_at >= now() - interval '1 day'
```

### Arquivos a Criar/Modificar
| Arquivo | Ação |
|---------|------|
| `src/pages/dashboard/imobiliaria/Leads.tsx` | Criar |
| `src/App.tsx` | Adicionar rota e import |

### Componentes Reutilizados
- `DashboardLayout` - Layout padrão do dashboard
- Componentes UI: Card, Table, Badge, Select, Input, Dialog, DropdownMenu
- Hooks: `useAuth`, `useToast`, `useQuery`, `useMutation`

### Diferenças em Relação ao Leads da Construtora
A página da imobiliária filtra diretamente por `imobiliaria_id`, enquanto a da construtora busca por todos os imóveis vinculados à construtora. A estrutura visual será similar para manter consistência.
