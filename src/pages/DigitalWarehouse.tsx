
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { EditableMaterialsTable } from "@/components/EditableMaterialsTable";

const DigitalWarehouse = () => {
  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Almoxarifado Digital</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus materiais de forma eficiente. Clique nas células para editar os dados diretamente.
          </p>
        </div>

        <Card className="p-6">
          <EditableMaterialsTable />
        </Card>
      </div>
    </Layout>
  );
};

export default DigitalWarehouse;
