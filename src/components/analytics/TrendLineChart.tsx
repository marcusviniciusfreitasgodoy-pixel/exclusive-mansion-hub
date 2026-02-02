import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

interface ChartLine {
  dataKey: string;
  name: string;
  color: string;
  hidden?: boolean;
}

interface TrendLineChartProps {
  title: string;
  description?: string;
  data: any[];
  lines: ChartLine[];
  xAxisKey?: string;
  className?: string;
}

const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: '#b8860b',
  accent: '#2d5a87',
  muted: '#9ca3af',
};

export function TrendLineChart({ 
  title, 
  description, 
  data, 
  lines, 
  xAxisKey = 'date',
  className 
}: TrendLineChartProps) {
  const [visibleLines, setVisibleLines] = useState<Set<string>>(
    new Set(lines.filter(l => !l.hidden).map(l => l.dataKey))
  );

  const toggleLine = (dataKey: string) => {
    setVisibleLines(prev => {
      const next = new Set(prev);
      if (next.has(dataKey)) {
        next.delete(dataKey);
      } else {
        next.add(dataKey);
      }
      return next;
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} className="text-sm flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              {item.name}: <strong>{item.value.toLocaleString()}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {/* Toggle buttons for lines */}
        <div className="flex flex-wrap gap-2 mb-4">
          {lines.map(line => (
            <button
              key={line.dataKey}
              onClick={() => toggleLine(line.dataKey)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                visibleLines.has(line.dataKey)
                  ? 'text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
              style={visibleLines.has(line.dataKey) ? { backgroundColor: line.color } : {}}
            >
              {line.name}
            </button>
          ))}
        </div>

        <div className="h-[300px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey={xAxisKey} 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  interval="preserveStartEnd"
                />
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                {lines.map(line => (
                  visibleLines.has(line.dataKey) && (
                    <Line
                      key={line.dataKey}
                      type="monotone"
                      dataKey={line.dataKey}
                      name={line.name}
                      stroke={line.color}
                      strokeWidth={2}
                      dot={{ fill: line.color, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  )
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Sem dados no período
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
