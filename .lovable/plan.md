

## Ficha de Visita com Assinatura Digital - Funcionalidades Faltantes

### O que ja existe

| Funcionalidade | Status |
|---|---|
| Tabela `fichas_visita` com colunas `assinatura_visitante` e `assinatura_corretor` | Existe |
| Funcao `generate_visit_code()` | Existe |
| Modal de criacao `NovaFichaModal` | Existe |
| Listagem `FichasTab` | Existe |
| Componente `SignaturePad` (react-signature-canvas) | Existe |
| **Pagina de detalhe da ficha (ver/editar/assinar presencialmente)** | **NAO EXISTE** |
| **Pagina publica de assinatura remota (sem login)** | **NAO EXISTE** |
| **RPC `get_ficha_for_signature` (dados seguros para pagina publica)** | **NAO EXISTE** |
| **Rotas `/ficha/:id` e `/assinatura/:codigo/:tipo`** | **NAO EXISTE** |
| **Exportacao PDF da ficha com assinaturas embutidas** | **NAO EXISTE** |
| **Botao "Ver Ficha" nos cards da FichasTab** | **NAO EXISTE** |
| **Compartilhamento de link para assinatura remota** | **NAO EXISTE** |

### Plano de Implementacao

#### 1. Migracao de Banco de Dados

Criar a funcao RPC `get_ficha_for_signature(p_codigo TEXT)` com `SECURITY DEFINER` que retorna apenas dados nao-sensiveis (id, codigo, endereco_imovel, data_visita, nome_corretor, status, assinatura_visitante, assinatura_corretor). Isso permite que a pagina publica de assinatura funcione sem expor CPF, telefone ou outros dados pessoais.

Adicionar policy RLS para permitir UPDATE anonimo apenas nos campos de assinatura (via RPC seguro).

#### 2. Pagina de Detalhe da Ficha (`FichaVisitaPage.tsx`)

Rota: `/dashboard/imobiliaria/ficha/:id` (autenticada)

Funcionalidades:
- Visualizar todos os dados da ficha (visitante, imovel, intermediacao)
- Modo edicao inline para campos editaveis
- Alterar status (agendada/confirmada/realizada/cancelada)
- **Assinatura presencial**: Dois canvas `SignaturePad` lado a lado (visitante e corretor), usando o componente existente. Salva base64 PNG direto na tabela
- **Links de assinatura remota**: Gerar e copiar URLs no formato `/assinatura/{codigo}/visitante` e `/assinatura/{codigo}/corretor` para enviar via WhatsApp
- **Indicadores de assinatura**: Check verde se ja assinada, circulo vazio se pendente
- **Exportar PDF**: Botao que gera PDF com jsPDF contendo dados da ficha + assinaturas embutidas como imagens

#### 3. Pagina Publica de Assinatura Remota (`AssinaturaVisita.tsx`)

Rota: `/assinatura/:codigo/:tipo` (publica, sem login)

Funcionalidades:
- Buscar ficha via RPC `get_ficha_for_signature` (nao expoe PII)
- Exibir dados minimos: endereco do imovel, data da visita, nome do corretor
- Canvas de assinatura touch-friendly (funciona em celular e desktop)
- Salvar assinatura no campo correto (`assinatura_visitante` ou `assinatura_corretor`)
- Tela de confirmacao com check verde apos salvar
- Tela de "ja assinado" se a assinatura ja existe
- Tela de "nao encontrado" se o codigo for invalido
- Texto legal sobre Lei 6.530/78

#### 4. Exportacao PDF

Usar `jsPDF` (ja instalado) para gerar PDF da ficha contendo:
- Cabecalho com codigo e data
- Secao 1: Dados do visitante (nome, CPF, telefone, endereco, acompanhantes)
- Secao 2: Dados do imovel (endereco, condominio, unidade, proprietario, valor)
- Secao 3: Intermediacao (corretor, notas, LGPD)
- Secao 4: Assinaturas embutidas como imagens PNG
- Rodape com data/hora de geracao

#### 5. Atualizacoes na FichasTab

Adicionar botao "Ver Ficha" em cada card que navega para `/dashboard/imobiliaria/ficha/{id}`.

#### 6. Rotas no App.tsx

Adicionar:
- Rota autenticada: `/dashboard/imobiliaria/ficha/:id` com `FichaVisitaPage`
- Rota publica: `/assinatura/:codigo/:tipo` com `AssinaturaVisita`

### Detalhes Tecnicos

**Arquivos a criar:**
- `src/pages/dashboard/imobiliaria/FichaVisitaPage.tsx` - Pagina de detalhe com assinatura presencial, links remotos e PDF
- `src/pages/AssinaturaVisita.tsx` - Pagina publica de assinatura remota
- Migracao SQL para RPC `get_ficha_for_signature` e RPC de update seguro

**Arquivos a modificar:**
- `src/App.tsx` - Adicionar 2 novas rotas
- `src/components/agendamentos/FichasTab.tsx` - Adicionar botao "Ver Ficha" nos cards

**Dependencias:** Nenhuma nova. Usa `react-signature-canvas`, `jsPDF`, `date-fns` e componentes shadcn/ui ja instalados.

