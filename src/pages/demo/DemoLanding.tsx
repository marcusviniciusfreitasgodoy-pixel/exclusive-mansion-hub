import { useNavigate } from 'react-router-dom';
import { Building2, Home, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo-principal.png';

export default function DemoLanding() {
  const navigate = useNavigate();

  const options = [
    {
      role: 'construtora',
      title: 'Explorar como Construtora',
      description: 'Gerencie imóveis, acompanhe leads, veja analytics e controle imobiliárias parceiras.',
      icon: Building2,
      features: ['Portfólio de imóveis', 'Pipeline de vendas', 'Analytics avançado', 'Gestão de parceiros', 'Efeito UAU e satisfação', 'Relatórios em PDF'],
      path: '/demo/construtora',
    },
    {
      role: 'imobiliaria',
      title: 'Explorar como Imobiliária',
      description: 'Divulgue imóveis com sua marca, capture leads, acompanhe satisfação dos visitantes e exporte relatórios de performance.',
      icon: Home,
      features: ['Links personalizados', 'Gestão de leads', 'Analytics de satisfação', 'Feedback pós-visita', 'Relatórios em PDF', 'Agendamento de visitas'],
      path: '/demo/imobiliaria',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="mb-10 text-center">
        <img src={logo} alt="Logo" className="mx-auto mb-6 h-12" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Modo Demonstração
        </h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Explore a plataforma com dados fictícios, sem necessidade de cadastro.
          Escolha o perfil que deseja conhecer:
        </p>
      </div>

      <div className="grid w-full max-w-3xl gap-6 md:grid-cols-2">
        {options.map((option) => (
          <Card
            key={option.role}
            className="group cursor-pointer border-2 border-transparent transition-all hover:border-primary hover:shadow-elegant"
            onClick={() => navigate(option.path)}
          >
            <CardContent className="flex flex-col p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <option.icon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                {option.title}
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                {option.description}
              </p>
              <ul className="mb-6 space-y-1.5 text-sm text-muted-foreground">
                {option.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-auto w-full gap-2 group-hover:bg-primary/90">
                Explorar
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="text-xs text-muted-foreground">
          Todas as ações de criação e exclusão estão desativadas no modo demonstração.
        </p>
      </div>
    </div>
  );
}
