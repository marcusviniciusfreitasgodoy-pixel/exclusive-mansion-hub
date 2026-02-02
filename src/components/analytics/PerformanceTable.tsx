import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Eye, MessageSquare, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceRow {
  id: string;
  name: string;
  views: number;
  leads: number;
  conversion: number;
  visitas?: number;
  nps?: number;
  rank?: number;
}

interface PerformanceTableProps {
  title: string;
  description?: string;
  data: PerformanceRow[];
  showRank?: boolean;
  showNPS?: boolean;
  showVisitas?: boolean;
  className?: string;
}

const getRankEmoji = (rank: number) => {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return rank.toString();
  }
};

export function PerformanceTable({ 
  title, 
  description, 
  data, 
  showRank = false,
  showNPS = false,
  showVisitas = false,
  className 
}: PerformanceTableProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {showRank && <TableHead className="w-12">Pos</TableHead>}
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">
                    <span className="flex items-center justify-end gap-1">
                      <Eye className="h-3 w-3" /> Views
                    </span>
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="flex items-center justify-end gap-1">
                      <MessageSquare className="h-3 w-3" /> Leads
                    </span>
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="flex items-center justify-end gap-1">
                      <TrendingUp className="h-3 w-3" /> Conv%
                    </span>
                  </TableHead>
                  {showVisitas && (
                    <TableHead className="text-right">
                      <span className="flex items-center justify-end gap-1">
                        <Calendar className="h-3 w-3" /> Visitas
                      </span>
                    </TableHead>
                  )}
                  {showNPS && <TableHead className="text-right">NPS</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={row.id}>
                    {showRank && (
                      <TableCell className="font-medium">
                        {getRankEmoji(row.rank || idx + 1)}
                      </TableCell>
                    )}
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {row.name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.views.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.leads}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={row.conversion >= 10 ? "default" : row.conversion >= 5 ? "secondary" : "outline"}
                      >
                        {row.conversion.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    {showVisitas && (
                      <TableCell className="text-right tabular-nums">
                        {row.visitas || 0}
                      </TableCell>
                    )}
                    {showNPS && (
                      <TableCell className="text-right">
                        {row.nps !== undefined ? (
                          <Badge 
                            variant={row.nps >= 9 ? "default" : row.nps >= 7 ? "secondary" : "destructive"}
                          >
                            {row.nps.toFixed(1)}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Sem dados no período</p>
        )}
      </CardContent>
    </Card>
  );
}
