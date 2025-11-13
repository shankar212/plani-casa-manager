import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProjectTemplates, CreateTemplateData } from "@/hooks/useProjectTemplates";
import { Save } from "lucide-react";

interface SaveTemplateDialogProps {
  projectData: {
    construction_type?: string;
    status?: string;
    client?: string;
    engineer?: string;
    team?: string;
    estimated_duration_days?: number;
  };
  trigger?: React.ReactNode;
}

export const SaveTemplateDialog = ({ projectData, trigger }: SaveTemplateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { createTemplate, loading } = useProjectTemplates();

  const handleSave = async () => {
    if (!name.trim()) return;

    const templateData: CreateTemplateData = {
      name: name.trim(),
      description: description.trim() || undefined,
      construction_type: projectData.construction_type,
      default_status: projectData.status,
      default_client: projectData.client,
      default_engineer: projectData.engineer,
      default_team: projectData.team,
      estimated_duration_days: projectData.estimated_duration_days,
    };

    try {
      await createTemplate(templateData);
      setOpen(false);
      setName("");
      setDescription("");
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Salvar como Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salvar como Template</DialogTitle>
          <DialogDescription>
            Salve este projeto como template para reutilizar estas configurações no futuro.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Nome do Template</Label>
            <Input
              id="template-name"
              placeholder="Ex: Residencial Padrão"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-description">Descrição (opcional)</Label>
            <Textarea
              id="template-description"
              placeholder="Descreva quando usar este template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || !name.trim()}>
            {loading ? "Salvando..." : "Salvar Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};