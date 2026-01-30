import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  Plus,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Link as LinkIcon,
  BarChart3,
  Calendar,
  FileText,
} from 'lucide-react';
import logo from '@/assets/logo-principal.png';

const construtoraLinks = [
  { title: 'Meus Imóveis', url: '/dashboard/construtora', icon: Home },
  { title: 'Novo Imóvel', url: '/dashboard/construtora/novo-imovel', icon: Plus },
  { title: 'Visitas Agendadas', url: '/dashboard/construtora/agendamentos', icon: Calendar },
  { title: 'Feedbacks & Satisfação', url: '/dashboard/construtora/feedbacks', icon: FileText },
  { title: 'Leads', url: '/dashboard/construtora/leads', icon: MessageSquare },
  { title: 'Analytics', url: '/dashboard/construtora/analytics', icon: BarChart3 },
  { title: 'Imobiliárias', url: '/dashboard/construtora/imobiliarias', icon: Users },
  { title: 'Configurações', url: '/dashboard/construtora/configuracoes', icon: Settings },
];

const imobiliariaLinks = [
  { title: 'Imóveis Disponíveis', url: '/dashboard/imobiliaria', icon: Home },
  { title: 'Agendamentos', url: '/dashboard/imobiliaria/agendamentos', icon: Calendar },
  { title: 'Feedbacks', url: '/dashboard/imobiliaria/feedbacks', icon: FileText },
  { title: 'Meus Links', url: '/dashboard/imobiliaria/meus-links', icon: LinkIcon },
  { title: 'Meus Leads', url: '/dashboard/imobiliaria/leads', icon: MessageSquare },
  { title: 'Analytics', url: '/dashboard/imobiliaria/analytics', icon: BarChart3 },
  { title: 'Configurações', url: '/dashboard/imobiliaria/configuracoes', icon: Settings },
];

export function DashboardSidebar() {
  const { role, construtora, imobiliaria, signOut } = useAuth();
  const location = useLocation();

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
                      <span>{link.title}</span>
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
