import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, AlertTriangle, Lightbulb, Star, Users, TrendingUp, MessageCircle, Phone, Mail, Bot, Palette, BarChart3, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoNegativo from "@/assets/logo-negativo.png";

const OnePager = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("godoy-prime-resumo-comercial.pdf");
    } finally {
      setExporting(false);
    }
  };

  const problemas = [
    "Contatos esfriam sem resposta rápida — perda de oportunidades",
    "Zero visibilidade sobre o desempenho das imobiliárias parceiras",
    "Materiais de venda despadronizados e desatualizados",
    "Visitas sem registro, avaliação ou rastreabilidade",
    "Decisões estratégicas sem dados concretos",
    "Profissionais que visitam o imóvel sem conhecer seus detalhes e diferenciais",
  ];

  const diferenciais = [
    { icon: Star, label: "Marca própria dinâmica", desc: "Cada parceiro com sua marca" },
    { icon: MessageCircle, label: "Sofia IA 24/7", desc: "Atendimento instantâneo por IA" },
    { icon: AlertTriangle, label: "Fichas com validade jurídica", desc: "Código de verificação + geolocalização" },
    { icon: TrendingUp, label: "Painel analítico completo", desc: "Mapa de calor, funil e retorno" },
    { icon: Lightbulb, label: "Efeito UAU", desc: "Páginas de apresentação de alto impacto" },
  ];

  const publicoAlvo = [
    { titulo: "Construtoras", desc: "Controle total sobre a distribuição de imóveis" },
    { titulo: "Incorporadoras", desc: "Visibilidade do funil de vendas" },
    { titulo: "Imobiliárias", desc: "Materiais prontos e contatos qualificados" },
    { titulo: "Corretores", desc: "Ferramentas profissionais para converter mais" },
  ];

  const funcionalidades = [
    {
      icon: TrendingUp,
      titulo: "Vendas e Gestão de Clientes",
      items: [
        { nome: "Funil Visual (Kanban)", desc: "Gestão visual de 8 estágios de contatos" },
        { nome: "Propostas formais", desc: "Documentos com validação e assinatura" },
        { nome: "Fichas de visita", desc: "Código de verificação + geolocalização (validade jurídica)" },
        { nome: "Agendamento inteligente", desc: "Calendário integrado com envio de documentos" },
      ],
    },
    {
      icon: Palette,
      titulo: "Marketing e Marca",
      items: [
        { nome: "Sites com marca própria", desc: "Cada parceiro com sua marca automaticamente" },
        { nome: "Modelos exclusivos", desc: "4 estilos: Luxo, Moderno, Clássico, Alto Padrão" },
        { nome: "Domínio personalizado", desc: "URL própria para cada construtora" },
        { nome: "Aprovação de mídias", desc: "Fluxo de aprovação e controle de marca" },
      ],
    },
    {
      icon: Bot,
      titulo: "IA e Atendimento",
      items: [
        { nome: "Sofia IA 24/7", desc: "Assistente virtual com voz e base de conhecimento" },
        { nome: "Base de conhecimento", desc: "Alimentada por PDFs técnicos" },
        { nome: "Resposta instantânea", desc: "Atendimento em menos de 1 minuto" },
      ],
    },
    {
      icon: BarChart3,
      titulo: "Dados e Gestão",
      items: [
        { nome: "Pesquisa de Satisfação (NPS)", desc: "Pesquisa pós-visita com assinatura digital" },
        { nome: "Painel de Indicadores", desc: "Mapa de calor, funil, retorno e métricas por parceiro" },
        { nome: "Multiempresa", desc: "Gestão separada construtora/imobiliária" },
        { nome: "Central de integrações", desc: "GA4, Pixel, automações externas" },
        { nome: "Efeito UAU", desc: "Ranking dos aspectos que mais impressionam visitantes" },
        { nome: "Gestão de Parceiros", desc: "Visão consolidada de todas as imobiliárias parceiras" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center py-8 px-4">
      {/* Export button */}
      <div className="print:hidden mb-6 w-full max-w-[794px] flex justify-end">
        <Button onClick={handleExportPDF} disabled={exporting} size="lg" className="gap-2">
          <Download className="h-5 w-5" />
          {exporting ? "Gerando PDF..." : "Exportar PDF"}
        </Button>
      </div>

      {/* A4 container */}
      <div
        ref={contentRef}
        className="bg-white w-full max-w-[794px] shadow-xl rounded-sm"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0C2340] to-[#102a4a] text-white px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoNegativo} alt="Godoy Prime" className="h-12" />
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]/80">Resumo Comercial</p>
            <p className="text-xs text-[#D4AF37]/50 mt-0.5">Tecnologia para o mercado imobiliário</p>
          </div>
        </div>

        {/* Problema */}
        <div className="px-10 py-5 border-b border-[#0C2340]/10">
          <h2 className="text-base font-bold text-red-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> O Problema
          </h2>
          <ul className="space-y-1.5">
            {problemas.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-xs text-[#0C2340]/80">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Solução */}
        <div className="px-10 py-4 border-b border-[#0C2340]/10 bg-[#faf8f3]">
          <h2 className="text-base font-bold text-[#0C2340] uppercase tracking-wide mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#D4AF37]" /> A Solução: Godoy Prime
          </h2>
          <p className="text-xs text-[#0C2340]/80 leading-relaxed">
            Plataforma digital que conecta <strong>construtoras</strong> e <strong>imobiliárias</strong> em um
            ecossistema digital unificado — com links rastreáveis de marca própria, inteligência artificial,
            fichas de visita com validade jurídica e indicadores em tempo real.
          </p>
        </div>

        {/* Funcionalidades por Categoria */}
        <div className="px-10 py-4 border-b border-[#0C2340]/10">
          <h2 className="text-sm font-bold text-[#0C2340] uppercase tracking-wide mb-1 flex items-center gap-2">
            <Layout className="h-4 w-4 text-[#D4AF37]" /> 17 funcionalidades em uma única plataforma
          </h2>
          <p className="text-[10px] text-[#0C2340]/60 mb-3">Organizadas por categoria de valor</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {funcionalidades.map((cat, i) => (
              <div key={i} className={i >= 2 ? "pt-1" : ""}>
                <div className="flex items-center gap-2 mb-2">
                  <cat.icon className="h-4 w-4 text-[#D4AF37] shrink-0" />
                  <p className="text-xs font-bold text-[#0C2340] uppercase tracking-wide">{cat.titulo}</p>
                </div>
                <div className="space-y-0.5">
                  {cat.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-[#D4AF37] shrink-0" />
                      <p className="text-[10px] text-[#0C2340]/80">
                        <strong className="text-[#0C2340]">{item.nome}</strong> — {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diferenciais + Público-Alvo (grid) */}
        <div className="grid grid-cols-5 border-b border-[#0C2340]/10">
          <div className="col-span-3 px-10 py-4 border-r border-[#0C2340]/10">
            <h2 className="text-base font-bold text-[#0C2340] uppercase tracking-wide mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-[#D4AF37]" /> Diferenciais
            </h2>
            <div className="space-y-2">
              {diferenciais.map((d, i) => (
                <div key={i} className="flex items-start gap-3">
                  <d.icon className="h-3.5 w-3.5 mt-0.5 text-[#D4AF37] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#0C2340]">{d.label}</p>
                    <p className="text-[10px] text-[#0C2340]/60">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 px-8 py-4">
            <h2 className="text-base font-bold text-[#0C2340] uppercase tracking-wide mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#D4AF37]" /> Público-Alvo
            </h2>
            <div className="space-y-2">
              {publicoAlvo.map((p, i) => (
                <div key={i}>
                  <p className="text-xs font-semibold text-[#0C2340]">{p.titulo}</p>
                  <p className="text-[10px] text-[#0C2340]/60">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#0C2340] to-[#102a4a] text-white px-10 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-lg font-bold mb-1">Pronto para transformar suas vendas?</p>
              <p className="text-sm text-[#D4AF37]/60">Agende uma demonstração gratuita e personalizada</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <a
                href="https://wa.me/5521964075124?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20demonstra%C3%A7%C3%A3o%20da%20Godoy%20Prime."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c9a430] text-[#0C2340] text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
              >
                <Phone className="h-4 w-4" /> WhatsApp
              </a>
              <a
                href="mailto:contato@godoyprime.com.br?subject=Demonstração Godoy Prime"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors border border-[#D4AF37]/30"
              >
                <Mail className="h-4 w-4" /> E-mail
              </a>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-[#D4AF37]/50 gap-2">
            <span>contato@godoyprime.com.br</span>
            <span>(21) 96407-5124</span>
            <span>godoyprime.com.br</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnePager;
