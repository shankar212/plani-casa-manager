
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { FloatingInstallButton } from "./FloatingInstallButton";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

import { PageTransition } from "./PageTransition";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Sidebar />
      <main className={cn(
        "min-h-screen animate-fade-in max-w-full overflow-x-hidden transition-all duration-300 ease-in-out",
        isMobile ? "ml-0 pb-20" : "ml-60"
      )}>
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <MobileBottomNav />
      <FloatingInstallButton />
    </div>
  );
};
