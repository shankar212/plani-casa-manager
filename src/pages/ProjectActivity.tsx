import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AnimatedBreadcrumbs } from '@/components/AnimatedBreadcrumbs';
import { ProjectActivityLog } from '@/components/ProjectActivityLog';
import { useProjectData } from '@/hooks/useProjectData';
import { Skeleton } from '@/components/ui/skeleton';

const ProjectActivity = () => {
  const { id } = useParams<{ id: string }>();
  const { project, loading } = useProjectData(id);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[600px]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <AnimatedBreadcrumbs />
        
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Histórico de Atividades</h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe todas as modificações, exclusões e alterações feitas no projeto
            </p>
          </div>

          {id && <ProjectActivityLog projectId={id} />}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectActivity;
