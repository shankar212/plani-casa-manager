
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "./contexts/ProjectContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectFinancial from "./pages/ProjectFinancial";
import ProjectTechnical from "./pages/ProjectTechnical";
import ProjectLegal from "./pages/ProjectLegal";
import ProjectReports from "./pages/ProjectReports";
import ProjectTimeline from "./pages/ProjectTimeline";
import ProjectActivity from "./pages/ProjectActivity";
import AddStep from "./pages/AddStep";
import DigitalWarehouse from "./pages/DigitalWarehouse";
import Notifications from "./pages/Notifications";
import AccountSettings from "./pages/AccountSettings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Install from "./pages/Install";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ProjectProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/projetos" element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            } />
            <Route path="/projetos/criar" element={
              <ProtectedRoute>
                <CreateProject />
              </ProtectedRoute>
            } />
            <Route path="/projetos/:id" element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            } />
            <Route path="/projetos/:id/financeiro" element={
              <ProtectedRoute>
                <ProjectFinancial />
              </ProtectedRoute>
            } />
            <Route path="/projetos/:id/tecnico" element={
              <ProtectedRoute>
                <ProjectTechnical />
              </ProtectedRoute>
            } />
            <Route path="/projetos/:id/conformidade-legal" element={
              <ProtectedRoute>
                <ProjectLegal />
              </ProtectedRoute>
            } />
            <Route path="/projetos/:id/relatorios" element={
              <ProtectedRoute>
                <ProjectReports />
              </ProtectedRoute>
            } />
            <Route path="/projetos/:id/cronograma" element={
              <ProtectedRoute>
                <ProjectTimeline />
              </ProtectedRoute>
            } />
            <Route path="/projetos/:id/atividades" element={
              <ProtectedRoute>
                <ProjectActivity />
              </ProtectedRoute>
            } />
            <Route path="/projetos/:id/adicionar-etapa" element={
              <ProtectedRoute>
                <AddStep />
              </ProtectedRoute>
            } />
            <Route path="/almoxarifado" element={
              <ProtectedRoute>
                <DigitalWarehouse />
              </ProtectedRoute>
            } />
              <Route path="/notificacoes" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              <Route path="/conta" element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              } />
              <Route path="/install" element={<Install />} />
              <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </ProjectProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
