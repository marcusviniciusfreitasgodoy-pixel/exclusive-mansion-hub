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
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { INTERESSE_LABELS, OBJECOES_OPTIONS } from "@/types/feedback";

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

const formSchema = z.object({
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
});

type FormData = z.infer<typeof formSchema>;

export default function FeedbackClientePublico() {
  const { token } = useParams<{ token: string }>();
  const tokenValue = token?.trim() ?? "";
  const isValidToken = z.string().uuid().safeParse(tokenValue).success;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const signatureRef = useRef<SignaturePadRef>(null);
  const [hasSignature, setHasSignature] = useState(false);

  // Buscar feedback pelo token usando RPC segura (sem política pública de SELECT)
  const { data: feedback, isLoading, error, refetch } = useQuery({
    queryKey: ["feedback-publico", token],
    queryFn: async () => {
      // Usar RPC segura para leitura - token é validado server-side
      const { data: feedbackData, error: feedbackError } = await supabase
        .rpc("get_feedback_by_token", { p_token: tokenValue })
        .maybeSingle();

      if (feedbackError) throw feedbackError;
      if (!feedbackData) return null;

      // Buscar dados relacionados (imoveis, imobiliarias, construtoras são públicos)
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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
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
    },
  });

  const interesseCompra = form.watch("interesse_compra");
  const showObjecoes = interesseCompra === "pouco_interessado" || interesseCompra === "sem_interesse";

  useEffect(() => {
    if (feedback?.status === "completo") {
      setIsComplete(true);
    }
  }, [feedback]);

  const onSubmit = async (data: FormData) => {
    if (!feedback) return;

    if (signatureRef.current?.isEmpty()) {
      toast.error("Assinatura obrigatória", {
        description: "Por favor, assine o documento antes de enviar.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const signatureData = signatureRef.current?.getSignatureData() || "";

      // Usar RPC segura para submeter feedback (sem política pública de UPDATE)
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
        });

      if (updateError) throw updateError;

      // Notificar corretor que é sua vez (via dashboard - email opcional futuro)
      // NÃO gera PDF ainda - será gerado quando corretor completar

      toast.success("Feedback enviado com sucesso!", {
        description: "O corretor será notificado para completar a avaliação.",
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

  // Página de sucesso / já completo
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
            <Button asChild>
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

  // Se já foi preenchido pelo cliente (aguardando corretor ou completo)
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
                {[feedback.imoveis.endereco, feedback.imoveis.bairro, feedback.imoveis.cidade]
                  .filter(Boolean)
                  .join(", ")}
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

        {/* Formulário */}
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

            {/* Avaliações por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5" />
                  Avalie os aspectos do imóvel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="avaliacao_localizacao"
                  render={({ field }) => (
                    <FormItem>
                      <StarRating
                        label="Localização"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avaliacao_acabamento"
                  render={({ field }) => (
                    <FormItem>
                      <StarRating
                        label="Acabamento"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avaliacao_layout"
                  render={({ field }) => (
                    <FormItem>
                      <StarRating
                        label="Layout / Distribuição"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avaliacao_custo_beneficio"
                  render={({ field }) => (
                    <FormItem>
                      <StarRating
                        label="Custo-Benefício"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avaliacao_atendimento"
                  render={({ field }) => (
                    <FormItem>
                      <StarRating
                        label="Atendimento"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

            {/* Interesse em Proposta */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tem interesse em fazer uma proposta? 🏡</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="interesse_compra"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        {(Object.keys(INTERESSE_LABELS) as Array<keyof typeof INTERESSE_LABELS>).map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => field.onChange(key)}
                            className={cn(
                              "w-full p-4 rounded-lg border-2 text-left transition-all",
                              field.value === key
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-muted-foreground/30"
                            )}
                          >
                            <span className={INTERESSE_LABELS[key].color}>
                              {INTERESSE_LABELS[key].label}
                            </span>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showObjecoes && (
                  <>
                    <FormField
                      control={form.control}
                      name="objecoes"
                      render={({ field }) => (
                    <FormItem>
                          <FormLabel>Gostaríamos de entender melhor. O que pesou na sua decisão? 🙏</FormLabel>
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
                  </>
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

            {/* Assinatura */}
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
                  Enviar Avaliação
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
