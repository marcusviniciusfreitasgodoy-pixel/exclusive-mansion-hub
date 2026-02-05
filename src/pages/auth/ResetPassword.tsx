import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import logo from '@/assets/logo-principal.png';
import authBackground from '@/assets/auth-background.jpg';

const passwordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
});

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase handles the token automatically via the URL fragment
    // Check if we have a valid session after the redirect
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check URL for error or access_token
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const error = hashParams.get('error');
      const accessToken = hashParams.get('access_token');
      
      if (error) {
        setIsValidToken(false);
        toast({
          title: 'Link inválido',
          description: 'O link de recuperação expirou ou é inválido. Solicite um novo.',
          variant: 'destructive'
        });
      } else if (!accessToken && !session) {
        // No token in URL and no session - likely direct access
        setIsValidToken(false);
      }
    };

    checkSession();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = passwordSchema.safeParse({ password, confirmPassword });
      if (!validation.success) {
        toast({
          title: 'Erro de validação',
          description: validation.error.errors[0].message,
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar sua senha. Tente novamente.',
          variant: 'destructive'
        });
      } else {
        setIsSuccess(true);
        toast({
          title: 'Senha atualizada!',
          description: 'Sua senha foi alterada com sucesso.'
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
      }
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
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
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <img src={logo} alt="Logo" className="mx-auto h-16" />
          <h1 className="mt-6 text-3xl font-bold text-secondary">
            {isSuccess ? 'Senha Atualizada!' : 'Redefinir Senha'}
          </h1>
          <p className="mt-2 text-primary-foreground">
            {isSuccess 
              ? 'Você será redirecionado para o login'
              : 'Digite sua nova senha'
            }
          </p>
        </div>

        <div className="mt-8 rounded-xl bg-white p-8 shadow-elegant">
          {!isValidToken ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Link inválido ou expirado</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  O link de recuperação não é válido. Por favor, solicite um novo link.
                </p>
              </div>
              <div className="pt-4">
                <Link to="/auth/forgot-password">
                  <Button className="w-full">
                    Solicitar novo link
                  </Button>
                </Link>
                <Link to="/auth/login" className="block mt-3">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o login
                  </Button>
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Senha alterada!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sua senha foi atualizada com sucesso. Você será redirecionado para o login em instantes.
                </p>
              </div>
              <div className="pt-4">
                <Link to="/auth/login">
                  <Button className="w-full">
                    Ir para o login agora
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Nova senha</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Redefinir senha'}
              </Button>

              <div className="text-center">
                <Link 
                  to="/auth/login" 
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Voltar para o login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
