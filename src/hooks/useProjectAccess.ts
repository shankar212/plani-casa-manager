import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AccessLevel = 'owner' | 'edit' | 'view' | null;

export const useProjectAccess = (projectId: string | undefined) => {
  const { user } = useAuth();
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!projectId || !user) {
        setAccessLevel(null);
        setLoading(false);
        return;
      }

      try {
        // Check if owner
        const { data: project } = await supabase
          .from('projects')
          .select('user_id')
          .eq('id', projectId)
          .single();

        if (project?.user_id === user.id) {
          setAccessLevel('owner');
          setLoading(false);
          return;
        }

        // Check project shares
        const { data: share } = await supabase
          .from('project_shares')
          .select('access_level')
          .eq('project_id', projectId)
          .eq('shared_with_user_id', user.id)
          .maybeSingle();

        if (share) {
          setAccessLevel(share.access_level as 'edit' | 'view');
          setLoading(false);
          return;
        }

        // Check account shares
        const { data: accountShare } = await supabase
          .from('account_shares')
          .select('account_shares.id, projects!inner(id)')
          .eq('shared_with_user_id', user.id)
          .eq('projects.id', projectId)
          .maybeSingle();

        if (accountShare) {
          setAccessLevel('view');
          setLoading(false);
          return;
        }

        setAccessLevel(null);
      } catch (error) {
        console.error('Error checking access:', error);
        setAccessLevel(null);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [projectId, user]);

  const canEdit = accessLevel === 'owner' || accessLevel === 'edit';
  const canView = accessLevel !== null;
  const isOwner = accessLevel === 'owner';

  return {
    accessLevel,
    loading,
    canEdit,
    canView,
    isOwner
  };
};
