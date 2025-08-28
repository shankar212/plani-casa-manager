import { useState, useEffect } from 'react';
import { useProjects } from './useProjects';

export const useProjectData = (projectId: string | undefined) => {
  const { getProjectById } = useProjects();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const projectData = await getProjectById(projectId);
        setProject(projectData);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, getProjectById]);

  return { project, loading, error };
};