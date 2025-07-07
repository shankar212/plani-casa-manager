
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useState } from "react";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const projects = [
    {
      id: 1,
      name: "apartamento hillrid",
      date: "desde 01 de agosto de 2024"
    },
    {
      id: 2,
      name: "ulisses faria 970",
      date: "desde 10 de dezembro de 2024"
    },
    {
      id: 3,
      name: "curitibapolloce",
      date: "desde 01 de novembro de 2024"
    }
  ];

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
          {projects.map((project) => (
            <Card key={project.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-medium mb-1">{project.name}</h3>
              <p className="text-sm text-gray-600">{project.date}</p>
            </Card>
          ))}
        </div>

        <Card className="p-8">
          <Button className="w-full py-6 text-lg">
            <Plus className="w-5 h-5 mr-2" />
            Criar novo projeto
          </Button>
        </Card>
      </div>
    </Layout>
  );
};

export default Projects;
