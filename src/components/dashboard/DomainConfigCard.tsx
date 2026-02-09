import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Globe, Loader2, CheckCircle2, AlertCircle, Clock, Copy, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface DomainConfigCardProps {
  entityType: "construtora" | "imobiliaria";
  entityId: string;
}

interface DomainRecord {
  id: string;
  domain: string;
  status: string;
  verified_at: string | null;
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { label: "Pendente", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  verified: { label: "Verificado", variant: "outline", icon: <CheckCircle2 className="h-3 w-3" /> },
  active: { label: "Ativo", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
  failed: { label: "Falhou", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
};

const STEPS = [
  { label: "Salvar domínio" },
  { label: "Configurar DNS" },
  { label: "Verificar e ativar" },
];

function getActiveStep(domain: DomainRecord | null): number {
  if (!domain) return 0;
  if (domain.status === "active") return 3; // all done
  if (domain.status === "verified") return 2;
  return 1; // pending or failed
}

function StepIndicator({ activeStep }: { activeStep: number }) {
  return (
    <div className="flex items-center justify-between px-6 pb-2">
      {STEPS.map((step, i) => {
        const completed = i < activeStep;
        const current = i === activeStep;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold border-2 transition-colors ${
                  completed
                    ? "border-green-600 bg-green-600 text-white"
                    : current
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 bg-background text-muted-foreground"
                }`}
              >
                {completed ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-[10px] leading-tight text-center max-w-[72px] ${
                  completed ? "text-green-600 font-medium" : current ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 mt-[-14px] transition-colors ${
                  i < activeStep ? "bg-green-600" : "bg-muted-foreground/20"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function DomainConfigCard({ entityType, entityId }: DomainConfigCardProps) {
  const [domain, setDomain] = useState("");
  const [existingDomain, setExistingDomain] = useState<DomainRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    loadDomain();
  }, [entityId]);

  async function loadDomain() {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("custom_domains")
        .select("id, domain, status, verified_at")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .limit(1)
        .maybeSingle();

      if (data) {
        setExistingDomain(data);
        setDomain(data.domain);
      }
    } catch (err) {
      console.error("Erro ao carregar domínio:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveDomain() {
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    if (!cleanDomain) {
      toast.error("Informe um domínio válido");
      return;
    }

    setIsSaving(true);
    try {
      if (existingDomain) {
        const { error } = await supabase
          .from("custom_domains")
          .update({ domain: cleanDomain, status: "pending", verified_at: null })
          .eq("id", existingDomain.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("custom_domains")
          .insert({ domain: cleanDomain, entity_type: entityType, entity_id: entityId });
        if (error) throw error;
      }

      // Also update the entity table
      if (entityType === "construtora") {
        await supabase.from("construtoras").update({ dominio_customizado: cleanDomain }).eq("id", entityId);
      } else {
        await supabase.from("imobiliarias").update({ dominio_customizado: cleanDomain }).eq("id", entityId);
      }

      toast.success("Domínio salvo! Configure o DNS conforme as instruções abaixo.");
      await loadDomain();
    } catch (err: any) {
      if (err?.code === "23505") {
        toast.error("Este domínio já está em uso por outra empresa.");
      } else {
        toast.error("Erro ao salvar domínio");
        console.error(err);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleVerifyDomain() {
    if (!existingDomain) return;
    setIsVerifying(true);
    try {
      const res = await supabase.functions.invoke("verify-domain", {
        body: { domain: existingDomain.domain },
      });

      if (res.error) throw res.error;

      const result = res.data;
      if (result?.verified) {
        toast.success("DNS verificado com sucesso! Domínio ativo.");
      } else {
        toast.warning(result?.message || "DNS ainda não aponta corretamente. Verifique as configurações.");
      }
      await loadDomain();
    } catch (err) {
      console.error("Erro ao verificar domínio:", err);
      toast.error("Erro ao verificar DNS");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleRemoveDomain() {
    if (!existingDomain) return;
    try {
      await supabase.from("custom_domains").delete().eq("id", existingDomain.id);
      if (entityType === "construtora") {
        await supabase.from("construtoras").update({ dominio_customizado: null }).eq("id", entityId);
      } else {
        await supabase.from("imobiliarias").update({ dominio_customizado: null }).eq("id", entityId);
      }
      setExistingDomain(null);
      setDomain("");
      toast.success("Domínio removido");
    } catch (err) {
      toast.error("Erro ao remover domínio");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  }

  const status = existingDomain ? STATUS_MAP[existingDomain.status] || STATUS_MAP.pending : null;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Domínio Customizado
        </CardTitle>
        <CardDescription>
          Configure um domínio próprio para exibir seus imóveis com sua marca.
        </CardDescription>
      </CardHeader>
      <StepIndicator activeStep={getActiveStep(existingDomain)} />
      <CardContent className="space-y-4">
        {/* Domain input */}
        <div className="flex gap-2">
          <Input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="imoveis.suaempresa.com.br"
            disabled={isSaving}
          />
          <Button onClick={handleSaveDomain} disabled={isSaving || !domain.trim()}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
          </Button>
        </div>

        {/* Status + Actions */}
        {existingDomain && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={status?.variant} className="flex items-center gap-1">
                {status?.icon}
                {status?.label}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleVerifyDomain} disabled={isVerifying}>
                {isVerifying ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-1 h-3 w-3" />}
                Verificar DNS
              </Button>
              <Button variant="ghost" size="sm" onClick={handleRemoveDomain} className="text-destructive hover:text-destructive">
                Remover
              </Button>
            </div>

            {/* DNS Instructions */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <p className="text-sm font-medium">Instruções de configuração DNS:</p>
              <p className="text-xs text-muted-foreground">
                Adicione um registro CNAME no painel de DNS do seu provedor de domínio:
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="font-medium text-muted-foreground">Tipo</span>
                  <p className="font-mono mt-1">CNAME</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Nome</span>
                  <p className="font-mono mt-1">{existingDomain.domain.split(".")[0]}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Valor</span>
                  <div className="flex items-center gap-1 mt-1">
                    <p className="font-mono">whitelabel.godoyprime.com.br</p>
                    <button onClick={() => copyToClipboard("whitelabel.godoyprime.com.br")} className="text-muted-foreground hover:text-foreground">
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                TTL recomendado: 3600 (1 hora). A propagação DNS pode levar até 48 horas.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
