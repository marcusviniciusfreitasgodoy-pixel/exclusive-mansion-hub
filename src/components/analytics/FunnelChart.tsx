import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FunnelStep {
  name: string;
  value: number;
  color?: string;
}

interface FunnelChartProps {
  title: string;
  description?: string;
  data: FunnelStep[];
  className?: string;
}

const DEFAULT_COLORS = [
  'bg-primary',
  'bg-primary/80',
  'bg-primary/60',
  'bg-primary/40',
  'bg-primary/20',
];

export function FunnelChart({ title, description, data, className }: FunnelChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((step, idx) => {
            const percentage = maxValue > 0 ? ((step.value / maxValue) * 100).toFixed(1) : '0';
            const conversionFromFirst = data[0]?.value > 0 
              ? ((step.value / data[0].value) * 100).toFixed(1) 
              : '0';
            
            return (
              <div key={step.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{step.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{step.value.toLocaleString()}</span>
                    <span className="text-muted-foreground text-xs">
                      ({conversionFromFirst}%)
                    </span>
                  </div>
                </div>
                <div className="h-8 bg-muted rounded-md overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-md transition-all duration-500",
                      step.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {data.length >= 2 && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">📊 Principais pontos de perda:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {data.slice(1).map((step, idx) => {
                const prevStep = data[idx];
                const lossRate = prevStep.value > 0 
                  ? (((prevStep.value - step.value) / prevStep.value) * 100).toFixed(1)
                  : '0';
                return (
                  <li key={step.name}>
                    • {lossRate}% perdem de {prevStep.name} para {step.name}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
