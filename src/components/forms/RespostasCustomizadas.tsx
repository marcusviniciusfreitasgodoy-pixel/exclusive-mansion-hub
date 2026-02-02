import { useEffect, useState } from 'react';
import { mapearRespostasComLabels, type RespostaMapeada } from '@/lib/form-helpers';
import type { TipoFormulario } from '@/types/form-config';
import { Skeleton } from '@/components/ui/skeleton';

interface RespostasCustomizadasProps {
  respostas: Record<string, unknown> | null;
  tipoFormulario: TipoFormulario;
  imobiliariaId: string;
  className?: string;
}

export function RespostasCustomizadas({
  respostas,
  tipoFormulario,
  imobiliariaId,
  className = '',
}: RespostasCustomizadasProps) {
  const [respostasComLabels, setRespostasComLabels] = useState<RespostaMapeada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRespostas() {
      if (!respostas || !imobiliariaId) {
        setRespostasComLabels([]);
        setLoading(false);
        return;
      }

      try {
        const mapeadas = await mapearRespostasComLabels(respostas, tipoFormulario, imobiliariaId);
        setRespostasComLabels(mapeadas);
      } catch (error) {
        console.error('Erro ao mapear respostas:', error);
        setRespostasComLabels([]);
      } finally {
        setLoading(false);
      }
    }

    loadRespostas();
  }, [respostas, tipoFormulario, imobiliariaId]);

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (respostasComLabels.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-medium text-muted-foreground">Respostas Adicionais</h4>
      <div className="space-y-2">
        {respostasComLabels.map((r) => (
          <div key={r.nome} className="flex flex-col sm:flex-row sm:items-start gap-1 text-sm">
            <span className="font-medium text-foreground min-w-[120px]">{r.label}:</span>
            <span className="text-muted-foreground">{r.valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
