import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RotateCcw, Palette, Type, Settings2 } from "lucide-react";
import type { TemplateType, TemplateCustomization } from "@/types/database";
import { templateDefaults, fontOptions } from "./templateStyles";

interface TemplateCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateType: TemplateType;
  customization: TemplateCustomization;
  onSave: (customization: TemplateCustomization) => void;
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-10 h-10 rounded-md border shadow-sm cursor-pointer hover:ring-2 ring-primary ring-offset-2 transition-all"
              style={{ backgroundColor: value }}
              aria-label={`Escolher ${label}`}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <HexColorPicker color={value} onChange={onChange} />
          </PopoverContent>
        </Popover>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 font-mono text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export function TemplateCustomizationModal({
  open,
  onOpenChange,
  templateType,
  customization,
  onSave,
}: TemplateCustomizationModalProps) {
  const defaults = templateDefaults[templateType];

  const [localCustom, setLocalCustom] = useState<TemplateCustomization>({
    cor_primaria: customization.cor_primaria || defaults.colorPrimary,
    cor_secundaria: customization.cor_secundaria || defaults.colorSecondary,
    cor_texto: customization.cor_texto || defaults.colorText,
    fonte_titulos:
      customization.fonte_titulos ||
      defaults.fontHeading.split(",")[0].replace(/'/g, ""),
    fonte_corpo:
      customization.fonte_corpo ||
      defaults.fontBody.split(",")[0].replace(/'/g, ""),
    estilo_botoes: customization.estilo_botoes || (defaults.buttonRadius === "0px" ? "squared" : "rounded"),
    tamanho_hero:
      customization.tamanho_hero ||
      (defaults.heroHeight === "100vh"
        ? "fullscreen"
        : defaults.heroHeight === "70vh"
        ? "grande"
        : "medio"),
    animacoes_ativas: customization.animacoes_ativas ?? defaults.animationsEnabled,
  });

  useEffect(() => {
    if (open) {
      setLocalCustom({
        cor_primaria: customization.cor_primaria || defaults.colorPrimary,
        cor_secundaria: customization.cor_secundaria || defaults.colorSecondary,
        cor_texto: customization.cor_texto || defaults.colorText,
        fonte_titulos:
          customization.fonte_titulos ||
          defaults.fontHeading.split(",")[0].replace(/'/g, ""),
        fonte_corpo:
          customization.fonte_corpo ||
          defaults.fontBody.split(",")[0].replace(/'/g, ""),
        estilo_botoes: customization.estilo_botoes || (defaults.buttonRadius === "0px" ? "squared" : "rounded"),
        tamanho_hero:
          customization.tamanho_hero ||
          (defaults.heroHeight === "100vh"
            ? "fullscreen"
            : defaults.heroHeight === "70vh"
            ? "grande"
            : "medio"),
        animacoes_ativas: customization.animacoes_ativas ?? defaults.animationsEnabled,
      });
    }
  }, [open, customization, defaults]);

  const handleReset = () => {
    setLocalCustom({
      cor_primaria: defaults.colorPrimary,
      cor_secundaria: defaults.colorSecondary,
      cor_texto: defaults.colorText,
      fonte_titulos: defaults.fontHeading.split(",")[0].replace(/'/g, ""),
      fonte_corpo: defaults.fontBody.split(",")[0].replace(/'/g, ""),
      estilo_botoes: defaults.buttonRadius === "0px" ? "squared" : "rounded",
      tamanho_hero:
        defaults.heroHeight === "100vh"
          ? "fullscreen"
          : defaults.heroHeight === "70vh"
          ? "grande"
          : "medio",
      animacoes_ativas: defaults.animationsEnabled,
    });
  };

  const handleSave = () => {
    onSave(localCustom);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personalizar Template
          </DialogTitle>
          <DialogDescription>
            Customize cores, fontes e estilos para este imóvel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Colors Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Palette className="h-4 w-4" />
              CORES
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ColorPicker
                label="Cor Primária"
                value={localCustom.cor_primaria || defaults.colorPrimary}
                onChange={(c) => setLocalCustom((p) => ({ ...p, cor_primaria: c }))}
              />
              <ColorPicker
                label="Cor Secundária"
                value={localCustom.cor_secundaria || defaults.colorSecondary}
                onChange={(c) => setLocalCustom((p) => ({ ...p, cor_secundaria: c }))}
              />
              <ColorPicker
                label="Cor do Texto"
                value={localCustom.cor_texto || defaults.colorText}
                onChange={(c) => setLocalCustom((p) => ({ ...p, cor_texto: c }))}
              />
            </div>
          </div>

          {/* Typography Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Type className="h-4 w-4" />
              TIPOGRAFIA
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fonte dos Títulos</Label>
                <Select
                  value={localCustom.fonte_titulos}
                  onValueChange={(v) =>
                    setLocalCustom((p) => ({ ...p, fonte_titulos: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.headings.map((font) => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fonte do Corpo</Label>
                <Select
                  value={localCustom.fonte_corpo}
                  onValueChange={(v) =>
                    setLocalCustom((p) => ({ ...p, fonte_corpo: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.body.map((font) => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Style Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Settings2 className="h-4 w-4" />
              ESTILO
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Estilo dos Botões</Label>
                <RadioGroup
                  value={localCustom.estilo_botoes}
                  onValueChange={(v) =>
                    setLocalCustom((p) => ({
                      ...p,
                      estilo_botoes: v as "rounded" | "squared" | "pill",
                    }))
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rounded" id="btn-rounded" />
                    <Label htmlFor="btn-rounded" className="cursor-pointer">
                      Arredondados
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="squared" id="btn-squared" />
                    <Label htmlFor="btn-squared" className="cursor-pointer">
                      Quadrados
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pill" id="btn-pill" />
                    <Label htmlFor="btn-pill" className="cursor-pointer">
                      Pílula
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Tamanho do Hero</Label>
                <RadioGroup
                  value={localCustom.tamanho_hero}
                  onValueChange={(v) =>
                    setLocalCustom((p) => ({
                      ...p,
                      tamanho_hero: v as "fullscreen" | "grande" | "medio",
                    }))
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fullscreen" id="hero-full" />
                    <Label htmlFor="hero-full" className="cursor-pointer">
                      Fullscreen (100vh)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="grande" id="hero-grande" />
                    <Label htmlFor="hero-grande" className="cursor-pointer">
                      Grande (70vh)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medio" id="hero-medio" />
                    <Label htmlFor="hero-medio" className="cursor-pointer">
                      Médio (60vh)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animações e transições</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar efeitos visuais suaves
                  </p>
                </div>
                <Switch
                  checked={localCustom.animacoes_ativas}
                  onCheckedChange={(c) =>
                    setLocalCustom((p) => ({ ...p, animacoes_ativas: c }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <Label>Preview</Label>
            <div
              className="rounded-lg border p-6"
              style={{
                backgroundColor:
                  templateType === "luxo"
                    ? "#0a0a0a"
                    : templateType === "classico"
                    ? "#F5F5DC"
                    : "#ffffff",
              }}
            >
              <h3
                style={{
                  fontFamily: `'${localCustom.fonte_titulos}', serif`,
                  color: localCustom.cor_secundaria,
                  fontSize: "1.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                Título do Imóvel
              </h3>
              <p
                style={{
                  fontFamily: `'${localCustom.fonte_corpo}', sans-serif`,
                  color: localCustom.cor_texto,
                  marginBottom: "1rem",
                }}
              >
                Descrição do imóvel com as configurações aplicadas.
              </p>
              <button
                style={{
                  backgroundColor: localCustom.cor_primaria,
                  color: "#ffffff",
                  padding: "0.5rem 1rem",
                  borderRadius:
                    localCustom.estilo_botoes === "pill"
                      ? "9999px"
                      : localCustom.estilo_botoes === "rounded"
                      ? "8px"
                      : "0px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Botão de Ação
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Resetar para Padrão
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
