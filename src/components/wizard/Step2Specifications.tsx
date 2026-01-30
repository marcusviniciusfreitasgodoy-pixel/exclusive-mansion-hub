import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight } from 'lucide-react';

export const step2Schema = z.object({
  areaTotal: z.number().min(1, 'Área total é obrigatória'),
  areaPrivativa: z.number().min(1, 'Área privativa é obrigatória'),
  suites: z.number().min(0, 'Valor inválido'),
  banheiros: z.number().min(1, 'Ao menos 1 banheiro'),
  vagas: z.number().min(0, 'Valor inválido'),
});

export type Step2Data = z.infer<typeof step2Schema>;

interface Step2Props {
  defaultValues?: Partial<Step2Data>;
  onComplete: (data: Step2Data) => void;
}

export function Step2Specifications({ defaultValues, onComplete }: Step2Props) {
  const form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      areaTotal: defaultValues?.areaTotal || 0,
      areaPrivativa: defaultValues?.areaPrivativa || 0,
      suites: defaultValues?.suites || 0,
      banheiros: defaultValues?.banheiros || 0,
      vagas: defaultValues?.vagas || 0,
    },
  });

  const onSubmit = (data: Step2Data) => {
    onComplete(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="areaTotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área Total (m²) *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      m²
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="areaPrivativa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área Privativa (m²) *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      m²
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="suites"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nº de Suítes *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="banheiros"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nº de Banheiros *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vagas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nº de Vagas *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
