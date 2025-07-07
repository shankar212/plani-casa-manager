
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";

const DigitalWarehouse = () => {
  const materials = [
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
          
          <div className="flex space-x-8 border-b border-gray-200 mb-6">
            <button className="pb-2 px-1 border-b-2 border-black font-medium">Pedidos</button>
            <button className="pb-2 px-1 text-gray-600 hover:text-black">Entregas</button>
            <button className="pb-2 px-1 text-gray-600 hover:text-black">Utilizados</button>
          </div>
        </div>

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
      </div>
    </Layout>
  );
};

export default DigitalWarehouse;
