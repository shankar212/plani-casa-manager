
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ProjectProvider } from "./contexts/ProjectContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PageTransition } from "./components/PageTransition";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectFinancial from "./pages/ProjectFinancial";
import ProjectTechnical from "./pages/ProjectTechnical";
import ProjectLegal from "./pages/ProjectLegal";
import ProjectReports from "./pages/ProjectReports";
import ProjectTimeline from "./pages/ProjectTimeline";
import AddStep from "./pages/AddStep";
import DigitalWarehouse from "./pages/DigitalWarehouse";
import Notifications from "./pages/Notifications";
import AccountSettings from "./pages/AccountSettings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Install from "./pages/Install";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={
          <PageTransition>
            <Auth />
          </PageTransition>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <PageTransition>
              <Home />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/projetos" element={
          <ProtectedRoute>
            <PageTransition>
              <Projects />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/projetos/criar" element={
          <ProtectedRoute>
            <PageTransition>
              <CreateProject />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/projetos/:id" element={
          <ProtectedRoute>
            <PageTransition>
              <ProjectDetail />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/projetos/:id/financeiro" element={
          <ProtectedRoute>
            <PageTransition>
              <ProjectFinancial />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/projetos/:id/tecnico" element={
          <ProtectedRoute>
            <PageTransition>
              <ProjectTechnical />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/projetos/:id/conformidade-legal" element={
          <ProtectedRoute>
            <PageTransition>
              <ProjectLegal />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/projetos/:id/relatorios" element={
          <ProtectedRoute>
            <PageTransition>
              <ProjectReports />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/projetos/:id/cronograma" element={
          <ProtectedRoute>
            <PageTransition>
              <ProjectTimeline />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/projetos/:id/adicionar-etapa" element={
          <ProtectedRoute>
            <PageTransition>
              <AddStep />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/almoxarifado" element={
          <ProtectedRoute>
            <PageTransition>
              <DigitalWarehouse />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/notificacoes" element={
          <ProtectedRoute>
            <PageTransition>
              <Notifications />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/conta" element={
          <ProtectedRoute>
            <PageTransition>
              <AccountSettings />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/install" element={
          <PageTransition>
            <Install />
          </PageTransition>
        } />
        <Route path="*" element={
          <PageTransition>
            <NotFound />
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ProjectProvider>
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </ProjectProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
