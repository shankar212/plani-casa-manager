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
import { Skeleton } from "@/components/ui/skeleton";

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
        .select("id, name, description, status, start_date, end_date, sale_value, total_budget, created_at, updated_at, user_id")
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


  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section with Gradient */}
        <div className="gradient-hero border-b border-border/50">
          <div className="p-4 md:p-8 lg:p-12 space-y-6 max-w-7xl mx-auto">
            <div className="space-y-4 animate-fade-in-up">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Plataforma de Gestão de Projetos
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Bem-vindo de volta,<br />
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {user?.email?.split("@")[0] || "Usuário"}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Gerencie seus projetos de construção de forma eficiente e moderna, tudo em um só lugar
              </p>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
          <DashboardStats {...stats} />

          {/* Recent Projects Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Projetos Recentes</h2>
                <p className="text-sm md:text-base text-muted-foreground mt-2">
                  {projects.length > 0
                    ? `Você tem ${projects.length} ${projects.length === 1 ? "projeto" : "projetos"}`
                    : "Nenhum projeto cadastrado"}
                </p>
              </div>
              <Button onClick={() => navigate("/projetos/criar")} className="gap-2 shadow-md hover:shadow-lg">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Projeto</span>
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`animate-fade-in-up animate-stagger-${Math.min(i % 3 + 1, 3)}`}>
                    <Card className="p-6 border-border/50">
                      <Skeleton className="h-7 w-3/4 mb-4 animate-pulse" style={{ animationDuration: '0.8s' }} />
                      <Skeleton className="h-5 w-1/2 mb-3 animate-pulse" style={{ animationDuration: '0.8s' }} />
                      <Skeleton className="h-4 w-2/3 mb-2 animate-pulse" style={{ animationDuration: '0.8s' }} />
                      <Skeleton className="h-4 w-1/2 animate-pulse" style={{ animationDuration: '0.8s' }} />
                    </Card>
                  </div>
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.slice(0, 6).map((project, index) => (
                  <div key={project.id} className={`animate-fade-in-up animate-stagger-${Math.min(index % 3 + 1, 3)}`}>
                    <ProjectCard
                      id={project.id}
                      title={project.name}
                      phase={project.status}
                      startDate={project.start_date ? formatDate(project.start_date) : "-"}
                      totalCost={project.total_budget ? formatCurrency(Number(project.total_budget)) : "-"}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 border-border/50 bg-muted/20 hover:border-primary/30 transition-all duration-300">
                <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="p-6 rounded-full bg-primary/5">
                    <Folder className="w-16 h-16 text-primary/40" />
                  </div>
                  <div className="text-center space-y-3">
                    <p className="text-xl font-semibold text-foreground">Nenhum projeto ainda</p>
                    <p className="text-base text-muted-foreground max-w-md">
                      Comece sua jornada criando seu primeiro projeto de construção
                    </p>
                  </div>
                  <Button onClick={() => navigate("/criar-projeto")} className="gap-2 mt-4 shadow-md hover:shadow-lg" size="lg">
                    <Plus className="w-5 h-5" />
                    Criar Primeiro Projeto
                  </Button>
                </CardContent>
              </Card>
            )}

            {projects.length > 6 && (
              <div className="text-center pt-4">
                <Button variant="outline" onClick={() => navigate("/projetos")} size="lg" className="shadow-sm hover:shadow-md">
                  Ver Todos os Projetos
                </Button>
              </div>
            )}
          </div>

          {/* Contact Support Section */}
          <div className="mt-16 pt-8 border-t border-border">
            <Card className="gradient-accent border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8 text-center space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Precisa de Ajuda?</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Entre em contato com o suporte via{" "}
                  <a
                    href="mailto:gustavo.corbucci@gmail.com?subject=[Plani] Assunto"
                    className="text-primary hover:underline font-semibold transition-colors"
                  >
                    gustavo.corbucci@gmail.com
                  </a>{" "}
                  com o título [Plani] Assunto
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="h-1 w-1 rounded-full bg-primary/40"></div>
                  <p className="text-sm text-muted-foreground font-medium">Aceitamos sugestões!</p>
                  <div className="h-1 w-1 rounded-full bg-primary/40"></div>
                </div>
                <p className="text-sm text-muted-foreground pt-2">
                  Obrigado por usar <span className="font-semibold text-primary">Plani</span>, construindo com você!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
