import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Home,
  Plus,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Link as LinkIcon,
  BarChart3,
  Calendar,
  FileText,
  Kanban,
  Link2,
  ImagePlus,
  Images,
} from 'lucide-react';
import logo from '@/assets/logo-principal.png';

const construtoraLinks = [
  { title: 'Meus Imóveis', url: '/dashboard/construtora', icon: Home },
  { title: 'Novo Imóvel', url: '/dashboard/construtora/novo-imovel', icon: Plus },
  { title: 'Aprovar Mídias', url: '/dashboard/construtora/aprovar-midias', icon: ImagePlus, hasBadge: true },
  { title: 'Pipeline CRM', url: '/dashboard/construtora/pipeline', icon: Kanban },
  { title: 'Visitas Agendadas', url: '/dashboard/construtora/agendamentos', icon: Calendar },
  { title: 'Feedbacks & Satisfação', url: '/dashboard/construtora/feedbacks', icon: FileText },
  { title: 'Leads', url: '/dashboard/construtora/leads', icon: MessageSquare },
  { title: 'Analytics', url: '/dashboard/construtora/analytics', icon: BarChart3 },
  { title: 'Integrações', url: '/dashboard/construtora/integracoes', icon: Link2 },
  { title: 'Imobiliárias', url: '/dashboard/construtora/imobiliarias', icon: Users },
  { title: 'Configurações', url: '/dashboard/construtora/configuracoes', icon: Settings },
];

const imobiliariaLinks = [
  { title: 'Imóveis Disponíveis', url: '/dashboard/imobiliaria', icon: Home },
  { title: 'Minhas Mídias', url: '/dashboard/imobiliaria/minhas-midias', icon: Images },
  { title: 'Pipeline CRM', url: '/dashboard/imobiliaria/pipeline', icon: Kanban },
  { title: 'Agendamentos', url: '/dashboard/imobiliaria/agendamentos', icon: Calendar },
  { title: 'Feedbacks', url: '/dashboard/imobiliaria/feedbacks', icon: FileText },
  { title: 'Meus Links', url: '/dashboard/imobiliaria/meus-links', icon: LinkIcon },
  { title: 'Meus Leads', url: '/dashboard/imobiliaria/leads', icon: MessageSquare },
  { title: 'Analytics', url: '/dashboard/imobiliaria/analytics', icon: BarChart3 },
  { title: 'Integrações', url: '/dashboard/imobiliaria/integracoes', icon: Link2 },
  { title: 'Configurações', url: '/dashboard/imobiliaria/configuracoes', icon: Settings },
];

export function DashboardSidebar() {
  const { role, construtora, imobiliaria, signOut } = useAuth();
  const location = useLocation();

  // Fetch pending media count for construtora badge
  const { data: pendingMediaCount = 0 } = useQuery({
    queryKey: ['pending-media-count', construtora?.id],
    queryFn: async () => {
      if (!construtora?.id) return 0;
      
      const { count, error } = await supabase
        .from('midias_pendentes')
        .select('id, imovel:imoveis!inner(construtora_id)', { count: 'exact', head: true })
        .eq('imovel.construtora_id', construtora.id)
        .eq('status', 'pendente');
      
      if (error) return 0;
      return count || 0;
    },
    enabled: role === 'construtora' && !!construtora?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const links = role === 'construtora' ? construtoraLinks : imobiliariaLinks;
  const companyName = role === 'construtora' 
    ? construtora?.nome_empresa 
    : imobiliaria?.nome_empresa;

  const isActive = (url: string) => {
    if (url === '/dashboard/construtora' || url === '/dashboard/imobiliaria') {
      return location.pathname === url;
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-8" />
        </Link>
        {companyName && (
          <p className="mt-2 text-sm font-medium text-muted-foreground truncate">
            {companyName}
          </p>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {role === 'construtora' ? 'Construtora' : 'Imobiliária'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.url}>
                  <SidebarMenuButton asChild isActive={isActive(link.url)}>
                    <Link to={link.url} className="flex items-center gap-2">
                      <link.icon className="h-4 w-4" />
                      <span className="flex-1">{link.title}</span>
                      {'hasBadge' in link && link.hasBadge && pendingMediaCount > 0 && (
                        <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0.5 min-w-5 h-5 flex items-center justify-center">
                          {pendingMediaCount > 99 ? '99+' : pendingMediaCount}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
