
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProjectStages, useProjectTasks } from '@/hooks/useProjects';
import type { ProjectStage, ProjectTask } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { normalizeStageStatus } from '@/lib/status';


export interface Tarefa {
  id: string;
  nome: string;
  descricao?: string;
  completed?: boolean;
}

export interface Etapa {
  id: string;
  nome: string;
  dataInicio?: string;
  prazoEstimado?: string;
  progresso: string;
  custo?: string;
  tarefas: Tarefa[];
  status: 'finalizado' | 'andamento' | 'proximo';
}

export interface NewEtapa {
  nome: string;
  dataInicio?: string;
  prazoEstimado?: string;
  progresso: string;
  custo?: string;
  tarefas: { nome: string; descricao?: string; }[];
  status: 'finalizado' | 'andamento' | 'proximo';
}

interface ProjectContextType {
  etapas: Etapa[];
  loading: boolean;
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  addEtapa: (etapa: NewEtapa) => Promise<void>;
  addTarefa: (etapaId: string, tarefa: Omit<Tarefa, 'id'>) => Promise<void>;
  deleteTarefa: (etapaId: string, tarefaId: string) => Promise<void>;
  deleteEtapa: (etapaId: string) => Promise<void>;
  updateEtapaStatus: (etapaId: string, status: 'finalizado' | 'andamento' | 'proximo') => Promise<void>;
  getEtapasByStatus: (status: 'finalizado' | 'andamento' | 'proximo') => Etapa[];
  refetch: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [allTasks, setAllTasks] = useState<{ [stageId: string]: ProjectTask[] }>({});
  
  const { stages, loading: stagesLoading, createStage, updateStage, deleteStage, refetch: refetchStages } = useProjectStages(projectId || undefined);

  // Convert database stages to frontend format
  useEffect(() => {
    const convertedEtapas: Etapa[] = stages.map(stage => ({
      id: stage.id,
      nome: stage.name,
      dataInicio: stage.start_date ? new Date(stage.start_date).toLocaleDateString('pt-BR') : undefined,
      prazoEstimado: stage.estimated_duration_days?.toString(),
      progresso: `${stage.progress_percentage || 0}%`,
      custo: stage.estimated_cost ? `R$ ${stage.estimated_cost.toLocaleString('pt-BR')}` : undefined,
      status: stage.status as 'finalizado' | 'andamento' | 'proximo',
      tarefas: allTasks[stage.id] ? allTasks[stage.id].map(task => ({
        id: task.id,
        nome: task.name,
        descricao: task.description || undefined,
        completed: task.completed || false
      })) : []
    }));
    setEtapas(convertedEtapas);
  }, [stages, allTasks]);

  // Fetch tasks for all stages
  useEffect(() => {
    const fetchAllTasks = async () => {
      const tasksPromises = stages.map(async (stage) => {
        const { data } = await supabase
          .from('project_tasks')
          .select('*')
          .eq('stage_id', stage.id);
        return { stageId: stage.id, tasks: data || [] };
      });
      
      const results = await Promise.all(tasksPromises);
      const tasksMap = results.reduce((acc, { stageId, tasks }) => {
        acc[stageId] = tasks;
        return acc;
      }, {} as { [stageId: string]: ProjectTask[] });
      
      setAllTasks(tasksMap);
    };

    if (stages.length > 0) {
      fetchAllTasks();
    }
  }, [stages]);

  const addEtapa = async (newEtapa: NewEtapa) => {
    if (!projectId) return;
    
    const statusMap = {
      'finalizado': 'finalizado' as const,
      'andamento': 'andamento' as const, 
      'proximo': 'proximo' as const
    };

    const stage = await createStage({
      project_id: projectId,
      name: newEtapa.nome,
      description: undefined,
      start_date: newEtapa.dataInicio ? new Date(newEtapa.dataInicio.split('/').reverse().join('-')).toISOString().split('T')[0] : null,
      estimated_duration_days: newEtapa.prazoEstimado ? parseInt(newEtapa.prazoEstimado) : null,
      progress_percentage: parseInt(newEtapa.progresso.replace('%', '')) || 0,
      estimated_cost: newEtapa.custo ? parseFloat(newEtapa.custo.replace(/[R$\s.,]/g, '')) : null,
      status: statusMap[newEtapa.status]
    });

    // Add tasks for the new stage
    if (stage && newEtapa.tarefas.length > 0) {
      const tasksPromises = newEtapa.tarefas.map(tarefa => 
        supabase.from('project_tasks').insert({
          stage_id: stage.id,
          name: tarefa.nome,
          description: tarefa.descricao || null,
          completed: false
        })
      );
      await Promise.all(tasksPromises);
      refetchStages();
    }
  };

  const addTarefa = async (etapaId: string, newTarefa: Omit<Tarefa, 'id'>) => {
    try {
      await supabase.from('project_tasks').insert({
        stage_id: etapaId,
        name: newTarefa.nome,
        description: newTarefa.descricao || null,
        completed: false
      });
      refetchStages();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const deleteTarefa = async (etapaId: string, tarefaId: string) => {
    try {
      await supabase.from('project_tasks').delete().eq('id', tarefaId);
      refetchStages();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const deleteEtapa = async (etapaId: string) => {
    try {
      await deleteStage(etapaId);
    } catch (error) {
      console.error('Error deleting stage:', error);
    }
  };

  const updateEtapaStatus = async (etapaId: string, status: 'finalizado' | 'andamento' | 'proximo') => {
    console.log('ProjectContext: updateEtapaStatus called with etapaId:', etapaId, 'status:', status);

    const normalized = normalizeStageStatus(status);
    console.log('ProjectContext: normalized status:', normalized);

    if (!normalized) {
      toast({
        title: 'Erro',
        description: `Status inválido: ${status}`,
        variant: 'destructive',
      });
      return;
    }

    const previousEtapas = etapas;
    // Optimistic update
    setEtapas(prev => prev.map(e => (e.id === etapaId ? { ...e, status: normalized } : e)));

    try {
      // Call updateStage which now uses RPC normalization on server-side
      await updateStage(etapaId, { status: normalized as any });
      toast({ title: 'Sucesso', description: 'Status da etapa atualizado.' });
    } catch (error) {
      console.error('Error updating stage status:', error);
      // Revert on error
      setEtapas(previousEtapas);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status da etapa',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getEtapasByStatus = (status: 'finalizado' | 'andamento' | 'proximo') => {
    return etapas.filter(etapa => etapa.status === status);
  };

  return (
    <ProjectContext.Provider value={{
      etapas,
      loading: stagesLoading,
      projectId,
      setProjectId,
      addEtapa,
      addTarefa,
      deleteTarefa,
      deleteEtapa,
      updateEtapaStatus,
      getEtapasByStatus,
      refetch: refetchStages
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
