import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  ArrowLeft,
  User,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Target,
  FileText,
  CheckCircle,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignaturePad, SignaturePadRef } from "@/components/feedback/SignaturePad";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { QUALIFICACAO_LABELS, PRAZO_LABELS } from "@/types/feedback";

const formSchema = z.object({
  duracao_minutos: z.number().min(1, "Informe a duração").max(480),
  qualificacao_lead: z.enum(["quente", "morno", "frio"], {
    required_error: "Selecione a qualificação",
  }),
  poder_decisao: z.enum(["total", "parcial", "nenhum"], {
    required_error: "Selecione o poder de decisão",
  }),
  poder_decisao_detalhes: z.string().optional(),
  prazo_compra: z.enum(["0-3_meses", "3-6_meses", "6-12_meses", "acima_12_meses", "indefinido"], {
    required_error: "Selecione o prazo",
  }),
  orcamento_disponivel: z.number().optional(),
  forma_pagamento_pretendida: z.string().optional(),
  observacoes_corretor: z.string().min(10, "Descreva como foi a visita"),
  proximos_passos: z.string().optional(),
  necessita_followup: z.boolean().default(true),
  data_followup: z.date().optional(),
  declaracao_verdade: z.boolean().refine((val) => val === true, {
    message: "Você deve confirmar a veracidade das informações",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function FeedbackCorretorPage() {
  const navigate = useNavigate();
  const { agendamentoId } = useParams<{ agendamentoId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signatureRef = useRef<SignaturePadRef>(null);
  const [hasSignature, setHasSignature] = useState(false);

  // Buscar dados do agendamento
  const { data: agendamento, isLoading } = useQuery({
    queryKey: ["agendamento", agendamentoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agendamentos_visitas")
        .select(`
          *,
          imoveis(id, titulo, endereco, bairro, cidade, valor, construtora_id),
          imobiliarias(id, nome_empresa)
        `)
        .eq("id", agendamentoId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!agendamentoId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duracao_minutos: 60,
      necessita_followup: true,
      declaracao_verdade: false,
    },
  });

  const necessitaFollowup = form.watch("necessita_followup");
  const poderDecisao = form.watch("poder_decisao");

  const calculateLeadScore = (data: FormData): number => {
    let score = 0;

    // Qualificação (0-40 pontos)
    if (data.qualificacao_lead === "quente") score += 40;
    else if (data.qualificacao_lead === "morno") score += 25;
    else score += 10;

    // Poder de decisão (0-25 pontos)
    if (data.poder_decisao === "total") score += 25;
    else if (data.poder_decisao === "parcial") score += 15;
    else score += 5;

    // Prazo (0-25 pontos)
    if (data.prazo_compra === "0-3_meses") score += 25;
    else if (data.prazo_compra === "3-6_meses") score += 20;
    else if (data.prazo_compra === "6-12_meses") score += 15;
    else if (data.prazo_compra === "acima_12_meses") score += 10;
    else score += 5;

    // Orçamento definido (0-10 pontos)
    if (data.orcamento_disponivel && data.orcamento_disponivel > 0) score += 10;

    return Math.min(score, 100);
  };

  const onSubmit = async (data: FormData) => {
    if (!agendamento) return;

    // Verificar assinatura
    if (signatureRef.current?.isEmpty()) {
      toast.error("Assinatura obrigatória", {
        description: "Por favor, assine o documento antes de enviar.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const signatureData = signatureRef.current?.getSignatureData() || "";
      const score = calculateLeadScore(data);

      // Criar feedback
      const { data: feedback, error: feedbackError } = await supabase
        .from("feedbacks_visitas")
        .insert({
          agendamento_visita_id: agendamentoId,
          imovel_id: agendamento.imoveis?.id,
          imobiliaria_id: agendamento.imobiliaria_id,
          construtora_id: agendamento.imoveis?.construtora_id,
          access_id: agendamento.access_id,
          data_visita: agendamento.data_confirmada || agendamento.opcao_data_1,
          duracao_minutos: data.duracao_minutos,
          cliente_nome: agendamento.cliente_nome,
          cliente_email: agendamento.cliente_email,
          cliente_telefone: agendamento.cliente_telefone,
          corretor_nome: "Corretor", // TODO: Pegar do usuário logado
          corretor_email: "", // TODO: Pegar do usuário logado
          qualificacao_lead: data.qualificacao_lead,
          poder_decisao: data.poder_decisao,
          poder_decisao_detalhes: data.poder_decisao_detalhes || null,
          prazo_compra: data.prazo_compra,
          orcamento_disponivel: data.orcamento_disponivel || null,
          forma_pagamento_pretendida: data.forma_pagamento_pretendida || null,
          observacoes_corretor: data.observacoes_corretor,
          proximos_passos: data.proximos_passos || null,
          necessita_followup: data.necessita_followup,
          data_followup: data.data_followup?.toISOString() || null,
          score_lead: score,
          assinatura_corretor: signatureData,
          assinatura_corretor_data: new Date().toISOString(),
          assinatura_corretor_ip: null, // Será capturado pelo edge function
          assinatura_corretor_device: navigator.userAgent,
          status: "aguardando_cliente",
          feedback_corretor_em: new Date().toISOString(),
        })
        .select()
        .single();

      if (feedbackError) throw feedbackError;

      // Atualizar status do agendamento
      await supabase
        .from("agendamentos_visitas")
        .update({ status: "realizado", realizado_em: new Date().toISOString() })
        .eq("id", agendamentoId);

      // Enviar email para o cliente
      try {
        await supabase.functions.invoke("send-feedback-request", {
          body: {
            feedbackId: feedback.id,
            token: feedback.token_acesso_cliente,
            clienteNome: agendamento.cliente_nome,
            clienteEmail: agendamento.cliente_email,
            imovelTitulo: agendamento.imoveis?.titulo,
          },
        });
      } catch (emailError) {
        console.warn("Erro ao enviar email:", emailError);
      }

      toast.success("Feedback registrado!", {
        description: "O cliente receberá um email para completar a avaliação.",
      });

      navigate("/dashboard/imobiliaria");
    } catch (error) {
      console.error("Erro ao salvar feedback:", error);
      toast.error("Erro ao salvar feedback", {
        description: "Por favor, tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!agendamento) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Agendamento não encontrado</h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Feedback da Visita</h1>
            <p className="text-muted-foreground">
              Registre as informações sobre a visita realizada
            </p>
          </div>
        </div>

        {/* Informações da Visita */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações da Visita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Imóvel</span>
                <p className="font-medium">{agendamento.imoveis?.titulo}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Cliente</span>
                <p className="font-medium">{agendamento.cliente_nome}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Data da Visita</span>
                <p className="font-medium">
                  {format(
                    new Date(agendamento.data_confirmada || agendamento.opcao_data_1),
                    "dd/MM/yyyy 'às' HH:mm",
                    { locale: ptBR }
                  )}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Contato</span>
                <p className="font-medium">{agendamento.cliente_telefone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Duração */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Duração da Visita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="duracao_minutos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (em minutos)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={480}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Qualificação do Lead */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5" />
                  Qualificação do Lead
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="qualificacao_lead"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Como você classifica este lead?</FormLabel>
                      <div className="flex gap-3">
                        {(["quente", "morno", "frio"] as const).map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => field.onChange(q)}
                            className={cn(
                              "flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all",
                              field.value === q
                                ? QUALIFICACAO_LABELS[q].color + " border-current"
                                : "border-muted bg-muted/30 hover:bg-muted/50"
                            )}
                          >
                            {QUALIFICACAO_LABELS[q].label}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="poder_decisao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poder de Decisão</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="total">Total - Decide sozinho</SelectItem>
                          <SelectItem value="parcial">Parcial - Precisa consultar</SelectItem>
                          <SelectItem value="nenhum">Nenhum - Apenas pesquisando</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(poderDecisao === "parcial" || poderDecisao === "nenhum") && (
                  <FormField
                    control={form.control}
                    name="poder_decisao_detalhes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detalhes sobre a decisão</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Quem mais está envolvido na decisão? Qual o papel desta pessoa?"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Prazo e Orçamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5" />
                  Prazo e Orçamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="prazo_compra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo para Compra</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o prazo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(PRAZO_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="orcamento_disponivel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Orçamento Disponível (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 500000"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="forma_pagamento_pretendida"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forma de Pagamento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Financiado, À vista..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Observações da Visita
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="observacoes_corretor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Como foi a visita?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva como foi a visita, reações do cliente, pontos de interesse..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proximos_passos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Próximos Passos</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="O que deve ser feito a seguir?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name="necessita_followup"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Necessita follow-up
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  {necessitaFollowup && (
                    <FormField
                      control={form.control}
                      name="data_followup"
                      render={({ field }) => (
                        <FormItem>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : "Data do follow-up"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                locale={ptBR}
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Assinatura */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Assinatura Digital
                </CardTitle>
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
                          Declaro que as informações prestadas são verdadeiras e correspondem fielmente ao ocorrido durante a visita.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !hasSignature}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Enviar Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
