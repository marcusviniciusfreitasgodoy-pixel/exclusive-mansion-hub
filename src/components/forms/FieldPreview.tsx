import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StarRating } from '@/components/feedback/StarRating';
import { NPSScale } from '@/components/feedback/NPSScale';
import { SignaturePad } from '@/components/feedback/SignaturePad';
import type { CampoFormulario } from '@/types/form-config';

interface FieldPreviewProps {
  campo: CampoFormulario;
  value?: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
}

export function FieldPreview({ campo, value, onChange, disabled = true }: FieldPreviewProps) {
  const renderField = () => {
    switch (campo.tipo) {
      case 'text':
        return (
          <Input
            placeholder={campo.placeholder || ''}
            disabled={disabled}
            value={(value as string) || ''}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            placeholder={campo.placeholder || 'email@exemplo.com'}
            disabled={disabled}
            value={(value as string) || ''}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );

      case 'telefone':
        return (
          <Input
            type="tel"
            placeholder={campo.placeholder || '(99) 99999-9999'}
            disabled={disabled}
            value={(value as string) || ''}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={campo.placeholder || ''}
            disabled={disabled}
            value={(value as number) || ''}
            onChange={(e) => onChange?.(Number(e.target.value))}
          />
        );

      case 'date':
        return (
          <Input
            type="datetime-local"
            disabled={disabled}
            value={(value as string) || ''}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={campo.placeholder || ''}
            disabled={disabled}
            rows={3}
            value={(value as string) || ''}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );

      case 'select':
        return (
          <Select
            disabled={disabled}
            value={(value as string) || ''}
            onValueChange={(v) => onChange?.(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={campo.placeholder || 'Selecione...'} />
            </SelectTrigger>
            <SelectContent>
              {campo.opcoes?.map((opcao, i) => (
                <SelectItem key={i} value={opcao}>
                  {opcao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup
            disabled={disabled}
            value={(value as string) || ''}
            onValueChange={(v) => onChange?.(v)}
          >
            {campo.opcoes?.map((opcao, i) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={opcao} id={`${campo.id}-${i}`} />
                <Label htmlFor={`${campo.id}-${i}`} className="font-normal">
                  {opcao}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {campo.opcoes?.map((opcao, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Checkbox
                  id={`${campo.id}-${i}`}
                  disabled={disabled}
                  checked={(value as string[])?.includes(opcao) || false}
                  onCheckedChange={(checked) => {
                    const current = (value as string[]) || [];
                    if (checked) {
                      onChange?.([...current, opcao]);
                    } else {
                      onChange?.(current.filter(v => v !== opcao));
                    }
                  }}
                />
                <Label htmlFor={`${campo.id}-${i}`} className="font-normal">
                  {opcao}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'rating':
        return (
          <StarRating
            value={(value as number) || 0}
            onChange={onChange as (v: number) => void}
            maxStars={5}
            disabled={disabled}
          />
        );

      case 'escala_nps':
        return (
          <NPSScale
            value={(value as number) || null}
            onChange={onChange as (v: number) => void}
            disabled={disabled}
          />
        );

      case 'assinatura':
        return (
          <div className="border rounded-lg p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground text-center">
              [Área de assinatura digital]
            </p>
          </div>
        );

      default:
        return (
          <Input placeholder="Campo não suportado" disabled />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        {campo.label}
        {campo.obrigatorio && <span className="text-destructive">*</span>}
      </Label>
      {renderField()}
      {campo.texto_ajuda && (
        <p className="text-sm text-muted-foreground">{campo.texto_ajuda}</p>
      )}
    </div>
  );
}
