
import { Layout } from "@/components/Layout";
import { ProjectCard } from "@/components/ProjectCard";

const Home = () => {
  const projects = [
    {
      title: "Apartamento Hillrid",
      phase: "Alvenaria",
      startDate: "10/10/2024",
      totalCost: "R$405.000,00"
    },
    {
      title: "Ulisses Faria 970",
      phase: "Cobertura",
      startDate: "10/12/2024",
      totalCost: "R$410.000,00"
    }
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Home</h1>
          <hr className="border-gray-300" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              phase={project.phase}
              startDate={project.startDate}
              totalCost={project.totalCost}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
