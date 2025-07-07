
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";

const ProjectDetail = () => {
  const { id } = useParams();
  const { getEtapasByStatus, deleteTarefa } = useProject();
  const [finalizadosOpen, setFinalizadosOpen] = useState(true);
  const [andamentoOpen, setAndamentoOpen] = useState(true);
  const [proximosOpen, setProximosOpen] = useState(true);

  const finalizados = getEtapasByStatus('finalizado');
  const emAndamento = getEtapasByStatus('andamento');
  const proximos = getEtapasByStatus('proximo');

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
          {/* Finalizados */}
          <Collapsible open={finalizadosOpen} onOpenChange={setFinalizadosOpen}>
            <Card className="p-6">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h2 className="text-lg font-semibold">Finalizados</h2>
                <div className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  {finalizadosOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                {finalizados.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhuma etapa finalizada ainda</p>
                ) : (
                  <div className="space-y-2">
                    {finalizados.map((etapa) => (
                      <div key={etapa.id} className="space-y-2">
                        <div className="p-3 bg-gray-50 rounded-lg font-medium">
                          {etapa.nome}
                        </div>
                        {etapa.tarefas.map((tarefa) => (
                          <div key={tarefa.id} className="ml-4 p-2 bg-gray-100 rounded flex justify-between items-center">
                            <span className="text-sm">{tarefa.nome}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTarefa(etapa.id, tarefa.id)}
                              className="p-1 h-auto text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Em andamento */}
          <Collapsible open={andamentoOpen} onOpenChange={setAndamentoOpen}>
            <Card className="p-6">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h2 className="text-lg font-semibold">Em andamento</h2>
                {andamentoOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="space-y-2">
                  {emAndamento.map((etapa) => (
                    <div key={etapa.id} className="space-y-2">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg font-medium">
                        {etapa.nome}
                      </div>
                      {etapa.tarefas.map((tarefa) => (
                        <div key={tarefa.id} className="ml-4 p-2 bg-blue-100 rounded flex justify-between items-center">
                          <span className="text-sm">{tarefa.nome}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTarefa(etapa.id, tarefa.id)}
                            className="p-1 h-auto text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Próximos */}
          <Collapsible open={proximosOpen} onOpenChange={setProximosOpen}>
            <Card className="p-6">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h2 className="text-lg font-semibold">Próximos</h2>
                {proximosOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="space-y-2">
                  {proximos.map((etapa) => (
                    <div key={etapa.id} className="space-y-2">
                      <div className="p-3 bg-gray-50 rounded-lg font-medium">
                        {etapa.nome}
                      </div>
                      {etapa.tarefas.map((tarefa) => (
                        <div key={tarefa.id} className="ml-4 p-2 bg-gray-100 rounded flex justify-between items-center">
                          <span className="text-sm">{tarefa.nome}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTarefa(etapa.id, tarefa.id)}
                            className="p-1 h-auto text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Card className="p-8">
            <Button 
              className="w-full py-6 text-lg"
              onClick={() => window.location.href = `/projetos/${id}/adicionar-etapa`}
            >
              Adicionar Etapa/Tarefa
            </Button>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
