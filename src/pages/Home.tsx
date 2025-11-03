
import { Layout } from "@/components/Layout";
import { ProjectCard } from "@/components/ProjectCard";
import { DashboardStats } from "@/components/DashboardStats";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Plus, Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Project = Tables<"projects">;

const Home = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "Obras").length,
    completedProjects: projects.filter((p) => p.status === "Pré-projeto").length,
    totalBudget: projects.reduce((sum, p) => sum + Number(p.total_budget || 0), 0),
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4 md:p-8">
          <div className="text-center text-muted-foreground">Carregando projetos...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-8">
        {/* Hero Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Bem-vindo de volta, {user?.email?.split('@')[0] || 'Usuário'}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Gerencie seus projetos de construção em um só lugar
          </p>
        </div>

        {/* Stats Dashboard */}
        <DashboardStats {...stats} />

        {/* Recent Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Projetos Recentes</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {projects.length > 0
                  ? `Você tem ${projects.length} ${projects.length === 1 ? "projeto" : "projetos"}`
                  : "Nenhum projeto cadastrado"}
              </p>
            </div>
            <Button onClick={() => navigate("/criar-projeto")} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Projeto
            </Button>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.name}
                  phase={project.status}
                  startDate={project.start_date ? formatDate(project.start_date) : "-"}
                  totalCost={project.total_budget ? formatCurrency(Number(project.total_budget)) : "-"}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                <Folder className="w-16 h-16 text-muted-foreground/50" />
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium text-muted-foreground">
                    Nenhum projeto ainda
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Comece criando seu primeiro projeto de construção
                  </p>
                </div>
                <Button onClick={() => navigate("/criar-projeto")} className="gap-2 mt-4">
                  <Plus className="w-4 h-4" />
                  Criar Primeiro Projeto
                </Button>
              </CardContent>
            </Card>
          )}

          {projects.length > 6 && (
            <div className="text-center">
              <Button variant="outline" onClick={() => navigate("/projetos")}>
                Ver Todos os Projetos
              </Button>
            </div>
          )}
        </div>

        {/* Contact Support Section */}
        <div className="mt-16 pt-8 border-t border-border">
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-muted-foreground">
                Entrem em contato com o suporte via{" "}
                <a
                  href="mailto:gustavo.corbucci@gmail.com?subject=[Plani] Assunto"
                  className="text-primary hover:underline font-medium"
                >
                  gustavo.corbucci@gmail.com
                </a>
                {" "}com o título [Plani] Assunto
              </p>
              <p className="text-muted-foreground font-medium">
                Aceitamos sugestões!
              </p>
              <p className="text-muted-foreground">
                Obrigado por usar Plani, construindo com você!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
