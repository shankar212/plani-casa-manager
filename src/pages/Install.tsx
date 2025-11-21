import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Download, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if prompt was already captured
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(prompt);
      (window as any).deferredPrompt = prompt;
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Smartphone className="w-12 h-12 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Instalar PlaniTec</h1>
              <p className="text-muted-foreground">
                Instale o aplicativo em seu dispositivo para acesso rápido e melhor experiência
              </p>
            </div>

            {isInstalled ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">Aplicativo já instalado!</span>
                </div>
                <Button onClick={() => navigate('/')} size="lg">
                  Ir para o Início
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-left">
                  <h2 className="font-semibold text-lg">Benefícios da instalação:</h2>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Acesso rápido direto da tela inicial</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Funciona offline com cache inteligente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Experiência completa sem navegador</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Atualizações automáticas</span>
                    </li>
                  </ul>
                </div>

                {deferredPrompt ? (
                  <Button onClick={handleInstall} size="lg" className="w-full md:w-auto">
                    <Download className="w-5 h-5 mr-2" />
                    Instalar Aplicativo
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Para instalar este aplicativo:
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 text-sm text-left space-y-2">
                      <p><strong>No iPhone/iPad:</strong> Toque no botão "Compartilhar" e selecione "Adicionar à Tela Inicial"</p>
                      <p><strong>No Android:</strong> Abra o menu do navegador e selecione "Instalar aplicativo" ou "Adicionar à tela inicial"</p>
                    </div>
                  </div>
                )}

                <Button onClick={() => navigate('/')} variant="outline" size="lg" className="w-full md:w-auto">
                  Continuar no Navegador
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
