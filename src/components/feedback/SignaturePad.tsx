import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Eraser, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SignaturePadRef {
  isEmpty: () => boolean;
  getSignatureData: () => string;
  clear: () => void;
}

interface SignaturePadProps {
  onSignatureChange?: (hasSignature: boolean) => void;
  className?: string;
  height?: number;
  disabled?: boolean;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onSignatureChange, className, height = 150, disabled = false }, ref) => {
    const sigCanvas = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      isEmpty: () => sigCanvas.current?.isEmpty() ?? true,
      getSignatureData: () => {
        if (sigCanvas.current?.isEmpty()) {
          return "";
        }
        return sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png") || "";
      },
      clear: () => {
        sigCanvas.current?.clear();
        onSignatureChange?.(false);
      },
    }));

    const handleEnd = () => {
      const isEmpty = sigCanvas.current?.isEmpty() ?? true;
      onSignatureChange?.(!isEmpty);
    };

    const handleClear = () => {
      sigCanvas.current?.clear();
      onSignatureChange?.(false);
    };

    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            ✍️ Assine no campo abaixo
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
          >
            <Eraser className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        </div>
        
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg bg-white overflow-hidden",
            disabled ? "opacity-50 pointer-events-none" : "border-muted-foreground/30"
          )}
        >
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              width: 400,
              height: height,
              className: "w-full touch-none",
              style: { 
                width: "100%", 
                height: `${height}px`,
                cursor: disabled ? "not-allowed" : "crosshair"
              },
            }}
            backgroundColor="white"
            penColor="#1e3a5f"
            onEnd={handleEnd}
          />
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Use o mouse ou dedo para desenhar sua assinatura
        </p>
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";
