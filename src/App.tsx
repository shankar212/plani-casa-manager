
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "./contexts/ProjectContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Projects = lazy(() => import("./pages/Projects"));
const CreateProject = lazy(() => import("./pages/CreateProject"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const ProjectFinancial = lazy(() => import("./pages/ProjectFinancial"));
const ProjectTechnical = lazy(() => import("./pages/ProjectTechnical"));
const ProjectLegal = lazy(() => import("./pages/ProjectLegal"));
const ProjectReports = lazy(() => import("./pages/ProjectReports"));
const ProjectTimeline = lazy(() => import("./pages/ProjectTimeline"));
const AddStep = lazy(() => import("./pages/AddStep"));
const DigitalWarehouse = lazy(() => import("./pages/DigitalWarehouse"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Install = lazy(() => import("./pages/Install"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="p-8 space-y-4">
    <Skeleton className="h-12 w-3/4" />
    <Skeleton className="h-64 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ProjectProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </BrowserRouter>
        </ProjectProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
