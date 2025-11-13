import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectTemplates, ProjectTemplate } from "@/hooks/useProjectTemplates";
import { FileText, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TemplateSelectorProps {
  onSelectTemplate: (template: ProjectTemplate) => void;
}

export const TemplateSelector = ({ onSelectTemplate }: TemplateSelectorProps) => {
  const { templates, loading } = useProjectTemplates();
  const [open, setOpen] = useState(false);

  const handleSelect = (template: ProjectTemplate) => {
    onSelectTemplate(template);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button" className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          Usar Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escolher Template de Projeto</DialogTitle>
          <DialogDescription>
            Selecione um template para preencher automaticamente os campos do projeto.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Você ainda não tem templates salvos.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Crie um projeto e salve-o como template para reutilizar no futuro.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelect(template)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {template.description && (
                    <CardDescription>{template.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  {template.construction_type && (
                    <p className="text-sm">
                      <span className="font-medium">Tipo:</span> {template.construction_type}
                    </p>
                  )}
                  {template.default_client && (
                    <p className="text-sm">
                      <span className="font-medium">Cliente:</span> {template.default_client}
                    </p>
                  )}
                  {template.estimated_duration_days && (
                    <p className="text-sm">
                      <span className="font-medium">Duração estimada:</span>{" "}
                      {template.estimated_duration_days} dias
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};