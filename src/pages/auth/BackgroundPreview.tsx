import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import logo from '@/assets/logo-principal.png';
import barraOption1 from '@/assets/barra-option-1.jpg';
import barraOption2 from '@/assets/barra-option-2.jpg';
import barraOption3 from '@/assets/barra-option-3.jpg';
import barraOption4 from '@/assets/barra-option-4.jpg';

const backgroundOptions = [
  { id: 1, src: barraOption1, name: 'Vista Aérea Panorâmica' },
  { id: 2, src: barraOption2, name: 'Pôr do Sol Dourado' },
  { id: 3, src: barraOption3, name: 'Vista Aérea Dia' },
  { id: 4, src: barraOption4, name: 'Praia com Pedra da Gávea' },
];

export default function BackgroundPreview() {
  const [selectedBg, setSelectedBg] = useState(barraOption1);
  const [selectedId, setSelectedId] = useState(1);

  return (
    <div className="min-h-screen bg-muted">
      {/* Preview Section */}
      <div 
        className="relative h-[70vh] flex items-center justify-center transition-all duration-500"
        style={{
          backgroundImage: `url(${selectedBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Mock Login Form */}
        <div className="w-full max-w-md space-y-8 relative z-10 px-4">
          <div className="text-center">
            <img src={logo} alt="Logo" className="mx-auto h-16" />
            <h1 className="mt-6 text-3xl font-bold text-white">Entrar</h1>
            <p className="mt-2 text-white/80">
              Acesse sua conta para gerenciar seus imóveis
            </p>
          </div>

          <div className="rounded-xl bg-white/95 backdrop-blur-sm p-8 shadow-elegant">
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded-md" />
              <div className="h-10 bg-muted rounded-md" />
              <div className="h-10 bg-primary rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Selection Section */}
      <div className="p-6 bg-white">
        <h2 className="text-xl font-semibold text-center mb-6">
          Escolha o background para as telas de Login e Cadastro
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {backgroundOptions.map((option) => (
            <Card 
              key={option.id}
              className={`relative cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary ${
                selectedId === option.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                setSelectedBg(option.src);
                setSelectedId(option.id);
              }}
            >
              <img 
                src={option.src} 
                alt={option.name}
                className="w-full h-32 object-cover"
              />
              {selectedId === option.id && (
                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
              <div className="p-2 text-center">
                <p className="text-xs font-medium">Opção {option.id}</p>
                <p className="text-xs text-muted-foreground">{option.name}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Após escolher, me diga qual opção você prefere (1, 2, 3 ou 4) e eu aplicarei nas telas de login e cadastro.
          </p>
          <Link to="/auth/login">
            <Button variant="outline">Ver página de Login atual</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
