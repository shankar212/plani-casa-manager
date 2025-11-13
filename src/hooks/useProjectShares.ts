import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ProjectShare {
  id: string;
  project_id: string;
  shared_with_user_id: string;
  shared_by_user_id: string;
  access_level: 'view' | 'edit' | 'admin';
  created_at: string;
  shared_with_email?: string;
  shared_with_name?: string;
}

export const useProjectShares = (projectId: string | undefined) => {
  const { user } = useAuth();
  const [shares, setShares] = useState<ProjectShare[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShares = async () => {
    if (!projectId || !user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_shares')
        .select(`
          *,
          profiles:shared_with_user_id (
            id,
            full_name
          )
        `)
        .eq('project_id', projectId);

      if (error) throw error;

      // Transform data to match our type
      const sharesData: ProjectShare[] = (data || []).map((share: any) => ({
        id: share.id,
        project_id: share.project_id,
        shared_with_user_id: share.shared_with_user_id,
        shared_by_user_id: share.shared_by_user_id,
        access_level: share.access_level as 'view' | 'edit' | 'admin',
        created_at: share.created_at,
        shared_with_email: share.shared_with_user_id, // Will fetch separately if needed
        shared_with_name: share.profiles?.full_name
      }));

      setShares(sharesData);
    } catch (error: any) {
      console.error('Error fetching shares:', error);
      toast.error('Erro ao carregar compartilhamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, [projectId, user]);

  const addShare = async (email: string, accessLevel: 'view' | 'edit' | 'admin') => {
    if (!projectId || !user) return;

    try {
      // Find user by email in profiles table
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(100);

      if (profileError) throw profileError;

      // We can't directly query auth.users, so we'll try to insert and let the database handle validation
      // The user should provide the UUID of the user they want to share with
      // For now, we'll show an error message
      toast.error('Por favor, forneça o ID do usuário (UUID) ao invés do email. Funcionalidade de busca por email requer configuração adicional.');
      
    } catch (error: any) {
      console.error('Error adding share:', error);
      toast.error('Erro ao compartilhar projeto');
    }
  };

  const updateAccessLevel = async (shareId: string, accessLevel: 'view' | 'edit' | 'admin') => {
    try {
      const { error } = await supabase
        .from('project_shares')
        .update({ access_level: accessLevel })
        .eq('id', shareId);

      if (error) throw error;

      toast.success('Nível de acesso atualizado');
      fetchShares();
    } catch (error: any) {
      console.error('Error updating access level:', error);
      toast.error('Erro ao atualizar nível de acesso');
    }
  };

  const removeShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('project_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      toast.success('Compartilhamento removido');
      fetchShares();
    } catch (error: any) {
      console.error('Error removing share:', error);
      toast.error('Erro ao remover compartilhamento');
    }
  };

  return {
    shares,
    loading,
    addShare,
    updateAccessLevel,
    removeShare,
    refetch: fetchShares
  };
};
