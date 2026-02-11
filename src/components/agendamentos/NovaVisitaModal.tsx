import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const schema = z.object({
  cliente_nome: z.string().min(2, 'Nome obrigatório'),
  cliente_telefone: z.string().min(10, 'Telefone obrigatório'),
  cliente_email: z.string().email('Email inválido'),
  imovel_id: z.string().min(1, 'Selecione um imóvel'),
  data: z.date({ required_error: 'Selecione uma data' }),
  horario: z.string().min(1, 'Selecione um horário'),
  corretor_nome: z.string().optional(),
  corretor_email: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imoveis: Array<{ id: string; titulo: string; construtora_id?: string }>;
}

const HORARIOS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '13:00', '13:30', '14:00',
  '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
  '17:30', '18:00',
];

export function NovaVisitaModal({ open, onOpenChange, imoveis }: Props) {
  const { imobiliaria } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cliente_nome: '',
      cliente_telefone: '',
      cliente_email: '',
      imovel_id: '',
      horario: '',
      corretor_nome: '',
      corretor_email: '',
      observacoes: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const selectedImovel = imoveis.find(i => i.id === values.imovel_id);
      const dateTime = new Date(values.data);
      const [h, m] = values.horario.split(':');
      dateTime.setHours(parseInt(h), parseInt(m), 0, 0);
      const isoDate = dateTime.toISOString();

      const { error } = await supabase
        .from('agendamentos_visitas')
        .insert({
          cliente_nome: values.cliente_nome,
          cliente_telefone: values.cliente_telefone,
          cliente_email: values.cliente_email,
          imovel_id: values.imovel_id,
          imobiliaria_id: imobiliaria!.id,
          construtora_id: (selectedImovel as any)?.construtora_id || '',
          opcao_data_1: isoDate,
          opcao_data_2: isoDate,
          data_confirmada: isoDate,
          status: 'confirmado' as const,
          confirmado_em: new Date().toISOString(),
          corretor_nome: values.corretor_nome || null,
          corretor_email: values.corretor_email || null,
          observacoes: values.observacoes || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-imobiliaria'] });
      toast.success('Agendamento criado com sucesso!');
      form.reset();
      onOpenChange(false);
    },
    onError: () => toast.error('Erro ao criar agendamento'),
  });

  // Need construtora_id from imoveis - let's fetch with access
  const imoveisWithConstrutora = imoveis;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Visita</DialogTitle>
          <DialogDescription>Criar agendamento de visita manualmente</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <FormField control={form.control} name="cliente_nome" render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cliente *</FormLabel>
                <FormControl><Input placeholder="Nome completo" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="cliente_telefone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone *</FormLabel>
                  <FormControl><Input placeholder="(11) 99999-9999" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="cliente_email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl><Input type="email" placeholder="email@exemplo.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="imovel_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Imóvel *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione o imóvel" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {imoveisWithConstrutora.map(i => (
                      <SelectItem key={i.id} value={i.id}>{i.titulo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="data" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="horario" render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Horário" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HORARIOS.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="corretor_nome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Corretor</FormLabel>
                  <FormControl><Input placeholder="Nome" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="corretor_email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email do Corretor</FormLabel>
                  <FormControl><Input type="email" placeholder="Email" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="observacoes" render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl><Textarea placeholder="Observações..." rows={2} {...field} /></FormControl>
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Criando...' : 'Criar Agendamento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
