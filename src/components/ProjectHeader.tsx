import { NavLink } from "react-router-dom";

interface ProjectHeaderProps {
  projectId: string;
  projectName: string;
  loading?: boolean;
}

export const ProjectHeader = ({ projectId, projectName, loading }: ProjectHeaderProps) => {
  if (loading) {
    return (
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">
          <NavLink to="/projetos" className="hover:text-black">projetos</NavLink> › 
          <span className="ml-1 bg-gray-200 animate-pulse rounded h-4 w-32 inline-block"></span>
        </div>
        <div className="bg-gray-200 animate-pulse rounded h-8 w-48 mb-4"></div>
        
      <div className="flex overflow-x-auto gap-2 md:space-x-4 border-b border-gray-200 scrollbar-hide">
        {['gestão', 'financeiro', 'técnico', 'conformidade legal', 'cronograma', 'relatórios e indicadores'].map((tab, index) => (
          <div key={index} className="pb-2 px-2 md:px-1">
            <div className="bg-gray-200 animate-pulse rounded h-4 w-20 whitespace-nowrap"></div>
          </div>
        ))}
      </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="text-sm text-gray-600 mb-2">
        <NavLink to="/projetos" className="hover:text-black">projetos</NavLink> › {projectName}
      </div>
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
      </div>
    </div>
  );
};