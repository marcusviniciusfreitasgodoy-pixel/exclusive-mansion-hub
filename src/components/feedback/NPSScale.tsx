import { cn } from "@/lib/utils";

interface NPSScaleProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function NPSScale({ value, onChange, disabled = false }: NPSScaleProps) {
  const getButtonColor = (score: number) => {
    if (score <= 6) return "bg-red-500 hover:bg-red-600 border-red-500";
    if (score <= 8) return "bg-yellow-500 hover:bg-yellow-600 border-yellow-500";
    return "bg-green-500 hover:bg-green-600 border-green-500";
  };

  const getSelectedColor = (score: number) => {
    if (score <= 6) return "bg-red-600 ring-2 ring-red-300";
    if (score <= 8) return "bg-yellow-600 ring-2 ring-yellow-300";
    return "bg-green-600 ring-2 ring-green-300";
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Pouco provável</span>
        <span>Muito provável</span>
      </div>
      
      <div className="flex justify-between gap-1">
        {Array.from({ length: 11 }, (_, index) => {
          const isSelected = value === index;
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => !disabled && onChange(index)}
              disabled={disabled}
              className={cn(
                "w-9 h-9 rounded-lg font-semibold text-white transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                isSelected ? getSelectedColor(index) : getButtonColor(index),
                isSelected && "scale-110 shadow-lg"
              )}
            >
              {index}
            </button>
          );
        })}
      </div>

      {value !== null && (
        <div className="text-center text-sm font-medium mt-2">
          {value <= 6 && (
            <span className="text-red-600">Detrator</span>
          )}
          {value >= 7 && value <= 8 && (
            <span className="text-yellow-600">Neutro</span>
          )}
          {value >= 9 && (
            <span className="text-green-600">Promotor</span>
          )}
        </div>
      )}
    </div>
  );
}
