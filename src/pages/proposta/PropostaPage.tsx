import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { Loader2, MapPin, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { ProposalForm } from "@/components/proposta/ProposalForm";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function PropostaPage() {
  const { token } = useParams<{ token: string }>();
  const tokenValue = token?.trim() ?? "";
  const isValidToken = z.string().uuid().safeParse(tokenValue).success;

  const { data: feedback, isLoading, error } = useQuery({
    queryKey: ["proposta-feedback", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_feedback_by_token", { p_token: tokenValue })
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      const [imovelRes, imobiliariaRes] = await Promise.all([
        data.imovel_id
          ? supabase.from("imoveis").select("titulo, endereco, bairro, cidade, valor").eq("id", data.imovel_id).maybeSingle()
          : Promise.resolve({ data: null }),
        data.imobiliaria_id
          ? supabase.from("imobiliarias_public").select("nome_empresa, logo_url").eq("id", data.imobiliaria_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      return { ...data, imoveis: imovelRes.data, imobiliarias: imobiliariaRes.data };
    },
    enabled: isValidToken,
  });

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-6">
        <h1 className="text-2xl font-bold mb-4">Link inválido</h1>
        <p className="text-muted-foreground">O link da proposta está incompleto ou inválido.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-6">
        <h1 className="text-2xl font-bold mb-4">Link inválido</h1>
        <p className="text-muted-foreground">Este link de proposta não é válido ou já expirou.</p>
      </div>
    );
  }

  const endereco = [feedback.imoveis?.endereco, feedback.imoveis?.bairro, feedback.imoveis?.cidade]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {feedback.imobiliarias?.logo_url && (
            <img src={feedback.imobiliarias.logo_url} alt="Logo" className="h-12 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold mb-2">
            Olá, {feedback.cliente_nome?.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Formalize sua proposta de compra para o imóvel abaixo
          </p>
        </div>

        {/* Info do Imóvel */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="font-semibold text-lg mb-2">{feedback.imoveis?.titulo}</h2>
            {endereco && (
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {endereco}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(feedback.data_visita), "dd/MM/yyyy", { locale: ptBR })}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {feedback.corretor_nome || "Corretor"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Proposta */}
        <ProposalForm
          preFill={{
            nome_completo: feedback.cliente_nome || "",
            telefone: (feedback as any).cliente_telefone || "",
            email: feedback.cliente_email || "",
            endereco_resumido: endereco,
            valor_ofertado: feedback.imoveis?.valor || undefined,
            token: tokenValue,
          }}
        />
      </div>
    </div>
  );
}
