import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoadingSpinner } from "@/components/ui/skeleton-loaders";
import { useDomainResolver } from "@/hooks/useDomainResolver";
import NotFound from "./pages/NotFound";

// Eager load auth pages (critical path)
import Login from "./pages/auth/Login";
import RegisterConstrutora from "./pages/auth/RegisterConstrutora";
import RegisterImobiliaria from "./pages/auth/RegisterImobiliaria";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Lazy load dashboard pages (code splitting)
const ConstrutoraDashboard = lazy(() => import("./pages/dashboard/construtora"));
const NovoImovel = lazy(() => import("./pages/dashboard/construtora/NovoImovel"));
const EditarImovel = lazy(() => import("./pages/dashboard/construtora/EditarImovel"));
const LeadsPage = lazy(() => import("./pages/dashboard/construtora/Leads"));
const AnalyticsPage = lazy(() => import("./pages/dashboard/construtora/Analytics"));
const GerenciarAcessos = lazy(() => import("./pages/dashboard/construtora/GerenciarAcessos"));
const AgendamentosConstrutora = lazy(() => import("./pages/dashboard/construtora/Agendamentos"));
const FeedbacksConstrutora = lazy(() => import("./pages/dashboard/construtora/Feedbacks"));
const ConfiguracoesConstrutora = lazy(() => import("./pages/dashboard/construtora/Configuracoes"));
const PipelineConstrutora = lazy(() => import("./pages/dashboard/construtora/Pipeline"));
const IntegracoesConstrutoraPage = lazy(() => import("./pages/dashboard/construtora/Integracoes"));
const AprovarMidias = lazy(() => import("./pages/dashboard/construtora/AprovarMidias"));
const ImobiliariasConstrutora = lazy(() => import("./pages/dashboard/construtora/Imobiliarias"));

const ImobiliariaDashboard = lazy(() => import("./pages/dashboard/imobiliaria"));
const FeedbackCorretorPage = lazy(() => import("./pages/dashboard/imobiliaria/FeedbackCorretor"));
const LeadsImobiliaria = lazy(() => import("./pages/dashboard/imobiliaria/Leads"));
const AgendamentosImobiliaria = lazy(() => import("./pages/dashboard/imobiliaria/Agendamentos"));
const AnalyticsImobiliaria = lazy(() => import("./pages/dashboard/imobiliaria/Analytics"));
const FeedbacksImobiliaria = lazy(() => import("./pages/dashboard/imobiliaria/Feedbacks"));
const ConfiguracoesImobiliaria = lazy(() => import("./pages/dashboard/imobiliaria/Configuracoes"));
const ConfiguracoesFormularios = lazy(() => import("./pages/dashboard/imobiliaria/ConfiguracoesFormularios"));
const CorretoresImobiliaria = lazy(() => import("./pages/dashboard/imobiliaria/Corretores"));
const EditarFormulario = lazy(() => import("./pages/dashboard/imobiliaria/EditarFormulario"));
const PipelineImobiliaria = lazy(() => import("./pages/dashboard/imobiliaria/Pipeline"));
const IntegracoesImobiliariaPage = lazy(() => import("./pages/dashboard/imobiliaria/Integracoes"));
const MinhasMidias = lazy(() => import("./pages/dashboard/imobiliaria/MinhasMidias"));
const MeusLinks = lazy(() => import("./pages/dashboard/imobiliaria/MeusLinks"));
const ConfigurarAgenda = lazy(() => import("./pages/dashboard/imobiliaria/ConfigurarAgenda"));
const FichaVisitaPage = lazy(() => import("./pages/dashboard/imobiliaria/FichaVisitaPage"));

// Lazy load demo pages
const DemoLanding = lazy(() => import("./pages/demo/DemoLanding"));
const DemoConstrutora = lazy(() => import("./pages/demo/DemoConstrutora"));
const DemoImobiliaria = lazy(() => import("./pages/demo/DemoImobiliaria"));

// Lazy load public pages
const PropertyPage = lazy(() => import("./pages/imovel/PropertyPage"));
const PropostaPage = lazy(() => import("./pages/proposta/PropostaPage"));
const FeedbackClientePublico = lazy(() => import("./pages/feedback/FeedbackClientePublico"));
const TemplatesShowcase = lazy(() => import("./pages/TemplatesShowcase"));
const EmpreendimentosHome = lazy(() => import("./pages/empreendimentos/Home"));
const EmpreendimentoDetalhe = lazy(() => import("./pages/empreendimentos/EmpreendimentoDetalhe"));
const Apresentacao = lazy(() => import("./pages/Apresentacao"));
const Manual = lazy(() => import("./pages/Manual"));
const AssinaturaVisita = lazy(() => import("./pages/AssinaturaVisita"));

// Lazy load admin/utility pages
const TesteConexao = lazy(() => import("./pages/TesteConexao"));
const SeedData = lazy(() => import("./pages/admin/SeedData"));
const Diagnostico = lazy(() => import("./pages/admin/Diagnostico"));
const BaseConhecimento = lazy(() => import("./pages/admin/BaseConhecimento"));
const GerenciarUsuarios = lazy(() => import("./pages/admin/GerenciarUsuarios"));

// Lazy load domain-resolved pages
const CustomDomainPage = lazy(() => import("./pages/CustomDomainPage"));

// Configure React Query with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Wrapper component for lazy routes with Suspense
function LazyRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      {children}
    </Suspense>
  );
}

// Domain-aware app shell
function AppRoutes() {
  const { isCustomDomain, resolution, isLoading } = useDomainResolver();

  if (isLoading) return <PageLoadingSpinner />;

  if (isCustomDomain && resolution) {
    return (
      <LazyRoute>
        <CustomDomainPage entityType={resolution.entityType} entityId={resolution.entityId} />
      </LazyRoute>
    );
  }

  return <MainRoutes />;
}

function MainRoutes() {
  return (
    <Routes>
            <Route path="/" element={<Login />} />
              
              {/* Demo Routes */}
              <Route path="/demo" element={
                <LazyRoute><DemoLanding /></LazyRoute>
              } />
              <Route path="/demo/construtora/*" element={
                <LazyRoute><DemoConstrutora /></LazyRoute>
              } />
              <Route path="/demo/imobiliaria/*" element={
                <LazyRoute><DemoImobiliaria /></LazyRoute>
              } />

              {/* Empreendimentos Routes */}
              <Route path="/empreendimentos" element={
                <LazyRoute><EmpreendimentosHome /></LazyRoute>
              } />
              <Route path="/empreendimento/:slug" element={
                <LazyRoute><EmpreendimentoDetalhe /></LazyRoute>
              } />


              {/* Apresentação Comercial - Public */}
              <Route path="/apresentacao" element={
                <LazyRoute><Apresentacao /></LazyRoute>
              } />
              <Route path="/manual" element={
                <ProtectedRoute allowedRoles={['construtora', 'imobiliaria']}>
                  <LazyRoute><Manual /></LazyRoute>
                </ProtectedRoute>
              } />
              
              {/* Templates Showcase - Public */}
              <Route path="/templates" element={
                <LazyRoute><TemplatesShowcase /></LazyRoute>
              } />
              
              {/* Test Routes */}
              <Route path="/teste-conexao" element={
                <LazyRoute><TesteConexao /></LazyRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/seed-data" element={
                <ProtectedRoute allowedRoles={['construtora', 'admin']}>
                  <LazyRoute><SeedData /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/admin/diagnostico" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <LazyRoute><Diagnostico /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/admin/base-conhecimento" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <LazyRoute><BaseConhecimento /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/admin/usuarios" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <LazyRoute><GerenciarUsuarios /></LazyRoute>
                </ProtectedRoute>
              } />
              
              {/* Auth Routes (eager loaded for fast initial load) */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/register/construtora" element={<RegisterConstrutora />} />
              <Route path="/auth/register/imobiliaria" element={<RegisterImobiliaria />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              
              {/* Dynamic Property Page (White Label) */}
              <Route path="/imovel/:slug" element={
                <LazyRoute><PropertyPage /></LazyRoute>
              } />
              
              {/* Construtora Dashboard */}
              <Route path="/dashboard/construtora" element={
                <ProtectedRoute allowedRoles={['construtora']}>
                  <LazyRoute><ConstrutoraDashboard /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/construtora/novo-imovel" element={
                <ProtectedRoute allowedRoles={['construtora']}>
                  <LazyRoute><NovoImovel /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/construtora/imovel/:id" element={
                <ProtectedRoute allowedRoles={['construtora']}>
                  <LazyRoute><EditarImovel /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/construtora/imovel/:id/acessos" element={
                <ProtectedRoute allowedRoles={['construtora']}>
                  <LazyRoute><GerenciarAcessos /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/construtora/leads" element={
                <ProtectedRoute allowedRoles={['construtora']}>
                  <LazyRoute><LeadsPage /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/construtora/analytics" element={
                <ProtectedRoute allowedRoles={['construtora']}>
                  <LazyRoute><AnalyticsPage /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/construtora/agendamentos" element={
                <ProtectedRoute allowedRoles={['construtora']}>
                  <LazyRoute><AgendamentosConstrutora /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/construtora/feedbacks" element={
                <ProtectedRoute allowedRoles={['construtora']}>
                  <LazyRoute><FeedbacksConstrutora /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/construtora/configuracoes" element={
                <ProtectedRoute allowedRoles={['construtora']}>
                  <LazyRoute><ConfiguracoesConstrutora /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/construtora/pipeline" element={
                <ProtectedRoute allowedRoles={['construtora']}>
                  <LazyRoute><PipelineConstrutora /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/construtora/integracoes" element={
                <ProtectedRoute allowedRoles={['construtora']}>
                  <LazyRoute><IntegracoesConstrutoraPage /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/construtora/aprovar-midias" element={
                <ProtectedRoute allowedRoles={['construtora']}>
                  <LazyRoute><AprovarMidias /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/construtora/imobiliarias" element={
                <ProtectedRoute allowedRoles={['construtora']}>
                  <LazyRoute><ImobiliariasConstrutora /></LazyRoute>
                </ProtectedRoute>
              } />
              
              {/* Imobiliaria Dashboard */}
              <Route path="/dashboard/imobiliaria" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><ImobiliariaDashboard /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/imobiliaria/agendamentos" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><AgendamentosImobiliaria /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/imobiliaria/feedbacks" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><FeedbacksImobiliaria /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/imobiliaria/visitas/:agendamentoId/feedback" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><FeedbackCorretorPage /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/imobiliaria/feedback/:feedbackId" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><FeedbackCorretorPage /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/imobiliaria/configuracoes" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><ConfiguracoesImobiliaria /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/imobiliaria/configuracoes/formularios" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><ConfiguracoesFormularios /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/imobiliaria/configuracoes/corretores" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><CorretoresImobiliaria /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/imobiliaria/configuracoes/formularios/:tipo/editar" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><EditarFormulario /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/imobiliaria/pipeline" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><PipelineImobiliaria /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/imobiliaria/analytics" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><AnalyticsImobiliaria /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/imobiliaria/integracoes" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><IntegracoesImobiliariaPage /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/imobiliaria/minhas-midias" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><MinhasMidias /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/imobiliaria/meus-links" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><MeusLinks /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/imobiliaria/leads" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><LeadsImobiliaria /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/imobiliaria/configurar-agenda" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><ConfigurarAgenda /></LazyRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/imobiliaria/ficha/:id" element={
                <ProtectedRoute allowedRoles={['imobiliaria']}>
                  <LazyRoute><FichaVisitaPage /></LazyRoute>
                </ProtectedRoute>
              } />
              
              {/* Feedback Público (sem autenticação) */}
              <Route path="/feedback-visita/:token" element={
                <LazyRoute><FeedbackClientePublico /></LazyRoute>
              } />
              
              {/* Assinatura Pública de Ficha de Visita (sem autenticação) */}
              <Route path="/assinatura/:codigo/:tipo" element={
                <LazyRoute><AssinaturaVisita /></LazyRoute>
              } />

              {/* Proposta Pública (sem autenticação) */}
              <Route path="/proposta/:token" element={
                <LazyRoute><PropostaPage /></LazyRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
