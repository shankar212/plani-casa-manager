import { Card, CardContent } from "@/components/ui/card";
import { Folder, TrendingUp, CheckCircle, DollarSign } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

const StatsCard = ({ title, value, icon, description }: StatsCardProps) => {
  return (
    <Card className="group border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:scale-[1.03] bg-gradient-to-br from-card to-muted/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-3xl md:text-4xl font-bold text-foreground group-hover:text-primary transition-colors">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="ml-4 p-4 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110 shadow-sm">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
}

export const DashboardStats = ({
  totalProjects,
  activeProjects,
  completedProjects,
  totalBudget,
}: DashboardStatsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const stats = [
    {
      title: "Total de Projetos",
      value: totalProjects,
      icon: <Folder className="w-6 h-6" />,
      description: "Projetos cadastrados",
    },
    {
      title: "Em Obras",
      value: activeProjects,
      icon: <TrendingUp className="w-6 h-6" />,
      description: "Projetos ativos",
    },
    {
      title: "Pré-projeto",
      value: completedProjects,
      icon: <CheckCircle className="w-6 h-6" />,
      description: "Em planejamento",
    },
    {
      title: "Orçamento Total",
      value: formatCurrency(totalBudget),
      icon: <DollarSign className="w-6 h-6" />,
      description: "Soma de todos os projetos",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className={`animate-fade-in-up animate-stagger-${index + 1}`}>
          <StatsCard {...stat} />
        </div>
      ))}
    </div>
  );
};
