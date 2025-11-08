
import { Home, Search, Settings, Bell, Folder, Archive, LogOut, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { title: "Home", icon: Home, url: "/" },
  { title: "Notificações", icon: Bell, url: "/notificacoes" },
  { title: "Projetos", icon: Folder, url: "/projetos" },
  { title: "Almoxarifado Digital", icon: Archive, url: "/almoxarifado" },
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
      "fixed left-0 top-0 h-screen gradient-primary shadow-xl transition-all duration-300 z-50 hidden md:flex flex-col",
      collapsed ? "w-20" : "w-72"
    )}>
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center">
              <span className="text-primary text-xl font-bold">P</span>
            </div>
            {!collapsed && (
              <div>
                <span className="font-bold text-xl text-white">Plani</span>
                <p className="text-xs text-white/70">Gestão de Projetos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                  "hover:bg-white/10 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                  isActive 
                    ? "bg-white text-primary shadow-lg font-semibold" 
                    : "text-white/90 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    collapsed ? "mx-auto" : ""
                  )} />
                  {!collapsed && (
                    <span className="flex-1 text-base">{item.title}</span>
                  )}
                  {!collapsed && isActive && (
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      
      {/* User Section */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 text-white/90">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email?.split('@')[0] || 'Usuário'}</p>
              <p className="text-xs text-white/60 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        
        <Button
          onClick={signOut}
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 p-3 h-auto text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-base">Sair</span>}
        </Button>
      </div>
      
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-24 w-8 h-8 bg-white border-2 border-primary/20 rounded-full flex items-center justify-center text-primary shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
      >
        <span className="text-lg font-bold">{collapsed ? "›" : "‹"}</span>
      </button>
    </div>
  );
};
