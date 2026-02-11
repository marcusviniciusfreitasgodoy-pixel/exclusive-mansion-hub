
## Adicionar Criacao Manual de Agendamento e Fichas de Visita Avulsa

### Analise Comparativa: O que ja existe vs. O que falta

| Funcionalidade | Status Atual |
|---|---|
| Tabela `agendamentos_visitas` | Existe |
| Tabela `disponibilidade_corretor` + `bloqueios_agenda` | Existe |
| Modal publico de agendamento (cliente via pagina do imovel) | Existe |
| Listagem/gestao de agendamentos (imobiliaria) | Existe |
| Dashboard de visitas (construtora) | Existe |
| Configurar agenda (imobiliaria) | Existe |
| **Criacao manual de agendamento pelo corretor/imobiliaria** | **NAO EXISTE** |
| **Tabela `fichas_visita`** | **NAO EXISTE** |
| **Formulario de ficha avulsa** | **NAO EXISTE** |
| **Criar ficha a partir de agendamento existente** | **NAO EXISTE** |

### Plano de Implementacao

#### 1. Migracao de Banco de Dados

Criar a tabela `fichas_visita` com os campos do plano fornecido, adaptados ao modelo existente (usando `imobiliaria_id` e `construtora_id` em vez de `organization_id`/`profiles`):

- `id`, `codigo` (unico, gerado automaticamente)
- Dados do visitante: `nome_visitante`, `cpf_visitante`, `telefone_visitante`, `email_visitante`, `rg_visitante`, `endereco_visitante`
- `acompanhantes` (JSONB)
- Dados do imovel: `imovel_id` (FK opcional para imoveis), `endereco_imovel`, `condominio_edificio`, `unidade_imovel`, `valor_imovel`, `nome_proprietario`
- Intermediacao: `corretor_nome`, `data_visita`, `status`, `notas`
- Assinaturas: `assinatura_visitante`, `assinatura_corretor`
- `aceita_ofertas_similares` (boolean)
- `imobiliaria_id`, `construtora_id`
- `agendamento_visita_id` (FK opcional - para fichas criadas a partir de agendamento)
- Timestamps

RLS: imobiliaria ve apenas suas fichas, construtora ve fichas dos seus imoveis.

Funcao SQL `generate_visit_code()` para gerar codigos unicos tipo `VIS-20260211-A3F2`.

#### 2. Botao "Nova Visita" na pagina de Agendamentos da Imobiliaria

Adicionar um botao no topo da pagina `src/pages/dashboard/imobiliaria/Agendamentos.tsx` que abre um modal/dialog com formulario para criar agendamento manualmente. Campos:

- Cliente: Nome, Telefone, Email
- Imovel: Select dos imoveis com acesso ativo
- Data/Horario: Usando o calendario inteligente ja existente (slots da disponibilidade)
- Corretor: Nome e email (texto livre)
- Observacoes
- Status inicial: `confirmado` (ja que e o corretor criando diretamente)

Ao salvar, insere na tabela `agendamentos_visitas` existente.

#### 3. Botao "Nova Ficha" na pagina de Agendamentos da Imobiliaria

Adicionar botao que abre um formulario completo para criar uma ficha de visita avulsa (sem agendamento previo). Dividido em 3 secoes:

**Secao 1 - Identificacao do Cliente:**
Nome, CPF, RG, Telefone, Email, Endereco, Acompanhantes (ate 2, dinamicos)

**Secao 2 - Identificacao do Imovel:**
Imovel (select ou endereco livre), Condominio/Edificio, Unidade, Proprietario, Valor

**Secao 3 - Intermediacao:**
Corretor, Data/Hora, Notas, Aceita ofertas similares (LGPD)

Gera codigo automatico e salva na tabela `fichas_visita`.

#### 4. Botao "Criar Ficha" no card de agendamento realizado

Nos agendamentos com status `realizado`, adicionar botao para criar uma ficha de visita pre-preenchida com os dados do agendamento (nome, telefone, email, imovel). O corretor completa os campos faltantes (CPF, assinaturas, etc).

#### 5. Aba "Fichas" na pagina de Agendamentos da Imobiliaria

Adicionar uma nova aba que lista todas as fichas de visita da imobiliaria, com:
- Cards com status, dados do visitante e imovel
- Filtro por status
- Botao para ver detalhes e editar

### Detalhes Tecnicos

**Arquivos a criar:**
- `supabase/migrations/XXXX_create_fichas_visita.sql` - Tabela + RLS + funcao de codigo

**Arquivos a modificar:**
- `src/pages/dashboard/imobiliaria/Agendamentos.tsx` - Adicionar botoes "Nova Visita" e "Nova Ficha", aba "Fichas", modais de criacao
- `src/integrations/supabase/types.ts` - Sera atualizado automaticamente

**Dependencias:** Nenhuma nova. Usa react-hook-form, zod, date-fns, lucide-react e componentes shadcn/ui ja instalados.
