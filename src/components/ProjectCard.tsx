
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ProjectAccessBadge } from "@/components/ProjectAccessBadge";
import { ProjectAccessLevel } from "@/hooks/useProjectAccess";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

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
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.2,
    triggerOnce: true,
  });

  const handleClick = () => {
    if (id) {
      navigate(`/projetos/${id}`);
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-12'
      }`}
    >
      <Card 
        className="group p-5 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30 bg-card hover:scale-[1.02] active:scale-[0.98] min-h-[160px] touch-manipulation" 
        onClick={handleClick}
      >
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1 leading-tight">
              {title}
            </h3>
            {accessLevel && <ProjectAccessBadge accessLevel={accessLevel} />}
          </div>
          
          <div className="space-y-2 sm:space-y-3 pt-2 border-t border-border/30">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Fase</span>
              <span className="text-xs sm:text-sm font-semibold text-foreground bg-primary/10 px-2.5 sm:px-3 py-1 rounded-full">
                {phase}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Início</span>
              <span className="text-xs sm:text-sm font-semibold text-foreground">{startDate}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Gasto Total</span>
              <span className="text-sm sm:text-base font-bold text-primary">{totalCost}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
