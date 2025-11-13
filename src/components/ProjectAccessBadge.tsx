import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Crown } from 'lucide-react';
import { ProjectAccessLevel } from '@/hooks/useProjectAccess';

interface ProjectAccessBadgeProps {
  accessLevel: ProjectAccessLevel;
}

export const ProjectAccessBadge = ({ accessLevel }: ProjectAccessBadgeProps) => {
  if (accessLevel === 'none') return null;

  const config = {
    owner: {
      label: 'Proprietário',
      icon: Crown,
      variant: 'default' as const,
      className: 'bg-primary text-primary-foreground'
    },
    edit: {
      label: 'Acesso de Edição',
      icon: Edit,
      variant: 'secondary' as const,
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
    },
    view: {
      label: 'Apenas Visualização',
      icon: Eye,
      variant: 'outline' as const,
      className: 'bg-muted text-muted-foreground'
    }
  };

  const { label, icon: Icon, variant, className } = config[accessLevel] || config.view;

  return (
    <Badge variant={variant} className={`gap-1.5 ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
};
