import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, UserPlus, Trash2, Info } from 'lucide-react';
import { useAccountShares } from '@/hooks/useAccountShares';
import { z } from 'zod';

const emailSchema = z.string().email({ message: 'Email inválido' });

export const AccountShareDialog = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [deleteShareId, setDeleteShareId] = useState<string | null>(null);
  
  const { shares, loading, addShare, removeShare } = useAccountShares();

  const handleAddShare = async () => {
    // Validate email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError('Por favor, insira um email válido');
      return;
    }
    
    setEmailError('');
    await addShare(email);
    setEmail('');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Compartilhar Conta
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compartilhar Todos os Projetos</DialogTitle>
            <DialogDescription>
              Dê acesso a todos os seus projetos para outro usuário
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Ao compartilhar sua conta, o usuário terá acesso de visualização a <strong>todos os seus projetos atuais e futuros</strong>.
              </AlertDescription>
            </Alert>

            {/* Add new share */}
            <Card className="p-4">
              <div className="flex items-start gap-4">
                <UserPlus className="w-5 h-5 mt-2 text-muted-foreground" />
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email do usuário</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@exemplo.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }}
                    />
                    {emailError && (
                      <p className="text-sm text-destructive">{emailError}</p>
                    )}
                  </div>

                  <Button onClick={handleAddShare} className="w-full">
                    Compartilhar Todos os Projetos
                  </Button>
                </div>
              </div>
            </Card>

            {/* Current shares */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Usuários com acesso à sua conta</h3>
              
              {loading ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Carregando...
                </div>
              ) : shares.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Nenhum compartilhamento de conta ainda
                </div>
              ) : (
                <div className="space-y-2">
                  {shares.map((share) => (
                    <Card key={share.id} className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {share.shared_with_name || 'Usuário'}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {share.shared_with_email}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Acesso a todos os projetos
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteShareId(share.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteShareId} onOpenChange={() => setDeleteShareId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover acesso à conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Este usuário perderá acesso a todos os seus projetos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteShareId) {
                  removeShare(deleteShareId);
                  setDeleteShareId(null);
                }
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
