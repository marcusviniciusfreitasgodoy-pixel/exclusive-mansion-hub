import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, className }: KPICardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return ArrowUp;
    if (trend.value < 0) return ArrowDown;
    return Minus;
  };

  const TrendIcon = getTrendIcon();
  const isPositive = trend?.isPositive ?? (trend?.value ?? 0) > 0;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && TrendIcon && (
              <span className={cn(
                "flex items-center text-xs font-medium",
                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
              )}>
                <TrendIcon className="h-3 w-3 mr-0.5" />
                {Math.abs(trend.value)}%
              </span>
            )}
            <p className="text-xs text-muted-foreground">
              {trend?.label || subtitle}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
