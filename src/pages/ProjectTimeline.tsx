import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ProjectHeader } from "@/components/ProjectHeader";
import { GanttChart } from "@/components/GanttChart";
import { useProject } from "@/contexts/ProjectContext";
import { useProjectData } from "@/hooks/useProjectData";
import { Card } from "@/components/ui/card";
import { Calendar, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export default function ProjectTimeline() {
  const { id } = useParams<{ id: string }>();
  const { project, loading: projectLoading } = useProjectData(id);
  const { etapas, loading: etapasLoading } = useProject();

  const loading = projectLoading || etapasLoading;

  // Calculate statistics
  const totalStages = etapas.length;
  const completedStages = etapas.filter(e => e.status === "finalizado").length;
  const inProgressStages = etapas.filter(e => e.status === "andamento").length;
  const totalDuration = etapas.reduce((sum, e) => sum + (parseInt(e.prazoEstimado || '0') || 0), 0);
  
  const allTasks = etapas.flatMap(e => e.tarefas || []);
  const completedTasks = allTasks.filter(t => t.completed).length;
  const totalTasks = allTasks.length;

  return (
    <Layout>
      <ProjectHeader 
        projectId={id || ""} 
        projectName={project?.name || ""} 
        loading={loading}
      />

      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Etapas</p>
                <p className="text-2xl font-bold">{totalStages}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Finalizadas</p>
                <p className="text-2xl font-bold">{completedStages}/{totalStages}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">{inProgressStages}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duração Total</p>
                <p className="text-2xl font-bold">{totalDuration} dias</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Task Progress Card */}
        {totalTasks > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Progresso de Tarefas</h3>
                <p className="text-sm text-muted-foreground">
                  {completedTasks} de {totalTasks} tarefas concluídas
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
              />
            </div>
          </Card>
        )}

        {/* Gantt Chart */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Cronograma do Projeto</h2>
          <GanttChart 
            stages={etapas.map(e => ({
              id: e.id,
              name: e.nome,
              start_date: e.dataInicio || null,
              estimated_duration_days: parseInt(e.prazoEstimado || '0') || null,
              status: e.status,
              progress_percentage: parseInt(e.progresso) || null,
              tasks: e.tarefas.map(t => ({
                id: t.id,
                name: t.nome,
                completed: t.completed || false,
              })),
            }))}
            projectStartDate={project?.start_date}
          />
        </div>

        {/* Milestones / Key Dates */}
        {project?.start_date && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Marcos do Projeto</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Data de Início</span>
                <span className="font-medium">{new Date(project.start_date).toLocaleDateString('pt-BR')}</span>
              </div>
              {project?.end_date && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Data de Término Prevista</span>
                  <span className="font-medium">{new Date(project.end_date).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Status do Projeto</span>
                <span className="font-medium">{project?.status}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
