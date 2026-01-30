import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  label?: string;
}

export function StarRating({
  value,
  onChange,
  maxStars = 5,
  size = "md",
  disabled = false,
  label,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= (hoverValue || value);

          return (
            <button
              key={index}
              type="button"
              onClick={() => !disabled && onChange(starValue)}
              onMouseEnter={() => !disabled && setHoverValue(starValue)}
              onMouseLeave={() => setHoverValue(0)}
              disabled={disabled}
              className={cn(
                "transition-all duration-150",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-110"
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors",
                  isFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-transparent text-muted-foreground/40"
                )}
              />
            </button>
          );
        })}
        {value > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {value}/{maxStars}
          </span>
        )}
      </div>
    </div>
  );
}
