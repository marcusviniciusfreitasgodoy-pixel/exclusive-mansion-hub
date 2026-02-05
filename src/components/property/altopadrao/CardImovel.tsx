import { MapPin, Bed, Maximize } from 'lucide-react';

interface CardImovelProps {
  imagem: string;
  imagemAlt?: string;
  titulo: string;
  localizacao: {
    cidade: string;
    bairro: string;
  };
  areaUtil: number;
  quartos: number;
  preco: {
    minValor?: number;
    maxValor?: number;
    valor?: number;
    unidade?: string;
  };
  onClick?: () => void;
  className?: string;
}

const formatPrice = (value: number, unidade: string = 'R$') => {
  return `${unidade} ${value.toLocaleString('pt-BR')}`;
};

const CardImovel = ({
  imagem,
  imagemAlt,
  titulo,
  localizacao,
  areaUtil,
  quartos,
  preco,
  onClick,
  className = '',
}: CardImovelProps) => {
  const displayPrice = preco.valor 
    ? formatPrice(preco.valor, preco.unidade)
    : preco.minValor && preco.maxValor
      ? `${formatPrice(preco.minValor, preco.unidade)} - ${formatPrice(preco.maxValor, preco.unidade)}`
      : 'Consulte-nos';

  return (
    <div
      onClick={onClick}
      className={`
        group relative bg-white rounded-lg shadow-md overflow-hidden
        transition-all duration-300 ease-in-out
        hover:shadow-xl hover:-translate-y-1
        cursor-pointer
        ${className}
      `}
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={imagem}
          alt={imagemAlt || titulo}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c4a6e]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Price Badge */}
        <div className="absolute bottom-4 left-4 bg-[#22c55e] text-white px-3 py-1.5 rounded-lg font-semibold text-sm shadow-lg">
          {displayPrice}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-['Montserrat'] font-semibold text-lg text-[#0c4a6e] mb-2 line-clamp-2 group-hover:text-[#0284c7] transition-colors">
          {titulo}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-[#737373] mb-4">
          <MapPin className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
          <span className="font-['Roboto'] text-sm truncate">
            {localizacao.bairro}, {localizacao.cidade}
          </span>
        </div>

        {/* Specs */}
        <div className="flex items-center justify-between pt-4 border-t border-[#e5e5e5]">
          <div className="flex items-center gap-1.5">
            <Maximize className="w-4 h-4 text-[#22c55e]" />
            <span className="font-['Roboto'] text-sm text-[#525252]">
              {areaUtil} m²
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-[#22c55e]" />
            <span className="font-['Roboto'] text-sm text-[#525252]">
              {quartos} {quartos === 1 ? 'quarto' : 'quartos'}
            </span>
          </div>
        </div>
      </div>

      {/* Hover accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0284c7] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  );
};

export default CardImovel;
