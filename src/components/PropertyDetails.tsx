import { Bed, Bath, Car, Maximize, MapPin } from "lucide-react";
export const PropertyDetails = () => {
  const details = [{
    icon: Maximize,
    label: "Área Total",
    value: "1.250m²"
  }, {
    icon: Maximize,
    label: "Área Privativa",
    value: "980m²"
  }, {
    icon: Bed,
    label: "Suítes",
    value: "5"
  }, {
    icon: Bath,
    label: "Banheiros",
    value: "7"
  }, {
    icon: Car,
    label: "Vagas",
    value: "5"
  }];
  return <section id="details" className="relative py-24 bg-luxury-cream">
      <div className="container mx-auto px-6">
        {/* Location */}
        <div className="mb-16 text-center animate-fade-in">
          <div className="mb-4 inline-flex items-center gap-2 text-primary">
            <MapPin className="h-5 w-5" />
            <span className="text-sm uppercase tracking-widest">Localização Premium</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold text-primary md:text-5xl lg:text-6xl">
            Avenida Lúcio Costa
          </h2>
          <p className="text-xl text-muted-foreground">
            Barra da Tijuca, Rio de Janeiro
          </p>
        </div>

        {/* Price Section */}
        <div className="mb-16 text-center">
          <div className="inline-block luxury-gradient rounded-2xl px-12 py-8 shadow-gold animate-scale-in">
            <p className="mb-2 text-sm uppercase tracking-widest text-accent text-center">VALOR DO IMÓVEL COM PORTEIRA FECHADA</p>
            <p className="text-5xl font-bold text-white md:text-6xl">R$ 13.500.000</p>
            <div className="mt-4 flex justify-center gap-8 text-sm text-white/80">
              <span>Condomínio: R$ 5.500</span>
              <span>IPTU: R$ 5.400</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-5 lg:gap-8">
          {details.map((detail, index) => {
          const Icon = detail.icon;
          return <div key={detail.label} className="group rounded-xl bg-white p-6 text-center shadow-elegant transition-elegant hover:-translate-y-2 hover:shadow-gold animate-fade-in" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent transition-smooth group-hover:bg-accent group-hover:text-primary">
                  <Icon className="h-7 w-7" />
                </div>
                <p className="mb-1 text-sm uppercase tracking-wide text-muted-foreground">
                  {detail.label}
                </p>
                <p className="text-3xl font-bold text-primary">{detail.value}</p>
              </div>;
        })}
        </div>
      </div>
    </section>;
};