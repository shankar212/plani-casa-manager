import { useState, useEffect } from "react";
import { X, Share, Plus, Smartphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const IOSInstallModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS device
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if modal was already shown
    const wasShown = localStorage.getItem('iosInstallModalShown');
    
    setIsIOS(isIOSDevice);
    
    // Show modal only on iOS Safari, not installed, and not previously shown
    if (isIOSDevice && !isStandalone && !wasShown) {
      // Show after 3 seconds to not interrupt initial experience
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('iosInstallModalShown', 'true');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Function to manually trigger modal (can be called from install page)
  useEffect(() => {
    const handleShowIOSModal = () => {
      if (isIOS) {
        setIsOpen(true);
      }
    };

    window.addEventListener('showIOSInstallModal', handleShowIOSModal);
    return () => window.removeEventListener('showIOSInstallModal', handleShowIOSModal);
  }, [isIOS]);

  if (!isIOS) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Smartphone className="w-6 h-6 text-primary" />
            Instalar PlaniTec no iPhone
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-muted-foreground">
            Siga estes passos simples para adicionar o PlaniTec à sua tela inicial:
          </p>

          {/* Step 1 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-2">
                  Toque no botão Compartilhar
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Procure o ícone de compartilhar na barra inferior ou superior do Safari
                </p>
                <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg border-2 border-dashed border-border">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" style={{ animationDuration: '3s' }} />
                    <div className="relative bg-primary/20 p-4 rounded-2xl">
                      <Share className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-2">
                  Selecione "Adicionar à Tela Inicial"
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Role para baixo no menu de compartilhamento e encontre esta opção
                </p>
                <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg border-2 border-dashed border-border">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
                    <div className="relative bg-primary/20 p-4 rounded-2xl">
                      <Plus className="w-12 h-12 text-primary" strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-2">
                  Confirme a instalação
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Toque em "Adicionar" no canto superior direito
                </p>
                <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-foreground text-center">
                    ✨ Pronto! O app aparecerá na sua tela inicial
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2 border border-border/50">
            <p className="font-semibold text-sm text-foreground">Benefícios:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Acesso rápido direto da tela inicial
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Funciona mesmo sem internet
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Experiência completa de aplicativo
              </li>
            </ul>
          </div>

          <Button
            onClick={() => setIsOpen(false)}
            className="w-full"
            size="lg"
          >
            Entendi!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
