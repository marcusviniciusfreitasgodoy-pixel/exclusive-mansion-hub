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
import NotFound from "./pages/NotFound";

// Eager load auth pages (critical path)
import Login from "./pages/auth/Login";
import RegisterConstrutora from "./pages/auth/RegisterConstrutora";
import RegisterImobiliaria from "./pages/auth/RegisterImobiliaria";

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
const AgendamentosImobiliaria = lazy(() => import("./pages/dashboard/imobiliaria/Agendamentos"));
const AnalyticsImobiliaria = lazy(() => import("./pages/dashboard/imobiliaria/Analytics"));
const FeedbacksImobiliaria = lazy(() => import("./pages/dashboard/imobiliaria/Feedbacks"));
const ConfiguracoesImobiliaria = lazy(() => import("./pages/dashboard/imobiliaria/Configuracoes"));
const ConfiguracoesFormularios = lazy(() => import("./pages/dashboard/imobiliaria/ConfiguracoesFormularios"));
const EditarFormulario = lazy(() => import("./pages/dashboard/imobiliaria/EditarFormulario"));
const PipelineImobiliaria = lazy(() => import("./pages/dashboard/imobiliaria/Pipeline"));
const IntegracoesImobiliariaPage = lazy(() => import("./pages/dashboard/imobiliaria/Integracoes"));
const MinhasMidias = lazy(() => import("./pages/dashboard/imobiliaria/MinhasMidias"));

// Lazy load public pages
const PropertyPage = lazy(() => import("./pages/imovel/PropertyPage"));
const FeedbackClientePublico = lazy(() => import("./pages/feedback/FeedbackClientePublico"));
const TemplatesShowcase = lazy(() => import("./pages/TemplatesShowcase"));

// Lazy load admin/utility pages
const TesteConexao = lazy(() => import("./pages/TesteConexao"));
const SeedData = lazy(() => import("./pages/admin/SeedData"));
const Diagnostico = lazy(() => import("./pages/admin/Diagnostico"));
const BaseConhecimento = lazy(() => import("./pages/admin/BaseConhecimento"));

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

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
              
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
                <LazyRoute><Diagnostico /></LazyRoute>
              } />
              <Route path="/admin/base-conhecimento" element={
                <LazyRoute><BaseConhecimento /></LazyRoute>
              } />
              
              {/* Auth Routes (eager loaded for fast initial load) */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/register/construtora" element={<RegisterConstrutora />} />
              <Route path="/auth/register/imobiliaria" element={<RegisterImobiliaria />} />
              
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
              
              {/* Feedback Público (sem autenticação) */}
              <Route path="/feedback-visita/:token" element={
                <LazyRoute><FeedbackClientePublico /></LazyRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
