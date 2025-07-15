
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  id?: string;
  title: string;
  phase: string;
  startDate: string;
  totalCost: string;
}

export const ProjectCard = ({ id, title, phase, startDate, totalCost }: ProjectCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (id) {
      navigate(`/projetos/${id}`);
    }
  };

  return (
    <Card 
      className="p-6 hover:shadow-md transition-shadow cursor-pointer" 
      onClick={handleClick}
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="space-y-2 text-sm text-gray-600">
        <div>
          <strong>Fase:</strong> {phase}
        </div>
        <div>
          <strong>Início:</strong> {startDate}
        </div>
        <div>
          <strong>Gasto total:</strong> {totalCost}
        </div>
      </div>
    </Card>
  );
};
