
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Tables } from "@/integrations/supabase/types";

type Material = Tables<"materials"> & {
  projects?: { name: string } | null;
};
interface ProjectOption {
  id: string;
  name: string;
}

const DigitalWarehouse = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    fetchMaterials();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchMaterials = async () => {
    try {
      let query = supabase
        .from("materials")
        .select(`
          *,
          projects:project_id (name)
        `);

      if (selectedProject === "none") {
        query = query.is("project_id", null);
      } else if (selectedProject !== "all") {
        query = query.eq("project_id", selectedProject);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

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
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard de gestão</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filtrar por projeto:</span>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Projetos</SelectItem>
                <SelectItem value="none">Sem Projeto</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="pedidos" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pedidos">Pedidos ({requestedMaterials.length})</TabsTrigger>
            <TabsTrigger value="entregas">Entregas ({deliveredMaterials.length})</TabsTrigger>
            <TabsTrigger value="utilizados">Utilizados ({usedMaterials.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Lista de materiais pedidos</h2>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Custo Unit. Estimado</TableHead>
                    <TableHead>Custo Total Estimado</TableHead>
                    <TableHead>Data do Pedido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestedMaterials.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.material_name}</TableCell>
                      <TableCell>{item.projects?.name || "Sem Projeto"}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.estimated_unit_cost ? formatCurrency(Number(item.estimated_unit_cost)) : '-'}</TableCell>
                      <TableCell>{item.estimated_total_cost ? formatCurrency(Number(item.estimated_total_cost)) : '-'}</TableCell>
                      <TableCell>{item.requested_at ? formatDate(item.requested_at) : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="entregas">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Lista de materiais entregues</h2>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Data de Entrega</TableHead>
                    <TableHead>Custo Unitário</TableHead>
                    <TableHead>Custo Total</TableHead>
                    <TableHead>Nota Fiscal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveredMaterials.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.material_name}</TableCell>
                      <TableCell>{item.projects?.name || "Sem Projeto"}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.delivery_date ? formatDate(item.delivery_date) : '-'}</TableCell>
                      <TableCell>{item.unit_cost ? formatCurrency(Number(item.unit_cost)) : '-'}</TableCell>
                      <TableCell>{item.total_cost ? formatCurrency(Number(item.total_cost)) : '-'}</TableCell>
                      <TableCell>{item.invoice_number || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="utilizados">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Lista de materiais utilizados</h2>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Data de Uso</TableHead>
                    <TableHead>Custo Unitário</TableHead>
                    <TableHead>Custo Total</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usedMaterials.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.material_name}</TableCell>
                      <TableCell>{item.projects?.name || "Sem Projeto"}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.used_date ? formatDate(item.used_date) : '-'}</TableCell>
                      <TableCell>{item.unit_cost ? formatCurrency(Number(item.unit_cost)) : '-'}</TableCell>
                      <TableCell>{item.total_cost ? formatCurrency(Number(item.total_cost)) : '-'}</TableCell>
                      <TableCell>{item.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DigitalWarehouse;
