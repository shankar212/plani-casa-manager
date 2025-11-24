import { useState } from 'react';
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogDescription as DialogDescription,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
  ResponsiveDialogTrigger as DialogTrigger,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Trash2, Info, Eye, Edit } from 'lucide-react';
import { useAccountShares } from '@/hooks/useAccountShares';
import { z } from 'zod';

const emailSchema = z.string().email({ message: 'Email inválido' });

export const AccountShareDialog = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [accessLevel, setAccessLevel] = useState<'view' | 'edit'>('view');
  const [deleteShareId, setDeleteShareId] = useState<string | null>(null);
  
  const { shares, loading, addShare, updateShareAccess, removeShare } = useAccountShares();

  const handleAddShare = async () => {
    // Validate email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError('Por favor, insira um email válido');
      return;
    }
    
    setEmailError('');
    await addShare(email, accessLevel);
    setEmail('');
    setAccessLevel('view');
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
        <DialogContent className="w-full max-w-none sm:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-y-auto">
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
                Ao compartilhar sua conta, o usuário terá acesso a <strong>todos os seus projetos atuais e futuros</strong> conforme o nível de acesso selecionado.
              </AlertDescription>
            </Alert>

            {/* Add new share */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <UserPlus className="w-5 h-5 mt-2 text-muted-foreground hidden sm:block" />
                <div className="flex-1 w-full space-y-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="access-level">Nível de Acesso</Label>
                    <Select value={accessLevel} onValueChange={(value: 'view' | 'edit') => setAccessLevel(value)}>
                      <SelectTrigger id="access-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Visualizar</div>
                              <div className="text-xs text-muted-foreground">Pode ver todos os projetos</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="edit">
                          <div className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Editar</div>
                              <div className="text-xs text-muted-foreground">Pode ver e editar todos os projetos</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : shares.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Nenhum compartilhamento de conta ainda
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {shares.map((share) => (
                    <Card key={share.id} className="p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-sm sm:text-base">
                            {share.shared_with_name || 'Usuário'}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate break-all">
                            {share.shared_with_email}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={share.access_level === 'edit' ? 'default' : 'secondary'} className="text-xs">
                              {share.access_level === 'view' ? (
                                <><Eye className="w-3 h-3 mr-1" /> Visualizar</>
                              ) : (
                                <><Edit className="w-3 h-3 mr-1" /> Editar</>
                              )}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-stretch gap-2">
                          <Select
                            value={share.access_level}
                            onValueChange={(value: 'view' | 'edit') => updateShareAccess(share.id, value)}
                          >
                            <SelectTrigger className="flex-1 h-10 touch-manipulation">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="view">Visualizar</SelectItem>
                              <SelectItem value="edit">Editar</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 shrink-0 touch-manipulation"
                            onClick={() => setDeleteShareId(share.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
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
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover acesso à conta?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                {deleteShareId && shares.find(s => s.id === deleteShareId)?.shared_with_name && (
                  <span className="font-medium text-foreground">
                    {shares.find(s => s.id === deleteShareId)?.shared_with_name}
                  </span>
                )}
                {deleteShareId && shares.find(s => s.id === deleteShareId)?.shared_with_email && (
                  <span className="block text-sm text-muted-foreground mt-1">
                    ({shares.find(s => s.id === deleteShareId)?.shared_with_email})
                  </span>
                )}
              </p>
              <p className="text-sm">
                Este usuário perderá acesso a <strong>todos os seus projetos</strong>. Esta ação não pode ser desfeita.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto touch-manipulation min-h-[44px]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteShareId) {
                  removeShare(deleteShareId);
                  setDeleteShareId(null);
                }
              }}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90 touch-manipulation min-h-[44px]"
            >
              Remover Acesso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
