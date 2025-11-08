
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className={cn(
        "min-h-screen animate-fade-in",
        isMobile ? "ml-0 pb-20" : "ml-60"
      )}>
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
};
