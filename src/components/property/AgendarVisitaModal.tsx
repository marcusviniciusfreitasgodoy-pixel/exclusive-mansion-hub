import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, isBefore, isSameDay, isAfter, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User, Mail, Phone, MessageSquare, Loader2, CalendarCheck } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { PropertyData, PropertyBranding } from "@/types/property-page";

// Horários disponíveis (9h às 18h, intervalos de 30min)
const HORARIOS_DISPONIVEIS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
];

const formSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  email: z.string().email("E-mail inválido").max(255),
  telefone: z.string().min(10, "Telefone inválido").max(20),
  observacoes: z.string().max(500).optional(),
  data1: z.date({ required_error: "Selecione a primeira data" }),
  horario1: z.string({ required_error: "Selecione o horário" }),
  data2: z.date({ required_error: "Selecione a segunda data" }),
  horario2: z.string({ required_error: "Selecione o horário" }),
}).refine((data) => {
  // Data mínima: amanhã
  const minDate = startOfDay(addDays(new Date(), 1));
  return !isBefore(startOfDay(data.data1), minDate);
}, {
  message: "A primeira data deve ser no mínimo amanhã",
  path: ["data1"],
}).refine((data) => {
  const minDate = startOfDay(addDays(new Date(), 1));
  return !isBefore(startOfDay(data.data2), minDate);
}, {
  message: "A segunda data deve ser no mínimo amanhã",
  path: ["data2"],
}).refine((data) => {
  // As duas datas devem ser diferentes ou horários diferentes
  if (isSameDay(data.data1, data.data2) && data.horario1 === data.horario2) {
    return false;
  }
  return true;
}, {
  message: "As duas opções devem ser diferentes",
  path: ["data2"],
});

type FormData = z.infer<typeof formSchema>;

interface AgendarVisitaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: PropertyData;
  branding: PropertyBranding;
  imobiliariaId: string | null;
  accessId: string | null;
}

export function AgendarVisitaModal({
  open,
  onOpenChange,
  property,
  branding,
  imobiliariaId,
  accessId,
}: AgendarVisitaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      observacoes: "",
    },
  });

  const minDate = addDays(new Date(), 1);

  const disabledDays = (date: Date) => {
    // Desabilitar datas passadas e hoje
    if (isBefore(startOfDay(date), startOfDay(minDate))) {
      return true;
    }
    // Desabilitar domingos (opcional - remover se quiser permitir)
    if (date.getDay() === 0) {
      return true;
    }
    return false;
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Combinar data e horário
      const [hora1, minuto1] = data.horario1.split(":").map(Number);
      const [hora2, minuto2] = data.horario2.split(":").map(Number);
      
      const opcaoData1 = new Date(data.data1);
      opcaoData1.setHours(hora1, minuto1, 0, 0);
      
      const opcaoData2 = new Date(data.data2);
      opcaoData2.setHours(hora2, minuto2, 0, 0);

      // Inserir agendamento no banco
      const { error: agendamentoError } = await supabase
        .from("agendamentos_visitas")
        .insert({
          imovel_id: property.id,
          construtora_id: property.construtoraId,
          imobiliaria_id: imobiliariaId,
          access_id: accessId,
          cliente_nome: data.nome.trim(),
          cliente_email: data.email.trim().toLowerCase(),
          cliente_telefone: data.telefone.trim(),
          opcao_data_1: opcaoData1.toISOString(),
          opcao_data_2: opcaoData2.toISOString(),
          observacoes: data.observacoes?.trim() || null,
          status: "pendente",
        });

      if (agendamentoError) {
        console.error("Erro ao criar agendamento:", agendamentoError);
        throw new Error("Não foi possível criar o agendamento");
      }

      // Chamar edge function para enviar notificações
      try {
        await supabase.functions.invoke("send-visit-notification", {
          body: {
            clienteNome: data.nome.trim(),
            clienteEmail: data.email.trim().toLowerCase(),
            clienteTelefone: data.telefone.trim(),
            opcaoData1: opcaoData1.toISOString(),
            opcaoData2: opcaoData2.toISOString(),
            observacoes: data.observacoes?.trim() || null,
            imovelTitulo: property.titulo,
            imovelEndereco: [property.endereco, property.bairro, property.cidade].filter(Boolean).join(", "),
            imobiliariaId,
            construtoraId: property.construtoraId,
          },
        });
      } catch (notificationError) {
        console.warn("Erro ao enviar notificações:", notificationError);
        // Não falhar o agendamento se as notificações falharem
      }

      toast.success("Solicitação de visita enviada!", {
        description: "Entraremos em contato para confirmar a melhor data.",
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao agendar visita:", error);
      toast.error("Erro ao solicitar agendamento", {
        description: "Por favor, tente novamente ou entre em contato por telefone.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const endereco = [property.endereco, property.bairro, property.cidade]
    .filter(Boolean)
    .join(", ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Agendar Visita
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-muted rounded-lg">
          <h3 className="font-semibold text-foreground">{property.titulo}</h3>
          {endereco && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              📍 {endereco}
            </p>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Escolha <strong>2 opções</strong> de data e horário de sua disponibilidade. 
          Entraremos em contato para confirmar a melhor opção.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Primeira Opção */}
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Primeira Opção
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="data1"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                : "Selecione"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={disabledDays}
                            initialFocus
                            locale={ptBR}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="horario1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione">
                              {field.value && (
                                <span className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {field.value}
                                </span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HORARIOS_DISPONIVEIS.map((horario) => (
                            <SelectItem key={horario} value={horario}>
                              {horario}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Segunda Opção */}
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Segunda Opção
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="data2"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                : "Selecione"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={disabledDays}
                            initialFocus
                            locale={ptBR}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="horario2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione">
                              {field.value && (
                                <span className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {field.value}
                                </span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HORARIOS_DISPONIVEIS.map((horario) => (
                            <SelectItem key={horario} value={horario}>
                              {horario}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Dados do Cliente */}
            <div className="space-y-3 pt-2">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Seus Dados
              </h4>

              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Seu nome" 
                        {...field} 
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="email"
                          placeholder="seu@email.com" 
                          {...field}
                          className="pl-10 bg-background"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone / WhatsApp</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="tel"
                          placeholder="(21) 99999-9999" 
                          {...field}
                          className="pl-10 bg-background"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea 
                          placeholder="Alguma preferência ou informação adicional?" 
                          {...field}
                          className="pl-10 min-h-[80px] bg-background resize-none"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CalendarCheck className="mr-2 h-5 w-5" />
                  Solicitar Agendamento
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
