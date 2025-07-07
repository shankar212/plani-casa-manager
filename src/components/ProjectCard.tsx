
import { Card } from "@/components/ui/card";

interface ProjectCardProps {
  title: string;
  phase: string;
  startDate: string;
  totalCost: string;
}

export const ProjectCard = ({ title, phase, startDate, totalCost }: ProjectCardProps) => {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
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
