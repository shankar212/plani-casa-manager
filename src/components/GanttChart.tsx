import { useMemo } from "react";
import { format, parseISO, addDays, differenceInDays, startOfDay } from "date-fns";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

interface Stage {
  id: string;
  name: string;
  start_date: string | null;
  estimated_duration_days: number | null;
  status: "finalizado" | "andamento" | "proximo";
  progress_percentage: number | null;
  tasks?: Task[];
}

interface GanttChartProps {
  stages: Stage[];
  projectStartDate?: string | null;
}

export const GanttChart = ({ stages, projectStartDate }: GanttChartProps) => {
  const chartData = useMemo(() => {
    if (!stages.length) return null;

    // Find the earliest start date
    const dates = stages
      .filter(s => s.start_date)
      .map(s => parseISO(s.start_date!));
    
    const projectStart = projectStartDate 
      ? parseISO(projectStartDate)
      : dates.length > 0 
        ? new Date(Math.min(...dates.map(d => d.getTime())))
        : new Date();

    // Calculate end dates for all stages
    const stagesWithDates = stages.map(stage => {
      const startDate = stage.start_date 
        ? parseISO(stage.start_date) 
        : projectStart;
      const duration = stage.estimated_duration_days || 30;
      const endDate = addDays(startDate, duration);
      
      return {
        ...stage,
        startDate,
        endDate,
        duration,
      };
    });

    // Find the latest end date
    const latestEnd = new Date(
      Math.max(...stagesWithDates.map(s => s.endDate.getTime()))
    );

    const totalDays = differenceInDays(latestEnd, projectStart) + 1;
    const today = startOfDay(new Date());

    return {
      projectStart,
      latestEnd,
      totalDays,
      stages: stagesWithDates,
      today,
    };
  }, [stages, projectStartDate]);

  if (!chartData) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Nenhuma etapa encontrada. Adicione etapas ao projeto para visualizar a linha do tempo.
        </p>
      </Card>
    );
  }

  const { projectStart, totalDays, stages: stagesWithDates, today } = chartData;

  const getStatusColor = (status: Stage["status"]) => {
    switch (status) {
      case "finalizado":
        return "bg-green-500";
      case "andamento":
        return "bg-blue-500";
      case "proximo":
        return "bg-gray-300";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusIcon = (status: Stage["status"]) => {
    switch (status) {
      case "finalizado":
        return <CheckCircle2 className="h-4 w-4" />;
      case "andamento":
        return <Clock className="h-4 w-4" />;
      case "proximo":
        return <Circle className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getPositionAndWidth = (startDate: Date, duration: number) => {
    const startOffset = differenceInDays(startDate, projectStart);
    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    return { left: `${Math.max(0, left)}%`, width: `${Math.min(100 - left, width)}%` };
  };

  const todayPosition = differenceInDays(today, projectStart);
  const todayPercentage = (todayPosition / totalDays) * 100;

  // Generate timeline markers (months or weeks depending on duration)
  const timelineMarkers = useMemo(() => {
    const markers: { date: Date; label: string; position: number }[] = [];
    const showMonths = totalDays > 90;
    
    if (showMonths) {
      let currentDate = new Date(projectStart);
      while (currentDate <= addDays(projectStart, totalDays)) {
        const daysFromStart = differenceInDays(currentDate, projectStart);
        markers.push({
          date: currentDate,
          label: format(currentDate, "MMM yyyy"),
          position: (daysFromStart / totalDays) * 100,
        });
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      }
    } else {
      // Show weeks
      for (let i = 0; i <= totalDays; i += 7) {
        const date = addDays(projectStart, i);
        markers.push({
          date,
          label: format(date, "dd/MM"),
          position: (i / totalDays) * 100,
        });
      }
    }
    
    return markers;
  }, [projectStart, totalDays]);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Timeline header */}
        <div className="relative h-12 border-b border-border">
          {timelineMarkers.map((marker, idx) => (
            <div
              key={idx}
              className="absolute bottom-0 flex flex-col items-center"
              style={{ left: `${marker.position}%` }}
            >
              <div className="h-2 w-px bg-border" />
              <span className="text-xs text-muted-foreground mt-1">{marker.label}</span>
            </div>
          ))}
          
          {/* Today indicator */}
          {todayPercentage >= 0 && todayPercentage <= 100 && (
            <div
              className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
              style={{ left: `${todayPercentage}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-1 rounded whitespace-nowrap">
                Hoje
              </div>
            </div>
          )}
        </div>

        {/* Gantt bars */}
        <div className="space-y-4">
          {stagesWithDates.map((stage) => {
            const { left, width } = getPositionAndWidth(stage.startDate, stage.duration);
            const completedTasks = stage.tasks?.filter(t => t.completed).length || 0;
            const totalTasks = stage.tasks?.length || 0;

            return (
              <div key={stage.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(stage.status)}
                  <span className="text-sm font-medium">{stage.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {stage.duration} dias
                  </Badge>
                  {totalTasks > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {completedTasks}/{totalTasks} tarefas
                    </Badge>
                  )}
                </div>
                
                <div className="relative h-8 bg-muted rounded-md overflow-hidden">
                  <div
                    className={`absolute h-full ${getStatusColor(stage.status)} rounded-md transition-all flex items-center px-2`}
                    style={{ left, width }}
                  >
                    {stage.progress_percentage != null && (
                      <div className="absolute inset-0 bg-white/20" style={{ width: `${100 - stage.progress_percentage}%`, right: 0, left: 'auto' }} />
                    )}
                    <span className="text-xs text-white font-medium relative z-10">
                      {stage.progress_percentage != null ? `${stage.progress_percentage}%` : ''}
                    </span>
                  </div>
                </div>

                {/* Tasks */}
                {stage.tasks && stage.tasks.length > 0 && (
                  <div className="ml-6 space-y-1">
                    {stage.tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        {task.completed ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <Circle className="h-3 w-3" />
                        )}
                        <span className={task.completed ? "line-through" : ""}>{task.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-xs text-muted-foreground">Finalizado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-xs text-muted-foreground">Em Andamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded" />
            <span className="text-xs text-muted-foreground">Próximo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-px h-4 bg-red-500" />
            <span className="text-xs text-muted-foreground">Hoje</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
