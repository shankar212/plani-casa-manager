import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

interface ChangeStatusDialogProps {
  etapaName: string;
  currentStatus: 'finalizado' | 'andamento' | 'proximo';
  targetStatus: 'finalizado' | 'andamento' | 'proximo';
  onConfirm: () => void;
}

const statusLabels = {
  'proximo': 'Próximos',
  'andamento': 'Em andamento', 
  'finalizado': 'Finalizado'
};

const getStatusIcon = (status: 'finalizado' | 'andamento' | 'proximo') => {
  switch (status) {
    case 'finalizado':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'andamento':
      return <ArrowRight className="w-4 h-4" />;
    case 'proximo':
      return <ArrowLeft className="w-4 h-4" />;
  }
};

const getButtonVariant = (targetStatus: 'finalizado' | 'andamento' | 'proximo') => {
  switch (targetStatus) {
    case 'finalizado':
      return 'default';
    case 'andamento':
      return 'secondary';
    case 'proximo':
      return 'outline';
  }
};

export const ChangeStatusDialog = ({ etapaName, currentStatus, targetStatus, onConfirm }: ChangeStatusDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          size="sm" 
          variant={getButtonVariant(targetStatus)}
          className="h-8 px-2"
        >
          {getStatusIcon(targetStatus)}
          <span className="ml-1 text-xs">{statusLabels[targetStatus]}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Alterar Status da Etapa</AlertDialogTitle>
          <AlertDialogDescription>
            Você tem certeza que deseja mover a etapa "{etapaName}" de "{statusLabels[currentStatus]}" para "{statusLabels[targetStatus]}"?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};