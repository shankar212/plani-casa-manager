import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ProjectAccessLevel = 'owner' | 'edit' | 'view' | 'none';

export const useProjectAccess = (projectId: string | undefined) => {
  const { user } = useAuth();
  const [accessLevel, setAccessLevel] = useState<ProjectAccessLevel>('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!projectId || !user) {
        setAccessLevel('none');
        setLoading(false);
        return;
      }

      try {
        // Check if user is owner
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
          setAccessLevel(share.access_level as ProjectAccessLevel);
          setLoading(false);
          return;
        }

        // Check account shares
        const { data: accountShare } = await supabase
          .from('account_shares')
          .select('account_shares.id')
          .eq('shared_with_user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (accountShare) {
          setAccessLevel('view');
          setLoading(false);
          return;
        }

        setAccessLevel('none');
      } catch (error) {
        console.error('Error checking access:', error);
        setAccessLevel('none');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [projectId, user]);

  return {
    accessLevel,
    loading,
    canEdit: accessLevel === 'owner' || accessLevel === 'edit',
    canView: accessLevel !== 'none',
    isOwner: accessLevel === 'owner',
  };
};
