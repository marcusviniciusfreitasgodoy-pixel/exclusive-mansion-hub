import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Clock } from 'lucide-react';
import { z } from 'zod';
import logo from '@/assets/logo-principal.png';
import authBackground from '@/assets/auth-background.jpg';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

const LOGIN_RATE_KEY = 'login_brute_force';
const LOCKOUT_THRESHOLD = 5;

interface LoginRateState {
  failedAttempts: number;
  lockedUntil: number | null;
}

function getLoginRateState(): LoginRateState {
  try {
    const raw = sessionStorage.getItem(LOGIN_RATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { failedAttempts: 0, lockedUntil: null };
}

function saveLoginRateState(state: LoginRateState) {
  sessionStorage.setItem(LOGIN_RATE_KEY, JSON.stringify(state));
}

function getLockoutDuration(attempts: number): number {
  // 30s, 60s, 120s for successive lockouts
  const lockoutIndex = Math.floor((attempts - LOCKOUT_THRESHOLD) / LOCKOUT_THRESHOLD);
  return Math.min(30 * Math.pow(2, lockoutIndex), 120);
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const loginSuccessRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { signIn, user, role, loading, mfaRequired } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check existing lockout on mount
  useEffect(() => {
    const stored = getLoginRateState();
    if (stored.lockedUntil) {
      const remaining = Math.ceil((stored.lockedUntil - Date.now()) / 1000);
      if (remaining > 0) {
        setRemainingSeconds(remaining);
      } else {
        saveLoginRateState({ ...stored, lockedUntil: null });
      }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (remainingSeconds <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          const stored = getLoginRateState();
          saveLoginRateState({ ...stored, lockedUntil: null });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [remainingSeconds > 0]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
  }, []);

  // Redirect authenticated users when role is loaded
  useEffect(() => {
    if (!loading && user && mfaRequired) {
      navigate('/auth/mfa-verify', { replace: true });
      return;
    }
    if (!loading && user && role) {
      if (role === 'construtora') {
        navigate('/dashboard/construtora', { replace: true });
      } else if (role === 'imobiliaria') {
        navigate('/dashboard/imobiliaria', { replace: true });
      }
    }
  }, [user, role, loading, navigate, mfaRequired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check lockout
    const stored = getLoginRateState();
    if (stored.lockedUntil && stored.lockedUntil > Date.now()) {
      toast({
        title: 'Conta temporariamente bloqueada',
        description: 'Aguarde antes de tentar novamente.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        toast({
          title: 'Erro de validação',
          description: validation.error.errors[0].message,
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      const { error } = await signIn(email, password);
      if (error) {
        // Register failed attempt
        const current = getLoginRateState();
        const newCount = current.failedAttempts + 1;

        if (newCount >= LOCKOUT_THRESHOLD && newCount % LOCKOUT_THRESHOLD === 0) {
          const duration = getLockoutDuration(newCount);
          const lockedUntil = Date.now() + duration * 1000;
          saveLoginRateState({ failedAttempts: newCount, lockedUntil });
          setRemainingSeconds(duration);
          toast({
            title: 'Muitas tentativas falhas',
            description: `Conta bloqueada por ${duration} segundos.`,
            variant: 'destructive'
          });
        } else {
          saveLoginRateState({ failedAttempts: newCount, lockedUntil: null });
          let message = 'Erro ao fazer login';
          if (error.message.includes('Invalid login credentials')) {
            message = 'E-mail ou senha incorretos';
          } else if (error.message.includes('Email not confirmed')) {
            message = 'Confirme seu e-mail antes de fazer login';
          }
          toast({
            title: 'Erro',
            description: message,
            variant: 'destructive'
          });
        }
      } else {
        // Reset on success
        saveLoginRateState({ failedAttempts: 0, lockedUntil: null });
        loginSuccessRef.current = true;
        toast({
          title: 'Sucesso',
          description: 'Login realizado com sucesso!'
        });
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

  // If already authenticated and loading role, show spinner
  if (user && !role && (loading || loginSuccessRef.current)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const isLocked = remainingSeconds > 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 relative" style={{
      backgroundImage: `url(${authBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <img src={logo} alt="Logo" className="mx-auto h-16" />
          <h1 className="mt-6 text-3xl font-bold text-secondary">Entrar</h1>
          <p className="mt-2 text-primary-foreground">
            Acesse sua conta para gerenciar seus imóveis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-xl bg-white p-8 shadow-elegant">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative mt-1">
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="pr-10" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mt-1 text-right">
                <Link 
                  to="/auth/forgot-password" 
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Esqueci minha senha
                </Link>
              </div>
            </div>
          </div>

          {isLocked && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Bloqueado por {formatTime(remainingSeconds)}. Aguarde para tentar novamente.
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || isLocked}>
            {isLoading ? 'Entrando...' : isLocked ? `Aguarde ${formatTime(remainingSeconds)}` : 'Entrar'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Não tem uma conta?</p>
            <div className="mt-2 flex justify-center gap-4">
              <Link to="/auth/register/construtora" className="font-medium text-primary hover:text-primary/80">
                Sou Construtora
              </Link>
              <span>|</span>
              <Link to="/auth/register/imobiliaria" className="font-medium text-primary hover:text-primary/80">
                Sou Imobiliária / Corretor
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
