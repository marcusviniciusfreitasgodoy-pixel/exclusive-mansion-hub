import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PipelineKanban } from '@/components/crm/PipelineKanban';

export default function PipelineImobiliaria() {
  return (
    <DashboardLayout title="Pipeline de Leads" fullWidth>
      <p className="mb-6 text-muted-foreground">
        Gerencie seus leads em um pipeline visual estilo Kanban
      </p>
      <div className="h-[calc(100vh-220px)]">
        <PipelineKanban type="imobiliaria" />
      </div>
    </DashboardLayout>
  );
}
