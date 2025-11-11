import { Home, Bell, Folder, Archive, User, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const navigationItems = [
  { title: "Home", icon: Home, url: "/" },
  { title: "Notificações", icon: Bell, url: "/notificacoes" },
  { title: "Projetos", icon: Folder, url: "/projetos" },
  { title: "Almoxarifado", icon: Archive, url: "/almoxarifado" },
];

export const MobileBottomNav = () => {
  const { user, signOut } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setIsSheetOpen(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <nav className="flex justify-around items-center py-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors min-w-0 flex-1",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs truncate">{item.title}</span>
          </NavLink>
        ))}
        
        {/* Profile/Settings with Logout */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors min-w-0 flex-1",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="w-5 h-5 mb-1" />
              <span className="text-xs truncate">Perfil</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>Perfil do Usuário</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Conta</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              
              <Separator />
              
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full justify-start"
                size="lg"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sair da Conta
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};