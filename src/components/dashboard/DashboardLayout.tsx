import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from './DashboardSidebar';
import { cn } from '@/lib/utils';

export interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  fullWidth?: boolean;
}

export function DashboardLayout({ children, title, fullWidth }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger />
            {title && <h1 className="text-xl font-semibold">{title}</h1>}
          </header>
          <div className={cn("p-6", fullWidth && "max-w-none")}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
