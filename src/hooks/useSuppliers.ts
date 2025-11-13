import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/lib/logger';

export type MaterialSupplier = Tables<'material_suppliers'>;
export type ServiceProvider = Tables<'service_providers'> & {
  projects?: { name: string } | null;
  project_stages?: { name: string } | null;
};
export type NewMaterialSupplier = TablesInsert<'material_suppliers'>;
export type NewServiceProvider = TablesInsert<'service_providers'>;

export const useMaterialSuppliers = (projectId?: string) => {
  const [suppliers, setSuppliers] = useState<MaterialSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      let query = supabase.from('material_suppliers').select('*');
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      logger.error('Error fetching material suppliers:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os fornecedores de material.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (supplier: NewMaterialSupplier): Promise<MaterialSupplier | undefined> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('material_suppliers')
        .insert({ ...supplier, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      setSuppliers(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Fornecedor de material criado com sucesso."
      });
      
      return data;
    } catch (error) {
      logger.error('Error creating material supplier:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o fornecedor de material.",
        variant: "destructive"
      });
    }
  };

  const updateSupplier = async (id: string, updates: TablesUpdate<'material_suppliers'>): Promise<MaterialSupplier | undefined> => {
    try {
      const { data, error } = await supabase
        .from('material_suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setSuppliers(prev => prev.map(s => s.id === id ? data : s));
      toast({
        title: "Sucesso",
        description: "Fornecedor de material atualizado com sucesso."
      });
      
      return data;
    } catch (error) {
      logger.error('Error updating material supplier:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o fornecedor de material.",
        variant: "destructive"
      });
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('material_suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSuppliers(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Sucesso",
        description: "Fornecedor de material excluído com sucesso."
      });
    } catch (error) {
      logger.error('Error deleting material supplier:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o fornecedor de material.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [projectId]);

  return {
    suppliers,
    loading,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refetch: fetchSuppliers
  };
};

export const useServiceProviders = (projectId?: string) => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProviders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('service_providers')
        .select(`
          *,
          projects(name),
          project_stages(name)
        `);
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      logger.error('Error fetching service providers:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os prestadores de serviço.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProvider = async (provider: NewServiceProvider): Promise<ServiceProvider | undefined> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('service_providers')
        .insert({ ...provider, user_id: user.id })
        .select(`
          *,
          projects(name),
          project_stages(name)
        `)
        .single();

      if (error) throw error;
      
      setProviders(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Prestador de serviço criado com sucesso."
      });
      
      return data;
    } catch (error) {
      logger.error('Error creating service provider:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o prestador de serviço.",
        variant: "destructive"
      });
    }
  };

  const updateProvider = async (id: string, updates: TablesUpdate<'service_providers'>): Promise<ServiceProvider | undefined> => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          projects(name),
          project_stages(name)
        `)
        .single();

      if (error) throw error;
      
      setProviders(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "Sucesso",
        description: "Prestador de serviço atualizado com sucesso."
      });
      
      return data;
    } catch (error) {
      logger.error('Error updating service provider:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o prestador de serviço.",
        variant: "destructive"
      });
    }
  };

  const deleteProvider = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProviders(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Prestador de serviço excluído com sucesso."
      });
    } catch (error) {
      logger.error('Error deleting service provider:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o prestador de serviço.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [projectId]);

  return {
    providers,
    loading,
    createProvider,
    updateProvider,
    deleteProvider,
    refetch: fetchProviders
  };
};