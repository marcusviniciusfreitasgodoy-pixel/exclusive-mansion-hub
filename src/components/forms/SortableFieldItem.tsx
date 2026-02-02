import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { CampoFormulario } from '@/types/form-config';
import { TIPO_CAMPO_LABELS } from '@/types/form-config';

interface SortableFieldItemProps {
  campo: CampoFormulario;
  onEdit: (campo: CampoFormulario) => void;
  onDelete: (campoId: string) => void;
  onToggleVisibility?: (campoId: string) => void;
}

export function SortableFieldItem({ campo, onEdit, onDelete, onToggleVisibility }: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: campo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-4 bg-background border rounded-lg
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
        ${campo.bloqueado ? 'bg-muted/30' : ''}
      `}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted"
        aria-label="Arrastar campo"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      {/* Field Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate">{campo.label}</span>
          {campo.bloqueado && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Obrigatório
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                Este campo é obrigatório do sistema e não pode ser removido
              </TooltipContent>
            </Tooltip>
          )}
          {campo.obrigatorio && !campo.bloqueado && (
            <Badge variant="outline" className="text-xs">Obrigatório</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span className="bg-muted px-2 py-0.5 rounded text-xs">
            {TIPO_CAMPO_LABELS[campo.tipo]}
          </span>
          <span className="font-mono text-xs">{campo.nome}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(campo)}
          aria-label="Editar campo"
        >
          <Edit className="h-4 w-4" />
        </Button>

        {campo.bloqueado ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled
                  className="cursor-not-allowed opacity-50"
                  aria-label="Não é possível excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Este campo é obrigatório e não pode ser removido
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(campo.id)}
            className="text-destructive hover:text-destructive"
            aria-label="Excluir campo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
