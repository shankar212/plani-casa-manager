
import { Layout } from "@/components/Layout";
import { EditableMaterialsTable } from "@/components/EditableMaterialsTable";

const DigitalWarehouse = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section with Gradient */}
        <div className="gradient-hero border-b border-border/50">
          <div className="p-4 md:p-8 lg:p-12 space-y-6 max-w-7xl mx-auto">
            <div className="space-y-4 animate-fade-in-up" style={{ animationDuration: '0.15s' }}>
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Gestão de Materiais
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Almoxarifado <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Digital</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Gerencie seus materiais de forma eficiente com controle completo de estoque e custos
              </p>
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
