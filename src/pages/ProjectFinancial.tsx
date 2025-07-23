import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useParams, NavLink } from "react-router-dom";
import { useServiceProviders } from "@/hooks/useSuppliers";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjectStages } from "@/hooks/useProjects";
import { Plus } from "lucide-react";

const ProjectFinancial = () => {
  const { id } = useParams();
  const { providers, loading, createProvider } = useServiceProviders(id);
  const { stages } = useProjectStages(id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: "",
    service_type: "",
    contract_value: "",
    stage_id: "",
    payment_status: "pendente"
  });

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProvider.name && newProvider.service_type && newProvider.contract_value && id) {
      await createProvider({
        ...newProvider,
        contract_value: parseFloat(newProvider.contract_value),
        project_id: id
      });
      setNewProvider({
        name: "",
        service_type: "",
        contract_value: "",
        stage_id: "",
        payment_status: "pendente"
      });
      setIsDialogOpen(false);
    }
  };

  const totalBudget = 1000000;
  const usedAmount = providers.reduce((sum, provider) => sum + provider.contract_value, 0);
  const usedPercentage = Math.round((usedAmount / totalBudget) * 100);

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">
            <NavLink to="/projetos" className="hover:text-black">projetos</NavLink> › apartamento hillrid
          </div>
          <h1 className="text-2xl font-bold mb-4">apartamento hillrid</h1>
          
          <div className="flex space-x-4 border-b border-gray-200">
            <NavLink 
              to={`/projetos/${id}`} 
              end
              className={({ isActive }) => 
                `pb-2 px-1 ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
              }
            >
              gestão
            </NavLink>
            <NavLink 
              to={`/projetos/${id}/financeiro`}
              className={({ isActive }) => 
                `pb-2 px-1 ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
              }
            >
              financeiro
            </NavLink>
            <NavLink 
              to={`/projetos/${id}/tecnico`}
              className={({ isActive }) => 
                `pb-2 px-1 ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
              }
            >
              técnico
            </NavLink>
            <NavLink 
              to={`/projetos/${id}/conformidade-legal`}
              className={({ isActive }) => 
                `pb-2 px-1 ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
              }
            >
              conformidade legal
            </NavLink>
            <NavLink 
              to={`/projetos/${id}/relatorios`}
              className={({ isActive }) => 
                `pb-2 px-1 ${isActive ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'}`
              }
            >
              relatórios e indicadores
            </NavLink>
          </div>
        </div>

        <div className="space-y-6">
          {/* Budget Overview */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">orçamento total do projeto</h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{usedPercentage}% utilizado</span>
              <span className="text-lg font-semibold">R$ {totalBudget.toLocaleString('pt-BR')}</span>
            </div>
            <Progress value={usedPercentage} className="h-3" />
            <div className="mt-2 text-sm text-gray-600">
              Usado: R$ {usedAmount.toLocaleString('pt-BR')}
            </div>
          </Card>

          {/* Payments and Contracts */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">pagamentos e contratos confirmados</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Contrato
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Contrato</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProvider} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome do Fornecedor</Label>
                      <Input
                        id="name"
                        value={newProvider.name}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="service_type">Tipo de Serviço</Label>
                      <Input
                        id="service_type"
                        value={newProvider.service_type}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, service_type: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contract_value">Valor do Contrato</Label>
                      <Input
                        id="contract_value"
                        type="number"
                        step="0.01"
                        value={newProvider.contract_value}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, contract_value: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="stage_id">Etapa</Label>
                      <Select value={newProvider.stage_id} onValueChange={(value) => setNewProvider(prev => ({ ...prev, stage_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar etapa" />
                        </SelectTrigger>
                        <SelectContent>
                          {stages.map((stage) => (
                            <SelectItem key={stage.id} value={stage.id}>
                              {stage.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="payment_status">Status do Pagamento</Label>
                      <Select value={newProvider.payment_status} onValueChange={(value) => setNewProvider(prev => ({ ...prev, payment_status: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem>
                          <SelectItem value="atrasado">Atrasado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">
                      Criar Contrato
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-gray-600">contrato</th>
                      <th className="text-left py-2 text-gray-600">tipo de serviço</th>
                      <th className="text-left py-2 text-gray-600">etapa</th>
                      <th className="text-left py-2 text-gray-600">valor</th>
                      <th className="text-left py-2 text-gray-600">status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((provider) => (
                      <tr key={provider.id} className="border-b">
                        <td className="py-3">{provider.name}</td>
                        <td className="py-3">{provider.service_type}</td>
                        <td className="py-3">{provider.project_stages?.name || "N/A"}</td>
                        <td className="py-3">R$ {provider.contract_value.toLocaleString('pt-BR')}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            provider.payment_status === 'pago' 
                              ? 'bg-green-100 text-green-700' 
                              : provider.payment_status === 'atrasado'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {provider.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {providers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          Nenhum contrato encontrado. Clique em "Novo Contrato" para adicionar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectFinancial;