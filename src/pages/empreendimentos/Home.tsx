import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NavigationBar from "@/components/property/altopadrao/NavigationBar";
import CardImovel from "@/components/property/altopadrao/CardImovel";
import { FormularioContato } from "@/components/empreendimentos/FormularioContato";
import { ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero-golf-ocean.jpg";

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

interface EmpreendimentoRow {
  id: string;
  titulo: string;
  slug: string;
  descricao_curta: string;
  localizacao: unknown;
  imagens: unknown;
  precos: unknown;
  detalhes: unknown;
}

interface ParsedEmpreendimento {
  id: string;
  titulo: string;
  slug: string;
  descricao_curta: string;
  localizacao: EmpreendimentoLocalizacao;
  imagens: Array<{ url: string; alt?: string }>;
  precos: EmpreendimentoPrecos;
  detalhes: EmpreendimentoDetalhes;
}

export default function EmpreendimentosHome() {
  const navigate = useNavigate();
  const [empreendimentos, setEmpreendimentos] = useState<ParsedEmpreendimento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmpreendimentos = async () => {
      const { data, error } = await supabase
        .from("empreendimentos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching empreendimentos:", error);
      } else {
        const parsed: ParsedEmpreendimento[] = (data || []).map((row: EmpreendimentoRow) => ({
          id: row.id,
          titulo: row.titulo,
          slug: row.slug,
          descricao_curta: row.descricao_curta,
          localizacao: (row.localizacao as EmpreendimentoLocalizacao) || {},
          imagens: (row.imagens as Array<{ url: string; alt?: string }>) || [],
          precos: (row.precos as EmpreendimentoPrecos) || {},
          detalhes: (row.detalhes as EmpreendimentoDetalhes) || {},
        }));
        setEmpreendimentos(parsed);
      }
      setLoading(false);
    };

    fetchEmpreendimentos();
  }, []);

  const scrollToEmpreendimentos = () => {
    document.getElementById("empreendimentos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Roboto', sans-serif" }}>
      {/* Load Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Navigation */}
      <NavigationBar />

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Vista aérea do campo de golfe com vista para o mar"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c4a6e]/60 via-[#0c4a6e]/40 to-[#0c4a6e]/70" />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h1
            className="mb-6 text-4xl font-bold uppercase tracking-wider text-white md:text-5xl lg:text-7xl"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              textShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            Sua vida entre o<br />
            <span className="text-[#22c55e]">mar</span> e o <span className="text-[#22c55e]">golfe</span>
          </h1>

          <p
            className="mb-10 max-w-2xl text-lg text-white/90 md:text-xl"
            style={{ fontFamily: "'Roboto', sans-serif" }}
          >
            Descubra empreendimentos exclusivos de alto padrão, onde sofisticação encontra natureza
          </p>

          <button
            onClick={scrollToEmpreendimentos}
            className="group flex flex-col items-center gap-2 text-white transition-all hover:text-[#22c55e]"
          >
            <span className="text-sm uppercase tracking-widest">Explorar</span>
            <ChevronDown className="h-8 w-8 animate-bounce" />
          </button>
        </div>
      </section>

      {/* Empreendimentos em Destaque */}
      <section id="empreendimentos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-5 md:px-10 lg:px-20">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold text-[#0c4a6e] mb-4"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Empreendimentos em Destaque
            </h2>
            <p className="text-[#737373] text-lg max-w-2xl mx-auto">
              Selecionamos os melhores empreendimentos de alto padrão para você
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                  <div className="h-56 bg-gray-200 rounded-t-lg" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : empreendimentos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#737373] text-lg">
                Nenhum empreendimento disponível no momento.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {empreendimentos.map((emp) => (
                <CardImovel
                  key={emp.id}
                  imagem={emp.imagens?.[0]?.url || "/placeholder.svg"}
                  imagemAlt={emp.imagens?.[0]?.alt || emp.titulo}
                  titulo={emp.titulo}
                  localizacao={{
                    cidade: emp.localizacao?.cidade || "",
                    bairro: emp.localizacao?.bairro || "",
                  }}
                  areaUtil={emp.detalhes?.areaUtil || 0}
                  quartos={emp.detalhes?.quartos || 0}
                  preco={{
                    minValor: emp.precos?.minValor,
                    maxValor: emp.precos?.maxValor,
                    valor: emp.precos?.valor,
                    unidade: emp.precos?.unidade || "R$",
                  }}
                  onClick={() => navigate(`/empreendimento/${emp.slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Form */}
      <FormularioContato />

      {/* Footer */}
      <footer className="bg-[#0a3d5c] py-10 text-center text-white/60">
        <p style={{ fontFamily: "'Roboto', sans-serif" }}>
          © {new Date().getFullYear()} Oceana Golf. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
