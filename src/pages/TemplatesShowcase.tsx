import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown, 
  Zap, 
  Home, 
  Eye,
  Bed,
  Bath,
  Car,
  Maximize,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Play,
  Images,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Sample property data for preview
const sampleProperty = {
  titulo: "Mansão Vista para o Mar",
  headline: "Residência de luxo com vista panorâmica para o oceano",
  valor: 12500000,
  endereco: "Av. Atlântica, 1500",
  bairro: "Copacabana",
  cidade: "Rio de Janeiro",
  estado: "RJ",
  quartos: 6,
  suites: 4,
  banheiros: 8,
  vagas: 4,
  area_total: 850,
  descricao: "Uma obra-prima arquitetônica situada em localização privilegiada, oferecendo vistas deslumbrantes do oceano Atlântico. Esta residência exclusiva combina elegância atemporal com conforto contemporâneo, apresentando acabamentos de altíssimo padrão e espaços amplos para entretenimento.",
  amenidades: ["Piscina Infinita", "Spa", "Academia", "Cinema", "Adega Climatizada", "Elevador Panorâmico"],
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
};

// ==================== TEMPLATE LUXO (Sotheby's Style) ====================
function TemplateLuxoPreview() {
  return (
    <div className="bg-white text-gray-800 min-h-[600px] overflow-hidden rounded-lg border">
      {/* Header */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6">
        <span className="font-serif text-xl font-bold text-[#D4AF37]">
          SOTHEBY'S REALTY
        </span>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <span className="hover:text-[#D4AF37] transition-colors cursor-pointer">Buy</span>
          <span className="hover:text-[#D4AF37] transition-colors cursor-pointer">Sell</span>
          <span className="hover:text-[#D4AF37] transition-colors cursor-pointer">Rent</span>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-[300px] bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200')] bg-cover bg-center opacity-60" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#D4AF37] uppercase tracking-wide mb-4">
            {sampleProperty.titulo}
          </h1>
          <p className="text-2xl text-white font-serif mb-6">
            {formatCurrency(sampleProperty.valor)}
          </p>
          <Button className="bg-[#D4AF37] text-black hover:bg-[#c9a430] rounded-lg px-8 py-3 font-semibold uppercase tracking-wide">
            Contact Agent
          </Button>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="p-6 bg-gray-50">
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 rounded overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <Images className="w-8 h-8 text-gray-500" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Details Grid */}
      <section className="p-6 bg-white">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-serif text-xl text-gray-900 mb-4">Descrição</h3>
            <p className="text-gray-600 font-serif leading-relaxed text-sm">
              {sampleProperty.descricao}
            </p>
          </div>
          <div>
            <h3 className="font-serif text-xl text-gray-900 mb-4">Características</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Bed className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-sm">{sampleProperty.quartos} Quartos</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Bath className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-sm">{sampleProperty.banheiros} Banheiros</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Car className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-sm">{sampleProperty.vagas} Vagas</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Maximize className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-sm">{sampleProperty.area_total}m²</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white p-6">
        <div className="grid md:grid-cols-4 gap-6 text-sm">
          <div>
            <h4 className="font-serif text-[#D4AF37] mb-2">Navigation</h4>
            <div className="space-y-1 text-gray-400">
              <p>Buy</p>
              <p>Sell</p>
              <p>Rent</p>
            </div>
          </div>
          <div>
            <h4 className="font-serif text-[#D4AF37] mb-2">Contact</h4>
            <p className="text-gray-400">+55 21 99999-9999</p>
          </div>
          <div>
            <h4 className="font-serif text-[#D4AF37] mb-2">Social</h4>
            <div className="flex gap-3 text-[#D4AF37]">
              <span>FB</span>
              <span>IG</span>
              <span>LI</span>
            </div>
          </div>
          <div>
            <h4 className="font-serif text-[#D4AF37] mb-2">Newsletter</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email"
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm flex-1"
              />
              <Button size="sm" className="bg-[#D4AF37] text-black hover:bg-[#c9a430]">
                Go
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==================== TEMPLATE MODERNO (The Agency Style) ====================
function TemplateModernoPreview() {
  return (
    <div className="bg-white text-gray-700 min-h-[600px] overflow-hidden rounded-lg border">
      {/* Header */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-6">
        <span className="font-sans text-xl font-bold text-[#1E3A8A]">
          THE AGENCY
        </span>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <span className="hover:text-[#1E3A8A] transition-colors cursor-pointer">Buy</span>
          <span className="hover:text-[#1E3A8A] transition-colors cursor-pointer">Sell</span>
          <span className="hover:text-[#1E3A8A] transition-colors cursor-pointer">Rent</span>
          <span className="hover:text-[#1E3A8A] transition-colors cursor-pointer">Agents</span>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-[280px] bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200')] bg-cover bg-center opacity-80" />
        <div className="absolute inset-0 bg-white/30" />
        <div className="relative z-10 flex flex-col justify-center h-full px-8 max-w-xl">
          <h1 className="font-sans text-3xl font-bold text-[#1E3A8A] mb-2 capitalize">
            {sampleProperty.titulo}
          </h1>
          <p className="text-2xl text-[#10B981] font-medium mb-4">
            {formatCurrency(sampleProperty.valor)}
          </p>
          <Button className="bg-[#1E3A8A] text-white hover:bg-[#1e3a8a]/90 rounded-xl px-6 py-2 w-fit shadow-lg">
            Request Info
          </Button>
        </div>
      </section>

      {/* Image Slider */}
      <section className="p-6 bg-[#F9FAFB]">
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-40 h-24 bg-gray-200 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <Images className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          ))}
          <div className="flex gap-2 ml-auto">
            <button className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-[#1E3A8A]' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </section>

      {/* Details Grid - 3 Columns */}
      <section className="p-6 bg-white">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-sans text-lg font-semibold text-[#1E3A8A] mb-3">Lifestyle</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {sampleProperty.descricao.slice(0, 150)}...
            </p>
          </div>
          <div>
            <h3 className="font-sans text-lg font-semibold text-[#1E3A8A] mb-3">Specs</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm text-gray-600">{sampleProperty.quartos} Bedrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm text-gray-600">{sampleProperty.banheiros} Bathrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm text-gray-600">{sampleProperty.area_total}m²</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-sans text-lg font-semibold text-[#1E3A8A] mb-3">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {sampleProperty.amenidades.slice(0, 4).map((a) => (
                <Badge key={a} variant="outline" className="text-[#10B981] border-[#10B981] text-xs">
                  {a}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#E0F2FE] p-6">
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-[#1E3A8A] mb-2">Links</h4>
            <div className="space-y-1 text-gray-600">
              <p>About</p>
              <p>Agents</p>
              <p>Listings</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#1E3A8A] mb-2">Social</h4>
            <div className="flex gap-3 text-[#10B981]">
              <span>Instagram</span>
              <span>LinkedIn</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#1E3A8A] mb-2">Newsletter</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm flex-1"
              />
              <Button size="sm" className="bg-[#1E3A8A] text-white hover:bg-[#1e3a8a]/90 rounded-lg">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==================== TEMPLATE CLÁSSICO ====================
function TemplateClassicoPreview() {
  return (
    <div className="bg-white text-gray-800 min-h-[600px] overflow-hidden rounded-lg border">
      {/* Header */}
      <header className="h-16 bg-[#1e3a5f] flex items-center justify-between px-6">
        <span className="font-bold text-xl text-white">
          GODOY PRIME
        </span>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-white/80">
          <span className="hover:text-[#b8860b] transition-colors cursor-pointer">Início</span>
          <span className="hover:text-[#b8860b] transition-colors cursor-pointer">Imóveis</span>
          <span className="hover:text-[#b8860b] transition-colors cursor-pointer">Contato</span>
        </nav>
      </header>

      {/* Hero Carousel */}
      <section className="relative h-[280px] bg-gray-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <Badge className="bg-[#b8860b] text-white">Exclusivo</Badge>
          <Badge className="bg-[#1e3a5f] text-white">Destaque</Badge>
        </div>
        
        {/* Media Counter */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Badge variant="secondary" className="bg-black/50 text-white">
            <Images className="w-3 h-3 mr-1" /> 42
          </Badge>
          <Badge variant="secondary" className="bg-black/50 text-white">
            <Play className="w-3 h-3 mr-1" /> 2
          </Badge>
        </div>
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {sampleProperty.titulo}
              </h1>
              <p className="text-white/80 flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4" />
                {sampleProperty.bairro}, {sampleProperty.cidade}
              </p>
            </div>
            <p className="text-2xl font-bold text-[#b8860b]">
              {formatCurrency(sampleProperty.valor)}
            </p>
          </div>
        </div>
        
        {/* Navigation Arrows */}
        <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white z-10">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white z-10">
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* Quick Stats */}
      <section className="py-4 px-6 bg-gray-50 border-b">
        <div className="flex justify-center gap-8">
          <div className="flex items-center gap-2">
            <Bed className="w-5 h-5 text-[#1e3a5f]" />
            <span className="font-semibold">{sampleProperty.quartos}</span>
            <span className="text-sm text-gray-500">Quartos</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="w-5 h-5 text-[#1e3a5f]" />
            <span className="font-semibold">{sampleProperty.banheiros}</span>
            <span className="text-sm text-gray-500">Banheiros</span>
          </div>
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-[#1e3a5f]" />
            <span className="font-semibold">{sampleProperty.vagas}</span>
            <span className="text-sm text-gray-500">Vagas</span>
          </div>
          <div className="flex items-center gap-2">
            <Maximize className="w-5 h-5 text-[#1e3a5f]" />
            <span className="font-semibold">{sampleProperty.area_total}</span>
            <span className="text-sm text-gray-500">m²</span>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="p-6">
        <h3 className="font-semibold text-lg text-[#1e3a5f] mb-3">Sobre o Imóvel</h3>
        <p className="text-gray-600 leading-relaxed text-sm">
          {sampleProperty.descricao}
        </p>
        
        {/* Amenities */}
        <div className="mt-4 flex flex-wrap gap-2">
          {sampleProperty.amenidades.map((a) => (
            <Badge key={a} variant="outline" className="border-[#1e3a5f] text-[#1e3a5f]">
              {a}
            </Badge>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="p-6 bg-[#1e3a5f]">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="font-semibold">Interessado neste imóvel?</p>
            <p className="text-white/80 text-sm">Agende uma visita ou solicite mais informações</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#1e3a5f]">
              <Phone className="w-4 h-4 mr-2" /> Ligar
            </Button>
            <Button className="bg-[#b8860b] hover:bg-[#a07609] text-white">
              <Mail className="w-4 h-4 mr-2" /> Contato
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white p-4 text-center text-sm">
        <p className="text-gray-400">© 2026 Godoy Prime. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

// ==================== MAIN SHOWCASE PAGE ====================
export default function TemplatesShowcase() {
  const [activeTemplate, setActiveTemplate] = useState<string>("luxo");
  const navigate = useNavigate();

  const templates = [
    {
      id: "luxo",
      name: "Luxo",
      subtitle: "Estilo Sotheby's",
      description: "Elegante e sofisticado, com paleta dourada e tipografia serifada clássica. Ideal para coberturas, mansões e penthouses de alto padrão.",
      icon: <Crown className="w-6 h-6" />,
      colors: ["#D4AF37", "#000000", "#FFFFFF"],
      font: "Times New Roman",
      preview: <TemplateLuxoPreview />,
    },
    {
      id: "moderno",
      name: "Moderno",
      subtitle: "Estilo The Agency",
      description: "Clean e natural, com tons de azul profundo e verde. Perfeito para apartamentos contemporâneos, lofts e imóveis de lifestyle.",
      icon: <Zap className="w-6 h-6" />,
      colors: ["#1E3A8A", "#10B981", "#F9FAFB"],
      font: "Montserrat",
      preview: <TemplateModernoPreview />,
    },
    {
      id: "classico",
      name: "Clássico",
      subtitle: "Estilo Godoy Prime",
      description: "Tradicional e conservador, com azul marinho e dourado. Versátil para casas familiares, residenciais e imóveis diversos.",
      icon: <Home className="w-6 h-6" />,
      colors: ["#1e3a5f", "#b8860b", "#FFFFFF"],
      font: "Inter",
      preview: <TemplateClassicoPreview />,
    },
  ];

  const currentTemplate = templates.find((t) => t.id === activeTemplate);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Galeria de Templates</h1>
            <p className="text-sm text-gray-500">Visualize os três modelos disponíveis para suas landing pages</p>
          </div>
          <Button onClick={() => navigate("/login")} variant="outline">
            Voltar ao Login
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Template Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                activeTemplate === template.id
                  ? "ring-2 ring-primary ring-offset-2"
                  : ""
              }`}
              onClick={() => setActiveTemplate(template.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: template.colors[0] + "20", color: template.colors[0] }}
                  >
                    {template.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.subtitle}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                
                {/* Color Palette */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground">Cores:</span>
                  <div className="flex gap-1">
                    {template.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Font */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Fonte:</span>
                  <span className="text-xs font-medium">{template.font}</span>
                </div>
                
                {activeTemplate === template.id && (
                  <div className="mt-4 pt-4 border-t">
                    <Badge className="bg-primary text-primary-foreground">
                      <Eye className="w-3 h-3 mr-1" />
                      Visualizando
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-50 border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: currentTemplate?.colors[0] + "20", 
                  color: currentTemplate?.colors[0] 
                }}
              >
                {currentTemplate?.icon}
              </div>
              <div>
                <h2 className="font-semibold text-lg">
                  Template {currentTemplate?.name}
                </h2>
                <p className="text-sm text-muted-foreground">{currentTemplate?.subtitle}</p>
              </div>
            </div>
            <Tabs value={activeTemplate} onValueChange={setActiveTemplate}>
              <TabsList>
                <TabsTrigger value="luxo" className="flex items-center gap-1">
                  <Crown className="w-4 h-4" /> Luxo
                </TabsTrigger>
                <TabsTrigger value="moderno" className="flex items-center gap-1">
                  <Zap className="w-4 h-4" /> Moderno
                </TabsTrigger>
                <TabsTrigger value="classico" className="flex items-center gap-1">
                  <Home className="w-4 h-4" /> Clássico
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="p-6">
            {currentTemplate?.preview}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card className="border-[#D4AF37]/50 bg-[#D4AF37]/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-[#D4AF37]" />
                <span className="font-semibold">Luxo (Sotheby's)</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Hero 70vh com overlay escuro</li>
                <li>• Tipografia serifada elegante</li>
                <li>• Galeria em grid 1/3/4 colunas</li>
                <li>• Footer 4 colunas com newsletter</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-[#1E3A8A]/50 bg-[#1E3A8A]/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-[#1E3A8A]" />
                <span className="font-semibold">Moderno (The Agency)</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Hero 60vh com overlay claro</li>
                <li>• Tipografia Montserrat moderna</li>
                <li>• Slider horizontal com autoplay</li>
                <li>• Layout 3 colunas lifestyle</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-[#1e3a5f]/50 bg-[#1e3a5f]/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-5 h-5 text-[#1e3a5f]" />
                <span className="font-semibold">Clássico (Godoy Prime)</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Carousel hero com badges</li>
                <li>• Barra de métricas resumida</li>
                <li>• Design azul/dourado tradicional</li>
                <li>• CTA de contato destacado</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
