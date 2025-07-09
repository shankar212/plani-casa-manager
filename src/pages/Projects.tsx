
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from '@/hooks/useProjects';
import { Skeleton } from "@/components/ui/skeleton";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { projects, loading } = useProjects();

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Projetos</h1>
          <hr className="border-gray-300" />
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="pesquisar projeto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Card 
                key={project.id} 
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/projetos/${project.id}`)}
              >
                <h3 className="font-medium mb-1">{project.name}</h3>
                <p className="text-sm text-gray-600">
                  desde {project.created_at ? new Date(project.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Status: {project.status}
                </p>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto cadastrado'}
              </p>
            </div>
          )}
        </div>

        <Card className="p-8">
          <Button 
            className="w-full py-6 text-lg"
            onClick={() => navigate('/projetos/criar')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Criar novo projeto
          </Button>
        </Card>
      </div>
    </Layout>
  );
};

export default Projects;
