import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle,
  MapPin,
  Calendar,
  User,
  FileText,
  Download,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignaturePad, SignaturePadRef } from "@/components/feedback/SignaturePad";
import { StarRating } from "@/components/feedback/StarRating";
import { NPSScale } from "@/components/feedback/NPSScale";
import { CNHUpload } from "@/components/proposta/CNHUpload";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { OBJECOES_OPTIONS } from "@/types/feedback";

const PRAZO_COMPRA_OPTIONS = [
  { value: "0-3_meses", label: "0 a 3 meses" },
  { value: "3-6_meses", label: "3 a 6 meses" },
  { value: "6-12_meses", label: "6 a 12 meses" },
  { value: "acima_12_meses", label: "Acima de 12 meses" },
  { value: "indefinido", label: "Indefinido" },
] as const;

const FORMA_PAGAMENTO_OPTIONS = [
  { value: "financiamento", label: "Financiamento bancário" },
  { value: "a_vista", label: "À vista" },
  { value: "consorcio", label: "Consórcio" },
  { value: "permuta", label: "Permuta" },
  { value: "outro", label: "Outro" },
] as const;

const EFEITO_UAU_OPTIONS = [
  { value: "vista", label: "🌅 Vista" },
  { value: "acabamento", label: "✨ Acabamento" },
  { value: "espaco", label: "📐 Espaço" },
  { value: "iluminacao", label: "💡 Iluminação" },
  { value: "varanda", label: "🌿 Varanda / Área externa" },
  { value: "cozinha", label: "🍳 Cozinha" },
  { value: "banheiros", label: "🚿 Banheiros" },
  { value: "localizacao", label: "📍 Localização" },
  { value: "condominio", label: "🏢 Condomínio" },
  { value: "seguranca", label: "🔒 Segurança" },
] as const;

const INTERESSE_OPTIONS = [
  { value: "muito_interessado", label: "🔥 Muito Alto", sublabel: "Quero fazer uma proposta" },
  { value: "interessado", label: "👍 Alto", sublabel: "Preciso pensar mais" },
  { value: "pouco_interessado", label: "🤔 Médio", sublabel: "Tenho dúvidas" },
  { value: "sem_interesse", label: "❌ Baixo", sublabel: "Não tenho interesse" },
] as const;

const PERCEPCAO_VALOR_OPTIONS = [
  { value: "abaixo_mercado", label: "Abaixo do mercado" },
  { value: "preco_justo", label: "Preço justo" },
  { value: "acima_mercado", label: "Acima do mercado" },
] as const;

const baseSchema = z.object({
  nps_cliente: z.number().min(0).max(10, "Selecione uma nota"),
  avaliacao_localizacao: z.number().min(1).max(5),
  avaliacao_acabamento: z.number().min(1).max(5),
  avaliacao_layout: z.number().min(1).max(5),
  avaliacao_custo_beneficio: z.number().min(1).max(5),
  avaliacao_atendimento: z.number().min(1).max(5),
  pontos_positivos: z.string().min(5, "Descreva os pontos positivos"),
  pontos_negativos: z.string().optional(),
  interesse_compra: z.enum(["muito_interessado", "interessado", "pouco_interessado", "sem_interesse"], {
    required_error: "Selecione seu nível de interesse",
  }),
  percepcao_valor: z.string().optional(),
  objecoes: z.array(z.string()).optional(),
  objecoes_detalhes: z.string().optional(),
  efeito_uau: z.array(z.string()).optional(),
  efeito_uau_detalhe: z.string().optional(),
  prazo_compra_cliente: z.string({ required_error: "Selecione o prazo estimado" }),
  orcamento_cliente: z.string().optional(),
  forma_pagamento_cliente: z.string().optional(),
  comentarios_livres: z.string().optional(),
  proximos_passos_cliente: z.string().optional(),
  declaracao_verdade: z.boolean().refine((val) => val === true, {
    message: "Você deve confirmar a veracidade das informações",
  }),
  // Proposal fields
  gostaria_fazer_proposta: z.boolean().optional(),
  prop_nome_completo: z.string().optional(),
  prop_cpf_cnpj: z.string().optional(),
  prop_telefone: z.string().optional(),
  prop_email: z.string().optional(),
  prop_endereco_resumido: z.string().optional(),
  prop_unidade: z.string().optional(),
  prop_matricula: z.string().optional(),
  prop_valor_ofertado: z.string().optional(),
  prop_sinal_entrada: z.string().optional(),
  prop_parcelas: z.string().optional(),
  prop_financiamento: z.string().optional(),
  prop_outras_condicoes: z.string().optional(),
  prop_cidade_uf: z.string().optional(),
  prop_validade_proposta: z.string().optional(),
  prop_forma_aceite: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.gostaria_fazer_proposta) {
    if (!data.prop_nome_completo || data.prop_nome_completo.length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nome obrigatório (min. 3 caracteres)", path: ["prop_nome_completo"] });
    }
    if (!data.prop_cpf_cnpj || data.prop_cpf_cnpj.length < 11) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CPF/CNPJ obrigatório", path: ["prop_cpf_cnpj"] });
    }
    if (!data.prop_telefone || data.prop_telefone.length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Telefone obrigatório", path: ["prop_telefone"] });
    }
    if (!data.prop_valor_ofertado) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valor ofertado obrigatório", path: ["prop_valor_ofertado"] });
    }
  }
});

type FormData = z.infer<typeof baseSchema>;

export default function FeedbackClientePublico() {
  const { token } = useParams<{ token: string }>();
  const tokenValue = token?.trim() ?? "";
  const isValidToken = z.string().uuid().safeParse(tokenValue).success;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const signatureRef = useRef<SignaturePadRef>(null);
  const proposalSignatureRef = useRef<SignaturePadRef>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [cnhUrl, setCnhUrl] = useState<string | null>(null);
  const [isUploadingCNH, setIsUploadingCNH] = useState(false);

  const { data: feedback, isLoading, error, refetch } = useQuery({
    queryKey: ["feedback-publico", token],
    queryFn: async () => {
      const { data: feedbackData, error: feedbackError } = await supabase
        .rpc("get_feedback_by_token", { p_token: tokenValue })
        .maybeSingle();

      if (feedbackError) throw feedbackError;
      if (!feedbackData) return null;

      const [imovelRes, imobiliariaRes, construtoraRes] = await Promise.all([
        feedbackData.imovel_id
          ? supabase.from("imoveis").select("titulo, endereco, bairro, cidade, valor").eq("id", feedbackData.imovel_id).maybeSingle()
          : Promise.resolve({ data: null }),
        feedbackData.imobiliaria_id
          ? supabase.from("imobiliarias_public").select("nome_empresa, logo_url").eq("id", feedbackData.imobiliaria_id).maybeSingle()
          : Promise.resolve({ data: null }),
        feedbackData.construtora_id
          ? supabase.from("construtoras").select("nome_empresa, logo_url").eq("id", feedbackData.construtora_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      return {
        ...feedbackData,
        imoveis: imovelRes.data,
        imobiliarias: imobiliariaRes.data,
        construtoras: construtoraRes.data,
      };
    },
    enabled: isValidToken,
  });

  const enderecoImovel = feedback
    ? [feedback.imoveis?.endereco, feedback.imoveis?.bairro, feedback.imoveis?.cidade].filter(Boolean).join(", ")
    : "";

  const form = useForm<FormData>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      nps_cliente: -1,
      avaliacao_localizacao: 0,
      avaliacao_acabamento: 0,
      avaliacao_layout: 0,
      avaliacao_custo_beneficio: 0,
      avaliacao_atendimento: 0,
      pontos_positivos: "",
      pontos_negativos: "",
      objecoes: [],
      efeito_uau: [],
      efeito_uau_detalhe: "",
      prazo_compra_cliente: "",
      orcamento_cliente: "",
      forma_pagamento_cliente: "",
      comentarios_livres: "",
      proximos_passos_cliente: "",
      declaracao_verdade: false,
      percepcao_valor: "",
      gostaria_fazer_proposta: false,
      prop_nome_completo: "",
      prop_cpf_cnpj: "",
      prop_telefone: "",
      prop_email: "",
      prop_endereco_resumido: "",
      prop_unidade: "",
      prop_matricula: "",
      prop_valor_ofertado: "",
      prop_sinal_entrada: "",
      prop_parcelas: "",
      prop_financiamento: "",
      prop_outras_condicoes: "",
      prop_cidade_uf: "",
      prop_validade_proposta: "",
      prop_forma_aceite: "assinatura",
    },
  });

  const interesseCompra = form.watch("interesse_compra");
  const showObjecoes = interesseCompra === "pouco_interessado" || interesseCompra === "sem_interesse";
  const gostariaFazerProposta = form.watch("gostaria_fazer_proposta");

  // Pre-fill proposal fields when feedback data is available
  useEffect(() => {
    if (feedback) {
      form.setValue("prop_nome_completo", feedback.cliente_nome || "");
      form.setValue("prop_telefone", (feedback as any).cliente_telefone || "");
      form.setValue("prop_email", feedback.cliente_email || "");
      form.setValue("prop_endereco_resumido", enderecoImovel);
    }
  }, [feedback, enderecoImovel]);

  useEffect(() => {
    if (feedback?.status === "completo") {
      setIsComplete(true);
    }
  }, [feedback]);

  const handleCNHUpload = async (file: File): Promise<string> => {
    setIsUploadingCNH(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `proposta-${tokenValue}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("documentos-proposta")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
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

  const onSubmit = async (data: FormData) => {
    if (!feedback) return;

    if (signatureRef.current?.isEmpty()) {
      toast.error("Assinatura obrigatória", {
        description: "Por favor, assine o documento antes de enviar.",
      });
      return;
    }

    if (data.gostaria_fazer_proposta && proposalSignatureRef.current?.isEmpty()) {
      toast.error("Assinatura da proposta obrigatória", {
        description: "Por favor, assine a proposta antes de enviar.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const signatureData = signatureRef.current?.getSignatureData() || "";

      // 1. Submit feedback
      const { error: updateError } = await supabase
        .rpc("submit_client_feedback", {
          p_token: tokenValue,
          p_nps_cliente: data.nps_cliente,
          p_avaliacao_localizacao: data.avaliacao_localizacao,
          p_avaliacao_acabamento: data.avaliacao_acabamento,
          p_avaliacao_layout: data.avaliacao_layout,
          p_avaliacao_custo_beneficio: data.avaliacao_custo_beneficio,
          p_avaliacao_atendimento: data.avaliacao_atendimento,
          p_pontos_positivos: data.pontos_positivos,
          p_pontos_negativos: data.pontos_negativos || "",
          p_sugestoes: data.comentarios_livres || "",
          p_interesse_compra: data.interesse_compra,
          p_objecoes: data.objecoes || [],
          p_objecoes_detalhes: data.objecoes_detalhes || "",
          p_efeito_uau: data.efeito_uau?.length ? data.efeito_uau : [],
          p_efeito_uau_detalhe: data.efeito_uau_detalhe || "",
          p_prazo_compra_cliente: data.prazo_compra_cliente || "",
          p_orcamento_cliente: data.orcamento_cliente ? parseFloat(data.orcamento_cliente) : null,
          p_forma_pagamento_cliente: data.forma_pagamento_cliente || "",
          p_proximos_passos_cliente: data.proximos_passos_cliente || "",
          p_assinatura_cliente: signatureData,
          p_assinatura_cliente_device: navigator.userAgent,
          p_percepcao_valor: data.percepcao_valor || "",
        });

      if (updateError) throw updateError;

      // 2. Submit proposal if checked
      if (data.gostaria_fazer_proposta) {
        const proposalSignatureData = proposalSignatureRef.current?.getSignatureData() || "";
        const valorNum = data.prop_valor_ofertado ? parseFloat(data.prop_valor_ofertado.replace(/\D/g, "")) : null;

        const { error: proposalError } = await supabase
          .rpc("submit_proposta_compra", {
            p_token: tokenValue,
            p_nome_completo: data.prop_nome_completo || "",
            p_cpf_cnpj: data.prop_cpf_cnpj || "",
            p_telefone: data.prop_telefone || "",
            p_email: data.prop_email || null,
            p_endereco_resumido: data.prop_endereco_resumido || null,
            p_unidade: data.prop_unidade || null,
            p_matricula: data.prop_matricula || null,
            p_valor_ofertado: valorNum,
            p_sinal_entrada: data.prop_sinal_entrada || null,
            p_parcelas: data.prop_parcelas || null,
            p_financiamento: data.prop_financiamento || null,
            p_outras_condicoes: data.prop_outras_condicoes || null,
            p_validade_proposta: data.prop_validade_proposta || null,
            p_assinatura_proponente: proposalSignatureData || null,
            p_cnh_url: cnhUrl || null,
          });

        if (proposalError) {
          console.error("Erro ao enviar proposta:", proposalError);
          // Don't block - feedback was already submitted
          toast.warning("Feedback enviado, mas houve um erro ao registrar a proposta.");
        }
      }

      toast.success("Feedback enviado com sucesso!", {
        description: data.gostaria_fazer_proposta
          ? "Sua proposta de compra também foi registrada."
          : "O corretor será notificado para completar a avaliação.",
      });

      setIsComplete(true);
      refetch();
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      toast.error("Erro ao enviar feedback", {
        description: "Por favor, tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenValue && !isValidToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Link inválido</h1>
          <p className="text-muted-foreground">
            O link está incompleto. Verifique se a URL está no formato
            <span className="font-medium"> /feedback-visita/&lt;token&gt;</span> (ex.: um UUID completo).
          </p>
        </div>
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
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Link inválido</h1>
          <p className="text-muted-foreground">
            Este link de feedback não é válido ou já expirou.
          </p>
        </div>
      </div>
    );
  }

  // Success page
  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Feedback Enviado!</h1>
          <p className="text-muted-foreground mb-6">
            Obrigado por compartilhar sua avaliação sobre a visita ao imóvel
            <strong> {feedback.imoveis?.titulo}</strong>.
          </p>
          {feedback.pdf_url && (
            <Button asChild className="mb-4">
              <a href={feedback.pdf_url} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Baixar Relatório PDF
              </a>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Already submitted by client
  if (feedback.status === "aguardando_corretor" && feedback.assinatura_cliente) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Feedback Recebido!</h1>
          <p className="text-muted-foreground">
            Obrigado por sua avaliação! O corretor irá completar o relatório e você receberá uma cópia em breve.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {feedback.imobiliarias?.logo_url && (
            <img
              src={feedback.imobiliarias.logo_url}
              alt="Logo"
              className="h-12 mx-auto mb-4"
            />
          )}
          <h1 className="text-2xl font-bold mb-2">
            Olá, {feedback.cliente_nome.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Obrigado por visitar o imóvel. Sua opinião é muito importante!
          </p>
        </div>

        {/* Info do Imóvel */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="font-semibold text-lg mb-2">{feedback.imoveis?.titulo}</h2>
            {feedback.imoveis?.endereco && (
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {enderecoImovel}
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

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* NPS */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  De 0 a 10, o quanto você recomendaria este imóvel?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="nps_cliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <NPSScale
                          value={field.value >= 0 ? field.value : null}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Star Ratings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5" />
                  Avalie os aspectos do imóvel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(["avaliacao_localizacao", "avaliacao_acabamento", "avaliacao_layout", "avaliacao_custo_beneficio", "avaliacao_atendimento"] as const).map((name) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <StarRating
                          label={{
                            avaliacao_localizacao: "Localização",
                            avaliacao_acabamento: "Acabamento",
                            avaliacao_layout: "Layout / Distribuição",
                            avaliacao_custo_beneficio: "Custo-Benefício",
                            avaliacao_atendimento: "Atendimento",
                          }[name]}
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Efeito UAU */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">✨ O que mais te impressionou? (Efeito UAU)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="efeito_uau"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selecione os aspectos que mais te surpreenderam</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {EFEITO_UAU_OPTIONS.map((opcao) => (
                          <button
                            key={opcao.value}
                            type="button"
                            onClick={() => {
                              const current = field.value || [];
                              if (current.includes(opcao.value)) {
                                field.onChange(current.filter((v) => v !== opcao.value));
                              } else {
                                field.onChange([...current, opcao.value]);
                              }
                            }}
                            className={cn(
                              "p-3 rounded-lg border-2 text-sm text-center transition-all",
                              (field.value || []).includes(opcao.value)
                                ? "border-primary bg-primary/5 font-medium"
                                : "border-muted hover:border-muted-foreground/30"
                            )}
                          >
                            {opcao.label}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="efeito_uau_detalhe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quer detalhar o que mais te impressionou? (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Conte com suas palavras o que causou maior impacto..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Feedback Textual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Sua Opinião
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="pontos_positivos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>O que você mais gostou? ✨</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Conte o que mais chamou sua atenção..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pontos_negativos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>O que poderia ser melhor? 🤔</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Algum ponto que não atendeu suas expectativas? (opcional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Prazo e Orçamento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💰 Planejamento de Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="prazo_compra_cliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual o seu prazo estimado para a compra?</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PRAZO_COMPRA_OPTIONS.map((opcao) => (
                          <button
                            key={opcao.value}
                            type="button"
                            onClick={() => field.onChange(opcao.value)}
                            className={cn(
                              "p-3 rounded-lg border-2 text-sm text-center transition-all",
                              field.value === opcao.value
                                ? "border-primary bg-primary/5 font-medium"
                                : "border-muted hover:border-muted-foreground/30"
                            )}
                          >
                            {opcao.label}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orcamento_cliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orçamento disponível (R$) — opcional</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 500000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="forma_pagamento_cliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de pagamento preferida — opcional</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {FORMA_PAGAMENTO_OPTIONS.map((opcao) => (
                          <button
                            key={opcao.value}
                            type="button"
                            onClick={() => field.onChange(opcao.value)}
                            className={cn(
                              "p-3 rounded-lg border-2 text-sm text-center transition-all",
                              field.value === opcao.value
                                ? "border-primary bg-primary/5 font-medium"
                                : "border-muted hover:border-muted-foreground/30"
                            )}
                          >
                            {opcao.label}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* ===== INTERESSE E PROPOSTA ===== */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🏡 Interesse e Proposta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nível de interesse - Grid 2x2 */}
                <FormField
                  control={form.control}
                  name="interesse_compra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Nível de Interesse</FormLabel>
                      <div className="grid grid-cols-2 gap-3">
                        {INTERESSE_OPTIONS.map((opcao) => (
                          <button
                            key={opcao.value}
                            type="button"
                            onClick={() => field.onChange(opcao.value)}
                            className={cn(
                              "p-4 rounded-lg border-2 text-left transition-all",
                              field.value === opcao.value
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-muted-foreground/30"
                            )}
                          >
                            <span className="font-medium text-sm">{opcao.label}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">{opcao.sublabel}</p>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Objeções (se pouco/sem interesse) */}
                {showObjecoes && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="objecoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>O que pesou na sua decisão? 🙏</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {OBJECOES_OPTIONS.map((opcao) => (
                              <label
                                key={opcao.value}
                                className={cn(
                                  "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                                  field.value?.includes(opcao.value)
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-muted-foreground/30"
                                )}
                              >
                                <Checkbox
                                  checked={field.value?.includes(opcao.value)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, opcao.value]);
                                    } else {
                                      field.onChange(current.filter((v) => v !== opcao.value));
                                    }
                                  }}
                                />
                                <span className="text-sm">{opcao.label}</span>
                              </label>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="objecoes_detalhes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gostaria de detalhar? (opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Sua opinião nos ajuda a melhorar..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Percepção de valor */}
                <FormField
                  control={form.control}
                  name="percepcao_valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Percepção de Valor</FormLabel>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-2"
                      >
                        {PERCEPCAO_VALOR_OPTIONS.map((opcao) => (
                          <label
                            key={opcao.value}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                              field.value === opcao.value
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-muted-foreground/30"
                            )}
                          >
                            <RadioGroupItem value={opcao.value} />
                            <span className="text-sm">{opcao.label}</span>
                          </label>
                        ))}
                      </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Checkbox proposta */}
                <FormField
                  control={form.control}
                  name="gostaria_fazer_proposta"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3 p-4 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="text-base font-semibold cursor-pointer">
                          📝 Gostaria de fazer uma proposta?
                        </FormLabel>
                        <p className="text-sm text-muted-foreground mt-1">
                          Preencha os dados abaixo para formalizar sua proposta de compra junto com o feedback.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {/* ===== INLINE PROPOSAL FIELDS ===== */}
                {gostariaFazerProposta && (
                  <div className="space-y-6 border-l-4 border-primary/30 pl-4 ml-2">
                    {/* Identificação do Proponente */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-base">👤 Identificação do Proponente</h3>
                      <FormField
                        control={form.control}
                        name="prop_nome_completo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="prop_cpf_cnpj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF / CNPJ *</FormLabel>
                              <FormControl>
                                <Input placeholder="000.000.000-00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="prop_telefone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone *</FormLabel>
                              <FormControl>
                                <Input placeholder="(00) 00000-0000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="prop_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@exemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Identificação do Imóvel */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-base">🏠 Identificação do Imóvel</h3>
                      <FormField
                        control={form.control}
                        name="prop_endereco_resumido"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input placeholder="Endereço do imóvel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="prop_unidade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unidade</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Apto 101, Bloco A" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="prop_matricula"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Matrícula</FormLabel>
                              <FormControl>
                                <Input placeholder="Nº da matrícula" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Valor e Condições */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-base">💰 Valor Ofertado e Condições de Pagamento</h3>
                      <FormField
                        control={form.control}
                        name="prop_valor_ofertado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Ofertado (R$) *</FormLabel>
                            <FormControl>
                              <CurrencyInput
                                value={field.value || ""}
                                onChange={field.onChange}
                                placeholder="R$ 0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="prop_sinal_entrada"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sinal / Entrada</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: R$ 50.000 na assinatura" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="prop_parcelas"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parcelas</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 12x de R$ 5.000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="prop_financiamento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Financiamento</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Financiamento CEF em 360 meses" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="prop_outras_condicoes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Outras Condições</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Condições adicionais..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Validade e Aceite */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-base">📅 Validade e Aceite</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="prop_cidade_uf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cidade / UF</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: São Paulo/SP" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="prop_validade_proposta"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Validade da Proposta</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="prop_forma_aceite"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Forma de Aceite</FormLabel>
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="space-y-2"
                            >
                              <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer">
                                <RadioGroupItem value="assinatura" />
                                <span className="text-sm">Assinatura digital</span>
                              </label>
                              <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer">
                                <RadioGroupItem value="email" />
                                <span className="text-sm">Confirmação por e-mail</span>
                              </label>
                              <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer">
                                <RadioGroupItem value="presencial" />
                                <span className="text-sm">Assinatura presencial</span>
                              </label>
                            </RadioGroup>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Cláusula */}
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <h4 className="font-semibold text-sm mb-2">📜 Cláusula de Documento Posterior</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        A presente proposta de compra constitui uma manifestação de interesse formal do proponente,
                        não configurando contrato definitivo. Os termos aqui expressos serão objeto de instrumento
                        particular de compromisso de compra e venda, a ser celebrado entre as partes em momento oportuno,
                        contendo todas as cláusulas e condições necessárias à formalização do negócio.
                      </p>
                    </div>

                    {/* CNH Upload + Assinatura do Proponente - side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CNHUpload
                        onUpload={handleCNHUpload}
                        isUploading={isUploadingCNH}
                      />
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">✍️ Assinatura do Proponente</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <SignaturePad
                            ref={proposalSignatureRef}
                            height={120}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comentários e Próximos Passos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  💬 Comentários e Próximos Passos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="comentarios_livres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comentários livres (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Algo mais que gostaria de compartilhar?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proximos_passos_cliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>O que deseja como próximo passo? (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Receber mais informações, agendar nova visita, receber proposta comercial..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Assinatura do Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assinatura Digital</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SignaturePad
                  ref={signatureRef}
                  onSignatureChange={setHasSignature}
                  height={120}
                />

                <FormField
                  control={form.control}
                  name="declaracao_verdade"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-2 space-y-0 p-4 bg-muted rounded-lg">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="font-normal cursor-pointer">
                          Declaro que as informações prestadas são verdadeiras e representam minha opinião sincera sobre a visita.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={isSubmitting || !hasSignature}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Enviar Feedback
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Suas informações são protegidas e não serão compartilhadas com terceiros.
        </p>
      </div>
    </div>
  );
}
