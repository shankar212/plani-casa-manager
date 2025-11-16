import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AccountShare {
  id: string;
  owner_user_id: string;
  shared_with_user_id: string;
  granted_by_user_id: string;
  access_level: string;
  created_at: string;
  shared_with_email?: string;
  shared_with_name?: string;
}

export const useAccountShares = () => {
  const { user } = useAuth();
  const [shares, setShares] = useState<AccountShare[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShares = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('account_shares')
        .select('*')
        .eq('owner_user_id', user.id);

      if (error) throw error;

      // Fetch profile and email for each user
      const sharesWithDetails = await Promise.all(
        (data || []).map(async (share: any) => {
          // Get email
          const { data: email } = await supabase
            .rpc('get_user_email_by_id', { _user_id: share.shared_with_user_id });
          
          // Get profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', share.shared_with_user_id)
            .maybeSingle();
          
          return {
            ...share,
            shared_with_email: email || 'Email não disponível',
            shared_with_name: profile?.full_name
          };
        })
      );

      setShares(sharesWithDetails);
    } catch (error: any) {
      console.error('Error fetching account shares:', error);
      toast.error('Erro ao carregar compartilhamentos da conta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, [user]);

  const addShare = async (email: string, accessLevel: 'view' | 'edit' = 'view') => {
    if (!user) return;

    try {
      // Find user by email
      const { data: userId, error: userError } = await supabase
        .rpc('get_user_id_by_email', { _email: email });

      if (userError) throw userError;
      
      if (!userId) {
        toast.error('Usuário não encontrado. Eles precisam criar uma conta primeiro.');
        return;
      }

      // Check if already shared
      const { data: existing } = await supabase
        .from('account_shares')
        .select('id')
        .eq('owner_user_id', user.id)
        .eq('shared_with_user_id', userId)
        .maybeSingle();

      if (existing) {
        toast.error('Sua conta já está compartilhada com este usuário');
        return;
      }

      const { error } = await supabase
        .from('account_shares')
        .insert({
          owner_user_id: user.id,
          shared_with_user_id: userId,
          granted_by_user_id: user.id,
          access_level: accessLevel
        });

      if (error) throw error;

      toast.success('Conta compartilhada com sucesso. O usuário agora tem acesso a todos os seus projetos.');
      fetchShares();
    } catch (error: any) {
      console.error('Error adding account share:', error);
      toast.error('Erro ao compartilhar conta');
    }
  };

  const updateShareAccess = async (shareId: string, accessLevel: 'view' | 'edit') => {
    try {
      const { error } = await supabase
        .from('account_shares')
        .update({ access_level: accessLevel })
        .eq('id', shareId);

      if (error) throw error;

      toast.success('Nível de acesso atualizado');
      fetchShares();
    } catch (error: any) {
      console.error('Error updating account share:', error);
      toast.error('Erro ao atualizar acesso');
    }
  };

  const removeShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('account_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      toast.success('Compartilhamento de conta removido');
      fetchShares();
    } catch (error: any) {
      console.error('Error removing account share:', error);
      toast.error('Erro ao remover compartilhamento');
    }
  };

  return {
    shares,
    loading,
    addShare,
    updateShareAccess,
    removeShare,
    refetch: fetchShares
  };
};
