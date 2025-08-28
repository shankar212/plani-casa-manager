import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { normalizeStageStatus } from '@/lib/status';


export type Project = Tables<'projects'>;
export type ProjectStage = Tables<'project_stages'>;
export type ProjectTask = Tables<'project_tasks'>;
export type NewProject = TablesInsert<'projects'>;
export type NewProjectStage = TablesInsert<'project_stages'>;
export type NewProjectTask = TablesInsert<'project_tasks'>;

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os projetos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (project: NewProject) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const projectWithUserId = {
        ...project,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([projectWithUserId])
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Projeto criado com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o projeto",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProject = async (id: string, updates: TablesUpdate<'projects'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "Sucesso",
        description: "Projeto atualizado com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o projeto",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProjects(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Projeto excluído com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o projeto",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getProjectById = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o projeto",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    refetch: fetchProjects
  };
};

export const useProjectStages = (projectId?: string) => {
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStages = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('project_stages')
        .select(`
          *,
          projects!inner(name)
        `)
        .order('created_at', { ascending: true });
      
      // If projectId is provided, filter by it; otherwise get all stages
      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setStages(data || []);
    } catch (error) {
      console.error('Error fetching stages:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as etapas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createStage = async (stage: NewProjectStage) => {
    try {
      const { data, error } = await supabase
        .from('project_stages')
        .insert([stage])
        .select()
        .single();

      if (error) throw error;
      
      setStages(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Etapa criada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating stage:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a etapa",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateStage = async (id: string, updates: TablesUpdate<'project_stages'>) => {
    try {
      console.log('useProjects: updateStage called with id:', id, 'updates:', updates);

      // Normalize status if present
      const safeUpdates: any = { ...updates };
      if (typeof safeUpdates.status === 'string') {
        const normalized = normalizeStageStatus(safeUpdates.status);
        console.log('useProjects: normalized status:', normalized, 'from:', safeUpdates.status);
        if (!normalized) {
          throw new Error(`Invalid stage status: ${safeUpdates.status}`);
        }
        safeUpdates.status = normalized;
      }
      
      const { data, error } = 'status' in safeUpdates
        ? await supabase.rpc('update_stage_status', { p_id: id, p_status: safeUpdates.status as any })
        : await supabase
            .from('project_stages')
            .update(safeUpdates)
            .eq('id', id)
            .select()
            .maybeSingle();

      if ('status' in safeUpdates) {
        // RPC returns row directly in data
        if ((data as any) == null) {
          console.warn('useProjects: RPC update_stage_status returned null. Refetching stages...');
          await fetchStages();
          return null as unknown as ProjectStage;
        }
      } else {
        if (!data) {
          console.warn('useProjects: updateStage returned no row (maybe RLS or no match). Refetching stages...');
          await fetchStages();
          return null as unknown as ProjectStage; // keep return type compatible
        }
      }
      
      const updated = data as ProjectStage;
      console.log('useProjects: Successfully updated stage:', updated);
      setStages(prev => prev.map(s => s.id === id ? updated : s));
      toast({
        title: "Sucesso",
        description: "Etapa atualizada com sucesso!"
      });
      
      return updated;
    } catch (error: any) {
      console.error('Error updating stage:', error);
      const message = error?.message || String(error);
      toast({
        title: "Erro",
        description: message.includes('Invalid stage status') ? "Status inválido enviado. Tente novamente." : "Não foi possível atualizar a etapa",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteStage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_stages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setStages(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Sucesso",
        description: "Etapa excluída com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting stage:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a etapa",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchStages();
  }, [projectId]);

  return {
    stages,
    loading,
    createStage,
    updateStage,
    deleteStage,
    refetch: fetchStages
  };
};

export const useProjectTasks = (stageId?: string) => {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = async () => {
    if (!stageId) {
      setLoading(false);
      setTasks([]);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('stage_id', stageId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (task: NewProjectTask) => {
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .insert([task])
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTask = async (id: string, updates: TablesUpdate<'project_tasks'>) => {
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => prev.map(t => t.id === id ? data : t));
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTasks(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Sucesso",
        description: "Tarefa excluída com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a tarefa",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [stageId]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks
  };
};
