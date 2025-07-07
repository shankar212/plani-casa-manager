import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useParams, NavLink } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const ProjectLegal = () => {
  const { id } = useParams();
  const { toast } = useToast();
  
  const [documents, setDocuments] = useState<Record<string, string[]>>({});

  const sectors = [
    "Pré-Projeto",
    "Projeto", 
    "Obras",
    "Pós obra",
    "Financiamento"
  ];

  const handleAddDocument = (sector: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setDocuments(prev => ({
          ...prev,
          [sector]: [...(prev[sector] || []), file.name]
        }));
        toast({
          title: "Document uploaded",
          description: `${file.name} added to ${sector} sector`,
        });
      }
    };
    input.click();
  };

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
          {sectors.map((sector, index) => (
            <Card key={index} className="p-4 min-h-[200px]">
              <h3 className="font-semibold mb-4 text-center border-b pb-2">{sector}</h3>
              
              {documents[sector] && documents[sector].length > 0 && (
                <div className="mb-4 space-y-2">
                  {documents[sector].map((doc, docIndex) => (
                    <div key={docIndex} className="text-sm flex items-start">
                      <span className="w-2 h-2 bg-black rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                      <span className="break-all">{doc}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={() => handleAddDocument(sector)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Documento
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectLegal;