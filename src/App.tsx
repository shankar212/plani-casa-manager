
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "./contexts/ProjectContext";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectFinancial from "./pages/ProjectFinancial";
import ProjectTechnical from "./pages/ProjectTechnical";
import ProjectLegal from "./pages/ProjectLegal";
import ProjectReports from "./pages/ProjectReports";
import AddStep from "./pages/AddStep";
import DigitalWarehouse from "./pages/DigitalWarehouse";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ProjectProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projetos" element={<Projects />} />
          <Route path="/projetos/criar" element={<CreateProject />} />
          <Route path="/projetos/:id" element={<ProjectDetail />} />
          <Route path="/projetos/:id/financeiro" element={<ProjectFinancial />} />
          <Route path="/projetos/:id/tecnico" element={<ProjectTechnical />} />
          <Route path="/projetos/:id/conformidade-legal" element={<ProjectLegal />} />
          <Route path="/projetos/:id/relatorios" element={<ProjectReports />} />
          <Route path="/projetos/:id/adicionar-etapa" element={<AddStep />} />
          <Route path="/almoxarifado" element={<DigitalWarehouse />} />
          <Route path="/configuracoes" element={<div>Configurações em desenvolvimento</div>} />
          <Route path="/notificacoes" element={<Notifications />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
