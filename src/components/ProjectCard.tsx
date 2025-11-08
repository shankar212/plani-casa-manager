
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
      className="group p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30 bg-card hover:scale-[1.02] active:scale-[0.98]" 
      onClick={handleClick}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </div>
        
        <div className="space-y-3 pt-2 border-t border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Fase</span>
            <span className="text-sm font-semibold text-foreground bg-primary/10 px-3 py-1 rounded-full">
              {phase}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Início</span>
            <span className="text-sm font-semibold text-foreground">{startDate}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <span className="text-sm font-medium text-muted-foreground">Gasto Total</span>
            <span className="text-base font-bold text-primary">{totalCost}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
