
import { Home, Search, Settings, Bell, Folder, Archive, LogOut, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigationItems = [
  { title: "Home", icon: Home, url: "/" },
  { title: "Notificações", icon: Bell, url: "/notificacoes" },
  { title: "Projetos", icon: Folder, url: "/projetos" },
  { title: "Almoxarifado Digital", icon: Archive, url: "/almoxarifado" },
  { title: "Configurações", icon: Settings, url: "/configuracoes" },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut, loading } = useAuth();

  // Don't render anything if auth is still loading
  if (loading) {
    return null;
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="p-4">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          {!collapsed && <span className="font-bold text-lg">PlaniTec</span>}
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={collapsed ? "" : "Pesquisar"}
              className={cn(
                "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm",
                collapsed && "pl-8"
              )}
            />
          </div>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive }) =>
                cn(
                  "flex items-center p-3 rounded-lg transition-colors hover:bg-gray-100",
                  isActive && "bg-gray-100 font-medium"
                )
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>
        
        <Separator className="my-4" />
        
        {/* User info and logout */}
        <div className="space-y-2">
          <div className="flex items-center p-3 text-sm text-muted-foreground">
            <User className="w-4 h-4 mr-3" />
            {!collapsed && (
              <div className="truncate">
                {user?.email}
              </div>
            )}
          </div>
          <Button
            onClick={signOut}
            variant="ghost"
            className="w-full justify-start p-3 h-auto hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4 mr-3" />
            {!collapsed && <span>Sair</span>}
          </Button>
        </div>
      </div>
      
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50"
      >
        {collapsed ? "›" : "‹"}
      </button>
    </div>
  );
};
