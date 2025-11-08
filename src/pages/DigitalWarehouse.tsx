import { Layout } from "@/components/Layout";
import { EditableMaterialsTable } from "@/components/EditableMaterialsTable";
import { useMaterials } from "@/hooks/useMaterials";
import { Card } from "@/components/ui/card";
import { Package, DollarSign, TrendingUp, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const DigitalWarehouse = () => {
  const { materials, loading } = useMaterials();

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalMaterials = materials.length;
    const totalEstimatedCost = materials.reduce((sum, m) => sum + (m.estimated_total_cost || 0), 0);
    const totalActualCost = materials.reduce((sum, m) => sum + (m.total_cost || 0), 0);
    const deliveredCount = materials.filter((m) => m.status === "delivered").length;
    const requestedCount = materials.filter((m) => m.status === "requested").length;
    const usedCount = materials.filter((m) => m.status === "used").length;

    return {
      totalMaterials,
      totalEstimatedCost,
      totalActualCost,
      deliveredCount,
      requestedCount,
      usedCount,
      deliveryRate: totalMaterials > 0 ? (deliveredCount / totalMaterials) * 100 : 0,
    };
  }, [materials]);

  const exportToCSV = () => {
    const headers = ["Material", "Quantidade", "Unidade", "Status", "Custo Estimado", "Custo Real", "Projeto"];
    const rows = materials.map(m => [
      m.material_name,
      m.quantity,
      m.unit,
      m.status,
      m.estimated_total_cost || 0,
      m.total_cost || 0,
      m.projects?.name || "Sem projeto"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `materiais_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section with Gradient */}
        <div className="gradient-hero border-b border-border/50">
          <div className="p-4 md:p-8 lg:p-12 space-y-6 max-w-7xl mx-auto">
            <div className="space-y-4 animate-fade-in-up">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Gestão de Materiais
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                    Almoxarifado <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Digital</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mt-2">
                    Gerencie seus materiais de forma eficiente com controle completo de estoque e custos
                  </p>
                </div>
                <Button onClick={exportToCSV} variant="outline" className="gap-2 shadow-sm hover:shadow-md">
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Enhanced Summary Stats */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl animate-pulse" style={{ animationDuration: '0.8s' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Materials */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border/50 bg-gradient-to-br from-card to-muted/10 animate-fade-in-up animate-stagger-1">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total de Materiais</p>
                    <p className="text-3xl font-bold text-foreground">{summaryStats.totalMaterials}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {summaryStats.requestedCount} solicitados
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 text-blue-600">
                    <Package className="w-8 h-8" />
                  </div>
                </div>
              </Card>

              {/* Estimated Cost */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border/50 bg-gradient-to-br from-card to-muted/10 animate-fade-in-up animate-stagger-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Custo Estimado</p>
                    <p className="text-3xl font-bold text-foreground">
                      R$ {summaryStats.totalEstimatedCost.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    {summaryStats.totalActualCost > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Real: R$ {summaryStats.totalActualCost.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                      </p>
                    )}
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <DollarSign className="w-8 h-8" />
                  </div>
                </div>
              </Card>

              {/* Delivered */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border/50 bg-gradient-to-br from-card to-muted/10 animate-fade-in-up animate-stagger-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Materiais Entregues</p>
                    <p className="text-3xl font-bold text-foreground">{summaryStats.deliveredCount}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {summaryStats.usedCount} já utilizados
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-green-500/10 text-green-600">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                </div>
              </Card>

              {/* Delivery Rate */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border/50 bg-gradient-to-br from-card to-muted/10 animate-fade-in-up animate-stagger-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Taxa de Entrega</p>
                    <p className="text-3xl font-bold text-foreground">{summaryStats.deliveryRate.toFixed(0)}%</p>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${summaryStats.deliveryRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-500/10 text-amber-600">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Materials Table */}
          <EditableMaterialsTable />
        </div>
      </div>
    </Layout>
  );
};

export default DigitalWarehouse;
