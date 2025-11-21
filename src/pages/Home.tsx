import { Layout } from "@/components/Layout";
import { ProjectCard } from "@/components/ProjectCard";
import { DashboardStats } from "@/components/DashboardStats";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Plus, Folder, Download } from "lucide-react";
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
        <div className="relative gradient-hero border-b border-border/50 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          
          <div className="relative p-4 md:p-8 lg:p-12 space-y-8 max-w-7xl mx-auto">
            <div className="space-y-6 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20 hover:bg-primary/15 transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Plataforma de Gestão de Projetos
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                Bem-vindo de volta,<br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent inline-block animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  {user?.email?.split("@")[0] || "Usuário"}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                Gerencie seus projetos de construção de forma eficiente e moderna, tudo em um só lugar
              </p>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 pt-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Button 
                  onClick={() => navigate("/projetos/criar")} 
                  size="lg"
                  className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Criar Projeto
                </Button>
                <Button 
                  onClick={() => navigate("/projetos")} 
                  variant="outline"
                  size="lg"
                  className="gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 bg-background/50 backdrop-blur-sm"
                >
                  <Folder className="w-5 h-5" />
                  Ver Todos
                </Button>
                <Button 
                  onClick={() => navigate("/install")} 
                  variant="outline"
                  size="lg"
                  className="gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 bg-background/50 backdrop-blur-sm"
                >
                  <Download className="w-5 h-5" />
                  Instalar App
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="p-4 md:p-8 space-y-10 max-w-7xl mx-auto">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <DashboardStats {...stats} />
          </div>

          {/* Recent Projects Section */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                  Projetos Recentes
                </h2>
                <p className="text-base md:text-lg text-muted-foreground flex items-center gap-2">
                  {projects.length > 0 ? (
                    <>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {projects.length}
                      </span>
                      {projects.length === 1 ? "projeto ativo" : "projetos ativos"}
                    </>
                  ) : (
                    "Nenhum projeto cadastrado"
                  )}
                </p>
              </div>
              {projects.length > 0 && (
                <Button 
                  onClick={() => navigate("/projetos/criar")} 
                  className="gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  Novo Projeto
                </Button>
              )}
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
              <Card className="relative border-dashed border-2 border-border/50 bg-gradient-to-br from-muted/20 to-background hover:border-primary/30 transition-all duration-500 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative flex flex-col items-center justify-center py-20 md:py-24 space-y-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3s' }} />
                    <div className="relative p-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 group-hover:scale-110 transition-transform duration-300">
                      <Folder className="w-20 h-20 text-primary/60" />
                    </div>
                  </div>
                  <div className="text-center space-y-4 max-w-lg">
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                      Comece Agora
                    </h3>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed px-4">
                      Dê o primeiro passo e crie seu projeto de construção. Gerencie etapas, materiais, documentos e muito mais.
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate("/projetos/criar")} 
                    className="gap-2 mt-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                    size="lg"
                  >
                    <Plus className="w-5 h-5" />
                    Criar Primeiro Projeto
                  </Button>
                </CardContent>
              </Card>
            )}

            {projects.length > 6 && (
              <div className="text-center pt-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/projetos")} 
                  size="lg" 
                  className="gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Folder className="w-4 h-4" />
                  Ver Todos os {projects.length} Projetos
                </Button>
              </div>
            )}
          </div>

          {/* Contact Support Section */}
          <div className="mt-20 pt-12 border-t border-border/50 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Card className="relative gradient-accent border-border/50 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="relative p-8 md:p-12 text-center space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Suporte Ativo
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">Precisa de Ajuda?</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Entre em contato com o suporte via{" "}
                  <a
                    href="mailto:gustavo.corbucci@gmail.com?subject=[Plani] Assunto"
                    className="text-primary hover:text-primary/80 underline font-semibold transition-colors inline-flex items-center gap-1"
                  >
                    gustavo.corbucci@gmail.com
                  </a>
                  {" "}com o título <span className="font-mono text-sm bg-muted px-2 py-1 rounded">[Plani] Assunto</span>
                </p>
                <div className="flex flex-col items-center gap-4 pt-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-border"></div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <span className="text-primary">✨</span>
                      Aceitamos sugestões e feedback
                      <span className="text-primary">✨</span>
                    </div>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-border"></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Obrigado por usar{" "}
                    <span className="font-bold text-primary text-base">Plani</span>
                    {" "}— construindo com você! 🏗️
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
