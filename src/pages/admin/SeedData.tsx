import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, Database, Building2, Home, Users, Link } from 'lucide-react';

interface SeedResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
}

export default function SeedData() {
  const { user, role, construtora } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [results, setResults] = useState<SeedResult[]>([]);
  const [generatedLinks, setGeneratedLinks] = useState<string[]>([]);

  const addResult = (result: SeedResult) => {
    setResults(prev => [...prev, result]);
    console.log(`[Seed] ${result.success ? '✅' : '❌'} ${result.step}: ${result.message}`);
  };

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const seedData = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para criar dados de teste.',
        variant: 'destructive',
      });
      return;
    }

    setIsSeeding(true);
    setResults([]);
    setGeneratedLinks([]);

    try {
      let construtoraId = construtora?.id;
      let imobiliariaId: string | null = null;

      // Step 1: Check/Create Construtora
      if (!construtoraId) {
        addResult({
          step: 'Construtora',
          success: false,
          message: 'Você precisa estar logado como construtora para criar dados de teste.',
        });
        setIsSeeding(false);
        return;
      }

      addResult({
        step: 'Construtora',
        success: true,
        message: `Usando construtora existente: ${construtora?.nome_empresa}`,
        data: { id: construtoraId },
      });

      // Step 2: Create Test Imobiliaria
      const { data: existingImob } = await supabase
        .from('imobiliarias')
        .select('id')
        .eq('nome_empresa', 'Godoy Prime Realty')
        .maybeSingle();

      if (existingImob) {
        imobiliariaId = existingImob.id;
        addResult({
          step: 'Imobiliária',
          success: true,
          message: 'Imobiliária de teste já existe: Godoy Prime Realty',
          data: { id: imobiliariaId },
        });
      } else {
        // Create a test user for imobiliaria (we'll use the service role later)
        // For now, we'll create the imobiliaria with a placeholder user_id
        const { data: newImob, error: imobError } = await supabase
          .from('imobiliarias')
          .insert({
            user_id: user.id, // Temporarily use current user
            nome_empresa: 'Godoy Prime Realty',
            creci: 'CRECI-RJ 12345',
            telefone: '(21) 99999-8888',
            email_contato: 'contato@godoyprime.com.br',
            cor_primaria: '#1e3a5f',
            logo_url: null,
          })
          .select()
          .single();

        if (imobError) {
          addResult({
            step: 'Imobiliária',
            success: false,
            message: `Erro ao criar imobiliária: ${imobError.message}`,
          });
        } else {
          imobiliariaId = newImob.id;
          addResult({
            step: 'Imobiliária',
            success: true,
            message: 'Imobiliária criada: Godoy Prime Realty',
            data: { id: imobiliariaId },
          });
        }
      }

      // Step 3: Create Test Properties
      const imoveisData = [
        {
          titulo: 'Cobertura Duplex Frente-Mar',
          endereco: 'Av. Lúcio Costa, 2360',
          bairro: 'Barra da Tijuca',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          valor: 12000000,
          condominio: 8500,
          iptu: 12000,
          area_total: 1250,
          area_privativa: 980,
          suites: 5,
          banheiros: 7,
          vagas: 5,
          status: 'ativo' as const,
          descricao: `Uma obra-prima arquitetônica à beira-mar na prestigiada Avenida Lúcio Costa. Esta cobertura duplex exclusiva oferece 980m² de área privativa com acabamentos de altíssimo padrão, incluindo mármore italiano, madeira de demolição e esquadrias de alumínio alemão.

O living panorâmico de pé-direito duplo oferece vista de 180° para o mar, enquanto a varanda gourmet com churrasqueira e piscina privativa cria o cenário perfeito para entretenimento.

A suíte master conta com closet de 45m², banheiro spa com banheira de hidromassagem e vista direta para o oceano. Quatro suítes adicionais, todas com varandas, garantem conforto para toda a família.`,
          diferenciais: JSON.stringify([
            'Vista mar 180° panorâmica',
            'Piscina privativa com borda infinita',
            'Elevador privativo',
            'Home theater com isolamento acústico',
            'Adega climatizada para 500 garrafas',
            'Automação residencial completa',
            'Gerador próprio',
            '5 vagas de garagem cobertas',
          ]),
          memorial_descritivo: 'Acabamentos: Mármore Carrara, Porcelanato italiano, Madeira de demolição, Esquadrias em alumínio alemão com vidros duplos antirruído.',
          imagens: JSON.stringify([
            { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', alt: 'Fachada principal' },
            { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', alt: 'Living panorâmico' },
            { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200', alt: 'Varanda gourmet' },
            { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', alt: 'Suíte master' },
            { url: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200', alt: 'Piscina' },
          ]),
          videos: JSON.stringify([
            { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tipo: 'youtube' },
          ]),
          tour_360_url: null,
          slug: 'cobertura-lucio-costa-godoyprime',
        },
        {
          titulo: 'Penthouse Vista Mar - Alto Padrão',
          endereco: 'Av. das Américas, 5000',
          bairro: 'Barra da Tijuca',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          valor: 8500000,
          condominio: 6500,
          iptu: 8000,
          area_total: 850,
          area_privativa: 720,
          suites: 4,
          banheiros: 5,
          vagas: 4,
          status: 'ativo' as const,
          descricao: `Penthouse de luxo com acabamentos premium e vista espetacular para o mar. Amplo living integrado à varanda gourmet, ideal para receber convidados com estilo e sofisticação.

Localização privilegiada próxima aos melhores restaurantes, shoppings e praias da Barra da Tijuca.`,
          diferenciais: JSON.stringify([
            'Vista mar frontal',
            'Varanda gourmet ampla',
            'Lareira ecológica',
            'Closet planejado',
            'Ar-condicionado central',
            '4 vagas de garagem',
          ]),
          memorial_descritivo: 'Piso em porcelanato polido, bancadas em granito preto, armários em MDF premium.',
          imagens: JSON.stringify([
            { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200', alt: 'Fachada' },
            { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200', alt: 'Living' },
            { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200', alt: 'Cozinha' },
          ]),
          videos: JSON.stringify([]),
          tour_360_url: null,
          slug: 'penthouse-barra-godoyprime',
        },
        {
          titulo: 'Apartamento 4 Suítes - Barra Exclusive',
          endereco: 'Av. Lúcio Costa, 3000',
          bairro: 'Barra da Tijuca',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          valor: 4200000,
          condominio: 3800,
          iptu: 4500,
          area_total: 420,
          area_privativa: 380,
          suites: 4,
          banheiros: 5,
          vagas: 3,
          status: 'ativo' as const,
          descricao: `Apartamento de alto padrão com 4 suítes amplas e bem iluminadas. Living integrado com varanda, vista parcial para o mar e acabamentos de primeira linha.

Condomínio com infraestrutura completa de lazer e segurança 24 horas.`,
          diferenciais: JSON.stringify([
            'Vista parcial mar',
            '4 suítes com ar-condicionado',
            'Varanda ampla',
            'Depósito privativo',
            'Condomínio com piscina',
          ]),
          memorial_descritivo: 'Acabamentos em porcelanato, armários planejados, aquecimento a gás.',
          imagens: JSON.stringify([
            { url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200', alt: 'Sala' },
            { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200', alt: 'Cozinha' },
          ]),
          videos: JSON.stringify([]),
          tour_360_url: null,
          slug: 'apto-luxury-barra-godoyprime',
        },
      ];

      const createdImoveis: { id: string; titulo: string; slug: string }[] = [];

      for (const imovelData of imoveisData) {
        const { slug, ...dataToInsert } = imovelData;
        
        // Check if imovel already exists
        const { data: existingImovel } = await supabase
          .from('imoveis')
          .select('id, titulo')
          .eq('construtora_id', construtoraId)
          .eq('titulo', imovelData.titulo)
          .maybeSingle();

        if (existingImovel) {
          createdImoveis.push({ id: existingImovel.id, titulo: imovelData.titulo, slug });
          addResult({
            step: `Imóvel: ${imovelData.titulo}`,
            success: true,
            message: 'Imóvel já existe',
            data: { id: existingImovel.id },
          });
          continue;
        }

        const { data: newImovel, error: imovelError } = await supabase
          .from('imoveis')
          .insert({
            construtora_id: construtoraId,
            ...dataToInsert,
          })
          .select()
          .single();

        if (imovelError) {
          addResult({
            step: `Imóvel: ${imovelData.titulo}`,
            success: false,
            message: `Erro: ${imovelError.message}`,
          });
        } else {
          createdImoveis.push({ id: newImovel.id, titulo: imovelData.titulo, slug });
          addResult({
            step: `Imóvel: ${imovelData.titulo}`,
            success: true,
            message: 'Imóvel criado com sucesso',
            data: { id: newImovel.id },
          });
        }
      }

      // Step 4: Create White Label Access for each property
      if (imobiliariaId && createdImoveis.length > 0) {
        for (const imovel of createdImoveis) {
          const { data: existingAccess } = await supabase
            .from('imobiliaria_imovel_access')
            .select('id, url_slug')
            .eq('imobiliaria_id', imobiliariaId)
            .eq('imovel_id', imovel.id)
            .maybeSingle();

          if (existingAccess) {
            setGeneratedLinks(prev => [...prev, `/imovel/${existingAccess.url_slug}`]);
            addResult({
              step: `Acesso: ${imovel.titulo}`,
              success: true,
              message: `Acesso já existe: ${existingAccess.url_slug}`,
            });
            continue;
          }

          const { data: newAccess, error: accessError } = await supabase
            .from('imobiliaria_imovel_access')
            .insert({
              imobiliaria_id: imobiliariaId,
              imovel_id: imovel.id,
              url_slug: imovel.slug,
              status: 'active',
              visitas: 0,
            })
            .select()
            .single();

          if (accessError) {
            addResult({
              step: `Acesso: ${imovel.titulo}`,
              success: false,
              message: `Erro: ${accessError.message}`,
            });
          } else {
            setGeneratedLinks(prev => [...prev, `/imovel/${newAccess.url_slug}`]);
            addResult({
              step: `Acesso: ${imovel.titulo}`,
              success: true,
              message: `Link criado: /imovel/${newAccess.url_slug}`,
            });
          }
        }
      }

      // Step 5: Create Test Leads
      const leadsData = [
        { nome: 'Carlos Silva', email: 'carlos@email.com', telefone: '(21) 99888-7777', mensagem: 'Gostaria de agendar uma visita para ver a cobertura.', origem: 'formulario' as const },
        { nome: 'Ana Martins', email: 'ana.martins@empresa.com.br', telefone: '(21) 98765-4321', mensagem: 'Tenho interesse no financiamento. Qual o valor de entrada?', origem: 'whatsapp' as const },
        { nome: 'Roberto Campos', email: 'roberto@gmail.com', telefone: null, mensagem: 'Vi o imóvel pelo site e achei incrível!', origem: 'formulario' as const },
        { nome: 'Mariana Costa', email: 'mariana.costa@hotmail.com', telefone: '(21) 97654-3210', mensagem: 'Aceita permuta por imóvel de menor valor?', origem: 'chat_ia' as const },
        { nome: 'Fernando Oliveira', email: 'fernando.oliveira@yahoo.com', telefone: '(21) 96543-2109', mensagem: 'Qual a disponibilidade para visita este fim de semana?', origem: 'formulario' as const },
      ];

      let leadCount = 0;
      for (let i = 0; i < leadsData.length; i++) {
        const lead = leadsData[i];
        const imovelIndex = i % createdImoveis.length;
        const imovel = createdImoveis[imovelIndex];

        if (!imovel) continue;

        const { error: leadError } = await supabase
          .from('leads')
          .insert({
            imovel_id: imovel.id,
            imobiliaria_id: imobiliariaId,
            nome: lead.nome,
            email: lead.email,
            telefone: lead.telefone,
            mensagem: lead.mensagem,
            origem: lead.origem,
            status: 'novo',
          });

        if (!leadError) {
          leadCount++;
        }
      }

      addResult({
        step: 'Leads',
        success: leadCount > 0,
        message: `${leadCount} leads de teste criados`,
      });

      toast({
        title: 'Dados de teste criados!',
        description: `${createdImoveis.length} imóveis e ${leadCount} leads foram criados com sucesso.`,
      });

    } catch (error: any) {
      console.error('[Seed] Erro:', error);
      addResult({
        step: 'Erro Geral',
        success: false,
        message: error.message || 'Erro desconhecido',
      });
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao criar os dados de teste.',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Você precisa estar logado para acessar esta página.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth/login')} className="w-full">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (role !== 'construtora' && role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Apenas construtoras podem criar dados de teste.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard/imobiliaria')} className="w-full">
              Ir para Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">🌱 Dados de Teste</h1>
          <p className="text-muted-foreground">
            Crie dados de exemplo para testar o sistema completo
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Seed Database
            </CardTitle>
            <CardDescription>
              Esta ação irá criar: 1 imobiliária de teste, 3 imóveis completos, acessos white-label e 5 leads de exemplo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">O que será criado:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  1 Imobiliária: Godoy Prime Realty
                </li>
                <li className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  3 Imóveis: Cobertura Duplex, Penthouse, Apartamento
                </li>
                <li className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  3 Links White-Label para cada imóvel
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  5 Leads de teste distribuídos
                </li>
              </ul>
            </div>

            <Button 
              onClick={seedData} 
              disabled={isSeeding}
              className="w-full"
              size="lg"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando dados...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Criar Dados de Teste
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado da Execução</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      result.success ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-medium">{result.step}:</span>{' '}
                      <span className="text-muted-foreground">{result.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {generatedLinks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>🔗 Links Gerados</CardTitle>
              <CardDescription>
                Clique para visualizar as páginas públicas dos imóveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {generatedLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Link className="h-4 w-4 text-primary" />
                    <span className="text-primary font-mono">{link}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate('/dashboard/construtora')}>
            Ir para Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/teste-conexao')}>
            Testar Conexão
          </Button>
        </div>
      </div>
    </div>
  );
}
