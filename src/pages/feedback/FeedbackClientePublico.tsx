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

const formSchema = z.object({
  nps_cliente: z.number().min(0).max(10, "Selecione uma nota"),
  avaliacao_localizacao: z.number().min(1).max(5),
  avaliacao_acabamento: z.number().min(1).max(5),
  avaliacao_layout: z.number().min(1).max(5),
  avaliacao_custo_beneficio: z.number().min(1).max(5),
  avaliacao_atendimento: z.number().min(1).max(5),
  pontos_positivos: z.string().min(5, "Descreva os pontos positivos"),
  pontos_negativos: z.string().optional(),
  sugestoes: z.string().optional(),
  interesse_compra: z.enum(["muito_interessado", "interessado", "pouco_interessado", "sem_interesse"], {
    required_error: "Selecione seu nível de interesse",
  }),
  objecoes: z.array(z.string()).optional(),
  objecoes_detalhes: z.string().optional(),
  declaracao_verdade: z.boolean().refine((val) => val === true, {
    message: "Você deve confirmar a veracidade das informações",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function FeedbackClientePublico() {
  const { token } = useParams<{ token: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const signatureRef = useRef<SignaturePadRef>(null);
  const [hasSignature, setHasSignature] = useState(false);

  // Buscar feedback pelo token
  const { data: feedback, isLoading, error, refetch } = useQuery({
    queryKey: ["feedback-publico", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedbacks_visitas")
        .select(`
          *,
          imoveis(titulo, endereco, bairro, cidade, valor),
          imobiliarias(nome_empresa, logo_url),
          construtoras(nome_empresa, logo_url)
        `)
        .eq("token_acesso_cliente", token)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!token,
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
      sugestoes: "",
      objecoes: [],
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

      // Atualizar feedback com dados do cliente
      const { error: updateError } = await supabase
        .from("feedbacks_visitas")
        .update({
          nps_cliente: data.nps_cliente,
          avaliacao_localizacao: data.avaliacao_localizacao,
          avaliacao_acabamento: data.avaliacao_acabamento,
          avaliacao_layout: data.avaliacao_layout,
          avaliacao_custo_beneficio: data.avaliacao_custo_beneficio,
          avaliacao_atendimento: data.avaliacao_atendimento,
          pontos_positivos: data.pontos_positivos,
          pontos_negativos: data.pontos_negativos || null,
          sugestoes: data.sugestoes || null,
          interesse_compra: data.interesse_compra,
          objecoes: data.objecoes || [],
          objecoes_detalhes: data.objecoes_detalhes || null,
          assinatura_cliente: signatureData,
          assinatura_cliente_data: new Date().toISOString(),
          assinatura_cliente_device: navigator.userAgent,
          status: "completo",
          feedback_cliente_em: new Date().toISOString(),
          completo_em: new Date().toISOString(),
        })
        .eq("id", feedback.id);

      if (updateError) throw updateError;

      // Disparar geração de PDF
      try {
        await supabase.functions.invoke("generate-feedback-pdf", {
          body: { feedbackId: feedback.id },
        });
      } catch (pdfError) {
        console.warn("Erro ao gerar PDF:", pdfError);
      }

      toast.success("Feedback enviado com sucesso!", {
        description: "Obrigado por sua avaliação.",
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

  // Se ainda está aguardando corretor
  if (feedback.status === "aguardando_corretor") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Aguardando Corretor</h1>
          <p className="text-muted-foreground">
            O corretor ainda não preencheu a avaliação. Você receberá um novo email quando for sua vez.
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

                <FormField
                  control={form.control}
                  name="sugestoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sugestões ou comentários 💬</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Algo mais que gostaria de compartilhar? (opcional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Interesse de Compra */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Qual seu interesse no imóvel?</CardTitle>
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
                          <FormLabel>O que te impediu? (selecione todos que se aplicam)</FormLabel>
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
                          <FormLabel>Quer detalhar?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Conte mais sobre o que te fez desistir..."
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
