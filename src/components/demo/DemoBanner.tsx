import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Eye, ArrowRightLeft, UserPlus } from 'lucide-react';

export function DemoBanner() {
  const { isDemo, demoRole } = useDemo();
  const navigate = useNavigate();

  if (!isDemo) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-secondary px-4 py-2 text-secondary-foreground">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Eye className="h-4 w-4" />
        <span>Modo Demonstração — {demoRole === 'construtora' ? 'Construtora' : 'Imobiliária'}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 border-secondary-foreground/30 bg-transparent text-secondary-foreground hover:bg-secondary-foreground/10"
          onClick={() => navigate('/demo')}
        >
          <ArrowRightLeft className="mr-1 h-3 w-3" />
          Trocar Perfil
        </Button>
        <Button
          size="sm"
          className="h-7 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => navigate('/auth/register/construtora')}
        >
          <UserPlus className="mr-1 h-3 w-3" />
          Criar Conta
        </Button>
      </div>
    </div>
  );
}
