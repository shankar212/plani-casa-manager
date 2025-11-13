import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectTemplates } from "@/hooks/useProjectTemplates";
import { FileText, Trash2, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Badge } from "@/components/ui/badge";

const ProjectTemplates = () => {
  const { templates, loading, deleteTemplate } = useProjectTemplates();

  const handleDelete = async (id: string) => {
    await deleteTemplate(id);
  };

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Templates de Projetos</h1>
              <p className="text-muted-foreground">
                Gerencie seus templates para criar projetos mais rapidamente
              </p>
            </div>
          </div>
          <hr className="border-border" />
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
          <Card className="p-12">
            <div className="text-center">
              <Sparkles className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum template criado</h3>
              <p className="text-muted-foreground mb-6">
                Templates ajudam você a criar projetos mais rapidamente com configurações pré-definidas.
              </p>
              <p className="text-sm text-muted-foreground">
                Para criar um template, preencha o formulário de criação de projeto e os dados serão salvos automaticamente.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {template.name}
                      </CardTitle>
                      {template.description && (
                        <CardDescription className="mt-2">
                          {template.description}
                        </CardDescription>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir template?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O template "{template.name}" será excluído permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(template.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {template.construction_type && (
                    <div>
                      <p className="text-sm font-medium">Tipo de Construção</p>
                      <Badge variant="secondary">{template.construction_type}</Badge>
                    </div>
                  )}
                  {template.default_status && (
                    <div>
                      <p className="text-sm font-medium">Status Padrão</p>
                      <Badge variant="outline">{template.default_status}</Badge>
                    </div>
                  )}
                  {template.default_client && (
                    <div>
                      <p className="text-sm font-medium">Cliente</p>
                      <p className="text-sm text-muted-foreground">{template.default_client}</p>
                    </div>
                  )}
                  {template.default_engineer && (
                    <div>
                      <p className="text-sm font-medium">Engenheiro/Arquiteto</p>
                      <p className="text-sm text-muted-foreground">{template.default_engineer}</p>
                    </div>
                  )}
                  {template.estimated_duration_days && (
                    <div>
                      <p className="text-sm font-medium">Duração Estimada</p>
                      <p className="text-sm text-muted-foreground">
                        {template.estimated_duration_days} dias
                      </p>
                    </div>
                  )}
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Criado em {new Date(template.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProjectTemplates;