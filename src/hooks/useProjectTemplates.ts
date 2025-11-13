import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProjectTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  construction_type?: string | null;
  default_status?: string | null;
  default_client?: string | null;
  default_engineer?: string | null;
  default_team?: string | null;
  estimated_duration_days?: number | null;
  template_stages?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  construction_type?: string;
  default_status?: string;
  default_client?: string;
  default_engineer?: string;
  default_team?: string;
  estimated_duration_days?: number;
  template_stages?: any[];
}

export const useProjectTemplates = () => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("project_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar templates",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: CreateTemplateData) => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("project_templates")
        .insert([{ ...templateData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Template criado!",
        description: "O template foi salvo com sucesso.",
      });

      await fetchTemplates();
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar template",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<CreateTemplateData>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("project_templates")
        .update(templateData)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Template atualizado!",
        description: "As alterações foram salvas.",
      });

      await fetchTemplates();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar template",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("project_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Template excluído!",
        description: "O template foi removido.",
      });

      await fetchTemplates();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir template",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};