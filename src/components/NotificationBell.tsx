import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtimeNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (notificationId: string, projectId: string | null) => {
    await markAsRead(notificationId);
    if (projectId) {
      navigate(`/projetos/${projectId}`);
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[400px]">
          {recentNotifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            <div className="space-y-1">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-accent cursor-pointer transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification.id, notification.project_id)}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 5 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/notificacoes')}
              >
                Ver todas as notificações
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};