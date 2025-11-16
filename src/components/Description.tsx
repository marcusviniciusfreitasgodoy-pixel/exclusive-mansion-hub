import { Check } from "lucide-react";
export const Description = () => {
  const highlights = ["Vista panorâmica inigualável para o mar da Barra", "Piscina privativa aquecida e sauna exclusiva", "Sala de cinema e adega climatizada", "Cinco suítes com três closets privativos", "Cinco vagas de garagem + quarto de motorista", "Condomínio com portaria 24h e segurança total", "Suíte Máster com hidromassagem", "Acabamentos de altíssimo padrão"];
  const features = ["5 suítes luxuosas, sendo 3 com closet", "Cinema particular", "7 banheiros completos", "Adega climatizada", "Espaço gourmet integrado", "Piscina privativa aquecida", "Sauna exclusiva", "Aquecimento a gás", "Ar-condicionado central", "Hidromassagem", "Fechadura digital", "Iluminação LED inteligente"];
  return <section className="relative py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-5xl">
          {/* Main Description */}
          <div className="mb-16 text-center animate-fade-in">
            <span className="mb-4 inline-block text-sm uppercase tracking-[0.3em] text-accent">
              Porteira Fechada
            </span>
            <h2 className="mb-8 text-4xl font-bold text-primary md:text-5xl">
              Exclusividade e Sofisticação<br />em Cada Detalhe
            </h2>
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                Apresentamos esta exclusiva cobertura duplex de alto padrão, situada no endereço mais 
                desejado da Barra da Tijuca, com vista panorâmica para o mar e acabamento impecável. 
                Com surpreendentes 980 m² privativos, o imóvel oferece conforto, sofisticação e 
                privacidade para sua família.
              </p>
              <p>
                Os ambientes são amplos, arejados e com projeto de iluminação inteligente em LED e 
                excelente iluminação natural, proporcionando sol da manhã e tarde. Equipado com 
                aquecimento a gás, ar-condicionado central, hidromassagem, fechadura digital e 
                acabamentos de altíssimo padrão.
              </p>
              <p>
                Localização privilegiada, próxima a shopping centers, escolas renomadas, farmácias, 
                padarias, supermercados, e com fácil acesso às principais vias de transporte da cidade.
              </p>
            </div>
          </div>

          {/* Highlights Grid */}
          <div className="mb-16">
            <h3 className="mb-8 text-center text-2xl font-bold text-primary md:text-3xl">
              Diferenciais Exclusivos
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {highlights.map((highlight, index) => <div key={index} className="flex items-start gap-4 rounded-lg bg-luxury-cream p-6 transition-elegant hover:shadow-elegant animate-fade-in" style={{
              animationDelay: `${index * 0.05}s`
            }}>
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-base leading-relaxed text-primary">{highlight}</p>
                </div>)}
            </div>
          </div>

          {/* Features */}
          
        </div>
      </div>
    </section>;
};