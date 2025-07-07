import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { useParams, NavLink } from "react-router-dom";

const ProjectReports = () => {
  const { id } = useParams();

  const reports = [
    { date: "15/01/2025", description: "Concluída a fundação do bloco A. Iniciados trabalhos de alvenaria." },
    { date: "14/01/2025", description: "Finalizada a instalação elétrica da subsolo. Testes iniciados." },
    { date: "13/01/2025", description: "Entrega de materiais para acabamento do bloco B." }
  ];

  const photos = Array(16).fill(null).map((_, i) => ({
    id: i + 1,
    size: ["927kV", "235kB", "826kB", "1273kV"][i % 4]
  }));

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Monthly Expenses Chart */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Gastos mensais</h2>
            <div className="flex justify-center items-end space-x-2 h-32">
              {[80, 70, 85, 60, 50].map((height, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    className="w-8 bg-purple-500 rounded-t" 
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs mt-1">
                    {["Jan", "Fev", "Mar", "Abr", "Mai"][i]}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Financial Results */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Resultados Financeiros</h2>
            <div className="space-y-3">
              <div className="bg-gray-100 p-3 rounded">
                <div className="text-sm text-gray-600">Custo: R$ XX</div>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <div className="text-sm text-gray-600">Valor Presente líquido: R$ XX</div>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <div className="text-sm text-gray-600">Exp. Retorno líquido: R$ XX</div>
              </div>
            </div>
          </Card>

          {/* Progress Reports */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">relatório de acompanhamento</h2>
            <div className="space-y-3">
              {reports.map((report, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium">Data: {report.date}</div>
                  <div className="text-gray-600">{report.description}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Photo Report */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">relatório fotográfico</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                <div className="text-xs text-gray-500 mb-1">img</div>
                <div className="text-xs text-gray-400">{photo.size}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ProjectReports;