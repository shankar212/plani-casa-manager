import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Settings, Check, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  project_id: string | null;
  created_at: string;
  read: boolean;
  projects?: {
    name: string;
  };
}

const typeColors = {
  gestao: "bg-blue-500",
  pedidos: "bg-orange-500", 
  entregas: "bg-green-500",
  conformidade: "bg-purple-500"
};

const typeLabels = {
  gestao: "Gestão",
  pedidos: "Pedidos",
  entregas: "Entregas", 
  conformidade: "Conformidade"
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      let query = supabase
        .from("notifications")
        .select(`
          *,
          projects (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        if (filter === "unread") {
          query = query.eq("read", false);
        } else {
          query = query.eq("type", filter);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar notificações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );

      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas"
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
                <SelectItem value="gestao">Gestão</SelectItem>
                <SelectItem value="pedidos">Pedidos</SelectItem>
                <SelectItem value="entregas">Entregas</SelectItem>
                <SelectItem value="conformidade">Conformidade</SelectItem>
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
          {notifications.length === 0 ? (
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
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-colors ${
                  notification.read ? "bg-card" : "bg-card border-l-4 border-l-primary"
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge 
                          variant="secondary" 
                          className={`${typeColors[notification.type as keyof typeof typeColors]} text-white text-xs`}
                        >
                          {typeLabels[notification.type as keyof typeof typeLabels]}
                        </Badge>
                        {notification.projects?.name && (
                          <Badge variant="outline" className="text-xs">
                            {notification.projects.name}
                          </Badge>
                        )}
                        {!notification.read && (
                          <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      
                      <p className="text-sm md:text-base font-medium mb-1 break-words">{notification.message}</p>
                      
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