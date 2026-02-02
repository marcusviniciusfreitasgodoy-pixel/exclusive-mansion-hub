import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Lightbulb, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Insight {
  type: 'warning' | 'success' | 'info' | 'tip';
  title: string;
  description: string;
  action?: string;
}

interface InsightsCardProps {
  insights: Insight[];
  className?: string;
}

const INSIGHT_CONFIG = {
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-600',
    emoji: '⚠️',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600',
    emoji: '✅',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600',
    emoji: '📊',
  },
  tip: {
    icon: Lightbulb,
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600',
    emoji: '💡',
  },
};

export function InsightsCard({ insights, className }: InsightsCardProps) {
  if (!insights.length) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Insights Automáticos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, idx) => {
            const config = INSIGHT_CONFIG[insight.type];
            const Icon = config.icon;
            
            return (
              <div 
                key={idx}
                className={cn(
                  "p-4 rounded-lg border",
                  config.bg,
                  config.border
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{config.emoji}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <p className="text-sm font-medium mt-2 text-primary">
                        → {insight.action}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
