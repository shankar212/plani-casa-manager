import { useProjectActivity } from '@/hooks/useProjectActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileEdit, 
  Trash2, 
  UserPlus, 
  CheckCircle2, 
  Clock,
  Settings,
  Package,
  ListChecks
} from 'lucide-react';

interface ProjectActivityLogProps {
  projectId: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'project_shared':
      return <UserPlus className="h-4 w-4" />;
    case 'project_activity':
      return <FileEdit className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
};

const getActivityColor = (message: string) => {
  if (message.includes('removeu') || message.includes('deletou')) {
    return 'destructive';
  }
  if (message.includes('concluiu') || message.includes('completou')) {
    return 'default';
  }
  if (message.includes('adicionou') || message.includes('criou')) {
    return 'secondary';
  }
  return 'outline';
};

const getActivityItemIcon = (message: string) => {
  if (message.includes('material')) {
    return <Package className="h-3 w-3" />;
  }
  if (message.includes('tarefa')) {
    return <ListChecks className="h-3 w-3" />;
  }
  if (message.includes('etapa')) {
    return <Clock className="h-3 w-3" />;
  }
  if (message.includes('removeu') || message.includes('deletou')) {
    return <Trash2 className="h-3 w-3" />;
  }
  if (message.includes('concluiu')) {
    return <CheckCircle2 className="h-3 w-3" />;
  }
  return <FileEdit className="h-3 w-3" />;
};

export const ProjectActivityLog = ({ projectId }: ProjectActivityLogProps) => {
  const { activities, loading } = useProjectActivity(projectId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhuma atividade registrada ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Atividades</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-3 pb-4 border-b border-border last:border-0"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-medium leading-tight">
                      {activity.title}
                    </h4>
                    <Badge variant={getActivityColor(activity.message)} className="flex-shrink-0 text-xs">
                      {getActivityItemIcon(activity.message)}
                      <span className="ml-1">
                        {activity.message.includes('etapa') ? 'Etapa' :
                         activity.message.includes('tarefa') ? 'Tarefa' :
                         activity.message.includes('material') ? 'Material' : 
                         activity.message.includes('compartilhou') ? 'Acesso' : 'Projeto'}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
