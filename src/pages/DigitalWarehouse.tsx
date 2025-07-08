
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Tables } from "@/integrations/supabase/types";

type Material = Tables<"materials">;

const DigitalWarehouse = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const requestedMaterials = materials.filter(m => m.status === "requested");
  const deliveredMaterials = materials.filter(m => m.status === "delivered");
  const usedMaterials = materials.filter(m => m.status === "used");

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="text-center">Carregando materiais...</div>
        </div>
      </Layout>
    );
  }

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
                    {requestedMaterials.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4">{item.material_name}</td>
                        <td className="py-3 px-4">{item.quantity}</td>
                        <td className="py-3 px-4">{item.unit}</td>
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
                      <th className="text-left py-3 px-4">Custo Unitário</th>
                      <th className="text-left py-3 px-4">Custo Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveredMaterials.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4">{item.material_name}</td>
                        <td className="py-3 px-4">{item.quantity}</td>
                        <td className="py-3 px-4">{item.unit}</td>
                        <td className="py-3 px-4">{item.delivery_date ? formatDate(item.delivery_date) : '-'}</td>
                        <td className="py-3 px-4">{item.unit_cost ? formatCurrency(Number(item.unit_cost)) : '-'}</td>
                        <td className="py-3 px-4">{item.total_cost ? formatCurrency(Number(item.total_cost)) : '-'}</td>
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
                      <th className="text-left py-3 px-4">Data de Uso</th>
                      <th className="text-left py-3 px-4">Custo Unitário</th>
                      <th className="text-left py-3 px-4">Custo Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usedMaterials.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4">{item.material_name}</td>
                        <td className="py-3 px-4">{item.quantity}</td>
                        <td className="py-3 px-4">{item.unit}</td>
                        <td className="py-3 px-4">{item.used_date ? formatDate(item.used_date) : '-'}</td>
                        <td className="py-3 px-4">{item.unit_cost ? formatCurrency(Number(item.unit_cost)) : '-'}</td>
                        <td className="py-3 px-4">{item.total_cost ? formatCurrency(Number(item.total_cost)) : '-'}</td>
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
