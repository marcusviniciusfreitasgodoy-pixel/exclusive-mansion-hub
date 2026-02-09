import { Link, useLocation } from 'react-router-dom';
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
import {
  Building2,
  Home,
  MessageSquare,
  BarChart3,
  Calendar,
  Kanban,
  Link as LinkIcon,
  Users,
  ArrowLeft,
  BookOpen,
  Globe,
} from 'lucide-react';
import logo from '@/assets/logo-principal.png';
import type { AppRole } from '@/types/database';
import { DEMO_CONSTRUTORA, DEMO_IMOBILIARIA } from '@/data/demo-data';

const construtoraLinks = [
  { title: 'Meus Imóveis', url: '/demo/construtora', icon: Home },
  { title: 'Sites & Templates', url: '/demo/construtora/sites', icon: Globe },
  { title: 'Pipeline CRM', url: '/demo/construtora/pipeline', icon: Kanban },
  { title: 'Visitas Agendadas', url: '/demo/construtora/agendamentos', icon: Calendar },
  { title: 'Leads', url: '/demo/construtora/leads', icon: MessageSquare },
  { title: 'Analytics', url: '/demo/construtora/analytics', icon: BarChart3 },
  { title: 'Imobiliárias', url: '/demo/construtora/imobiliarias', icon: Users },
];

const imobiliariaLinks = [
  { title: 'Imóveis Disponíveis', url: '/demo/imobiliaria', icon: Home },
  { title: 'Meus Links', url: '/demo/imobiliaria/meus-links', icon: LinkIcon },
  { title: 'Meus Leads', url: '/demo/imobiliaria/leads', icon: MessageSquare },
  { title: 'Analytics', url: '/demo/imobiliaria/analytics', icon: BarChart3 },
  { title: 'Agendamentos', url: '/demo/imobiliaria/agendamentos', icon: Calendar },
];

interface DemoDashboardSidebarProps {
  role: AppRole;
}

export function DemoDashboardSidebar({ role }: DemoDashboardSidebarProps) {
  const location = useLocation();
  const links = role === 'construtora' ? construtoraLinks : imobiliariaLinks;
  const companyName = role === 'construtora' ? DEMO_CONSTRUTORA.nome_empresa : DEMO_IMOBILIARIA.nome_empresa;

  const isActive = (url: string) => {
    if (url === '/demo/construtora' || url === '/demo/imobiliaria') {
      return location.pathname === url;
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        <Link to="/demo" className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-8" />
        </Link>
        <p className="mt-2 text-sm font-medium text-muted-foreground truncate">
          {companyName}
        </p>
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
                      <span>{link.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/manual" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Manual</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground"
          asChild
        >
          <Link to="/demo">
            <ArrowLeft className="h-4 w-4" />
            Voltar à Escolha
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
