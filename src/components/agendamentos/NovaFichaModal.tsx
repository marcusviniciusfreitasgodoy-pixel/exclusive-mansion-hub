import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
  // Cliente
  nome_visitante: z.string().min(2, 'Nome obrigatório'),
  cpf_visitante: z.string().min(11, 'CPF obrigatório'),
  rg_visitante: z.string().optional(),
  telefone_visitante: z.string().min(10, 'Telefone obrigatório'),
  email_visitante: z.string().email().optional().or(z.literal('')),
  endereco_visitante: z.string().optional(),
  acompanhantes: z.array(z.object({
    nome: z.string().min(1, 'Nome obrigatório'),
    cpf: z.string().optional(),
  })).optional(),
  // Imóvel
  imovel_id: z.string().optional(),
  endereco_imovel: z.string().min(2, 'Endereço do imóvel obrigatório'),
  condominio_edificio: z.string().optional(),
  unidade_imovel: z.string().optional(),
  nome_proprietario: z.string().optional(),
  valor_imovel: z.string().optional(),
  // Intermediação
  corretor_nome: z.string().min(2, 'Nome do corretor obrigatório'),
  notas: z.string().optional(),
  aceita_ofertas_similares: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imoveis: Array<{ id: string; titulo: string; endereco?: string | null; construtora_id?: string }>;
  prefill?: {
    nome_visitante?: string;
    telefone_visitante?: string;
    email_visitante?: string;
    imovel_id?: string;
    endereco_imovel?: string;
    corretor_nome?: string;
    agendamento_visita_id?: string;
    construtora_id?: string;
  };
}

export function NovaFichaModal({ open, onOpenChange, imoveis, prefill }: Props) {
  const { imobiliaria } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome_visitante: prefill?.nome_visitante || '',
      cpf_visitante: '',
      rg_visitante: '',
      telefone_visitante: prefill?.telefone_visitante || '',
      email_visitante: prefill?.email_visitante || '',
      endereco_visitante: '',
      acompanhantes: [],
      imovel_id: prefill?.imovel_id || '',
      endereco_imovel: prefill?.endereco_imovel || '',
      condominio_edificio: '',
      unidade_imovel: '',
      nome_proprietario: '',
      valor_imovel: '',
      corretor_nome: prefill?.corretor_nome || '',
      notas: '',
      aceita_ofertas_similares: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'acompanhantes',
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Generate code
      const { data: codeData } = await supabase.rpc('generate_visit_code');
      const codigo = codeData || `VIS-${Date.now().toString(36).toUpperCase()}`;

      const selectedImovel = imoveis.find(i => i.id === values.imovel_id);

      const { error } = await supabase
        .from('fichas_visita')
        .insert({
          codigo,
          nome_visitante: values.nome_visitante,
          cpf_visitante: values.cpf_visitante,
          telefone_visitante: values.telefone_visitante,
          email_visitante: values.email_visitante || null,
          rg_visitante: values.rg_visitante || null,
          endereco_visitante: values.endereco_visitante || null,
          acompanhantes: values.acompanhantes && values.acompanhantes.length > 0 ? values.acompanhantes : [],
          imovel_id: values.imovel_id || null,
          endereco_imovel: values.endereco_imovel,
          condominio_edificio: values.condominio_edificio || null,
          unidade_imovel: values.unidade_imovel || null,
          valor_imovel: values.valor_imovel ? parseFloat(values.valor_imovel) : null,
          nome_proprietario: values.nome_proprietario || null,
          corretor_nome: values.corretor_nome,
          notas: values.notas || null,
          aceita_ofertas_similares: values.aceita_ofertas_similares,
          imobiliaria_id: imobiliaria!.id,
          construtora_id: prefill?.construtora_id || (selectedImovel as any)?.construtora_id || null,
          agendamento_visita_id: prefill?.agendamento_visita_id || null,
          status: 'realizada',
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-visita'] });
      queryClient.invalidateQueries({ queryKey: ['agendamentos-imobiliaria'] });
      toast.success('Ficha de visita criada com sucesso!');
      form.reset();
      onOpenChange(false);
    },
    onError: (e) => {
      console.error(e);
      toast.error('Erro ao criar ficha de visita');
    },
  });

  const handleImovelChange = (imovelId: string) => {
    form.setValue('imovel_id', imovelId);
    const imovel = imoveis.find(i => i.id === imovelId);
    if (imovel?.endereco) {
      form.setValue('endereco_imovel', imovel.endereco);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Ficha de Visita</DialogTitle>
          <DialogDescription>Registrar uma visita avulsa com dados completos do visitante</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
            {/* Seção 1: Cliente */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">1. IDENTIFICAÇÃO DO CLIENTE</h3>
              <div className="space-y-3">
                <FormField control={form.control} name="nome_visitante" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="cpf_visitante" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF *</FormLabel>
                      <FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="rg_visitante" render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="telefone_visitante" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone *</FormLabel>
                      <FormControl><Input placeholder="(11) 99999-9999" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email_visitante" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="endereco_visitante" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl><Input placeholder="Endereço completo" {...field} /></FormControl>
                  </FormItem>
                )} />

                {/* Acompanhantes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Acompanhantes</span>
                    {fields.length < 2 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => append({ nome: '', cpf: '' })}>
                        <Plus className="h-3 w-3 mr-1" /> Adicionar
                      </Button>
                    )}
                  </div>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 mb-2">
                      <FormField control={form.control} name={`acompanhantes.${index}.nome`} render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl><Input placeholder="Nome" {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`acompanhantes.${index}.cpf`} render={({ field }) => (
                        <FormItem className="w-40">
                          <FormControl><Input placeholder="CPF" {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Seção 2: Imóvel */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">2. IDENTIFICAÇÃO DO IMÓVEL</h3>
              <div className="space-y-3">
                <FormField control={form.control} name="imovel_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imóvel (selecionar ou preencher abaixo)</FormLabel>
                    <Select onValueChange={handleImovelChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecionar imóvel cadastrado" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {imoveis.map(i => (
                          <SelectItem key={i.id} value={i.id}>{i.titulo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <FormField control={form.control} name="endereco_imovel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço do Imóvel *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="condominio_edificio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condomínio / Edifício</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="unidade_imovel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="nome_proprietario" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proprietário</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="valor_imovel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl><Input type="number" placeholder="0,00" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Seção 3: Intermediação */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">3. INTERMEDIAÇÃO</h3>
              <div className="space-y-3">
                <FormField control={form.control} name="corretor_nome" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Corretor *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="notas" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl><Textarea rows={2} {...field} /></FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="aceita_ofertas_similares" render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0 font-normal text-sm">
                      Autorizo o recebimento de ofertas de imóveis similares (LGPD)
                    </FormLabel>
                  </FormItem>
                )} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvando...' : 'Criar Ficha'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
