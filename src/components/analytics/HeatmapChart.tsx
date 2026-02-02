import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

interface HeatmapChartProps {
  title: string;
  description?: string;
  data: HeatmapData[];
  className?: string;
}

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const HOURS = [8, 10, 12, 14, 16, 18, 20, 22];

export function HeatmapChart({ title, description, data, className }: HeatmapChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  const getHeatColor = (value: number): string => {
    const intensity = value / maxValue;
    if (intensity === 0) return 'bg-muted';
    if (intensity < 0.25) return 'bg-primary/20';
    if (intensity < 0.5) return 'bg-primary/40';
    if (intensity < 0.75) return 'bg-primary/60';
    return 'bg-primary';
  };

  const getValue = (day: string, hour: number): number => {
    const item = data.find(d => d.day === day && d.hour === hour);
    return item?.value || 0;
  };

  // Find peak time
  const peak = data.reduce((max, curr) => curr.value > max.value ? curr : max, { day: '', hour: 0, value: 0 });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="w-12"></th>
                {HOURS.map(hour => (
                  <th key={hour} className="text-xs font-medium text-muted-foreground p-1 text-center">
                    {hour}h
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day}>
                  <td className="text-xs font-medium text-muted-foreground pr-2">{day}</td>
                  {HOURS.map(hour => {
                    const value = getValue(day, hour);
                    return (
                      <td key={hour} className="p-0.5">
                        <div
                          className={cn(
                            "h-6 rounded transition-colors cursor-default",
                            getHeatColor(value)
                          )}
                          title={`${day} ${hour}h: ${value} acessos`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Menos</span>
            <div className="flex gap-0.5">
              <div className="w-4 h-4 bg-muted rounded" />
              <div className="w-4 h-4 bg-primary/20 rounded" />
              <div className="w-4 h-4 bg-primary/40 rounded" />
              <div className="w-4 h-4 bg-primary/60 rounded" />
              <div className="w-4 h-4 bg-primary rounded" />
            </div>
            <span className="text-xs text-muted-foreground">Mais</span>
          </div>
        </div>

        {peak.value > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">
              💡 <strong>Insight:</strong> Pico de acessos {peak.day} às {peak.hour}h 
              com {peak.value} visitas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
