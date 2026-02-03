import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { ArrowRight, Plus, X, Edit2, Check, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const step3Schema = z.object({
  descricao: z.string().min(50, 'Descrição deve ter no mínimo 50 caracteres'),
  diferenciais: z.array(z.string()).min(3, 'Adicione pelo menos 3 diferenciais'),
  memorial: z.string().optional(),
  condicoesPagamento: z.string().optional(),
  contextoAdicionalIA: z.string().optional(),
});

export type Step3Data = z.infer<typeof step3Schema>;

interface Step3Props {
  defaultValues?: Partial<Step3Data>;
  onComplete: (data: Step3Data) => void;
}

export function Step3Description({ defaultValues, onComplete }: Step3Props) {
  const [newDiferencial, setNewDiferencial] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      descricao: defaultValues?.descricao || '',
      diferenciais: defaultValues?.diferenciais || [],
      memorial: defaultValues?.memorial || '',
      condicoesPagamento: defaultValues?.condicoesPagamento || '',
      contextoAdicionalIA: defaultValues?.contextoAdicionalIA || '',
    },
  });

  const diferenciais = form.watch('diferenciais');

  const addDiferencial = () => {
    if (newDiferencial.trim()) {
      form.setValue('diferenciais', [...diferenciais, newDiferencial.trim()]);
      setNewDiferencial('');
    }
  };

  const removeDiferencial = (index: number) => {
    form.setValue('diferenciais', diferenciais.filter((_, i) => i !== index));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(diferenciais[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const updated = [...diferenciais];
      updated[editingIndex] = editValue.trim();
      form.setValue('diferenciais', updated);
      setEditingIndex(null);
      setEditValue('');
    }
  };

  const onSubmit = (data: Step3Data) => {
    onComplete(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição Geral *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o imóvel detalhadamente, destacando seus principais atributos, localização, acabamentos e diferenciais..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <div className="text-xs text-muted-foreground text-right">
                {field.value?.length || 0} caracteres (mínimo 50)
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Diferenciais */}
        <FormField
          control={form.control}
          name="diferenciais"
          render={() => (
            <FormItem>
              <FormLabel>Diferenciais Exclusivos * (mínimo 3)</FormLabel>
              <div className="space-y-3">
                {/* Add new */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Vista mar 180° panorâmica"
                    value={newDiferencial}
                    onChange={(e) => setNewDiferencial(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDiferencial();
                      }
                    }}
                  />
                  <Button type="button" onClick={addDiferencial} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* List */}
                <div className="flex flex-wrap gap-2">
                  {diferenciais.map((item, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="py-2 px-3 flex items-center gap-2"
                    >
                      {editingIndex === index ? (
                        <>
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-6 text-xs w-40"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={saveEdit}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span>{item}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => startEditing(index)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => removeDiferencial(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </Badge>
                  ))}
                </div>

                {diferenciais.length < 3 && (
                  <p className="text-sm text-amber-600">
                    Adicione mais {3 - diferenciais.length} diferencial(is)
                  </p>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="memorial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Memorial Descritivo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os acabamentos, materiais utilizados e especificações técnicas..."
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
          name="condicoesPagamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condições de Pagamento</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex: Aceita financiamento bancário. Entrada de 30% + 60 parcelas..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contexto Adicional para IA */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="contextoAdicionalIA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    Contexto Adicional para Sofia (IA)
                  </FormLabel>
                  <FormDescription>
                    Informações específicas que a assistente virtual Sofia deve saber sobre este imóvel, 
                    como detalhes não públicos, instruções de negociação, ou pontos-chave para destacar durante conversas.
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Proprietário aceita permuta por imóvel de menor valor. Apartamento vizinho também está à venda. Priorizar compradores à vista. Mencionar a proximidade com o novo shopping em construção..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2">
            Próximo
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
