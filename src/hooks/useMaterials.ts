
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { logError } from '@/lib/errorHandler';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Material = Tables<'materials'> & {
  projects?: { name: string } | null;
};

export type NewMaterial = Omit<TablesInsert<'materials'>, 'id' | 'created_at' | 'updated_at'>;

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('materials')
        .select(`
          *,
          projects:project_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      logError('Material Fetching', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os materiais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createMaterial = async (material: NewMaterial) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const materialWithUserId = {
        ...material,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('materials')
        .insert([materialWithUserId])
        .select(`
          *,
          projects:project_id (name)
        `)
        .single();

      if (error) throw error;
      
      setMaterials(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Material criado com sucesso!"
      });
      
      return data;
    } catch (error) {
      logError('Material Creation', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o material",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateMaterial = async (id: string, updates: TablesUpdate<'materials'>) => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          projects:project_id (name)
        `)
        .single();

      if (error) throw error;
      
      setMaterials(prev => prev.map(m => m.id === id ? data : m));
      return data;
    } catch (error) {
      logError('Material Update', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o material",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMaterials(prev => prev.filter(m => m.id !== id));
      toast({
        title: "Sucesso",
        description: "Material excluído com sucesso!"
      });
    } catch (error) {
      logError('Material Deletion', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o material",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMaterials();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('materials-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'materials'
        },
        (payload) => {
          console.log('Material change detected:', payload);
          fetchMaterials(); // Refetch to get updated data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    materials,
    loading,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    refetch: fetchMaterials
  };
};
