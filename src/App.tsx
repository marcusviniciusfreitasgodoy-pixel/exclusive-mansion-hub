import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import RegisterConstrutora from "./pages/auth/RegisterConstrutora";
import RegisterImobiliaria from "./pages/auth/RegisterImobiliaria";
import ConstrutoraDashboard from "./pages/dashboard/construtora";
import NovoImovel from "./pages/dashboard/construtora/NovoImovel";
import EditarImovel from "./pages/dashboard/construtora/EditarImovel";
import LeadsPage from "./pages/dashboard/construtora/Leads";
import AnalyticsPage from "./pages/dashboard/construtora/Analytics";
import GerenciarAcessos from "./pages/dashboard/construtora/GerenciarAcessos";
import ImobiliariaDashboard from "./pages/dashboard/imobiliaria";
import FeedbackCorretorPage from "./pages/dashboard/imobiliaria/FeedbackCorretor";
import AgendamentosImobiliaria from "./pages/dashboard/imobiliaria/Agendamentos";
import FeedbacksImobiliaria from "./pages/dashboard/imobiliaria/Feedbacks";
import AgendamentosConstrutora from "./pages/dashboard/construtora/Agendamentos";
import FeedbacksConstrutora from "./pages/dashboard/construtora/Feedbacks";
import ConfiguracoesConstrutora from "./pages/dashboard/construtora/Configuracoes";
import ConfiguracoesImobiliaria from "./pages/dashboard/imobiliaria/Configuracoes";
import FeedbackClientePublico from "./pages/feedback/FeedbackClientePublico";
import PropertyPage from "./pages/imovel/PropertyPage";
import TesteConexao from "./pages/TesteConexao";
import SeedData from "./pages/admin/SeedData";
import Diagnostico from "./pages/admin/Diagnostico";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Test Routes */}
            <Route path="/teste-conexao" element={<TesteConexao />} />
            
            {/* Admin Routes */}
            <Route path="/admin/seed-data" element={
              <ProtectedRoute allowedRoles={['construtora', 'admin']}>
                <SeedData />
              </ProtectedRoute>
            } />
            <Route path="/admin/diagnostico" element={<Diagnostico />} />
            
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/register/construtora" element={<RegisterConstrutora />} />
            <Route path="/auth/register/imobiliaria" element={<RegisterImobiliaria />} />
            
            {/* Dynamic Property Page (White Label) */}
            <Route path="/imovel/:slug" element={<PropertyPage />} />
            
            {/* Construtora Dashboard */}
            <Route path="/dashboard/construtora" element={
              <ProtectedRoute allowedRoles={['construtora']}>
                <ConstrutoraDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/construtora/novo-imovel" element={
              <ProtectedRoute allowedRoles={['construtora']}>
                <NovoImovel />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/construtora/imovel/:id" element={
              <ProtectedRoute allowedRoles={['construtora']}>
                <EditarImovel />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/construtora/imovel/:id/acessos" element={
              <ProtectedRoute allowedRoles={['construtora']}>
                <GerenciarAcessos />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/construtora/leads" element={
              <ProtectedRoute allowedRoles={['construtora']}>
                <LeadsPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/construtora/analytics" element={
              <ProtectedRoute allowedRoles={['construtora']}>
                <AnalyticsPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/construtora/agendamentos" element={
              <ProtectedRoute allowedRoles={['construtora']}>
                <AgendamentosConstrutora />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/construtora/feedbacks" element={
              <ProtectedRoute allowedRoles={['construtora']}>
                <FeedbacksConstrutora />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/construtora/configuracoes" element={
              <ProtectedRoute allowedRoles={['construtora']}>
                <ConfiguracoesConstrutora />
              </ProtectedRoute>
            } />
            
            {/* Imobiliaria Dashboard */}
            <Route path="/dashboard/imobiliaria" element={
              <ProtectedRoute allowedRoles={['imobiliaria']}>
                <ImobiliariaDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/imobiliaria/agendamentos" element={
              <ProtectedRoute allowedRoles={['imobiliaria']}>
                <AgendamentosImobiliaria />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/imobiliaria/feedbacks" element={
              <ProtectedRoute allowedRoles={['imobiliaria']}>
                <FeedbacksImobiliaria />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/imobiliaria/visitas/:agendamentoId/feedback" element={
              <ProtectedRoute allowedRoles={['imobiliaria']}>
                <FeedbackCorretorPage />
              </ProtectedRoute>
            } />
            {/* Nova rota: corretor acessa feedback existente (cliente já respondeu) */}
            <Route path="/dashboard/imobiliaria/feedback/:feedbackId" element={
              <ProtectedRoute allowedRoles={['imobiliaria']}>
                <FeedbackCorretorPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/imobiliaria/configuracoes" element={
              <ProtectedRoute allowedRoles={['imobiliaria']}>
                <ConfiguracoesImobiliaria />
              </ProtectedRoute>
            } />
            
            {/* Feedback Público (sem autenticação) */}
            <Route path="/feedback-visita/:token" element={<FeedbackClientePublico />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
