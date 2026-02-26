

## One-Pager Comercial Exportavel em PDF

### Objetivo
Criar uma nova pagina `/one-pager` com layout otimizado para impressao/PDF, contendo as secoes: Problema, Solucao, Diferenciais, Publico-Alvo, ROI Estimado e CTA. Um botao "Exportar PDF" usara `jspdf` + `html2canvas` (ja instalados no projeto) para gerar o documento.

### Estrutura da Pagina

A pagina tera layout A4 (210x297mm) com fundo branco, otimizada para exportacao limpa:

```text
+------------------------------------------+
|  [Logo Godoy Prime]    ONE-PAGER COMERCIAL|
|  Tecnologia para o mercado imobiliario    |
+------------------------------------------+
|                                           |
|  O PROBLEMA                               |
|  - Leads esfriam sem resposta rapida      |
|  - Zero visibilidade sobre parceiros      |
|  - Materiais despadronizados              |
|  - Visitas sem registro ou feedback       |
|  - Decisoes sem dados concretos           |
|                                           |
+------------------------------------------+
|                                           |
|  A SOLUCAO: GODOY PRIME                   |
|  Plataforma SaaS que conecta construtoras |
|  e imobiliarias em um ecossistema digital |
|  com rastreamento, IA e analytics.        |
|                                           |
+------------------------------------------+
|  DIFERENCIAIS          |  PUBLICO-ALVO    |
|  - White-label dinamico|  - Construtoras  |
|  - IA Sofia 24/7       |  - Incorporadoras|
|  - Feedback juridico   |  - Imobiliarias  |
|  - Efeito UAU          |  - Corretores    |
|  - Analytics completo  |    autonomos     |
+------------------------------------------+
|                                           |
|  ROI ESTIMADO                             |
|  Imoveis alto padrao: VGV medio R$ 800k+  |
|  1 lead convertido = ROI de 100x sobre    |
|  o custo anual da plataforma              |
|                                           |
|  Metricas: +40% conversao, <1min resposta |
|  100% visibilidade, feedback digital      |
|                                           |
+------------------------------------------+
|                                           |
|  [Agendar Demonstracao]  [WhatsApp]       |
|  contato@godoyprime.com.br                |
|  (21) 96407-5124                          |
|                                           |
+------------------------------------------+
```

### Arquivos a Criar/Modificar

**1. `src/pages/OnePager.tsx`** (novo)
- Componente com layout fixo A4, fundo branco, tipografia escura
- Secoes: Header com logo, Problema (lista com icones), Solucao (texto descritivo), Diferenciais (grid 2 colunas), Publico-Alvo (cards por perfil), ROI Estimado (metricas em destaque), CTA (botoes de contato)
- Botao "Exportar PDF" fixo no topo (oculto na impressao via `print:hidden`)
- Usa `html2canvas` para capturar o conteudo e `jspdf` para gerar o PDF A4

**2. `src/App.tsx`** (modificar)
- Adicionar rota publica `/one-pager` apontando para o novo componente com lazy loading

### Detalhes Tecnicos

- **Exportacao PDF**: Captura o container principal com `html2canvas` (scale: 2 para alta resolucao), depois insere no `jspdf` em formato A4. O botao de exportacao e elementos de navegacao recebem classe `print:hidden` para nao aparecerem no PDF.
- **Responsividade**: A pagina funciona normalmente no browser mas o layout e otimizado para A4 (max-width ~794px centralizado).
- **Sem dependencias novas**: `jspdf` e `html2canvas` ja estao instalados no projeto.
- **Cores da marca**: Usa as variaveis CSS existentes (`primary`, `secondary`) para manter consistencia visual com o restante do app.
- **Conteudo**: Todo o texto e hardcoded (nao depende de banco de dados), baseado nas informacoes ja definidas na pagina `/apresentacao`.

