import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CNHUpload } from "./CNHUpload";
import { SignaturePad, SignaturePadRef } from "@/components/feedback/SignaturePad";
import { PropostaPreFill } from "@/types/proposta";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";

const proposalSchema = z.object({
  nome_completo: z.string().min(3, "Nome obrigatório"),
  cpf_cnpj: z.string().min(11, "CPF/CNPJ obrigatório"),
  telefone: z.string().min(10, "Telefone obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  endereco_resumido: z.string().min(5, "Endereço obrigatório"),
  unidade: z.string().optional(),
  matricula: z.string().optional(),
  valor_ofertado: z.string().min(1, "Valor obrigatório"),
  sinal_entrada: z.string().optional(),
  parcelas: z.string().optional(),
  financiamento: z.string().optional(),
  outras_condicoes: z.string().optional(),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

interface ProposalFormProps {
  preFill?: PropostaPreFill;
  onSuccess?: () => void;
}

export function ProposalForm({ preFill, onSuccess }: ProposalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cnhUrl, setCnhUrl] = useState<string | null>(null);
  const [isUploadingCNH, setIsUploadingCNH] = useState(false);
  const signatureRef = useRef<SignaturePadRef>(null);
  const [hasSignature, setHasSignature] = useState(false);

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      nome_completo: preFill?.nome_completo || "",
      cpf_cnpj: preFill?.cpf_cnpj || "",
      telefone: preFill?.telefone || "",
      email: preFill?.email || "",
      endereco_resumido: preFill?.endereco_resumido || "",
      valor_ofertado: preFill?.valor_ofertado ? String(preFill.valor_ofertado) : "",
    },
  });

  const handleCNHUpload = async (file: File): Promise<string> => {
    setIsUploadingCNH(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `propostas/${Date.now()}-cnh.${ext}`;
      const { error } = await supabase.storage
        .from("documentos-proposta")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("documentos-proposta")
        .getPublicUrl(path);
      const url = urlData.publicUrl;
      setCnhUrl(url);
      return url;
    } finally {
      setIsUploadingCNH(false);
    }
  };

  const onSubmit = async (data: ProposalFormData) => {
    if (signatureRef.current?.isEmpty()) {
      toast.error("Assinatura obrigatória", {
        description: "Por favor, assine antes de enviar a proposta.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const signatureData = signatureRef.current?.getSignatureData() || "";
      const valorNum = data.valor_ofertado ? parseFloat(data.valor_ofertado.replace(/\D/g, "")) : null;

      const { error } = await supabase.rpc("submit_proposta_compra", {
        p_token: preFill?.token || "",
        p_nome_completo: data.nome_completo,
        p_cpf_cnpj: data.cpf_cnpj,
        p_telefone: data.telefone,
        p_email: data.email || null,
        p_endereco_resumido: data.endereco_resumido,
        p_unidade: data.unidade || null,
        p_matricula: data.matricula || null,
        p_valor_ofertado: valorNum,
        p_sinal_entrada: data.sinal_entrada || null,
        p_parcelas: data.parcelas || null,
        p_financiamento: data.financiamento || null,
        p_outras_condicoes: data.outras_condicoes || null,
        p_assinatura_proponente: signatureData,
        p_cnh_url: cnhUrl,
      });

      if (error) throw error;

      toast.success("Proposta enviada com sucesso!");
      setSubmitted(true);
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao enviar proposta:", error);
      toast.error("Erro ao enviar proposta", {
        description: error?.message || "Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Proposta Enviada!</h3>
          <p className="text-muted-foreground">
            Sua proposta foi registrada com sucesso. A imobiliária entrará em contato em breve.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold flex items-center justify-center gap-2">
          <FileText className="h-5 w-5" />
          Proposta Formal de Compra
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Preencha os dados abaixo para formalizar sua proposta
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Identificação do Proponente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">👤 Identificação do Proponente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="nome_completo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl><Input placeholder="Nome completo" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="cpf_cnpj" render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF / CNPJ *</FormLabel>
                    <FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="telefone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl><Input placeholder="(00) 00000-0000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl><Input type="email" placeholder="email@exemplo.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Identificação do Imóvel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🏠 Identificação do Imóvel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="endereco_resumido" render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço do Imóvel *</FormLabel>
                  <FormControl><Input placeholder="Endereço completo" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="unidade" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade / Apto</FormLabel>
                    <FormControl><Input placeholder="Ex: Apto 101" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="matricula" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matrícula</FormLabel>
                    <FormControl><Input placeholder="Nº da matrícula" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* Valor e Condições */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">💰 Valor e Condições</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="valor_ofertado" render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Ofertado *</FormLabel>
                  <FormControl>
                    <CurrencyInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="sinal_entrada" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sinal / Entrada</FormLabel>
                  <FormControl><Input placeholder="Ex: R$ 50.000 na assinatura" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="parcelas" render={({ field }) => (
                <FormItem>
                  <FormLabel>Parcelas</FormLabel>
                  <FormControl><Input placeholder="Ex: 24x de R$ 5.000" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="financiamento" render={({ field }) => (
                <FormItem>
                  <FormLabel>Financiamento</FormLabel>
                  <FormControl><Input placeholder="Ex: Financiamento CEF 30 anos" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="outras_condicoes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Outras Condições</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Condições adicionais, observações..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Upload CNH */}
          <CNHUpload onUpload={handleCNHUpload} isUploading={isUploadingCNH} />

          {/* Cláusula informativa */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Cláusula informativa:</strong> Esta proposta constitui uma manifestação formal de interesse 
                de compra e não possui caráter vinculante até a assinatura do contrato de compra e venda 
                definitivo entre as partes. Os termos aqui apresentados estão sujeitos à aprovação do 
                proprietário/vendedor e poderão ser objeto de negociação.
              </p>
            </CardContent>
          </Card>

          {/* Assinatura */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">✍️ Assinatura do Proponente</CardTitle>
              <CardDescription>
                Confirme sua proposta com assinatura digital
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignaturePad
                ref={signatureRef}
                onSignatureChange={setHasSignature}
                height={180}
              />
            </CardContent>
          </Card>

          {!hasSignature && (
            <p className="text-sm text-amber-600 text-center flex items-center justify-center gap-1">
              ⚠️ Confirme sua assinatura acima antes de enviar.
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || !hasSignature}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            <Send className="h-4 w-4 mr-2" />
            Enviar Proposta
          </Button>
        </form>
      </Form>
    </div>
  );
}
