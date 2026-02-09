import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Copy, Plus, Trash2, ExternalLink, Users, ArrowLeft, MessageSquare, Eye, Building2 } from 'lucide-react';

interface Access {
  id: string;
  url_slug: string;
  status: string;
  visitas: number;
  acesso_concedido_em: string;
  imobiliaria_id: string | null;
  imobiliarias: {
    id: string;
    nome_empresa: string;
    logo_url: string | null;
  } | null;
}

export default function GerenciarAcessos() {
  const { id: imovelId } = useParams<{ id: string }>();
  const { construtora } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedImobiliaria, setSelectedImobiliaria] = useState<string>('');
  const [customSlug, setCustomSlug] = useState('');

  // Fetch imovel
  const { data: imovel, isLoading: imovelLoading } = useQuery({
    queryKey: ['imovel', imovelId],
    queryFn: async () => {
      if (!imovelId) return null;
      const { data, error } = await supabase
        .from('imoveis')
        .select('id, titulo')
        .eq('id', imovelId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!imovelId,
  });

  // Fetch current accesses
  const { data: accesses, isLoading: accessesLoading } = useQuery({
    queryKey: ['accesses', imovelId],
    queryFn: async () => {
      if (!imovelId) return [];
      const { data, error } = await supabase
        .from('imobiliaria_imovel_access')
        .select(`
          id,
          url_slug,
          status,
          visitas,
          acesso_concedido_em,
          imobiliaria_id,
          imobiliarias (id, nome_empresa, logo_url)
        `)
        .eq('imovel_id', imovelId)
        .order('acesso_concedido_em', { ascending: false });
      if (error) throw error;
      return data as Access[];
    },
    enabled: !!imovelId,
  });

  // Fetch lead counts per access
  const { data: leadCounts } = useQuery({
    queryKey: ['lead-counts-access', imovelId],
    queryFn: async () => {
      if (!imovelId || !accesses?.length) return {};
      const { data, error } = await supabase
        .from('leads')
        .select('access_id')
        .eq('imovel_id', imovelId);
      if (error) throw error;
      const counts: Record<string, number> = {};
      data?.forEach(lead => {
        if (lead.access_id) {
          counts[lead.access_id] = (counts[lead.access_id] || 0) + 1;
        }
      });
      return counts;
    },
    enabled: !!accesses?.length,
  });

  // Fetch available imobiliarias (that don't have access yet)
  const { data: availableImobiliarias } = useQuery({
    queryKey: ['available-imobiliarias', imovelId, accesses],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imobiliarias')
        .select('id, nome_empresa')
        .order('nome_empresa');
      if (error) throw error;
      
      // Filter out those that already have access
      const existingIds = accesses?.map(a => a.imobiliaria_id) || [];
      return data?.filter(i => !existingIds.includes(i.id)) || [];
    },
    enabled: !!accesses,
  });

  // Grant access mutation
  const grantAccessMutation = useMutation({
    mutationFn: async ({ imobiliariaId, slug }: { imobiliariaId: string; slug: string }) => {
      const { error } = await supabase
        .from('imobiliaria_imovel_access')
        .insert({
          imovel_id: imovelId,
          imobiliaria_id: imobiliariaId,
          url_slug: slug,
          status: 'active',
          visitas: 0,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accesses', imovelId] });
      queryClient.invalidateQueries({ queryKey: ['available-imobiliarias'] });
      setSelectedImobiliaria('');
      setCustomSlug('');
      toast({ title: 'Acesso concedido!', description: 'A imobiliária agora tem acesso ao imóvel.' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  // Revoke access mutation
  const revokeAccessMutation = useMutation({
    mutationFn: async (accessId: string) => {
      const { error } = await supabase
        .from('imobiliaria_imovel_access')
        .update({ status: 'revoked' })
        .eq('id', accessId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accesses', imovelId] });
      toast({ title: 'Acesso revogado', description: 'O link foi desativado.' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const generateSlug = (imobiliariaName: string) => {
    const imovelSlug = imovel?.titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 30) || 'imovel';
    
    const imobSlug = imobiliariaName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 20);
    
    return `${imovelSlug}-${imobSlug}`;
  };

  const handleGrantAccess = () => {
    if (!selectedImobiliaria) {
      toast({ title: 'Selecione uma imobiliária', variant: 'destructive' });
      return;
    }

    const imobiliaria = availableImobiliarias?.find(i => i.id === selectedImobiliaria);
    const slug = customSlug.trim() || generateSlug(imobiliaria?.nome_empresa || 'parceiro');

    grantAccessMutation.mutate({ imobiliariaId: selectedImobiliaria, slug });
  };

  const copyLink = async (slug: string) => {
    const url = `${window.location.origin}/imovel/${slug}`;
    await navigator.clipboard.writeText(url);
    toast({ title: 'Link copiado!', description: 'O link foi copiado para a área de transferência.' });
  };

  if (imovelLoading || accessesLoading) {
    return (
      <DashboardLayout title="Carregando...">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!imovel) {
    return (
      <DashboardLayout title="Imóvel não encontrado">
        <Card className="flex h-64 items-center justify-center">
          <CardContent>
            <p className="text-muted-foreground">O imóvel solicitado não foi encontrado.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const directLinkAccess = accesses?.find(a => a.status === 'active' && !a.imobiliaria_id);
  const activeAccesses = accesses?.filter(a => a.status === 'active' && a.imobiliaria_id) || [];
  const revokedAccesses = accesses?.filter(a => a.status === 'revoked') || [];

  const generateDirectSlug = () => {
    return (imovel?.titulo || 'imovel')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 40) + '-direto';
  };

  const handleGenerateDirectLink = async () => {
    if (!imovelId) return;
    const slug = generateDirectSlug();
    const { error } = await supabase
      .from('imobiliaria_imovel_access')
      .insert({
        imovel_id: imovelId,
        imobiliaria_id: null,
        url_slug: slug,
        status: 'active',
        visitas: 0,
      });
    if (error) {
      // Try with random suffix if slug exists
      const slugRetry = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
      const { error: retryError } = await supabase
        .from('imobiliaria_imovel_access')
        .insert({
          imovel_id: imovelId,
          imobiliaria_id: null,
          url_slug: slugRetry,
          status: 'active',
          visitas: 0,
        });
      if (retryError) {
        toast({ title: 'Erro', description: retryError.message, variant: 'destructive' });
        return;
      }
    }
    queryClient.invalidateQueries({ queryKey: ['accesses', imovelId] });
    toast({ title: 'Link direto gerado!', description: 'O link da construtora foi criado com sucesso.' });
  };

  return (
    <DashboardLayout title="Gerenciar Acessos">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard/construtora')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h2 className="text-xl font-semibold">{imovel.titulo}</h2>
        <p className="text-muted-foreground">
          Gerencie as imobiliárias que têm acesso a este imóvel
        </p>
      </div>

      {/* Grant New Access */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Conceder Novo Acesso
          </CardTitle>
          <CardDescription>
            Selecione uma imobiliária para gerar um link white-label exclusivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedImobiliaria} onValueChange={setSelectedImobiliaria}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione uma imobiliária" />
              </SelectTrigger>
              <SelectContent>
                {availableImobiliarias?.length ? (
                  availableImobiliarias.map(i => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.nome_empresa}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Nenhuma imobiliária disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Input
              placeholder="Slug personalizado (opcional)"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="flex-1"
            />
            <Button 
              onClick={handleGrantAccess}
              disabled={!selectedImobiliaria || grantAccessMutation.isPending}
            >
              {grantAccessMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Conceder Acesso
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Direct Link (Construtora) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Link Direto (Construtora)
          </CardTitle>
          <CardDescription>
            Link público com branding da sua construtora, sem imobiliária intermediária
          </CardDescription>
        </CardHeader>
        <CardContent>
          {directLinkAccess ? (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {directLinkAccess.url_slug}
                </code>
                <span className="text-sm text-muted-foreground">
                  {directLinkAccess.visitas || 0} visitas
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyLink(directLinkAccess.url_slug)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`/imovel/${directLinkAccess.url_slug}`, '_blank')}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleGenerateDirectLink} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Gerar Link Direto
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Active Accesses */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Acessos Ativos ({activeAccesses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAccesses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma imobiliária tem acesso a este imóvel ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imobiliária</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Concedido em</TableHead>
                  <TableHead className="text-center">Visitas</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeAccesses.map((access) => (
                  <TableRow key={access.id}>
                    <TableCell className="font-medium">
                      {access.imobiliarias?.nome_empresa || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {access.url_slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      {format(new Date(access.acesso_concedido_em), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="flex items-center justify-center gap-1">
                        <Eye className="h-3 w-3" /> {access.visitas || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="flex items-center justify-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {leadCounts?.[access.id] || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyLink(access.url_slug)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(`/imovel/${access.url_slug}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revogar acesso?</AlertDialogTitle>
                              <AlertDialogDescription>
                                O link será desativado e a imobiliária "{access.imobiliarias?.nome_empresa}" não poderá mais compartilhar este imóvel.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => revokeAccessMutation.mutate(access.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Revogar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Revoked Accesses */}
      {revokedAccesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Acessos Revogados ({revokedAccesses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {revokedAccesses.map((access) => (
                <div key={access.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">
                    {access.imobiliarias?.nome_empresa || 'N/A'}
                  </span>
                  <Badge variant="outline" className="text-muted-foreground">
                    Revogado
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
