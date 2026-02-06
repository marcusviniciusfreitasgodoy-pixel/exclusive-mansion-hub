import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Building2, Home, Users, Search, Mail, Phone, Globe, Shield } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const DEVELOPER_EMAIL = "dev@godoyrealty.com";

interface ConstructoraProfile {
  id: string;
  user_id: string;
  nome_empresa: string;
  cnpj: string;
  email_contato: string | null;
  telefone: string | null;
  site_url: string | null;
  plano: string | null;
  status: string | null;
  created_at: string | null;
  logo_url: string | null;
}

interface ImobiliariaProfile {
  id: string;
  user_id: string;
  nome_empresa: string;
  creci: string;
  email_contato: string | null;
  telefone: string | null;
  site_url: string | null;
  created_at: string | null;
  logo_url: string | null;
}

interface UserStats {
  totalConstrutoras: number;
  totalImobiliarias: number;
  totalLeads: number;
  totalImoveis: number;
}

export default function GerenciarUsuarios() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [construtoras, setConstrutoras] = useState<ConstructoraProfile[]>([]);
  const [imobiliarias, setImobiliarias] = useState<ImobiliariaProfile[]>([]);
  const [stats, setStats] = useState<UserStats>({ totalConstrutoras: 0, totalImobiliarias: 0, totalLeads: 0, totalImoveis: 0 });
  const [searchConstrutora, setSearchConstrutora] = useState("");
  const [searchImobiliaria, setSearchImobiliaria] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== DEVELOPER_EMAIL) {
        toast.error("Acesso restrito", { description: "Esta página é restrita ao desenvolvedor." });
        navigate("/");
        return;
      }
      setIsAuthorized(true);
      loadData();
    }
    checkAuth();
  }, [navigate]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [construtorasRes, imobiliariasRes, imoveisRes, leadsRes] = await Promise.all([
        supabase.from("construtoras").select("*").order("created_at", { ascending: false }),
        supabase.from("imobiliarias").select("*").order("created_at", { ascending: false }),
        supabase.from("imoveis").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
      ]);

      setConstrutoras((construtorasRes.data || []) as ConstructoraProfile[]);
      setImobiliarias((imobiliariasRes.data || []) as ImobiliariaProfile[]);
      setStats({
        totalConstrutoras: construtorasRes.data?.length || 0,
        totalImobiliarias: imobiliariasRes.data?.length || 0,
        totalImoveis: imoveisRes.count || 0,
        totalLeads: leadsRes.count || 0,
      });
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredConstrutoras = construtoras.filter(c =>
    c.nome_empresa.toLowerCase().includes(searchConstrutora.toLowerCase()) ||
    c.cnpj.includes(searchConstrutora)
  );

  const filteredImobiliarias = imobiliarias.filter(i =>
    i.nome_empresa.toLowerCase().includes(searchImobiliaria.toLowerCase()) ||
    i.creci.toLowerCase().includes(searchImobiliaria.toLowerCase())
  );

  function formatDate(date: string | null) {
    if (!date) return "—";
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  }

  function formatCNPJ(cnpj: string) {
    const digits = cnpj.replace(/\D/g, "");
    if (digits.length !== 14) return cnpj;
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }

  if (!isAuthorized || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-muted-foreground">Painel do desenvolvedor — visão geral de construtoras e imobiliárias cadastradas.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalConstrutoras}</p>
                  <p className="text-xs text-muted-foreground">Construtoras</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Home className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalImobiliarias}</p>
                  <p className="text-xs text-muted-foreground">Imobiliárias</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-accent-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalImoveis}</p>
                  <p className="text-xs text-muted-foreground">Imóveis</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-accent-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalLeads}</p>
                  <p className="text-xs text-muted-foreground">Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="construtoras">
          <TabsList>
            <TabsTrigger value="construtoras" className="gap-1.5">
              <Building2 className="h-4 w-4" /> Construtoras ({stats.totalConstrutoras})
            </TabsTrigger>
            <TabsTrigger value="imobiliarias" className="gap-1.5">
              <Home className="h-4 w-4" /> Imobiliárias ({stats.totalImobiliarias})
            </TabsTrigger>
          </TabsList>

          {/* Construtoras Tab */}
          <TabsContent value="construtoras" className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CNPJ..."
                value={searchConstrutora}
                onChange={(e) => setSearchConstrutora(e.target.value)}
                className="pl-9"
              />
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConstrutoras.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhuma construtora encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredConstrutoras.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {c.logo_url ? (
                                <img src={c.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-sm">{c.nome_empresa}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{c.user_id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-mono">{formatCNPJ(c.cnpj)}</TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              {c.email_contato && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" /> {c.email_contato}
                                </div>
                              )}
                              {c.telefone && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" /> {c.telefone}
                                </div>
                              )}
                              {c.site_url && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Globe className="h-3 w-3" /> {c.site_url}
                                </div>
                              )}
                              {!c.email_contato && !c.telefone && <span className="text-xs text-muted-foreground">—</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={c.status === "active" ? "default" : "secondary"}>
                              {c.status || "active"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{c.plano || "free"}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatDate(c.created_at)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Imobiliárias Tab */}
          <TabsContent value="imobiliarias" className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CRECI..."
                value={searchImobiliaria}
                onChange={(e) => setSearchImobiliaria(e.target.value)}
                className="pl-9"
              />
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>CRECI</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredImobiliarias.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          Nenhuma imobiliária encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredImobiliarias.map((i) => (
                        <TableRow key={i.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {i.logo_url ? (
                                <img src={i.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  <Home className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-sm">{i.nome_empresa}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{i.user_id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-mono">{i.creci}</TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              {i.email_contato && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" /> {i.email_contato}
                                </div>
                              )}
                              {i.telefone && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" /> {i.telefone}
                                </div>
                              )}
                              {i.site_url && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Globe className="h-3 w-3" /> {i.site_url}
                                </div>
                              )}
                              {!i.email_contato && !i.telefone && <span className="text-xs text-muted-foreground">—</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatDate(i.created_at)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
