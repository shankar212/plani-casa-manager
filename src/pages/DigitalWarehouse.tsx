
import { Layout } from "@/components/Layout";
import { EditableMaterialsTable } from "@/components/EditableMaterialsTable";
import { Package, TrendingUp } from "lucide-react";

const DigitalWarehouse = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
        {/* Hero Section */}
        <div className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
          <div className="relative p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
            <div className="space-y-6 animate-fade-in-up" style={{ animationDuration: '0.4s' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                  Gestão de Materiais
                </span>
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Almoxarifado{" "}
                  <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                    Digital
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
                  Gerencie seus materiais de forma eficiente com controle completo de estoque, custos e fornecedores
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Controle inteligente de inventário e custos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <EditableMaterialsTable />
        </div>
      </div>
    </Layout>
  );
};

export default DigitalWarehouse;
