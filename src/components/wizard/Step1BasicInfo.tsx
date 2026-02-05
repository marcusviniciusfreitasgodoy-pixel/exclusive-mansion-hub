import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export const step1Schema = z.object({
  titulo: z.string().min(5, 'Título deve ter no mínimo 5 caracteres').max(100, 'Título muito longo'),
  endereco: z.string().min(5, 'Endereço é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(2, 'Bairro é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  estado: z.string().min(2, 'Estado é obrigatório'),
  cep: z.string()
    .optional()
    .refine(
      (val) => !val || /^\d{5}-?\d{3}$/.test(val),
      { message: 'CEP inválido (formato: 00000-000)' }
    ),
  valor: z.number().min(1000, 'Valor deve ser maior que R$ 1.000'),
  condominio: z.number().optional(),
  iptu: z.number().optional(),
  status: z.enum(['ativo', 'inativo']).default('ativo'),
});

export type Step1Data = z.infer<typeof step1Schema>;

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface Step1Props {
  defaultValues?: Partial<Step1Data>;
  onComplete: (data: Step1Data) => void;
}

export function Step1BasicInfo({ defaultValues, onComplete }: Step1Props) {
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [cepSuccess, setCepSuccess] = useState(false);

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      titulo: defaultValues?.titulo || '',
      endereco: defaultValues?.endereco || '',
      numero: defaultValues?.numero || '',
      complemento: defaultValues?.complemento || '',
      bairro: defaultValues?.bairro || '',
      cidade: defaultValues?.cidade || 'Rio de Janeiro',
      estado: defaultValues?.estado || 'RJ',
      cep: defaultValues?.cep || '',
      valor: defaultValues?.valor || 0,
      condominio: defaultValues?.condominio || 0,
      iptu: defaultValues?.iptu || 0,
      status: defaultValues?.status || 'ativo',
    },
  });

  // Reset form when defaultValues change (for draft restore)
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      form.reset({
        titulo: defaultValues.titulo || '',
        endereco: defaultValues.endereco || '',
        numero: defaultValues.numero || '',
        complemento: defaultValues.complemento || '',
        bairro: defaultValues.bairro || '',
        cidade: defaultValues.cidade || 'Rio de Janeiro',
        estado: defaultValues.estado || 'RJ',
        cep: defaultValues.cep || '',
        valor: defaultValues.valor || 0,
        condominio: defaultValues.condominio || 0,
        iptu: defaultValues.iptu || 0,
        status: defaultValues.status || 'ativo',
      });
    }
  }, [defaultValues, form]);

  const onSubmit = (data: Step1Data) => {
    onComplete(data);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
  };

  const formatCep = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 5) {
      return cleaned;
    }
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  };

  const fetchAddressByCep = useCallback(async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsLoadingCep(true);
    setCepError(null);
    setCepSuccess(false);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepError('CEP não encontrado');
        return;
      }

      // Preenche os campos automaticamente
      if (data.logradouro) {
        form.setValue('endereco', data.logradouro, { shouldValidate: true });
      }
      if (data.bairro) {
        form.setValue('bairro', data.bairro, { shouldValidate: true });
      }
      if (data.localidade) {
        form.setValue('cidade', data.localidade, { shouldValidate: true });
      }
      if (data.uf) {
        form.setValue('estado', data.uf, { shouldValidate: true });
      }

      setCepSuccess(true);
      // Remove success indicator after 3 seconds
      setTimeout(() => setCepSuccess(false), 3000);
    } catch {
      setCepError('Erro ao buscar CEP');
    } finally {
      setIsLoadingCep(false);
    }
  }, [form]);

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const formatted = formatCep(e.target.value);
    onChange(formatted);

    // Limpa estados anteriores
    setCepError(null);
    setCepSuccess(false);

    // Busca endereço quando CEP estiver completo (9 caracteres com hífen)
    if (formatted.length === 9) {
      fetchAddressByCep(formatted);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Imóvel *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Cobertura Duplex Frente-Mar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address Section */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CEP - Primeiro campo */}
            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="00000-000"
                        maxLength={9}
                        value={field.value || ''}
                        onChange={(e) => handleCepChange(e, field.onChange)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        className={cepError ? 'border-destructive' : cepSuccess ? 'border-green-500' : ''}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isLoadingCep && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {cepSuccess && !isLoadingCep && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {cepError && !isLoadingCep && (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </div>
                  </FormControl>
                  {cepError && (
                    <p className="text-sm text-destructive">{cepError}</p>
                  )}
                  {cepSuccess && (
                    <p className="text-sm text-green-600">Endereço encontrado e preenchido!</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo vazio para alinhar grid */}
            <div className="hidden md:block" />

            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Rua/Avenida *</FormLabel>
                  <FormControl>
                    <Input placeholder="Av. Lúcio Costa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número *</FormLabel>
                  <FormControl>
                    <Input placeholder="2360" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="complemento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input placeholder="Bloco A, Cobertura" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bairro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro *</FormLabel>
                  <FormControl>
                    <Input placeholder="Barra da Tijuca" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade *</FormLabel>
                  <FormControl>
                    <Input placeholder="Rio de Janeiro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ESTADOS_BR.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
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

        {/* Values Section */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Valores</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Imóvel *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="R$ 0"
                      value={field.value ? formatCurrency(field.value) : ''}
                      onChange={(e) => field.onChange(parseCurrency(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condominio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condomínio (mensal)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="R$ 0"
                      value={field.value ? formatCurrency(field.value) : ''}
                      onChange={(e) => field.onChange(parseCurrency(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="iptu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IPTU (mensal)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="R$ 0"
                      value={field.value ? formatCurrency(field.value) : ''}
                      onChange={(e) => field.onChange(parseCurrency(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status inicial</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ativo">Ativo (publicado)</SelectItem>
                  <SelectItem value="inativo">Rascunho (não publicado)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
