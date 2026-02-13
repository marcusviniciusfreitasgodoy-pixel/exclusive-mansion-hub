import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { useOTPBruteForceProtection } from '@/hooks/useOTPBruteForceProtection';
import logo from '@/assets/logo-principal.png';
import authBackground from '@/assets/auth-background.jpg';

export default function MFAVerify() {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { completeMFA, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAutoLogout = useCallback(async () => {
    toast({
      title: 'Conta bloqueada',
      description: 'Muitas tentativas falhas. Faça login novamente.',
      variant: 'destructive',
    });
    await signOut();
    navigate('/auth/login', { replace: true });
  }, [signOut, navigate, toast]);

  const { isLocked, remainingSeconds, registerFailedAttempt, reset, getDelay } =
    useOTPBruteForceProtection(handleAutoLogout);

  const handleVerify = async () => {
    if (code.length !== 6 || isLocked) return;

    const delay = getDelay();
    if (delay > 0) {
      setIsVerifying(true);
      await new Promise(r => setTimeout(r, delay));
    }

    setIsVerifying(true);
    try {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactor = factorsData?.totp?.[0];

      if (!totpFactor) {
        toast({ title: 'Erro', description: 'Nenhum fator TOTP encontrado.', variant: 'destructive' });
        return;
      }

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        registerFailedAttempt();
        toast({ title: 'Código inválido', description: 'Verifique o código e tente novamente.', variant: 'destructive' });
        setCode('');
        return;
      }

      reset();
      completeMFA();
      toast({ title: 'Verificado!', description: 'Autenticação de dois fatores concluída.' });
    } catch (err: any) {
      console.error('MFA verify error:', err);
      registerFailedAttempt();
      toast({ title: 'Erro', description: err.message || 'Erro ao verificar código.', variant: 'destructive' });
      setCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBack = async () => {
    await signOut();
    navigate('/auth/login', { replace: true });
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
          <div className="mt-6 flex items-center justify-center gap-2">
            <ShieldCheck className="h-7 w-7 text-secondary" />
            <h1 className="text-3xl font-bold text-secondary">Verificação 2FA</h1>
          </div>
          <p className="mt-2 text-primary-foreground">
            Digite o código de 6 dígitos do seu aplicativo autenticador
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-elegant space-y-6">
          {isLocked && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Muitas tentativas. Tente novamente em <strong>{remainingSeconds}s</strong></span>
            </div>
          )}

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              onComplete={handleVerify}
              disabled={isLocked}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={handleVerify}
            className="w-full"
            disabled={code.length !== 6 || isVerifying || isLocked}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar'
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={handleBack}
            className="w-full text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o login
          </Button>
        </div>
      </div>
    </div>
  );
}
