import { NavLink } from "react-router-dom";
import { AnimatedBreadcrumbs } from "./AnimatedBreadcrumbs";
import { Skeleton } from "./ui/skeleton";

interface ProjectHeaderProps {
  projectId: string;
  projectName: string;
  loading?: boolean;
}

export const ProjectHeader = ({ projectId, projectName, loading }: ProjectHeaderProps) => {
  if (loading) {
    return (
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <span className="text-muted-foreground">/</span>
          <Skeleton className="h-4 w-20" />
          <span className="text-muted-foreground">/</span>
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-48 mb-4" />
        
        <div className="flex overflow-x-auto gap-2 md:space-x-4 border-b border-gray-200 scrollbar-hide">
          {['gestão', 'financeiro', 'técnico', 'conformidade legal', 'cronograma', 'relatórios e indicadores', 'histórico'].map((tab, index) => (
            <div key={index} className="pb-2 px-2 md:px-1">
              <Skeleton className="h-4 w-20 whitespace-nowrap" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <AnimatedBreadcrumbs />
      <h1 className="text-2xl font-bold mb-4">{projectName}</h1>
      
      <div className="flex overflow-x-auto gap-2 md:space-x-4 border-b border-gray-200 scrollbar-hide">
        <NavLink 
          to={`/projetos/${projectId}`} 
          end
          className={({ isActive }) => 
            `pb-2 px-2 md:px-1 text-xs sm:text-sm md:text-base whitespace-nowrap ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
          }
        >
          gestão
        </NavLink>
        <NavLink 
          to={`/projetos/${projectId}/financeiro`}
          className={({ isActive }) => 
            `pb-2 px-2 md:px-1 text-xs sm:text-sm md:text-base whitespace-nowrap ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
          }
        >
          financeiro
        </NavLink>
        <NavLink 
          to={`/projetos/${projectId}/tecnico`}
          className={({ isActive }) => 
            `pb-2 px-2 md:px-1 text-xs sm:text-sm md:text-base whitespace-nowrap ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
          }
        >
          técnico
        </NavLink>
        <NavLink 
          to={`/projetos/${projectId}/conformidade-legal`}
          className={({ isActive }) => 
            `pb-2 px-2 md:px-1 text-xs sm:text-sm md:text-base whitespace-nowrap ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
          }
        >
          conformidade legal
        </NavLink>
        <NavLink 
          to={`/projetos/${projectId}/cronograma`}
          className={({ isActive }) => 
            `pb-2 px-2 md:px-1 text-xs sm:text-sm md:text-base whitespace-nowrap ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
          }
        >
          cronograma
        </NavLink>
        <NavLink 
          to={`/projetos/${projectId}/relatorios`}
          className={({ isActive }) => 
            `pb-2 px-2 md:px-1 text-xs sm:text-sm md:text-base whitespace-nowrap ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
          }
        >
          relatórios e indicadores
        </NavLink>
        <NavLink 
          to={`/projetos/${projectId}/atividades`}
          className={({ isActive }) => 
            `pb-2 px-2 md:px-1 text-xs sm:text-sm md:text-base whitespace-nowrap ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
          }
        >
          histórico
        </NavLink>
      </div>
    </div>
  );
};