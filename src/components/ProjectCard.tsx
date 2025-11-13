
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ProjectAccessBadge } from "@/components/ProjectAccessBadge";
import { ProjectAccessLevel } from "@/hooks/useProjectAccess";

interface ProjectCardProps {
  id?: string;
  title: string;
  phase: string;
  startDate: string;
  totalCost: string;
  accessLevel?: ProjectAccessLevel;
}

export const ProjectCard = ({ id, title, phase, startDate, totalCost, accessLevel }: ProjectCardProps) => {
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
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1">
            {title}
          </h3>
          {accessLevel && <ProjectAccessBadge accessLevel={accessLevel} />}
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
