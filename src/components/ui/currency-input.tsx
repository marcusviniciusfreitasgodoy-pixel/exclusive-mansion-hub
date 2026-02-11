import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

const formatToBRL = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseInt(numbers, 10));
};

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, placeholder = "R$ 0", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() => value ? formatToBRL(value) : '');

    React.useEffect(() => {
      setDisplayValue(value ? formatToBRL(value) : '');
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (!inputValue) {
        setDisplayValue('');
        onChange('');
        return;
      }
      const formatted = formatToBRL(inputValue);
      setDisplayValue(formatted);
      onChange(inputValue.replace(/\D/g, ''));
    };

    return (
      <Input
        ref={ref}
        className={cn("font-mono", className)}
        value={displayValue}
        onChange={handleChange}
        onFocus={(e) => e.target.select()}
        placeholder={placeholder}
        inputMode="numeric"
        {...props}
      />
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";
export { CurrencyInput };
