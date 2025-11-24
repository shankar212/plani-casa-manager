import { useLocation, useParams } from "react-router-dom";
import { useProjectData } from "./useProjectData";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const location = useLocation();
  const params = useParams();
  const { project } = useProjectData(params.id);

  const pathname = location.pathname;
  const breadcrumbs: BreadcrumbItem[] = [];

  // Home
  if (pathname === "/") {
    breadcrumbs.push({ label: "Início", current: true });
    return breadcrumbs;
  }

  breadcrumbs.push({ label: "Início", href: "/" });

  // Projects routes
  if (pathname.startsWith("/projetos")) {
    if (pathname === "/projetos") {
      breadcrumbs.push({ label: "Projetos", current: true });
    } else if (pathname === "/projetos/criar") {
      breadcrumbs.push({ label: "Projetos", href: "/projetos" });
      breadcrumbs.push({ label: "Criar Projeto", current: true });
    } else if (params.id) {
      breadcrumbs.push({ label: "Projetos", href: "/projetos" });
      const projectName = project?.name || "Carregando...";
      
      if (pathname === `/projetos/${params.id}`) {
        breadcrumbs.push({ label: projectName, current: true });
      } else {
        breadcrumbs.push({ label: projectName, href: `/projetos/${params.id}` });
        
        if (pathname.includes("/financeiro")) {
          breadcrumbs.push({ label: "Financeiro", current: true });
        } else if (pathname.includes("/tecnico")) {
          breadcrumbs.push({ label: "Técnico", current: true });
        } else if (pathname.includes("/conformidade-legal")) {
          breadcrumbs.push({ label: "Conformidade Legal", current: true });
        } else if (pathname.includes("/cronograma")) {
          breadcrumbs.push({ label: "Cronograma", current: true });
        } else if (pathname.includes("/relatorios")) {
          breadcrumbs.push({ label: "Relatórios", current: true });
        } else if (pathname.includes("/adicionar-etapa")) {
          breadcrumbs.push({ label: "Adicionar Etapa", current: true });
        }
      }
    }
  }
  // Warehouse
  else if (pathname === "/almoxarifado") {
    breadcrumbs.push({ label: "Almoxarifado", current: true });
  }
  // Notifications
  else if (pathname === "/notificacoes") {
    breadcrumbs.push({ label: "Notificações", current: true });
  }
  // Account
  else if (pathname === "/conta") {
    breadcrumbs.push({ label: "Configurações da Conta", current: true });
  }

  return breadcrumbs;
};
