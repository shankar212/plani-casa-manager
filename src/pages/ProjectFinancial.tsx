import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useParams, NavLink } from "react-router-dom";

const ProjectFinancial = () => {
  const { id } = useParams();

  const contractors = [
    { name: "Fornecedor A", value: "R$ 55.730,00", status: "pago" },
    { name: "Fornecedor Y", value: "R$ 21.200,00", status: "pago" },
    { name: "Fornecedor S", value: "R$ 5.789,90", status: "pendente" },
    { name: "Fornecedor A", value: "R$ 55.730,00", status: "pago" },
    { name: "Fornecedor Y", value: "R$ 21.200,00", status: "pago" },
    { name: "Fornecedor S", value: "R$ 5.789,90", status: "pendente" },
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

        <div className="space-y-6">
          {/* Budget Overview */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">orçamento total do projeto</h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">33% utilizado</span>
              <span className="text-lg font-semibold">1.000.000,00</span>
            </div>
            <Progress value={33} className="h-3" />
          </Card>

          {/* Payments and Contracts */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">pagamentos e contratos confirmados</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-600">contrato</th>
                    <th className="text-left py-2 text-gray-600">valor</th>
                    <th className="text-left py-2 text-gray-600">status</th>
                  </tr>
                </thead>
                <tbody>
                  {contractors.map((contractor, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{contractor.name}</td>
                      <td className="py-3">{contractor.value}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          contractor.status === 'pago' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {contractor.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectFinancial;