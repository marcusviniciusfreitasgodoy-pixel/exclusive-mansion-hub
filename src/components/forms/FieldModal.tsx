import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, GripVertical, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import type { CampoFormulario, TipoCampo } from '@/types/form-config';
import { TIPO_CAMPO_LABELS } from '@/types/form-config';

const fieldSchema = z.object({
  tipo: z.string().min(1, 'Selecione o tipo de campo'),
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(50)
    .regex(/^[a-z0-9_]+$/, 'Apenas letras minúsculas, números e underscore'),
  label: z.string().min(1, 'Label é obrigatório').max(255),
  placeholder: z.string().max(255).optional(),
  texto_ajuda: z.string().max(500).optional(),
  obrigatorio: z.boolean().default(false),
  opcoes: z.array(z.string()).optional(),
  validacao_min: z.coerce.number().optional(),
  validacao_max: z.coerce.number().optional(),
  condicional_ativo: z.boolean().default(false),
  condicional_campo_id: z.string().optional(),
  condicional_operador: z.enum(['igual', 'diferente', 'contem']).optional(),
  condicional_valor: z.string().optional(),
});

type FieldFormData = z.infer<typeof fieldSchema>;

interface FieldModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: CampoFormulario | null;
  existingNames: string[];
  onSave: (field: CampoFormulario) => void;
  existingFields?: CampoFormulario[];
}

const TIPOS_COM_OPCOES: TipoCampo[] = ['select', 'radio', 'checkbox'];
const TIPOS_COM_VALIDACAO_TEXTO: TipoCampo[] = ['text', 'textarea'];
const TIPOS_COM_VALIDACAO_NUMERO: TipoCampo[] = ['number'];

export function FieldModal({
  open,
  onOpenChange,
  field,
  existingNames,
  onSave,
  existingFields = [],
}: FieldModalProps) {
  const [opcoes, setOpcoes] = useState<string[]>(['', '']);
  const [showNameWarning, setShowNameWarning] = useState(false);

  const form = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      tipo: '',
      nome: '',
      label: '',
      placeholder: '',
      texto_ajuda: '',
      obrigatorio: false,
      validacao_min: undefined,
      validacao_max: undefined,
      condicional_ativo: false,
      condicional_campo_id: '',
      condicional_operador: 'igual',
      condicional_valor: '',
    },
  });

  const tipoSelecionado = form.watch('tipo') as TipoCampo;
  const isEditing = !!field;
  const isBlocked = field?.bloqueado;

  useEffect(() => {
    if (open && field) {
      form.reset({
        tipo: field.tipo,
        nome: field.nome,
        label: field.label,
        placeholder: field.placeholder || '',
        texto_ajuda: field.texto_ajuda || '',
        obrigatorio: field.obrigatorio,
        validacao_min: field.validacao?.min,
        validacao_max: field.validacao?.max,
        condicional_ativo: !!field.condicional,
        condicional_campo_id: field.condicional?.campo_id || '',
        condicional_operador: field.condicional?.mostrar_se || 'igual',
        condicional_valor: field.condicional?.valor || '',
      });
      setOpcoes(field.opcoes || ['', '']);
    } else if (open) {
      form.reset();
      setOpcoes(['', '']);
    }
    setShowNameWarning(false);
  }, [open, field, form]);

  const handleSubmit = (data: FieldFormData) => {
    // Validate options for select/radio/checkbox
    if (TIPOS_COM_OPCOES.includes(data.tipo as TipoCampo)) {
      const validOpcoes = opcoes.filter(o => o.trim());
      if (validOpcoes.length < 2) {
        form.setError('opcoes', { message: 'Adicione pelo menos 2 opções' });
        return;
      }
    }

    // Check for duplicate name (only if name changed)
    if (!isEditing || (isEditing && data.nome !== field?.nome)) {
      if (existingNames.includes(data.nome)) {
        form.setError('nome', { message: 'Este nome já está em uso' });
        return;
      }
    }

    // Show warning if changing name of existing field
    if (isEditing && data.nome !== field?.nome && !showNameWarning) {
      setShowNameWarning(true);
      return;
    }

    const newField: CampoFormulario = {
      id: field?.id || crypto.randomUUID(),
      tipo: data.tipo as TipoCampo,
      nome: data.nome,
      label: data.label,
      placeholder: data.placeholder || undefined,
      texto_ajuda: data.texto_ajuda || undefined,
      obrigatorio: data.obrigatorio,
      ordem: field?.ordem || 999,
      bloqueado: field?.bloqueado,
      opcoes: TIPOS_COM_OPCOES.includes(data.tipo as TipoCampo)
        ? opcoes.filter(o => o.trim())
        : undefined,
      validacao:
        (data.validacao_min !== undefined || data.validacao_max !== undefined)
          ? { min: data.validacao_min, max: data.validacao_max }
          : undefined,
      condicional: data.condicional_ativo && data.condicional_campo_id
        ? {
            campo_id: data.condicional_campo_id,
            valor: data.condicional_valor || '',
            mostrar_se: data.condicional_operador || 'igual',
          }
        : undefined,
    };

    onSave(newField);
  };

  const addOpcao = () => {
    setOpcoes(prev => [...prev, '']);
  };

  const removeOpcao = (index: number) => {
    if (opcoes.length > 2) {
      setOpcoes(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateOpcao = (index: number, value: string) => {
    setOpcoes(prev => prev.map((o, i) => (i === index ? value : o)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Campo' : 'Adicionar Novo Campo'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Tipo de Campo */}
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Campo *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isBlocked}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(TIPO_CAMPO_LABELS).map(([value, label]) => (
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

            {/* Nome do Campo */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Campo (interno) *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="ex: preferencia_contato"
                      disabled={isBlocked}
                    />
                  </FormControl>
                  <FormDescription>
                    Usado no banco de dados, sem espaços
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showNameWarning && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Alterar o nome do campo pode causar perda de dados antigos.
                  Clique em "Salvar" novamente para confirmar.
                </AlertDescription>
              </Alert>
            )}

            {/* Label */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label (texto visível) *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: Qual sua preferência de contato?" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Texto de Ajuda */}
            <FormField
              control={form.control}
              name="texto_ajuda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto de Ajuda (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: Escolha como prefere que entremos em contato" />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Placeholder */}
            <FormField
              control={form.control}
              name="placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placeholder (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: WhatsApp, E-mail, Ligação" />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Obrigatório */}
            <FormField
              control={form.control}
              name="obrigatorio"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isBlocked}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Este campo é obrigatório</FormLabel>
                </FormItem>
              )}
            />

            {/* Opções para select/radio/checkbox */}
            {TIPOS_COM_OPCOES.includes(tipoSelecionado) && (
              <div className="space-y-3">
                <Label>Opções de Resposta *</Label>
                <div className="space-y-2">
                  {opcoes.map((opcao, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <Input
                        value={opcao}
                        onChange={(e) => updateOpcao(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOpcao(index)}
                        disabled={opcoes.length <= 2}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addOpcao}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar opção
                </Button>
                {form.formState.errors.opcoes && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.opcoes.message}
                  </p>
                )}
              </div>
            )}

            {/* Validações para texto */}
            {TIPOS_COM_VALIDACAO_TEXTO.includes(tipoSelecionado) && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validacao_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mín. caracteres</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="0" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="validacao_max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máx. caracteres</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="500" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Validações para número */}
            {TIPOS_COM_VALIDACAO_NUMERO.includes(tipoSelecionado) && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validacao_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor mínimo</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="0" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="validacao_max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor máximo</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="1000000" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Lógica Condicional */}
            {existingFields.length > 0 && (
              <Accordion type="single" collapsible>
                <AccordionItem value="condicional">
                  <AccordionTrigger>Lógica Condicional</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="condicional_ativo"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Mostrar este campo apenas se:
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    {form.watch('condicional_ativo') && (
                      <div className="space-y-3 pl-6">
                        <FormField
                          control={form.control}
                          name="condicional_campo_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Campo</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {existingFields.map(f => (
                                    <SelectItem key={f.id} value={f.id}>
                                      {f.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="condicional_operador"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Condição</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="igual">é igual a</SelectItem>
                                  <SelectItem value="diferente">é diferente de</SelectItem>
                                  <SelectItem value="contem">contém</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="condicional_valor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valor</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Valor esperado" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                💾 Salvar Campo
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
