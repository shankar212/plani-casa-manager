
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DigitalWarehouse = () => {
  const materials = [
    { material: "cimento", quantidade: 100, unidade: "sacos" },
    { material: "areia", quantidade: 50, unidade: "m³" },
    { material: "brita", quantidade: 30, unidade: "m³" },
    { material: "vergalhão", quantidade: 200, unidade: "barras" },
    { material: "tijolo", quantidade: 5000, unidade: "unidades" }
  ];

  const entregas = [
    { material: "cimento", quantidade: 100, unidade: "sacos", data: "30/ago/24" },
    { material: "areia", quantidade: 50, unidade: "m³", data: "25/set/24" },
    { material: "brita", quantidade: 30, unidade: "m³", data: "28/set/24" },
    { material: "vergalhão", quantidade: 200, unidade: "barras", data: "10/out/24" },
    { material: "tijolo", quantidade: 5000, unidade: "unidades", data: "18/out/24" }
  ];

  const utilizados = [
    { material: "cimento", quantidade: 100, unidade: "sacos" },
    { material: "areia", quantidade: 50, unidade: "m³" },
    { material: "brita", quantidade: 30, unidade: "m³" },
    { material: "vergalhão", quantidade: 200, unidade: "barras" },
    { material: "tijolo", quantidade: 5000, unidade: "unidades" }
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Dashboard de gestão</h1>
        </div>

        <Tabs defaultValue="pedidos" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="entregas">Entregas</TabsTrigger>
            <TabsTrigger value="utilizados">Utilizados</TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Lista de materiais pedidos</h2>
                <button className="p-2 text-gray-600 hover:text-black">
                  ✏️
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Material</th>
                      <th className="text-left py-3 px-4">Quantidade</th>
                      <th className="text-left py-3 px-4">Unidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4">{item.material}</td>
                        <td className="py-3 px-4">{item.quantidade}</td>
                        <td className="py-3 px-4">{item.unidade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="entregas">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Lista de materiais entregues</h2>
                <button className="p-2 text-gray-600 hover:text-black">
                  ✏️
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Material</th>
                      <th className="text-left py-3 px-4">Quantidade</th>
                      <th className="text-left py-3 px-4">Unidade</th>
                      <th className="text-left py-3 px-4">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entregas.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4">{item.material}</td>
                        <td className="py-3 px-4">{item.quantidade}</td>
                        <td className="py-3 px-4">{item.unidade}</td>
                        <td className="py-3 px-4">{item.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="utilizados">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Lista de materiais utilizados</h2>
                <button className="p-2 text-gray-600 hover:text-black">
                  ✏️
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Material</th>
                      <th className="text-left py-3 px-4">Quantidade</th>
                      <th className="text-left py-3 px-4">Unidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utilizados.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4">{item.material}</td>
                        <td className="py-3 px-4">{item.quantidade}</td>
                        <td className="py-3 px-4">{item.unidade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DigitalWarehouse;
