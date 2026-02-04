import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Calendar, Plus, Trash2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDisponibilidade, Disponibilidade } from "@/hooks/useDisponibilidade";

const HORARIOS = Array.from({ length: 24 }, (_, i) => {
  const hour = String(i).padStart(2, '0');
  return [`${hour}:00`, `${hour}:30`];
}).flat().filter(h => {
  const hour = parseInt(h.split(':')[0]);
  return hour >= 6 && hour <= 22;
});

const DURACOES = [
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 horas' },
];

export default function ConfigurarAgenda() {
  const {
    disponibilidades,
    bloqueios,
    isLoading,
    upsertDisponibilidade,
    deleteDisponibilidade,
    addBloqueio,
    deleteBloqueio,
    DIAS_SEMANA,
  } = useDisponibilidade();

  const [bloqueioDialog, setBloqueioDialog] = useState(false);
  const [bloqueioForm, setBloqueioForm] = useState({
    data_inicio: null as Date | null,
    data_fim: null as Date | null,
    motivo: '',
  });

  const handleDisponibilidadeChange = (
    diaSemana: number, 
    field: keyof Disponibilidade, 
    value: any
  ) => {
    const existing = disponibilidades.find(d => d.dia_semana === diaSemana);
    
    if (field === 'ativo' && !value && existing) {
      // Desativar dia
      upsertDisponibilidade.mutate({
        ...existing,
        ativo: false,
      });
    } else {
      // Atualizar ou criar
      upsertDisponibilidade.mutate({
        dia_semana: diaSemana,
        hora_inicio: existing?.hora_inicio || '09:00:00',
        hora_fim: existing?.hora_fim || '18:00:00',
        duracao_slot_minutos: existing?.duracao_slot_minutos || 60,
        ativo: true,
        [field]: field === 'hora_inicio' || field === 'hora_fim' 
          ? `${value}:00` 
          : value,
      });
    }
  };

  const handleAddBloqueio = () => {
    if (!bloqueioForm.data_inicio || !bloqueioForm.data_fim) return;
    
    addBloqueio.mutate({
      data_inicio: bloqueioForm.data_inicio.toISOString(),
      data_fim: bloqueioForm.data_fim.toISOString(),
      motivo: bloqueioForm.motivo || null,
      recorrente: false,
    });
    
    setBloqueioDialog(false);
    setBloqueioForm({ data_inicio: null, data_fim: null, motivo: '' });
  };

  const diasConfigurados = disponibilidades.filter(d => d.ativo).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              Configurar Agenda
            </h1>
            <p className="text-muted-foreground mt-1">
              Defina seus horários de atendimento e bloqueie datas específicas
            </p>
          </div>
          
          <Badge variant={diasConfigurados > 0 ? "default" : "secondary"} className="flex items-center gap-1">
            {diasConfigurados > 0 ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                {diasConfigurados} dia(s) configurado(s)
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                Nenhum dia configurado
              </>
            )}
          </Badge>
        </div>

        {/* Info Alert */}
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            Configure seus horários de disponibilidade para que clientes possam agendar visitas apenas nos horários que você está disponível.
            Os slots serão gerados automaticamente com base na duração definida.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Disponibilidade Semanal */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Horários Semanais</CardTitle>
              <CardDescription>
                Ative os dias e defina os horários de atendimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DIAS_SEMANA.map(dia => {
                const config = disponibilidades.find(d => d.dia_semana === dia.value);
                const isActive = config?.ativo ?? false;
                
                return (
                  <div 
                    key={dia.value} 
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg border transition-colors",
                      isActive ? "bg-primary/5 border-primary/20" : "bg-muted/50"
                    )}
                  >
                    <Switch
                      checked={isActive}
                      onCheckedChange={(checked) => 
                        handleDisponibilidadeChange(dia.value, 'ativo', checked)
                      }
                    />
                    
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        "font-medium",
                        !isActive && "text-muted-foreground"
                      )}>
                        {dia.label}
                      </span>
                    </div>
                    
                    {isActive && (
                      <div className="flex items-center gap-2 text-sm">
                        <Select
                          value={config?.hora_inicio?.slice(0, 5) || '09:00'}
                          onValueChange={(v) => 
                            handleDisponibilidadeChange(dia.value, 'hora_inicio', v)
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {HORARIOS.map(h => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <span className="text-muted-foreground">às</span>
                        
                        <Select
                          value={config?.hora_fim?.slice(0, 5) || '18:00'}
                          onValueChange={(v) => 
                            handleDisponibilidadeChange(dia.value, 'hora_fim', v)
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {HORARIOS.map(h => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Duração do slot */}
              <div className="pt-4 border-t">
                <Label className="text-sm font-medium">Duração de cada visita</Label>
                <Select
                  value={String(disponibilidades[0]?.duracao_slot_minutos || 60)}
                  onValueChange={(v) => {
                    // Atualiza todos os dias com a mesma duração
                    disponibilidades.forEach(d => {
                      if (d.ativo) {
                        upsertDisponibilidade.mutate({
                          ...d,
                          duracao_slot_minutos: parseInt(v),
                        });
                      }
                    });
                  }}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURACOES.map(d => (
                      <SelectItem key={d.value} value={String(d.value)}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bloqueios */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Bloqueios de Agenda</CardTitle>
                <CardDescription>
                  Datas em que você não está disponível
                </CardDescription>
              </div>
              
              <Dialog open={bloqueioDialog} onOpenChange={setBloqueioDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Bloqueio</DialogTitle>
                    <DialogDescription>
                      Adicione um período em que você não estará disponível para visitas.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data Início</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              <Calendar className="mr-2 h-4 w-4" />
                              {bloqueioForm.data_inicio 
                                ? format(bloqueioForm.data_inicio, 'dd/MM/yyyy', { locale: ptBR })
                                : 'Selecione'
                              }
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={bloqueioForm.data_inicio || undefined}
                              onSelect={(date) => setBloqueioForm(prev => ({ 
                                ...prev, 
                                data_inicio: date || null,
                                data_fim: prev.data_fim && date && date > prev.data_fim ? date : prev.data_fim
                              }))}
                              locale={ptBR}
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Data Fim</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              <Calendar className="mr-2 h-4 w-4" />
                              {bloqueioForm.data_fim 
                                ? format(bloqueioForm.data_fim, 'dd/MM/yyyy', { locale: ptBR })
                                : 'Selecione'
                              }
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={bloqueioForm.data_fim || undefined}
                              onSelect={(date) => setBloqueioForm(prev => ({ ...prev, data_fim: date || null }))}
                              locale={ptBR}
                              disabled={(date) => date < (bloqueioForm.data_inicio || new Date())}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Motivo (opcional)</Label>
                      <Textarea
                        placeholder="Ex: Férias, feriado, compromisso pessoal..."
                        value={bloqueioForm.motivo}
                        onChange={(e) => setBloqueioForm(prev => ({ ...prev, motivo: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBloqueioDialog(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleAddBloqueio}
                      disabled={!bloqueioForm.data_inicio || !bloqueioForm.data_fim}
                    >
                      Adicionar Bloqueio
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            
            <CardContent>
              {bloqueios.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum bloqueio cadastrado</p>
                  <p className="text-sm">Adicione datas em que não poderá atender</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bloqueios.map(bloqueio => (
                    <div 
                      key={bloqueio.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {format(parseISO(bloqueio.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
                          {' '}-{' '}
                          {format(parseISO(bloqueio.data_fim), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        {bloqueio.motivo && (
                          <div className="text-sm text-muted-foreground">
                            {bloqueio.motivo}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteBloqueio.mutate(bloqueio.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo da Disponibilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {DIAS_SEMANA.map(dia => {
                const config = disponibilidades.find(d => d.dia_semana === dia.value && d.ativo);
                
                return (
                  <Badge 
                    key={dia.value}
                    variant={config ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {dia.label.slice(0, 3)}
                    {config && (
                      <span className="ml-1 opacity-75">
                        {config.hora_inicio?.slice(0, 5)}-{config.hora_fim?.slice(0, 5)}
                      </span>
                    )}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
