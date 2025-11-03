import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useProjects } from '@/hooks/useProjects';
import { useToast } from "@/hooks/use-toast";
import { projectSchema, ProjectInput } from '@/lib/validationSchemas';
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const CreateProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      constructionType: "",
      startDate: undefined,
      endDate: undefined,
      status: "Pré-projeto",
      client: "",
      engineer: "",
      team: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para criar projetos",
        variant: "destructive"
      });
      return;
    }

    try {
      const description = `Tipo: ${values.constructionType}\nCliente: ${values.client}\nEngenheiro: ${values.engineer}${values.team ? `\nEquipe: ${values.team}` : ''}`;
      
      const project = await createProject({
        name: values.name,
        description,
        start_date: values.startDate ? values.startDate.toISOString().split('T')[0] : null,
        end_date: values.endDate ? values.endDate.toISOString().split('T')[0] : null,
        status: values.status as any,
        total_budget: null,
        user_id: user.id,
      });
      
      toast({
        title: "Sucesso!",
        description: "Projeto criado com sucesso",
      });
      
      navigate(`/projetos/${project.id}`);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error creating project:', error);
      }
      toast({
        title: "Erro",
        description: "Não foi possível criar o projeto. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold mb-4">Criar novo projeto</h1>
          <hr className="border-border" />
        </div>

        <Card className="p-6 md:p-8 max-w-4xl">
          <h2 className="text-lg font-semibold mb-6">Dados gerais do projeto</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do projeto *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Residência Silva" 
                        {...field}
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="constructionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de construção *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="casa">Casa</SelectItem>
                        <SelectItem value="apartamento">Apartamento</SelectItem>
                        <SelectItem value="comercial">Comercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="reforma">Reforma</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de início</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "dd/MM/yyyy") : "Selecione a data"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de término prevista</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "dd/MM/yyyy") : "Selecione a data"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const startDate = form.getValues("startDate");
                              return startDate ? date < startDate : false;
                            }}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status do projeto *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pré-projeto">Pré-projeto</SelectItem>
                        <SelectItem value="Em andamento">Em andamento</SelectItem>
                        <SelectItem value="Finalizado">Finalizado</SelectItem>
                        <SelectItem value="Pausado">Pausado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engineer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engenheiro ou arquiteto responsável *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do responsável técnico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipe (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Liste os membros da equipe, incluindo contratos e subcontratos"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {form.formState.isSubmitting ? "Criando projeto..." : "Criar projeto"}
              </Button>
            </form>
          </Form>
        </Card>

        <div className="mt-8 p-4 bg-muted rounded-lg max-w-4xl">
          <h3 className="font-medium mb-2">Próximos passos:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Adicionar documentos técnicos</li>
            <li>• Configurar etapas do projeto</li>
            <li>• Gerenciar materiais</li>
            <li>• Acompanhar progresso financeiro</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProject;
