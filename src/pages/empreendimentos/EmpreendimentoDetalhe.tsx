import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NavigationBar from "@/components/property/altopadrao/NavigationBar";
import { FormularioContato } from "@/components/empreendimentos/FormularioContato";
import { AltoPadraoGallery } from "@/components/property/altopadrao/AltoPadraoGallery";
import { ArrowLeft, Bed, Bath, Car, Maximize, MapPin, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmpreendimentoLocalizacao {
  cidade?: string;
  bairro?: string;
  endereco?: string;
}

interface EmpreendimentoPrecos {
  minValor?: number;
  maxValor?: number;
  valor?: number;
  unidade?: string;
}

interface EmpreendimentoDetalhes {
  areaUtil?: number;
  quartos?: number;
  banheiros?: number;
  vagasGaragem?: number;
}

interface ParsedEmpreendimento {
  id: string;
  titulo: string;
  slug: string;
  descricao_curta: string;
  status: string;
  localizacao: EmpreendimentoLocalizacao;
  caracteristicas_principais: string[];
  imagens: Array<{ url: string; alt?: string }>;
  precos: EmpreendimentoPrecos;
  detalhes: EmpreendimentoDetalhes;
  link_visita_virtual?: string;
}

export default function EmpreendimentoDetalhe() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [empreendimento, setEmpreendimento] = useState<ParsedEmpreendimento | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmpreendimento = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from("empreendimentos")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("Error fetching empreendimento:", error);
        navigate("/empreendimentos");
      } else if (data) {
        const parsed: ParsedEmpreendimento = {
          id: data.id,
          titulo: data.titulo,
          slug: data.slug,
          descricao_curta: data.descricao_curta,
          status: data.status,
          localizacao: (data.localizacao as EmpreendimentoLocalizacao) || {},
          caracteristicas_principais: (data.caracteristicas_principais as string[]) || [],
          imagens: (data.imagens as Array<{ url: string; alt?: string }>) || [],
          precos: (data.precos as EmpreendimentoPrecos) || {},
          detalhes: (data.detalhes as EmpreendimentoDetalhes) || {},
          link_visita_virtual: data.link_visita_virtual || undefined,
        };
        setEmpreendimento(parsed);
      }
      setLoading(false);
    };

    fetchEmpreendimento();
  }, [slug, navigate]);

  const formatPrice = (value: number, unidade: string = "R$") => {
    return `${unidade} ${value.toLocaleString("pt-BR")}`;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      em_lancamento: "Em Lançamento",
      em_construcao: "Em Construção",
      pronto_para_morar: "Pronto para Morar",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      em_lancamento: "bg-[#0284c7]",
      em_construcao: "bg-amber-500",
      pronto_para_morar: "bg-[#22c55e]",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <NavigationBar />
        <div className="pt-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0284c7]" />
        </div>
      </div>
    );
  }

  if (!empreendimento) {
    return (
      <div className="min-h-screen bg-white">
        <NavigationBar />
        <div className="pt-32 text-center">
          <h1 className="text-2xl text-[#0c4a6e]">Empreendimento não encontrado</h1>
          <Button onClick={() => navigate("/empreendimentos")} className="mt-4">
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  const displayPrice = empreendimento.precos.valor
    ? formatPrice(empreendimento.precos.valor, empreendimento.precos.unidade)
    : empreendimento.precos.minValor && empreendimento.precos.maxValor
    ? `${formatPrice(empreendimento.precos.minValor, empreendimento.precos.unidade)} - ${formatPrice(
        empreendimento.precos.maxValor,
        empreendimento.precos.unidade
      )}`
    : "Consulte-nos";

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Roboto', sans-serif" }}>
      {/* Load Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <NavigationBar />

      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img
            src={empreendimento.imagens?.[0]?.url || "/placeholder.svg"}
            alt={empreendimento.titulo}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c4a6e]/80 via-[#0c4a6e]/30 to-transparent" />
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate("/empreendimentos")}
          className="absolute left-6 top-28 z-10 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white backdrop-blur-sm transition-all hover:bg-white/40"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Voltar</span>
        </button>

        {/* Status Badge */}
        <div className="absolute right-6 top-28 z-10">
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${getStatusColor(
              empreendimento.status
            )}`}
          >
            {getStatusLabel(empreendimento.status)}
          </span>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto">
            <h1
              className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {empreendimento.titulo}
            </h1>

            <div className="flex items-center gap-2 text-white/90 mb-4">
              <MapPin className="h-5 w-5 text-[#22c55e]" />
              <span>
                {[
                  empreendimento.localizacao?.bairro,
                  empreendimento.localizacao?.cidade,
                ].filter(Boolean).join(", ")}
              </span>
            </div>

            <p
              className="text-3xl font-semibold text-[#22c55e] md:text-4xl"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {displayPrice}
            </p>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-5 md:px-10 lg:px-20">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {empreendimento.detalhes?.areaUtil && (
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Maximize className="h-8 w-8 text-[#0284c7] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-[#0c4a6e]">
                      {empreendimento.detalhes.areaUtil}m²
                    </p>
                    <p className="text-[#737373] text-sm">Área Útil</p>
                  </div>
                )}
                {empreendimento.detalhes?.quartos && (
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Bed className="h-8 w-8 text-[#0284c7] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-[#0c4a6e]">
                      {empreendimento.detalhes.quartos}
                    </p>
                    <p className="text-[#737373] text-sm">Quartos</p>
                  </div>
                )}
                {empreendimento.detalhes?.banheiros && (
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Bath className="h-8 w-8 text-[#0284c7] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-[#0c4a6e]">
                      {empreendimento.detalhes.banheiros}
                    </p>
                    <p className="text-[#737373] text-sm">Banheiros</p>
                  </div>
                )}
                {empreendimento.detalhes?.vagasGaragem && (
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Car className="h-8 w-8 text-[#0284c7] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-[#0c4a6e]">
                      {empreendimento.detalhes.vagasGaragem}
                    </p>
                    <p className="text-[#737373] text-sm">Vagas</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-12">
                <h2
                  className="text-2xl font-semibold text-[#0c4a6e] mb-4"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Sobre o Empreendimento
                </h2>
                <p className="text-[#525252] text-lg leading-relaxed">
                  {empreendimento.descricao_curta}
                </p>
              </div>

              {/* Features */}
              {empreendimento.caracteristicas_principais?.length > 0 && (
                <div className="mb-12">
                  <h2
                    className="text-2xl font-semibold text-[#0c4a6e] mb-6"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Características Principais
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {empreendimento.caracteristicas_principais.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
                          <Check className="h-4 w-4 text-[#22c55e]" />
                        </div>
                        <span className="text-[#525252]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-gray-50 rounded-2xl p-6">
                <h3
                  className="text-xl font-semibold text-[#0c4a6e] mb-4"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Agende sua Visita
                </h3>
                <p className="text-[#737373] mb-6">
                  Entre em contato com nossa equipe e conheça este empreendimento exclusivo.
                </p>

                {empreendimento.link_visita_virtual && (
                  <a
                    href={empreendimento.link_visita_virtual}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full mb-4 py-3 px-6 rounded-xl bg-[#0284c7] text-white font-semibold transition-all hover:shadow-lg"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Tour Virtual 360°
                  </a>
                )}

                <a
                  href="#contato"
                  className="flex items-center justify-center w-full py-3 px-6 rounded-xl bg-[#22c55e] text-white font-semibold transition-all hover:shadow-lg"
                >
                  Falar com Corretor
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {empreendimento.imagens && empreendimento.imagens.length > 1 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-5 md:px-10 lg:px-20">
            <h2
              className="text-3xl font-semibold text-[#0c4a6e] mb-8 text-center"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Galeria de Imagens
            </h2>
            <AltoPadraoGallery images={empreendimento.imagens} />
          </div>
        </section>
      )}

      {/* Contact Form */}
      <FormularioContato empreendimentoTitulo={empreendimento.titulo} />

      {/* Footer */}
      <footer className="bg-[#0a3d5c] py-10 text-center text-white/60">
        <p style={{ fontFamily: "'Roboto', sans-serif" }}>
          © {new Date().getFullYear()} Oceana Golf. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
