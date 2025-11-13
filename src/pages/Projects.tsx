
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Plus, SlidersHorizontal, Package, TrendingUp, CheckCircle2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from '@/hooks/useProjects';
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccountShareDialog } from "@/components/AccountShareDialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProjectAccessLevel } from "@/hooks/useProjectAccess";
import { ProjectAccessBadge } from "@/components/ProjectAccessBadge";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [ownershipFilter, setOwnershipFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { projects, loading } = useProjects();
  const { user } = useAuth();
  const [projectAccessMap, setProjectAccessMap] = useState<Map<string, ProjectAccessLevel>>(new Map());

  // Fetch project access levels
  useEffect(() => {
    const fetchProjectAccess = async () => {
      if (!user?.id || projects.length === 0) return;

      const accessMap = new Map<string, ProjectAccessLevel>();

      for (const project of projects) {
        try {
          if (project.user_id === user.id) {
            accessMap.set(project.id, 'owner');
            continue;
          }

          const { data: share } = await supabase
            .from('project_shares')
            .select('access_level')
            .eq('project_id', project.id)
            .eq('shared_with_user_id', user.id)
            .maybeSingle();

          if (share) {
            accessMap.set(project.id, share.access_level as ProjectAccessLevel);
            continue;
          }

          const { data: accountShare } = await supabase
            .from('account_shares')
            .select('account_shares.id')
            .eq('owner_user_id', project.user_id)
            .eq('shared_with_user_id', user.id)
            .limit(1)
            .maybeSingle();

          if (accountShare) {
            accessMap.set(project.id, 'view');
          } else {
            accessMap.set(project.id, 'none');
          }
        } catch (error) {
          accessMap.set(project.id, 'none');
        }
      }

      setProjectAccessMap(accessMap);
    };

    fetchProjectAccess();
  }, [user, projects]);

  const filteredProjects = useMemo(() => {
    return projects
      .filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || project.status === statusFilter;
        const accessLevel = projectAccessMap.get(project.id);
        const matchesOwnership = 
          ownershipFilter === "all" ||
          (ownershipFilter === "owned" && accessLevel === "owner") ||
          (ownershipFilter === "shared" && accessLevel !== "owner");
        return matchesSearch && matchesStatus && matchesOwnership;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "oldest":
            return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          case "recent":
          default:
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
      });
  }, [projects, searchTerm, statusFilter, sortBy, ownershipFilter, projectAccessMap]);

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section with Gradient */}
        <div className="gradient-hero border-b border-border/50">
          <div className="p-4 md:p-8 lg:p-12 space-y-6 max-w-7xl mx-auto">
            <div className="space-y-4 animate-fade-in-up">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Gestão de Projetos
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Seus <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Projetos</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Visualize, organize e gerencie todos os seus projetos de construção
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="p-6 rounded-xl bg-gradient-to-br from-card to-muted/20 border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{filteredProjects.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Projetos</p>
                </div>
                <div className="p-4 rounded-xl bg-primary/10 text-primary">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-to-br from-card to-muted/20 border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Em Obras</p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {filteredProjects.filter(p => p.status === "Obras").length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Ativos</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 text-amber-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-to-br from-card to-muted/20 border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pós Obra</p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {filteredProjects.filter(p => p.status === "Pós obra").length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Finalizados</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/10 text-green-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 bg-card rounded-xl border border-border/50 p-6 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar projeto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-input bg-background rounded-lg text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center pt-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-semibold">Filtros:</span>
              </div>
              
              <Select value={ownershipFilter} onValueChange={setOwnershipFilter}>
                <SelectTrigger className="w-[180px] shadow-sm">
                  <SelectValue placeholder="Propriedade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os projetos</SelectItem>
                  <SelectItem value="owned">Meus projetos</SelectItem>
                  <SelectItem value="shared">Compartilhados</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] shadow-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="Pré-projeto">Pré-projeto</SelectItem>
                  <SelectItem value="Projeto">Projeto</SelectItem>
                  <SelectItem value="Financiamento">Financiamento</SelectItem>
                  <SelectItem value="Obras">Obras</SelectItem>
                  <SelectItem value="Pós obra">Pós obra</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] shadow-sm">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="oldest">Mais antigos</SelectItem>
                  <SelectItem value="name">Nome (A-Z)</SelectItem>
                </SelectContent>
              </Select>

              {(ownershipFilter !== "all" || statusFilter !== "all" || sortBy !== "recent" || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOwnershipFilter("all");
                    setStatusFilter("all");
                    setSortBy("recent");
                    setSearchTerm("");
                  }}
                  className="text-sm hover:bg-destructive/10 hover:text-destructive"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>

          {/* Projects Grid */}
          <div>
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-foreground">
                {filteredProjects.length > 0 ? `${filteredProjects.length} ${filteredProjects.length === 1 ? 'Projeto' : 'Projetos'}` : 'Projetos'}
              </h2>
              <div className="flex gap-2">
                <AccountShareDialog />
                <Button 
                  onClick={() => navigate('/projetos/criar')}
                  className="gap-2 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Novo Projeto
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                // Loading skeletons with stagger
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`animate-fade-in-up animate-stagger-${Math.min(i % 3 + 1, 3)}`}>
                    <Card className="p-6 border-border/50">
                      <Skeleton className="h-7 w-3/4 mb-4 animate-pulse" style={{ animationDuration: '0.8s' }} />
                      <Skeleton className="h-4 w-1/2 mb-2 animate-pulse" style={{ animationDuration: '0.8s' }} />
                      <Skeleton className="h-4 w-2/3 animate-pulse" style={{ animationDuration: '0.8s' }} />
                    </Card>
                  </div>
                ))
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <div key={project.id} className={`animate-fade-in-up animate-stagger-${Math.min(index % 3 + 1, 3)}`}>
                     <Card 
                      className="group p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30 bg-gradient-to-br from-card to-muted/10 hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => navigate(`/projetos/${project.id}`)}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                              {project.name}
                            </h3>
                            <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                              {project.status}
                            </div>
                          </div>
                          <ProjectAccessBadge accessLevel={projectAccessMap.get(project.id) || 'none'} />
                        </div>
                        
                        <div className="pt-4 border-t border-border/30 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Criado em</span>
                            <span className="font-semibold text-foreground">
                              {project.created_at ? new Date(project.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                            </span>
                          </div>
                          {project.start_date && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Data de início</span>
                              <span className="font-semibold text-foreground">
                                {new Date(project.start_date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="border-dashed border-2 border-border/50 bg-muted/20 hover:border-primary/30 transition-all duration-300">
                    <div className="flex flex-col items-center justify-center py-16 space-y-6">
                      <div className="p-6 rounded-full bg-primary/5">
                        <Package className="w-16 h-16 text-primary/40" />
                      </div>
                      <div className="text-center space-y-3">
                        <p className="text-xl font-semibold text-foreground">
                          {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto cadastrado'}
                        </p>
                        <p className="text-base text-muted-foreground max-w-md">
                          {searchTerm 
                            ? 'Tente ajustar os filtros ou termos de busca' 
                            : 'Comece criando seu primeiro projeto de construção'}
                        </p>
                      </div>
                      {!searchTerm && (
                        <Button 
                          onClick={() => navigate('/projetos/criar')} 
                          className="gap-2 mt-4 shadow-md hover:shadow-lg" 
                          size="lg"
                        >
                          <Plus className="w-5 h-5" />
                          Criar Primeiro Projeto
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
