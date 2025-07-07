import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { useParams, NavLink } from "react-router-dom";

const ProjectLegal = () => {
  const { id } = useParams();

  const documents = [
    { phase: "Pré-Projeto", items: ["Matrícula Terreno"] },
    { phase: "Projeto", items: ["ART", "Projeto", "Memorial descritivo"] },
    { phase: "Obras", items: ["SQPO", "CMO"] },
    { phase: "Pós obra", items: ["CND", "Habite-se"] },
    { phase: "Financiamento", items: ["Elem Construtivos", "Seguro RGPM"] }
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {documents.map((phase, index) => (
            <Card key={index} className="p-4">
              <h3 className="font-semibold mb-3 text-center border-b pb-2">{phase.phase}</h3>
              <ul className="space-y-2">
                {phase.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm flex items-center">
                    <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectLegal;