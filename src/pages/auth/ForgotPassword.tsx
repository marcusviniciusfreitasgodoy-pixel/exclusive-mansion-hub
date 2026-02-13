import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { ArrowLeft, Mail, CheckCircle, Clock } from 'lucide-react';
import logo from '@/assets/logo-principal.png';
import authBackground from '@/assets/auth-background.jpg';

const emailSchema = z.object({
  email: z.string().email('E-mail inválido')
});

const STORAGE_KEY = 'pwd_reset_rate';
const MAX_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 60;
const LOCKOUT_SECONDS = 300; // 5 minutes

interface RateLimitState {
  attempts: number;
  cooldownUntil: number | null;
  lockedUntil: number | null;
}

function getStoredState(): RateLimitState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { attempts: 0, cooldownUntil: null, lockedUntil: null };
}

function saveState(state: RateLimitState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  // Check for existing cooldown/lockout on mount
  useEffect(() => {
    const stored = getStoredState();
    const now = Date.now();
    if (stored.lockedUntil && stored.lockedUntil > now) {
      setIsLockedOut(true);
      setRemainingSeconds(Math.ceil((stored.lockedUntil - now) / 1000));
    } else if (stored.cooldownUntil && stored.cooldownUntil > now) {
      setRemainingSeconds(Math.ceil((stored.cooldownUntil - now) / 1000));
    } else {
      // Clear expired states
      if (stored.lockedUntil && stored.lockedUntil <= now) {
        saveState({ attempts: 0, cooldownUntil: null, lockedUntil: null });
      }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (remainingSeconds <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (isLockedOut) {
        setIsLockedOut(false);
        saveState({ attempts: 0, cooldownUntil: null, lockedUntil: null });
      }
      return;
    }
    timerRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          const stored = getStoredState();
          if (stored.lockedUntil) {
            saveState({ attempts: 0, cooldownUntil: null, lockedUntil: null });
            setIsLockedOut(false);
          } else {
            saveState({ ...stored, cooldownUntil: null });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [remainingSeconds > 0, isLockedOut]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check lockout
    const stored = getStoredState();
    const now = Date.now();
    if (stored.lockedUntil && stored.lockedUntil > now) {
      toast({
        title: 'Muitas tentativas',
        description: 'Aguarde antes de tentar novamente.',
        variant: 'destructive'
      });
      return;
    }

    // Check cooldown
    if (stored.cooldownUntil && stored.cooldownUntil > now) {
      toast({
        title: 'Aguarde',
        description: 'Espere o cooldown antes de enviar novamente.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const validation = emailSchema.safeParse({ email });
      if (!validation.success) {
        toast({
          title: 'Erro de validação',
          description: validation.error.errors[0].message,
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível enviar o e-mail de recuperação. Tente novamente.',
          variant: 'destructive'
        });
      } else {
        const newAttempts = stored.attempts + 1;

        if (newAttempts >= MAX_ATTEMPTS) {
          // Lock out for 5 minutes
          const lockedUntil = Date.now() + LOCKOUT_SECONDS * 1000;
          saveState({ attempts: newAttempts, cooldownUntil: null, lockedUntil });
          setIsLockedOut(true);
          setRemainingSeconds(LOCKOUT_SECONDS);
        } else {
          // Apply 60s cooldown
          const cooldownUntil = Date.now() + COOLDOWN_SECONDS * 1000;
          saveState({ attempts: newAttempts, cooldownUntil, lockedUntil: null });
          setRemainingSeconds(COOLDOWN_SECONDS);
        }

        setIsSuccess(true);
        toast({
          title: 'E-mail enviado!',
          description: 'Verifique sua caixa de entrada para redefinir sua senha.'
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

  const isDisabled = isLoading || remainingSeconds > 0 || isLockedOut;

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
            Recuperar Senha
          </h1>
          <p className="mt-2 text-primary-foreground">
            {isSuccess 
              ? 'Verifique seu e-mail para continuar'
              : 'Digite seu e-mail para receber o link de recuperação'
            }
          </p>
        </div>

        <div className="mt-8 rounded-xl bg-white p-8 shadow-elegant">
          {isLockedOut ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Muitas tentativas</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Você atingiu o limite de tentativas. Aguarde <strong>{formatTime(remainingSeconds)}</strong> antes de tentar novamente.
                </p>
              </div>
              <div className="pt-4">
                <Link to="/auth/login" className="block">
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
                <h3 className="text-lg font-semibold text-foreground">E-mail enviado!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enviamos um link de recuperação para <strong>{email}</strong>. 
                  Verifique sua caixa de entrada e spam.
                </p>
              </div>
              {remainingSeconds > 0 && (
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" />
                  Aguarde {formatTime(remainingSeconds)} para reenviar
                </p>
              )}
              <div className="pt-4 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isDisabled}
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar para outro e-mail
                </Button>
                <Link to="/auth/login" className="block">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
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
              </div>

              {remainingSeconds > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Aguarde {formatTime(remainingSeconds)} para enviar
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isDisabled}>
                {isLoading ? 'Enviando...' : remainingSeconds > 0 ? `Aguarde ${formatTime(remainingSeconds)}` : 'Enviar link de recuperação'}
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
