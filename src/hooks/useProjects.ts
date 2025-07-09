import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

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
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
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

  const getProjectById = async (id: string) => {
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
  };

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
    if (!projectId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_stages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

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
      const { data, error } = await supabase
        .from('project_stages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setStages(prev => prev.map(s => s.id === id ? data : s));
      toast({
        title: "Sucesso",
        description: "Etapa atualizada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating stage:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a etapa",
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
    if (!stageId) return;
    
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