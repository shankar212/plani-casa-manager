import { useState } from 'react';
import {
  SwipeableDialog as Dialog,
  SwipeableDialogContent as DialogContent,
  SwipeableDialogDescription as DialogDescription,
  SwipeableDialogHeader as DialogHeader,
  SwipeableDialogTitle as DialogTitle,
  SwipeableDialogTrigger as DialogTrigger,
} from '@/components/ui/swipeable-dialog';
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
import { Badge } from '@/components/ui/badge';
import { Share2, UserPlus, Trash2, Eye, Edit } from 'lucide-react';
import { useProjectShares } from '@/hooks/useProjectShares';
import { z } from 'zod';

interface ProjectShareDialogProps {
  projectId: string;
  projectName: string;
}

const emailSchema = z.string().email({ message: 'Email inválido' });

export const ProjectShareDialog = ({ projectId, projectName }: ProjectShareDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState<'view' | 'edit'>('view');
  const [emailError, setEmailError] = useState('');
  const [deleteShareId, setDeleteShareId] = useState<string | null>(null);
  
  const { shares, loading, addShare, updateAccessLevel, removeShare } = useProjectShares(projectId);

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

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'view':
        return <Eye className="w-4 h-4" />;
      case 'edit':
        return <Edit className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case 'view':
        return 'Visualizar';
      case 'edit':
        return 'Editar';
      default:
        return level;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto" onOpenChange={setOpen}>
          <DialogHeader>
            <DialogTitle>Compartilhar Projeto</DialogTitle>
            <DialogDescription>
              Gerencie quem tem acesso a "{projectName}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
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

                  <div className="space-y-2">
                    <Label htmlFor="access-level">Nível de acesso</Label>
                    <Select
                      value={accessLevel}
                      onValueChange={(value: any) => setAccessLevel(value)}
                    >
                      <SelectTrigger id="access-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Visualizar</div>
                              <div className="text-xs text-muted-foreground">
                                Pode ver o projeto
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="edit">
                          <div className="flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Editar</div>
                              <div className="text-xs text-muted-foreground">
                                Pode editar o projeto
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleAddShare} className="w-full">
                    Compartilhar
                  </Button>
                </div>
              </div>
            </Card>

            {/* Current shares */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Pessoas com acesso</h3>
              
              {loading ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Carregando...
                </div>
              ) : shares.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Nenhum compartilhamento ainda
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
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Select
                            value={share.access_level}
                            onValueChange={(value: any) =>
                              updateAccessLevel(share.id, value)
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  {getAccessLevelIcon(share.access_level)}
                                  <span className="text-sm">
                                    {getAccessLevelLabel(share.access_level)}
                                  </span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="view">
                                <div className="flex items-center gap-2">
                                  <Eye className="w-4 h-4" />
                                  Visualizar
                                </div>
                              </SelectItem>
                              <SelectItem value="edit">
                                <div className="flex items-center gap-2">
                                  <Edit className="w-4 h-4" />
                                  Editar
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            size="icon"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover acesso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta pessoa não terá mais acesso ao projeto. Esta ação não pode ser desfeita.
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
