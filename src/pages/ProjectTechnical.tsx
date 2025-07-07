import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { useParams, NavLink } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";

const ProjectTechnical = () => {
  const { id } = useParams();
  const { etapas } = useProject();

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">
            <NavLink to="/projetos" className="hover:text-black">projetos</NavLink> › apartamento hillrid
          </div>
          <h1 className="text-2xl font-bold mb-4">apartamento hillrid</h1>
          
          <div className="flex space-x-4 border-b border-gray-200">
            <NavLink 
              to={`/projetos/${id}`} 
              end
              className={({ isActive }) => 
                `pb-2 px-1 ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
              }
            >
              gestão
            </NavLink>
            <NavLink 
              to={`/projetos/${id}/financeiro`}
              className={({ isActive }) => 
                `pb-2 px-1 ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
              }
            >
              financeiro
            </NavLink>
            <NavLink 
              to={`/projetos/${id}/tecnico`}
              className={({ isActive }) => 
                `pb-2 px-1 ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
              }
            >
              técnico
            </NavLink>
            <NavLink 
              to={`/projetos/${id}/conformidade-legal`}
              className={({ isActive }) => 
                `pb-2 px-1 ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
              }
            >
              conformidade legal
            </NavLink>
            <NavLink 
              to={`/projetos/${id}/relatorios`}
              className={({ isActive }) => 
                `pb-2 px-1 ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
              }
            >
              relatórios e indicadores
            </NavLink>
          </div>
        </div>

        <div className="space-y-6">
          {/* Physical Financial Schedule */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">cronograma físico financeiro</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-600">etapa</th>
                    <th className="text-left py-2 text-gray-600">início</th>
                    <th className="text-left py-2 text-gray-600">fim</th>
                    <th className="text-left py-2 text-gray-600">progresso</th>
                    <th className="text-left py-2 text-gray-600">custo (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {etapas.map((etapa) => (
                    <tr key={etapa.id} className="border-b">
                      <td className="py-3">{etapa.nome}</td>
                      <td className="py-3">{etapa.dataInicio || '-'}</td>
                      <td className="py-3">-</td>
                      <td className="py-3">{etapa.progresso}</td>
                      <td className="py-3">{etapa.custo || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Technical Plans and Projects */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">plantas e projetos técnicos</h2>
            <div className="flex space-x-2 mb-4">
              <button className="px-3 py-1 bg-gray-100 rounded text-sm">estrutural</button>
              <button className="px-3 py-1 text-gray-600 text-sm">hidrossanitário</button>
              <button className="px-3 py-1 text-gray-600 text-sm">elétrico</button>
              <button className="px-3 py-1 text-gray-600 text-sm">arquitetônico</button>
            </div>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <span className="text-gray-500">Visualizador PDF</span>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectTechnical;