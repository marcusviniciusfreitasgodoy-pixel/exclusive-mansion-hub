import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link as LinkIcon, Copy, ExternalLink } from 'lucide-react';
import type { Imovel, ImobiliariaImovelAccess } from '@/types/database';

interface ImovelWithAccess extends Imovel {
  access?: ImobiliariaImovelAccess;
}

export default function ImobiliariaDashboard() {
  const { imobiliaria } = useAuth();
  const { toast } = useToast();
  const [selectedImovel, setSelectedImovel] = useState<Imovel | null>(null);
  const [slug, setSlug] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: imoveisWithAccess, isLoading, refetch } = useQuery({
    queryKey: ['imoveis-disponiveis', imobiliaria?.id],
    queryFn: async () => {
      if (!imobiliaria?.id) return [];
      
      // Get all access records for this imobiliaria
      const { data: accessData, error: accessError } = await supabase
        .from('imobiliaria_imovel_access')
        .select('*, imovel:imoveis(*)')
        .eq('imobiliaria_id', imobiliaria.id)
        .eq('status', 'active');

      if (accessError) throw accessError;
      
      return accessData?.map(access => ({
        ...access.imovel,
        access: {
          id: access.id,
          imobiliaria_id: access.imobiliaria_id,
          imovel_id: access.imovel_id,
          url_slug: access.url_slug,
          acesso_concedido_em: access.acesso_concedido_em,
          status: access.status,
          visitas: access.visitas,
        }
      })) as ImovelWithAccess[] || [];
    },
    enabled: !!imobiliaria?.id,
  });

  const generateSlug = (titulo: string) => {
    const baseSlug = titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const imobName = imobiliaria?.nome_empresa
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return `${baseSlug}-${imobName}`;
  };

  const handleOpenDialog = (imovel: Imovel) => {
    setSelectedImovel(imovel);
    setSlug(generateSlug(imovel.titulo));
  };

  const handleGenerateLink = async () => {
    if (!selectedImovel || !imobiliaria || !slug) return;
    
    setIsGenerating(true);
    try {
      const { error } = await supabase
        .from('imobiliaria_imovel_access')
        .update({ url_slug: slug })
        .eq('imovel_id', selectedImovel.id)
        .eq('imobiliaria_id', imobiliaria.id);

      if (error) {
        if (error.message.includes('duplicate')) {
          toast({
            title: 'Erro',
            description: 'Este slug já está em uso. Escolha outro.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: 'Link gerado!',
        description: 'Seu link personalizado foi criado com sucesso.',
      });
      
      setSelectedImovel(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o link.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Link copiado para a área de transferência.',
    });
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'A consultar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const baseUrl = window.location.origin;

  return (
    <DashboardLayout title="Imóveis Disponíveis">
      <p className="mb-6 text-muted-foreground">
        Imóveis que você tem autorização para divulgar
      </p>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : !imoveisWithAccess?.length ? (
        <Card className="flex h-64 flex-col items-center justify-center text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Você ainda não tem acesso a nenhum imóvel.
              <br />
              Aguarde uma construtora conceder acesso.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {imoveisWithAccess.map((imovel) => (
            <Card key={imovel.id} className="overflow-hidden">
              <div className="aspect-video bg-muted">
                {imovel.imagens?.[0]?.url ? (
                  <img
                    src={imovel.imagens[0].url}
                    alt={imovel.titulo}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Sem imagem
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <h3 className="font-semibold leading-tight line-clamp-2">
                  {imovel.titulo}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {imovel.bairro}, {imovel.cidade}
                </p>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(imovel.valor)}
                </p>
                {imovel.access?.url_slug && (
                  <p className="mt-2 text-xs text-muted-foreground truncate">
                    {baseUrl}/imovel/{imovel.access.url_slug}
                  </p>
                )}
              </CardContent>
              <CardFooter className="gap-2">
                {imovel.access?.url_slug ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyToClipboard(`${baseUrl}/imovel/${imovel.access!.url_slug}`)}
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copiar Link
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/imovel/${imovel.access.url_slug}`} target="_blank" rel="noopener">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        onClick={() => handleOpenDialog(imovel)}
                      >
                        <LinkIcon className="mr-1 h-3 w-3" />
                        Gerar Meu Link
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Gerar Link Personalizado</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Slug da URL</Label>
                          <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            placeholder="meu-imovel-personalizado"
                            className="mt-1"
                          />
                        </div>
                        <div className="rounded-md bg-muted p-3">
                          <p className="text-xs text-muted-foreground">Preview:</p>
                          <p className="text-sm font-medium break-all">
                            {baseUrl}/imovel/{slug}
                          </p>
                        </div>
                        <Button
                          onClick={handleGenerateLink}
                          disabled={isGenerating || !slug}
                          className="w-full"
                        >
                          {isGenerating ? 'Gerando...' : 'Gerar Link'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
