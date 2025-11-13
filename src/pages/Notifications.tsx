import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Settings, Check, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  project_id: string | null;
  created_at: string;
  read: boolean;
}

const typeColors: Record<string, string> = {
  gestao: "bg-blue-500",
  pedidos: "bg-orange-500", 
  entregas: "bg-green-500",
  conformidade: "bg-purple-500",
  project_shared: "bg-indigo-500",
  project_activity: "bg-teal-500",
  task_update: "bg-amber-500",
  stage_complete: "bg-emerald-500",
};

const typeLabels: Record<string, string> = {
  gestao: "Gestão",
  pedidos: "Pedidos",
  entregas: "Entregas", 
  conformidade: "Conformidade",
  project_shared: "Compartilhamento",
  project_activity: "Atividade",
  task_update: "Tarefa",
  stage_complete: "Etapa",
};

export default function Notifications() {
  const [filter, setFilter] = useState<string>("all");
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useRealtimeNotifications();
  const navigate = useNavigate();

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    return notification.type === filter;
  });

  const handleNotificationClick = async (notificationId: string, projectId: string | null) => {
    await markAsRead(notificationId);
    if (projectId) {
      navigate(`/projetos/${projectId}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Notificações</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} não lidas` : "Todas as notificações estão em dia"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">Não lidas</SelectItem>
                <SelectItem value="project_shared">Compartilhamento</SelectItem>
                <SelectItem value="project_activity">Atividade</SelectItem>
                <SelectItem value="task_update">Tarefas</SelectItem>
                <SelectItem value="stage_complete">Etapas</SelectItem>
                <SelectItem value="gestao">Gestão</SelectItem>
                <SelectItem value="pedidos">Pedidos</SelectItem>
                <SelectItem value="entregas">Entregas</SelectItem>
              </SelectContent>
            </Select>

            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" className="w-full sm:w-auto">
                <Check className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Marcar todas como lidas</span>
                <span className="sm:hidden">Marcar todas</span>
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma notificação encontrada</h3>
                  <p className="text-muted-foreground">
                    {filter === "all" ? "Você não tem notificações" : "Nenhuma notificação corresponde aos filtros selecionados"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-colors hover:shadow-md ${
                  notification.read ? "bg-card" : "bg-card border-l-4 border-l-primary"
                }`}
                onClick={() => handleNotificationClick(notification.id, notification.project_id)}
              >
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge 
                          variant="secondary" 
                          className={`${typeColors[notification.type]} text-white text-xs`}
                        >
                          {typeLabels[notification.type] || notification.type}
                        </Badge>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      
                      <h3 className="font-semibold mb-1">{notification.title}</h3>
                      <p className="text-sm md:text-base text-muted-foreground mb-2 break-words">{notification.message}</p>
                      
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}