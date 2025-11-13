import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProjectRealtime = (projectId: string | undefined, onUpdate: () => void) => {
  useEffect(() => {
    if (!projectId) return;

    // Subscribe to project changes
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
          console.log('Project change detected:', payload);
          if (payload.eventType === 'UPDATE') {
            toast.info('Projeto atualizado por outro usuário');
            onUpdate();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_stages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Stage change detected:', payload);
          if (payload.eventType === 'INSERT') {
            toast.info('Nova etapa adicionada');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Etapa atualizada');
          } else if (payload.eventType === 'DELETE') {
            toast.info('Etapa removida');
          }
          onUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks'
        },
        (payload) => {
          console.log('Task change detected:', payload);
          if (payload.eventType === 'INSERT') {
            toast.info('Nova tarefa adicionada');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Tarefa atualizada');
          } else if (payload.eventType === 'DELETE') {
            toast.info('Tarefa removida');
          }
          onUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'materials',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Material change detected:', payload);
          if (payload.eventType === 'INSERT') {
            toast.info('Novo material adicionado');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Material atualizado');
          } else if (payload.eventType === 'DELETE') {
            toast.info('Material removido');
          }
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectChannel);
    };
  }, [projectId, onUpdate]);
};
