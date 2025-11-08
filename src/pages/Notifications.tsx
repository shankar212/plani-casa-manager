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
        <div className="min-h-screen">
          <div className="gradient-hero border-b border-border/50">
            <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted/50 rounded w-1/4"></div>
                <div className="h-12 bg-muted/50 rounded w-2/4"></div>
              </div>
            </div>
          </div>
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section with Gradient */}
        <div className="gradient-hero border-b border-border/50">
          <div className="p-4 md:p-8 lg:p-12 space-y-6 max-w-7xl mx-auto">
            <div className="space-y-4 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <Bell className="h-4 w-4" />
                Central de Notificações
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Suas <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Notificações</span>
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-lg md:text-xl text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} ${unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'}` : "Todas as notificações estão em dia"}
                </p>
                {unreadCount > 0 && (
                  <div className="px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Filters and Actions */}
          <div className="flex items-center justify-between gap-4 flex-wrap bg-card rounded-xl border border-border/50 p-4 shadow-sm">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px] shadow-sm">
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
              <Button onClick={markAllAsRead} variant="outline" className="shadow-sm hover:shadow-md">
                <Check className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <Card className="border-dashed border-2 border-border/50 bg-muted/20 hover:border-primary/30 transition-all duration-300">
                <CardContent className="flex items-center justify-center py-16">
                  <div className="text-center space-y-6">
                    <div className="p-6 rounded-full bg-primary/5 inline-block">
                      <Bell className="h-16 w-16 text-primary/40" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-foreground">Nenhuma notificação encontrada</h3>
                      <p className="text-base text-muted-foreground max-w-md">
                        {filter === "all" ? "Você não tem notificações no momento" : "Nenhuma notificação corresponde aos filtros selecionados"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification, index) => (
                <div key={notification.id} className={`animate-fade-in-up animate-stagger-${Math.min(index % 4 + 1, 4)}`}>
                  <Card 
                    className={`group cursor-pointer transition-all duration-300 hover:shadow-lg border-border/50 hover:border-primary/30 ${
                      notification.read 
                        ? "bg-card hover:scale-[1.01]" 
                        : "bg-gradient-to-br from-primary/5 to-primary/10 border-l-4 border-l-primary hover:scale-[1.02] shadow-md"
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge 
                              variant="secondary" 
                              className={`${typeColors[notification.type as keyof typeof typeColors]} text-white shadow-sm`}
                            >
                              {typeLabels[notification.type as keyof typeof typeLabels]}
                            </Badge>
                            {notification.projects?.name && (
                              <Badge variant="outline" className="border-border/50 bg-background/50">
                                {notification.projects.name}
                              </Badge>
                            )}
                            {!notification.read && (
                              <div className="flex items-center gap-2 text-primary">
                                <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                                <span className="text-xs font-semibold uppercase tracking-wide">Nova</span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                            {notification.message}
                          </p>
                          
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </span>
                          </p>
                        </div>
                        
                        {!notification.read && (
                          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}