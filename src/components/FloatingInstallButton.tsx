import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const FloatingInstallButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed or dismissed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    const wasDismissed = localStorage.getItem('installButtonDismissed');
    
    if (isInstalled || wasDismissed) {
      return;
    }

    const handleScroll = () => {
      // Show button after scrolling down 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    localStorage.setItem('installButtonDismissed', 'true');
  };

  const handleClick = () => {
    navigate("/install");
  };

  if (isDismissed) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 animate-pulse" style={{ animationDuration: '3s' }} />
        
        {/* Button */}
        <Button
          onClick={handleClick}
          size="lg"
          className="relative shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110 gap-2 pr-4 pl-5 rounded-full bg-gradient-to-r from-primary to-primary/90"
        >
          <Download className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />
          <span className="font-semibold">Instalar App</span>
        </Button>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-border hover:border-destructive hover:bg-destructive/10 transition-all duration-200 flex items-center justify-center group/close opacity-0 group-hover:opacity-100"
          aria-label="Dispensar"
        >
          <X className="w-3 h-3 text-muted-foreground group-hover/close:text-destructive" />
        </button>
      </div>
    </div>
  );
};
