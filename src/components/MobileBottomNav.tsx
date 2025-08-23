import { Home, Bell, Folder, Archive, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "Home", icon: Home, url: "/" },
  { title: "Notificações", icon: Bell, url: "/notificacoes" },
  { title: "Projetos", icon: Folder, url: "/projetos" },
  { title: "Almoxarifado", icon: Archive, url: "/almoxarifado" },
  { title: "Configurações", icon: Settings, url: "/configuracoes" },
];

export const MobileBottomNav = () => {
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
      </nav>
    </div>
  );
};