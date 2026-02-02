import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface OriginData {
  name: string;
  value: number;
  color?: string;
}

interface LeadOriginChartProps {
  title: string;
  description?: string;
  data: OriginData[];
  className?: string;
}

const DEFAULT_COLORS = ['#1e3a5f', '#b8860b', '#2d5a87', '#d4a84b', '#4a7c9f', '#8b7355'];

export function LeadOriginChart({ title, description, data, className }: LeadOriginChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  const dataWithColors = data.map((item, idx) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            {item.value} leads ({percentage}%)
          </p>
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
        {data.length > 0 && total > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataWithColors}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {dataWithColors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Sem dados no período
          </div>
        )}
        
        {/* Legend */}
        {data.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {dataWithColors.map((item) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
              return (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">
                    {item.name}: {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
