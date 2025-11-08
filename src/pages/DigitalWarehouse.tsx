
import { Layout } from "@/components/Layout";
import { EditableMaterialsTable } from "@/components/EditableMaterialsTable";

const DigitalWarehouse = () => {
  return (
    <Layout>
      <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-700">
          <h1 className="text-3xl font-bold mb-2">Almoxarifado Digital</h1>
          <p className="text-muted-foreground">
            Gerencie seus materiais de forma eficiente. Use os filtros para buscar e organize por status ou projeto.
          </p>
        </div>

        <EditableMaterialsTable />
      </div>
    </Layout>
  );
};

export default DigitalWarehouse;
