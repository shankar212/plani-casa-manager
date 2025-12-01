
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Plus, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { DeleteTarefaDialog } from "@/components/DeleteTarefaDialog";
import { DeleteEtapaDialog } from "@/components/DeleteEtapaDialog";
import { ChangeStatusDialog } from "@/components/ChangeStatusDialog";
import { ProjectShareDialog } from "@/components/ProjectShareDialog";
import { ProjectAccessBadge } from "@/components/ProjectAccessBadge";
import { useProjects } from "@/hooks/useProjects";
import { useProjectRealtime } from "@/hooks/useProjectRealtime";
import { useProjectAccess } from "@/hooks/useProjectAccess";
import type { Project } from "@/hooks/useProjects";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEtapasByStatus, deleteTarefa, deleteEtapa, updateEtapaStatus, setProjectId, loading } = useProject();
  const { getProjectById } = useProjects();
  const { accessLevel, canEdit, isOwner } = useProjectAccess(id);
  const [finalizadosOpen, setFinalizadosOpen] = useState(true);
  const [andamentoOpen, setAndamentoOpen] = useState(true);
  const [proximosOpen, setProximosOpen] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);

  useEffect(() => {
    console.log('ProjectDetail: URL params:', { id });
    console.log('ProjectDetail: typeof id:', typeof id);
    
    if (id) {
      setProjectId(id);
      
      const fetchProject = async () => {
        try {
          setProjectLoading(true);
          console.log('ProjectDetail: Fetching project with ID:', id);
          const projectData = await getProjectById(id);
          console.log('ProjectDetail: Received project data:', projectData);
          setProject(projectData);
        } catch (error) {
          console.error('Error fetching project:', error);
        } finally {
          setProjectLoading(false);
        }
      };
      
      fetchProject();
    } else {
      console.log('ProjectDetail: No ID provided');
      setProjectLoading(false);
    }
  }, [id, setProjectId, getProjectById]);

  // Set up realtime listeners for project updates
  useProjectRealtime(id, () => {
    // Refetch project data when changes are detected
    if (id) {
      getProjectById(id).then(setProject);
    }
  });

  const finalizados = getEtapasByStatus('finalizado');
  const emAndamento = getEtapasByStatus('andamento');
  const proximos = getEtapasByStatus('proximo');

  if (projectLoading || loading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="text-center">Carregando projeto...</div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="p-8">
          <div className="text-center">Projeto não encontrado</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 lg:p-8 max-w-full">
        <div className="mb-4 md:mb-6 max-w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/projetos')}
            className="mb-3 -ml-2 hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Projetos
          </Button>
          <div className="text-xs md:text-sm text-gray-600 mb-2">
            <NavLink to="/projetos" className="hover:text-black">projetos</NavLink> › {project.name}
          </div>
          <div className="flex items-center justify-between mb-3 md:mb-4 gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold break-words">{project.name}</h1>
              <ProjectAccessBadge accessLevel={accessLevel} />
            </div>
            {isOwner && <ProjectShareDialog projectId={id!} projectName={project.name} />}
          </div>
          
          <div className="flex overflow-x-auto gap-2 md:space-x-4 border-b border-gray-200 scrollbar-hide">
            <NavLink 
              to={`/projetos/${id}`} 
              end
              className={({ isActive }) => 
                `pb-2 px-2 md:px-1 text-xs sm:text-sm md:text-base whitespace-nowrap ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
              }
            >
              gestão
            </NavLink>
            <NavLink 
              to={`/projetos/${id}/financeiro`}
              className={({ isActive }) => 
                `pb-2 px-2 md:px-1 text-xs sm:text-sm md:text-base whitespace-nowrap ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
              }
            >
              financeiro
            </NavLink>
            <NavLink 
              to={`/projetos/${id}/tecnico`}
              className={({ isActive }) => 
                `pb-2 px-2 md:px-1 text-xs sm:text-sm md:text-base whitespace-nowrap ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
              }
            >
              técnico
            </NavLink>
            <NavLink 
              to={`/projetos/${id}/conformidade-legal`}
              className={({ isActive }) => 
                `pb-2 px-2 md:px-1 text-xs sm:text-sm md:text-base whitespace-nowrap ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
              }
            >
              conformidade legal
            </NavLink>
            <NavLink 
              to={`/projetos/${id}/cronograma`}
              className={({ isActive }) => 
                `pb-2 px-2 md:px-1 text-xs sm:text-sm md:text-base whitespace-nowrap ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
              }
            >
              cronograma
            </NavLink>
            <NavLink 
              to={`/projetos/${id}/relatorios`}
              className={({ isActive }) => 
                `pb-2 px-2 md:px-1 text-xs sm:text-sm md:text-base whitespace-nowrap ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
              }
            >
              relatórios e indicadores
            </NavLink>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6 w-full max-w-full">
          {/* Finalizados */}
          <Collapsible open={finalizadosOpen} onOpenChange={setFinalizadosOpen}>
            <Card className="p-4 md:p-6 w-full max-w-full">
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
                        <div className="p-3 bg-gray-50 rounded-lg font-medium flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <span className="text-sm md:text-base break-words">{etapa.nome}</span>
                          {canEdit && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <ChangeStatusDialog
                                etapaName={etapa.nome}
                                currentStatus="finalizado"
                                targetStatus="andamento"
                                onConfirm={() => updateEtapaStatus(etapa.id, 'andamento')}
                              />
                              <DeleteEtapaDialog
                                etapaName={etapa.nome}
                                onConfirm={() => deleteEtapa(etapa.id)}
                              />
                            </div>
                          )}
                        </div>
                      {etapa.tarefas.map((tarefa) => (
                        <div key={tarefa.id} className="ml-2 md:ml-4 p-2 bg-gray-100 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <span className="text-xs md:text-sm break-words">{tarefa.nome}</span>
                          {canEdit && (
                            <DeleteTarefaDialog
                              tarefaName={tarefa.nome}
                              onConfirm={() => deleteTarefa(etapa.id, tarefa.id)}
                            />
                          )}
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
            <Card className="p-4 md:p-6 w-full max-w-full">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h2 className="text-lg font-semibold">Em andamento</h2>
                {andamentoOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="space-y-2">
                   {emAndamento.map((etapa) => (
                     <div key={etapa.id} className="space-y-2">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg font-medium flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <span className="text-sm md:text-base break-words">{etapa.nome}</span>
                          {canEdit && (
                            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                              <ChangeStatusDialog
                                etapaName={etapa.nome}
                                currentStatus="andamento"
                                targetStatus="finalizado"
                                onConfirm={() => updateEtapaStatus(etapa.id, 'finalizado')}
                              />
                              <ChangeStatusDialog
                                etapaName={etapa.nome}
                                currentStatus="andamento"
                                targetStatus="proximo"
                                onConfirm={() => updateEtapaStatus(etapa.id, 'proximo')}
                              />
                              <DeleteEtapaDialog
                                etapaName={etapa.nome}
                                onConfirm={() => deleteEtapa(etapa.id)}
                              />
                            </div>
                          )}
                        </div>
                      {etapa.tarefas.map((tarefa) => (
                        <div key={tarefa.id} className="ml-2 md:ml-4 p-2 bg-blue-100 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <span className="text-xs md:text-sm break-words">{tarefa.nome}</span>
                          {canEdit && (
                            <DeleteTarefaDialog
                              tarefaName={tarefa.nome}
                              onConfirm={() => deleteTarefa(etapa.id, tarefa.id)}
                            />
                          )}
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
            <Card className="p-4 md:p-6 w-full max-w-full">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h2 className="text-lg font-semibold">Próximos</h2>
                {proximosOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="space-y-2">
                   {proximos.map((etapa) => (
                     <div key={etapa.id} className="space-y-2">
                        <div className="p-3 bg-gray-50 rounded-lg font-medium flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <span className="text-sm md:text-base break-words">{etapa.nome}</span>
                          {canEdit && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <ChangeStatusDialog
                                etapaName={etapa.nome}
                                currentStatus="proximo"
                                targetStatus="andamento"
                                onConfirm={() => updateEtapaStatus(etapa.id, 'andamento')}
                              />
                              <DeleteEtapaDialog
                                etapaName={etapa.nome}
                                onConfirm={() => deleteEtapa(etapa.id)}
                              />
                            </div>
                          )}
                        </div>
                      {etapa.tarefas.map((tarefa) => (
                        <div key={tarefa.id} className="ml-2 md:ml-4 p-2 bg-gray-100 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <span className="text-xs md:text-sm break-words">{tarefa.nome}</span>
                          {canEdit && (
                            <DeleteTarefaDialog
                              tarefaName={tarefa.nome}
                              onConfirm={() => deleteTarefa(etapa.id, tarefa.id)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {canEdit && (
            <Card className="p-4 md:p-8 w-full max-w-full">
              <Button 
                className="w-full py-4 md:py-6 text-base md:text-lg"
                onClick={() => window.location.href = `/projetos/${id}/adicionar-etapa`}
              >
                Adicionar Etapa/Tarefa
              </Button>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
