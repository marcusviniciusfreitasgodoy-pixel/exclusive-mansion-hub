import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Database, Users, Building2, Home, FileText, Eye } from 'lucide-react';

interface TableStatus {
  name: string;
  exists: boolean;
  count: number | null;
  error?: string;
}

export default function TesteConexao() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [isTestingInsert, setIsTestingInsert] = useState(false);
  const [insertResult, setInsertResult] = useState<string | null>(null);
  const [construtoras, setConstrutoras] = useState<any[]>([]);
  const [isLoadingConstrutoras, setIsLoadingConstrutoras] = useState(false);

  useEffect(() => {
    checkConnection();
    checkTables();
  }, []);

  const checkConnection = async () => {
    console.log('🔄 Testando conexão com Supabase...');
    try {
      const { data, error } = await supabase.from('user_roles').select('count').limit(1);
      
      if (error && !error.message.includes('permission denied')) {
        console.error('❌ Erro de conexão:', error);
        setConnectionStatus('error');
        setConnectionError(error.message);
      } else {
        console.log('✅ Conexão com Supabase estabelecida!');
        setConnectionStatus('connected');
      }
    } catch (err) {
      console.error('❌ Erro de conexão:', err);
      setConnectionStatus('error');
      setConnectionError(String(err));
    }
  };

  const checkTables = async () => {
    const tablesToCheck = ['construtoras', 'imobiliarias', 'imoveis', 'leads', 'user_roles', 'pageviews', 'imobiliaria_imovel_access'] as const;
    const results: TableStatus[] = [];

    for (const tableName of tablesToCheck) {
      console.log(`🔄 Verificando tabela: ${tableName}...`);
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`⚠️ Tabela ${tableName}: ${error.message}`);
          results.push({
            name: tableName,
            exists: !error.message.includes('does not exist'),
            count: null,
            error: error.message
          });
        } else {
          console.log(`✅ Tabela ${tableName}: ${count} registros`);
          results.push({
            name: tableName,
            exists: true,
            count: count
          });
        }
      } catch (err) {
        console.error(`❌ Erro ao verificar ${tableName}:`, err);
        results.push({
          name: tableName,
          exists: false,
          count: null,
          error: String(err)
        });
      }
    }

    setTables(results);
  };

  const testInsert = async () => {
    setIsTestingInsert(true);
    setInsertResult(null);
    console.log('🔄 Testando inserção na tabela construtoras...');

    try {
      // First, we need to be authenticated to insert
      // For testing, let's check auth status
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const message = '⚠️ Você precisa estar logado para testar inserção. As políticas RLS exigem autenticação.';
        console.log(message);
        setInsertResult(message);
        setIsTestingInsert(false);
        return;
      }

      const testData = {
        user_id: user.id,
        nome_empresa: `Construtora Teste ${Date.now()}`,
        cnpj: `${Math.random().toString().slice(2, 16)}`,
      };

      console.log('📤 Dados a inserir:', testData);

      const { data, error } = await supabase
        .from('construtoras')
        .insert(testData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro na inserção:', error);
        setInsertResult(`❌ Erro: ${error.message}`);
      } else {
        console.log('✅ Inserção bem-sucedida:', data);
        setInsertResult(`✅ Construtora criada com sucesso! ID: ${data.id}`);
        // Refresh the tables count
        checkTables();
      }
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      setInsertResult(`❌ Erro inesperado: ${String(err)}`);
    } finally {
      setIsTestingInsert(false);
    }
  };

  const listConstrutoras = async () => {
    setIsLoadingConstrutoras(true);
    console.log('🔄 Listando construtoras...');

    try {
      const { data, error } = await supabase
        .from('construtoras')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Erro ao listar:', error);
        setConstrutoras([]);
      } else {
        console.log('✅ Construtoras encontradas:', data);
        setConstrutoras(data || []);
      }
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
    } finally {
      setIsLoadingConstrutoras(false);
    }
  };

  const getTableIcon = (name: string) => {
    switch (name) {
      case 'construtoras': return Building2;
      case 'imobiliarias': return Users;
      case 'imoveis': return Home;
      case 'leads': return FileText;
      case 'pageviews': return Eye;
      default: return Database;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Teste de Conexão</h1>
          <p className="mt-2 text-muted-foreground">Validação da estrutura do banco de dados</p>
          <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">
            ← Voltar ao site
          </Link>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Status da Conexão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {connectionStatus === 'loading' && (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span>Verificando conexão...</span>
                </>
              )}
              {connectionStatus === 'connected' && (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-green-600 font-medium">Conectado ao Supabase</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <XCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <span className="text-red-600 font-medium">Erro de conexão</span>
                    {connectionError && (
                      <p className="text-sm text-red-500 mt-1">{connectionError}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tables Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status das Tabelas</CardTitle>
            <CardDescription>Verificação das tabelas principais do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {tables.map((table) => {
                const Icon = getTableIcon(table.name);
                return (
                  <div
                    key={table.name}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      table.exists ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${table.exists ? 'text-green-600' : 'text-red-600'}`} />
                      <span className="font-medium">{table.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {table.exists ? (
                        <>
                          <span className="text-sm text-muted-foreground">
                            {table.count !== null ? `${table.count} registros` : 'OK'}
                          </span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-red-500">Não encontrada</span>
                          <XCircle className="h-4 w-4 text-red-500" />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <Button onClick={checkTables} variant="outline" className="mt-4">
              Recarregar Status
            </Button>
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Testes de Operações</CardTitle>
            <CardDescription>Teste inserção e listagem de dados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button onClick={testInsert} disabled={isTestingInsert}>
                {isTestingInsert ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inserindo...
                  </>
                ) : (
                  'Testar Inserção'
                )}
              </Button>
              <Button onClick={listConstrutoras} variant="outline" disabled={isLoadingConstrutoras}>
                {isLoadingConstrutoras ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Listar Construtoras'
                )}
              </Button>
            </div>

            {insertResult && (
              <div className={`rounded-lg p-3 ${
                insertResult.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
              }`}>
                {insertResult}
              </div>
            )}

            {construtoras.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Construtoras ({construtoras.length}):</h4>
                <div className="space-y-2">
                  {construtoras.map((c) => (
                    <div key={c.id} className="rounded border p-3 bg-white">
                      <p className="font-medium">{c.nome_empresa}</p>
                      <p className="text-sm text-muted-foreground">CNPJ: {c.cnpj}</p>
                      <p className="text-xs text-muted-foreground">ID: {c.id}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Links Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link to="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/auth/register/construtora">
                <Button variant="outline">Cadastro Construtora</Button>
              </Link>
              <Link to="/auth/register/imobiliaria">
                <Button variant="outline">Cadastro Imobiliária</Button>
              </Link>
              <Link to="/dashboard/construtora">
                <Button variant="outline">Dashboard Construtora</Button>
              </Link>
              <Link to="/dashboard/imobiliaria">
                <Button variant="outline">Dashboard Imobiliária</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Structure Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Estrutura Implementada</CardTitle>
            <CardDescription>Resumo dos arquivos e componentes criados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-primary mb-2">📁 Autenticação</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>src/contexts/AuthContext.tsx - Contexto global de auth</li>
                  <li>src/components/auth/ProtectedRoute.tsx - Proteção de rotas</li>
                  <li>src/pages/auth/Login.tsx - Página de login</li>
                  <li>src/pages/auth/RegisterConstrutora.tsx - Cadastro construtora</li>
                  <li>src/pages/auth/RegisterImobiliaria.tsx - Cadastro imobiliária</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">📁 Dashboards</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>src/pages/dashboard/construtora/index.tsx</li>
                  <li>src/pages/dashboard/imobiliaria/index.tsx</li>
                  <li>src/components/dashboard/DashboardLayout.tsx</li>
                  <li>src/components/dashboard/DashboardSidebar.tsx</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">📁 Página Dinâmica White-Label</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>src/pages/imovel/PropertyPage.tsx - Página /imovel/:slug</li>
                  <li>src/hooks/usePropertyPage.ts - Hook de dados</li>
                  <li>src/components/property/DynamicHero.tsx</li>
                  <li>src/components/property/DynamicPropertyDetails.tsx</li>
                  <li>src/components/property/DynamicDescription.tsx</li>
                  <li>src/components/property/DynamicGallery.tsx</li>
                  <li>src/components/property/DynamicVideoSection.tsx</li>
                  <li>src/components/property/DynamicContact.tsx</li>
                  <li>src/components/property/DynamicNavbar.tsx</li>
                  <li>src/components/property/DynamicFooter.tsx</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">📁 Banco de Dados (Supabase)</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>user_roles - Papéis dos usuários</li>
                  <li>construtoras - Dados das construtoras</li>
                  <li>imobiliarias - Dados das imobiliárias</li>
                  <li>imoveis - Imóveis cadastrados</li>
                  <li>imobiliaria_imovel_access - Acesso white-label</li>
                  <li>leads - Leads capturados</li>
                  <li>pageviews - Tracking de visitas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
