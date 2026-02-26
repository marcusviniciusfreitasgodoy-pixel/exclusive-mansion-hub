import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, AlertTriangle, Lightbulb, Star, Users, TrendingUp, MessageCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoPrincipal from "@/assets/logo-principal.png";

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
      pdf.save("godoy-prime-one-pager.pdf");
    } finally {
      setExporting(false);
    }
  };

  const problemas = [
    "Leads esfriam sem resposta rápida — perda de oportunidades",
    "Zero visibilidade sobre o desempenho das imobiliárias parceiras",
    "Materiais de venda despadronizados e desatualizados",
    "Visitas sem registro, feedback ou rastreabilidade",
    "Decisões estratégicas sem dados concretos",
  ];

  const diferenciais = [
    { icon: Star, label: "White-label dinâmico", desc: "Cada parceiro com sua marca" },
    { icon: MessageCircle, label: "IA Sofia 24/7", desc: "Atendimento instantâneo por IA" },
    { icon: AlertTriangle, label: "Fichas com validade jurídica", desc: "Hash + geolocalização" },
    { icon: TrendingUp, label: "Analytics completo", desc: "Heatmap, funil e ROI" },
    { icon: Lightbulb, label: "Efeito UAU", desc: "Landing pages de alto impacto" },
  ];

  const publicoAlvo = [
    { titulo: "Construtoras", desc: "Controle total sobre a distribuição de imóveis" },
    { titulo: "Incorporadoras", desc: "Visibilidade do pipeline de vendas" },
    { titulo: "Imobiliárias", desc: "Materiais prontos e leads qualificados" },
    { titulo: "Corretores", desc: "Ferramentas profissionais para converter mais" },
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
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-10 py-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoPrincipal} alt="Godoy Prime" className="h-12 brightness-0 invert" />
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">One-Pager Comercial</p>
            <p className="text-sm text-slate-400 mt-1">Tecnologia para o mercado imobiliário</p>
          </div>
        </div>

        {/* Problema */}
        <div className="px-10 py-7 border-b border-slate-200">
          <h2 className="text-lg font-bold text-red-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> O Problema
          </h2>
          <ul className="space-y-2">
            {problemas.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Solução */}
        <div className="px-10 py-7 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-emerald-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" /> A Solução: Godoy Prime
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Plataforma SaaS que conecta <strong>construtoras</strong> e <strong>imobiliárias</strong> em um
            ecossistema digital unificado — com links rastreáveis white-label, inteligência artificial,
            fichas de visita com validade jurídica e analytics em tempo real. Tudo em um só lugar.
          </p>
        </div>

        {/* Diferenciais + Público-Alvo (grid) */}
        <div className="grid grid-cols-5 border-b border-slate-200">
          {/* Diferenciais - 3 cols */}
          <div className="col-span-3 px-10 py-7 border-r border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" /> Diferenciais
            </h2>
            <div className="space-y-3">
              {diferenciais.map((d, i) => (
                <div key={i} className="flex items-start gap-3">
                  <d.icon className="h-4 w-4 mt-0.5 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{d.label}</p>
                    <p className="text-xs text-slate-500">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Público-Alvo - 2 cols */}
          <div className="col-span-2 px-8 py-7">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" /> Público-Alvo
            </h2>
            <div className="space-y-3">
              {publicoAlvo.map((p, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-slate-800">{p.titulo}</p>
                  <p className="text-xs text-slate-500">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROI Estimado */}
        <div className="px-10 py-7 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" /> ROI Estimado
          </h2>
          <div className="bg-emerald-50 rounded-lg p-5 border border-emerald-200">
            <p className="text-sm text-slate-700 mb-3">
              Imóveis de alto padrão: VGV médio <strong>R$ 800.000+</strong>
            </p>
            <p className="text-xl font-bold text-emerald-700 mb-4">
              1 lead convertido = ROI de 100x sobre o custo anual da plataforma
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { valor: "+40%", label: "Conversão de leads" },
                { valor: "<1 min", label: "Tempo de resposta" },
                { valor: "100%", label: "Visibilidade de parceiros" },
                { valor: "Digital", label: "Feedback com validade jurídica" },
              ].map((m, i) => (
                <div key={i} className="text-center bg-white rounded p-3 border border-emerald-100">
                  <p className="text-lg font-bold text-emerald-700">{m.valor}</p>
                  <p className="text-xs text-slate-600">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 text-white px-10 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-lg font-bold mb-1">Pronto para transformar suas vendas?</p>
              <p className="text-sm text-slate-400">Agende uma demonstração gratuita e personalizada</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <a
                href="https://wa.me/5521964075124?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20demonstra%C3%A7%C3%A3o%20da%20Godoy%20Prime."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
              >
                <Phone className="h-4 w-4" /> WhatsApp
              </a>
              <a
                href="mailto:contato@godoyprime.com.br?subject=Demonstração Godoy Prime"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors border border-white/20"
              >
                <Mail className="h-4 w-4" /> E-mail
              </a>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
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
