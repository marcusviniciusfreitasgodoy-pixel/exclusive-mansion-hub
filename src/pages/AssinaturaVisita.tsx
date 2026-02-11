import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SignaturePad, SignaturePadRef } from "@/components/feedback/SignaturePad";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, MapPin, Calendar, User, CheckCircle2, FileSignature, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type SignatureType = "visitante" | "corretor";

interface FichaPublic {
  id: string;
  codigo: string;
  endereco_imovel: string;
  data_visita: string | null;
  corretor_nome: string;
  status: string;
  assinatura_visitante: string | null;
  assinatura_corretor: string | null;
}

export default function AssinaturaVisita() {
  const { codigo, tipo } = useParams<{ codigo: string; tipo: string }>();
  const [ficha, setFicha] = useState<FichaPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assinado, setAssinado] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const sigRef = useRef<SignaturePadRef>(null);

  const signatureType: SignatureType = tipo === "corretor" ? "corretor" : "visitante";

  useEffect(() => {
    const fetchFicha = async () => {
      if (!codigo) { setNotFound(true); setLoading(false); return; }
      try {
        const { data, error } = await supabase
          .rpc("get_ficha_for_signature", { p_codigo: codigo });
        if (error) throw error;
        if (!data || (data as any[]).length === 0) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const fichaData = (data as any[])[0] as FichaPublic;
        setFicha(fichaData);

        const existingSig = signatureType === "visitante"
          ? fichaData.assinatura_visitante
          : fichaData.assinatura_corretor;
        if (existingSig) setAssinado(true);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchFicha();
  }, [codigo, signatureType]);

  const handleSave = async () => {
    if (!ficha || !sigRef.current || sigRef.current.isEmpty()) {
      toast.error("Desenhe sua assinatura antes de confirmar.");
      return;
    }
    setSaving(true);
    try {
      const signatureData = sigRef.current.getSignatureData();
      const { data, error } = await supabase
        .rpc("save_ficha_signature", {
          p_codigo: ficha.codigo,
          p_tipo: signatureType,
          p_assinatura: signatureData,
        });
      if (error) throw error;
      if (!data) {
        toast.error("Assinatura já foi registrada anteriormente.");
        setAssinado(true);
        return;
      }
      setAssinado(true);
      toast.success("Assinatura registrada com sucesso!");
    } catch {
      toast.error("Erro ao salvar assinatura. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Visita não encontrada</h2>
            <p className="text-sm text-muted-foreground">
              O código informado é inválido ou a ficha de visita não existe.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (assinado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Assinatura Registrada!</h2>
            <p className="text-sm text-muted-foreground">
              Sua assinatura foi salva com sucesso na ficha de visita.
            </p>
            {ficha && (
              <p className="text-xs text-muted-foreground mt-3">
                Código: {ficha.codigo}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-4">
        {/* Header */}
        <div className="text-center">
          <FileSignature className="h-10 w-10 text-primary mx-auto mb-2" />
          <h1 className="text-xl font-bold text-foreground">Assinatura Digital</h1>
          <p className="text-sm text-muted-foreground">
            {signatureType === "visitante"
              ? "Registre sua assinatura na ficha de visita"
              : "Registre a assinatura do corretor"}
          </p>
        </div>

        {/* Dados da visita */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Dados da Visita</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Imóvel</p>
                <p className="text-muted-foreground">{ficha!.endereco_imovel}</p>
              </div>
            </div>
            {ficha!.data_visita && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Data</p>
                  <p className="text-muted-foreground">
                    {format(new Date(ficha!.data_visita), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Corretor</p>
                <p className="text-muted-foreground">{ficha!.corretor_nome}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Canvas */}
        <Card>
          <CardContent className="pt-6">
            <SignaturePad ref={sigRef} height={160} />
            <Button className="w-full mt-4" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              {saving ? "Salvando..." : "Confirmar Assinatura"}
            </Button>
          </CardContent>
        </Card>

        {/* Termos */}
        <p className="text-xs text-muted-foreground text-center px-4">
          Ao assinar, você declara que visitou o imóvel acima e está ciente dos termos
          da ficha de visita, conforme Lei 6.530/78.
        </p>
      </div>
    </div>
  );
}
