import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { addDays, format, startOfDay, isBefore, isAfter, parse, addMinutes, isSameDay } from 'date-fns';

export interface Disponibilidade {
  id: string;
  imobiliaria_id: string;
  dia_semana: number; // 0=domingo, 6=sábado
  hora_inicio: string; // "09:00:00"
  hora_fim: string; // "18:00:00"
  duracao_slot_minutos: number;
  ativo: boolean;
}

export interface Bloqueio {
  id: string;
  imobiliaria_id: string;
  data_inicio: string;
  data_fim: string;
  motivo: string | null;
  recorrente: boolean;
}

export interface TimeSlot {
  date: Date;
  time: string;
  available: boolean;
}

const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

export function useDisponibilidade() {
  const { imobiliaria } = useAuth();
  const queryClient = useQueryClient();
  const imobiliariaId = imobiliaria?.id;

  // Fetch disponibilidade
  const { data: disponibilidades, isLoading: loadingDisponibilidades } = useQuery({
    queryKey: ['disponibilidade', imobiliariaId],
    queryFn: async () => {
      if (!imobiliariaId) return [];
      const { data, error } = await supabase
        .from('disponibilidade_corretor' as any)
        .select('*')
        .eq('imobiliaria_id', imobiliariaId)
        .order('dia_semana');
      if (error) throw error;
      return (data || []) as unknown as Disponibilidade[];
    },
    enabled: !!imobiliariaId,
  });

  // Fetch bloqueios
  const { data: bloqueios, isLoading: loadingBloqueios } = useQuery({
    queryKey: ['bloqueios', imobiliariaId],
    queryFn: async () => {
      if (!imobiliariaId) return [];
      const { data, error } = await supabase
        .from('bloqueios_agenda' as any)
        .select('*')
        .eq('imobiliaria_id', imobiliariaId)
        .order('data_inicio');
      if (error) throw error;
      return (data || []) as unknown as Bloqueio[];
    },
    enabled: !!imobiliariaId,
  });

  // Upsert disponibilidade
  const upsertDisponibilidade = useMutation({
    mutationFn: async (data: Partial<Disponibilidade> & { dia_semana: number }) => {
      if (!imobiliariaId) throw new Error('Imobiliária não encontrada');
      
      const payload = {
        ...data,
        imobiliaria_id: imobiliariaId,
      };

      const { error } = await supabase
        .from('disponibilidade_corretor' as any)
        .upsert(payload, { 
          onConflict: 'imobiliaria_id,dia_semana' 
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidade', imobiliariaId] });
      toast.success('Disponibilidade atualizada');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar disponibilidade: ' + error.message);
    },
  });

  // Delete disponibilidade
  const deleteDisponibilidade = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('disponibilidade_corretor' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidade', imobiliariaId] });
      toast.success('Disponibilidade removida');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover disponibilidade: ' + error.message);
    },
  });

  // Add bloqueio
  const addBloqueio = useMutation({
    mutationFn: async (data: Omit<Bloqueio, 'id' | 'imobiliaria_id'>) => {
      if (!imobiliariaId) throw new Error('Imobiliária não encontrada');
      
      const { error } = await supabase
        .from('bloqueios_agenda' as any)
        .insert({
          ...data,
          imobiliaria_id: imobiliariaId,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloqueios', imobiliariaId] });
      toast.success('Bloqueio adicionado');
    },
    onError: (error: Error) => {
      toast.error('Erro ao adicionar bloqueio: ' + error.message);
    },
  });

  // Delete bloqueio
  const deleteBloqueio = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bloqueios_agenda' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloqueios', imobiliariaId] });
      toast.success('Bloqueio removido');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover bloqueio: ' + error.message);
    },
  });

  return {
    disponibilidades: disponibilidades || [],
    bloqueios: bloqueios || [],
    isLoading: loadingDisponibilidades || loadingBloqueios,
    upsertDisponibilidade,
    deleteDisponibilidade,
    addBloqueio,
    deleteBloqueio,
    DIAS_SEMANA,
  };
}

// Hook for public availability (used in AgendarVisitaModal)
export function usePublicDisponibilidade(imobiliariaId: string | null) {
  // Fetch disponibilidade da imobiliária
  const { data: disponibilidades } = useQuery({
    queryKey: ['disponibilidade-publica', imobiliariaId],
    queryFn: async () => {
      if (!imobiliariaId) return [];
      const { data, error } = await supabase
        .from('disponibilidade_corretor' as any)
        .select('*')
        .eq('imobiliaria_id', imobiliariaId)
        .eq('ativo', true);
      if (error) throw error;
      return (data || []) as unknown as Disponibilidade[];
    },
    enabled: !!imobiliariaId,
  });

  // Fetch bloqueios da imobiliária
  const { data: bloqueios } = useQuery({
    queryKey: ['bloqueios-publicos', imobiliariaId],
    queryFn: async () => {
      if (!imobiliariaId) return [];
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('bloqueios_agenda' as any)
        .select('*')
        .eq('imobiliaria_id', imobiliariaId)
        .gte('data_fim', now);
      if (error) throw error;
      return (data || []) as unknown as Bloqueio[];
    },
    enabled: !!imobiliariaId,
  });

  // Fetch agendamentos existentes para evitar conflitos
  const { data: agendamentosExistentes } = useQuery({
    queryKey: ['agendamentos-existentes', imobiliariaId],
    queryFn: async () => {
      if (!imobiliariaId) return [];
      const minDate = addDays(new Date(), 1).toISOString();
      const maxDate = addDays(new Date(), 60).toISOString();
      
      const { data, error } = await supabase
        .from('agendamentos_visitas')
        .select('data_confirmada, opcao_data_1, opcao_data_2, status')
        .eq('imobiliaria_id', imobiliariaId)
        .not('status', 'in', '("cancelado","realizado")')
        .gte('opcao_data_1', minDate)
        .lte('opcao_data_1', maxDate);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!imobiliariaId,
  });

  // Gera slots disponíveis para os próximos 60 dias
  const availableSlots = useMemo(() => {
    if (!disponibilidades || disponibilidades.length === 0) {
      // Se não houver disponibilidade configurada, retorna horário padrão
      return generateDefaultSlots();
    }

    const slots: TimeSlot[] = [];
    const today = new Date();
    const minDate = startOfDay(addDays(today, 1));
    const maxDate = addDays(today, 60);

    for (let date = minDate; isBefore(date, maxDate); date = addDays(date, 1)) {
      const dayOfWeek = date.getDay();
      const config = disponibilidades.find(d => d.dia_semana === dayOfWeek && d.ativo);
      
      if (!config) continue;

      // Check if date is blocked
      const isBlocked = bloqueios?.some(b => {
        const blockStart = new Date(b.data_inicio);
        const blockEnd = new Date(b.data_fim);
        return !isBefore(date, startOfDay(blockStart)) && !isAfter(date, startOfDay(blockEnd));
      });

      if (isBlocked) continue;

      // Generate time slots for this day
      const startTime = parse(config.hora_inicio, 'HH:mm:ss', date);
      const endTime = parse(config.hora_fim, 'HH:mm:ss', date);
      const slotDuration = config.duracao_slot_minutos || 60;

      let currentSlot = startTime;
      while (isBefore(currentSlot, endTime)) {
        const timeStr = format(currentSlot, 'HH:mm');
        
        // Check if slot is already booked
        const isBooked = agendamentosExistentes?.some(a => {
          const data1 = new Date(a.opcao_data_1);
          const data2 = a.opcao_data_2 ? new Date(a.opcao_data_2) : null;
          const dataConfirmada = a.data_confirmada ? new Date(a.data_confirmada) : null;
          
          const checkDate = dataConfirmada || data1;
          return isSameDay(checkDate, date) && format(checkDate, 'HH:mm') === timeStr;
        });

        slots.push({
          date,
          time: timeStr,
          available: !isBooked,
        });

        currentSlot = addMinutes(currentSlot, slotDuration);
      }
    }

    return slots;
  }, [disponibilidades, bloqueios, agendamentosExistentes]);

  // Dias disponíveis para o calendário
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    availableSlots.forEach(slot => {
      if (slot.available) {
        dates.add(format(slot.date, 'yyyy-MM-dd'));
      }
    });
    return dates;
  }, [availableSlots]);

  // Horários disponíveis para uma data específica
  const getSlotsForDate = (date: Date) => {
    return availableSlots.filter(slot => 
      isSameDay(slot.date, date) && slot.available
    );
  };

  // Verifica se um dia está disponível
  const isDayAvailable = (date: Date) => {
    return availableDates.has(format(date, 'yyyy-MM-dd'));
  };

  // Verifica se a imobiliária tem agenda configurada
  const hasConfiguredSchedule = (disponibilidades?.length || 0) > 0;

  return {
    availableSlots,
    availableDates,
    getSlotsForDate,
    isDayAvailable,
    hasConfiguredSchedule,
  };
}

// Gera slots padrão caso não haja configuração (9h-18h, seg-sex)
function generateDefaultSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date();
  const minDate = startOfDay(addDays(today, 1));
  const maxDate = addDays(today, 60);

  const defaultTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  for (let date = minDate; isBefore(date, maxDate); date = addDays(date, 1)) {
    const dayOfWeek = date.getDay();
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    defaultTimes.forEach(time => {
      slots.push({
        date,
        time,
        available: true,
      });
    });
  }

  return slots;
}
