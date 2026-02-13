import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, ShieldOff, Loader2, Copy, Check, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useOTPBruteForceProtection } from '@/hooks/useOTPBruteForceProtection';

type MFAStatus = 'loading' | 'inactive' | 'enrolling' | 'active';

interface EnrollmentData {
  factorId: string;
  qrCode: string;
  secret: string;
}

export function MFASetup() {
  const [status, setStatus] = useState<MFAStatus>('loading');
  const [activeFactorId, setActiveFactorId] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [code, setCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { isLocked, remainingSeconds, registerFailedAttempt, reset, getDelay } =
    useOTPBruteForceProtection();

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const verifiedFactor = data?.totp?.find(f => (f as any).status === 'verified');
      if (verifiedFactor) {
        setActiveFactorId(verifiedFactor.id);
        setStatus('active');
      } else {
        setStatus('inactive');
      }
    } catch {
      setStatus('inactive');
    }
  };

  const handleEnroll = async () => {
    setIsProcessing(true);
    try {
      const { data: existing } = await supabase.auth.mfa.listFactors();
      const unverified = existing?.totp?.filter(f => (f as any).status === 'unverified') || [];
      for (const factor of unverified) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }

      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;

      setEnrollment({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
      setStatus('enrolling');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Erro ao iniciar ativação.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmEnroll = async () => {
    if (!enrollment || code.length !== 6 || isLocked) return;

    const delay = getDelay();
    if (delay > 0) {
      setIsProcessing(true);
      await new Promise(r => setTimeout(r, delay));
    }

    setIsProcessing(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollment.factorId,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollment.factorId,
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
      setActiveFactorId(enrollment.factorId);
      setEnrollment(null);
      setCode('');
      setStatus('active');
      toast({ title: '2FA Ativado!', description: 'Autenticação de dois fatores configurada com sucesso.' });
    } catch (err: any) {
      registerFailedAttempt();
      toast({ title: 'Erro', description: err.message || 'Erro ao confirmar.', variant: 'destructive' });
      setCode('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnenroll = async () => {
    if (!activeFactorId) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: activeFactorId });
      if (error) throw error;

      setActiveFactorId(null);
      setStatus('inactive');
      toast({ title: '2FA Desativado', description: 'Autenticação de dois fatores foi removida.' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Erro ao desativar.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopySecret = () => {
    if (enrollment?.secret) {
      navigator.clipboard.writeText(enrollment.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancelEnroll = async () => {
    if (enrollment) {
      await supabase.auth.mfa.unenroll({ factorId: enrollment.factorId });
    }
    reset();
    setEnrollment(null);
    setCode('');
    setStatus('inactive');
  };

  if (status === 'loading') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <CardTitle>Autenticação em Dois Fatores (2FA)</CardTitle>
          </div>
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status === 'active' ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
        <CardDescription>
          Adicione uma camada extra de segurança usando um aplicativo autenticador como Google Authenticator ou Authy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'inactive' && (
          <Button onClick={handleEnroll} disabled={isProcessing}>
            {isProcessing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando...</>
            ) : (
              <><ShieldCheck className="mr-2 h-4 w-4" /> Ativar 2FA</>
            )}
          </Button>
        )}

        {status === 'enrolling' && enrollment && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              1. Escaneie o QR Code abaixo com seu aplicativo autenticador:
            </p>
            <div className="flex justify-center p-4 bg-white rounded-lg border">
              <img src={enrollment.qrCode} alt="QR Code para 2FA" className="w-48 h-48" />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Ou insira este código manualmente:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono break-all">
                  {enrollment.secret}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopySecret}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {isLocked && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Muitas tentativas. Tente novamente em <strong>{remainingSeconds}s</strong></span>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                2. Digite o código de 6 dígitos gerado pelo app:
              </p>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  onComplete={handleConfirmEnroll}
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
            </div>

            <div className="flex gap-2">
              <Button onClick={handleConfirmEnroll} disabled={code.length !== 6 || isProcessing || isLocked}>
                {isProcessing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirmando...</>
                ) : (
                  'Confirmar Ativação'
                )}
              </Button>
              <Button variant="outline" onClick={handleCancelEnroll}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {status === 'active' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sua conta está protegida com autenticação de dois fatores. Você precisará do código do aplicativo autenticador a cada login.
            </p>
            <Button variant="destructive" onClick={handleUnenroll} disabled={isProcessing}>
              {isProcessing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Desativando...</>
              ) : (
                <><ShieldOff className="mr-2 h-4 w-4" /> Desativar 2FA</>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
