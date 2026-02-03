import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import logo from '@/assets/logo-principal.png';
import authBackground from '@/assets/auth-background.jpg';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        toast({
          title: 'Erro de validação',
          description: validation.error.errors[0].message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const { error } = await signIn(email, password);
      
      if (error) {
        let message = 'Erro ao fazer login';
        if (error.message.includes('Invalid login credentials')) {
          message = 'E-mail ou senha incorretos';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Confirme seu e-mail antes de fazer login';
        }
        toast({
          title: 'Erro',
          description: message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sucesso',
          description: 'Login realizado com sucesso!',
        });
        // Redirect will happen via AuthContext after role is loaded
        setTimeout(() => {
          if (role === 'construtora') {
            navigate('/dashboard/construtora');
          } else if (role === 'imobiliaria') {
            navigate('/dashboard/imobiliaria');
          } else {
            navigate('/');
          }
        }, 500);
      }
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex min-h-screen flex-col items-center justify-center px-4 relative"
      style={{
        backgroundImage: `url(${authBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <img src={logo} alt="Logo" className="mx-auto h-16" />
          <h1 className="mt-6 text-3xl font-bold text-primary">Entrar</h1>
          <p className="mt-2 text-muted-foreground">
            Acesse sua conta para gerenciar seus imóveis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-xl bg-white p-8 shadow-elegant">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Não tem uma conta?</p>
            <div className="mt-2 flex justify-center gap-4">
              <Link 
                to="/auth/register/construtora" 
                className="font-medium text-primary hover:text-primary/80"
              >
                Sou Construtora
              </Link>
              <span>|</span>
              <Link 
                to="/auth/register/imobiliaria" 
                className="font-medium text-primary hover:text-primary/80"
              >
                Sou Imobiliária
              </Link>
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          <Link to="/imovel/cobertura-lucio-costa-godoyprime" className="hover:text-primary">
            ← Voltar para o site
          </Link>
        </p>
      </div>
    </div>
  );
}
