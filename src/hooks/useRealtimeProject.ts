import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeProjectOptions {
  projectId?: string;
  onProjectUpdate?: () => void;
  onStageUpdate?: () => void;
  onTaskUpdate?: () => void;
  onMaterialUpdate?: () => void;
}

export const useRealtimeProject = ({
  projectId,
  onProjectUpdate,
  onStageUpdate,
  onTaskUpdate,
  onMaterialUpdate,
}: UseRealtimeProjectOptions) => {
  useEffect(() => {
    if (!projectId) return;

    const channels: RealtimeChannel[] = [];

    // Subscribe to project updates
    if (onProjectUpdate) {
      const projectChannel = supabase
        .channel(`project-${projectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'projects',
            filter: `id=eq.${projectId}`
          },
          (payload) => {
            console.log('Project updated:', payload);
            onProjectUpdate();
          }
        )
        .subscribe();
      
      channels.push(projectChannel);
    }

    // Subscribe to stage updates
    if (onStageUpdate) {
      const stageChannel = supabase
        .channel(`stages-${projectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'project_stages',
            filter: `project_id=eq.${projectId}`
          },
          (payload) => {
            console.log('Stage updated:', payload);
            onStageUpdate();
          }
        )
        .subscribe();
      
      channels.push(stageChannel);
    }

    // Subscribe to task updates
    if (onTaskUpdate) {
      const taskChannel = supabase
        .channel(`tasks-${projectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'project_tasks'
          },
          (payload) => {
            console.log('Task updated:', payload);
            onTaskUpdate();
          }
        )
        .subscribe();
      
      channels.push(taskChannel);
    }

    // Subscribe to material updates
    if (onMaterialUpdate) {
      const materialChannel = supabase
        .channel(`materials-${projectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'materials',
            filter: `project_id=eq.${projectId}`
          },
          (payload) => {
            console.log('Material updated:', payload);
            onMaterialUpdate();
          }
        )
        .subscribe();
      
      channels.push(materialChannel);
    }

    // Cleanup function
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [projectId, onProjectUpdate, onStageUpdate, onTaskUpdate, onMaterialUpdate]);
};
