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
import { Plus, Check, X } from "lucide-react";
import { EditableCell } from "@/components/EditableCell";

const ProjectFinancial = () => {
  const { id } = useParams();
  const { providers, loading, createProvider, updateProvider } = useServiceProviders(id);
  const { stages } = useProjectStages(id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: "",
    service_type: "",
    contract_value: "",
    stage_id: "",
    payment_status: "pendente"
  });

  // New row data for inline editing
  const [newRowData, setNewRowData] = useState({
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
        project_id: id,
        stage_id: newProvider.stage_id || null // Convert empty string to null
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

  const handleNewRowChange = (field: string, value: string | number | null) => {
    setNewRowData(prev => ({
      ...prev,
      [field]: value?.toString() || ''
    }));
  };

  const createNewProvider = async () => {
    if (isCreatingNew || !newRowData.name?.trim()) return;
    
    setIsCreatingNew(true);
    try {
      await createProvider({
        ...newRowData,
        contract_value: parseFloat(newRowData.contract_value) || 0,
        project_id: id!,
        stage_id: newRowData.stage_id || null
      });
      
      setNewRowData({
        name: "",
        service_type: "",
        contract_value: "",
        stage_id: "",
        payment_status: "pendente"
      });
    } catch (error) {
      console.error('Error creating provider:', error);
    } finally {
      setIsCreatingNew(false);
    }
  };

  const handleUpdateProvider = async (providerId: string, field: string, value: string | number | null) => {
    try {
      const updates: any = { [field]: value };
      
      if (field === 'contract_value') {
        updates.contract_value = parseFloat(value as string) || 0;
      } else if (field === 'stage_id') {
        updates.stage_id = value || null;
      }
      
      await updateProvider(providerId, updates);
    } catch (error) {
      console.error('Error updating provider:', error);
    }
  };

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
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium">contrato</th>
                        <th className="text-left py-3 px-4 font-medium">tipo de serviço</th>
                        <th className="text-left py-3 px-4 font-medium">etapa</th>
                        <th className="text-left py-3 px-4 font-medium">valor</th>
                        <th className="text-left py-3 px-4 font-medium">status</th>
                        <th className="text-left py-3 px-4 font-medium">ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* New provider row */}
                      <tr className="bg-muted/20 border-b">
                        <td className="p-0">
                          <EditableCell
                            value={newRowData.name}
                            onSave={(value) => handleNewRowChange('name', value)}
                            placeholder="Clique para adicionar contrato..."
                            isNewRow={true}
                          />
                        </td>
                        <td className="p-0">
                          <EditableCell
                            value={newRowData.service_type}
                            onSave={(value) => handleNewRowChange('service_type', value)}
                            placeholder="Tipo de serviço"
                            isNewRow={true}
                          />
                        </td>
                        <td className="p-0">
                          <EditableCell
                            value={newRowData.stage_id}
                            onSave={(value) => handleNewRowChange('stage_id', value)}
                            type="select"
                            options={[
                              { value: null, label: 'Selecionar etapa' },
                              ...stages.map(stage => ({ value: stage.id, label: stage.name }))
                            ]}
                            isNewRow={true}
                          />
                        </td>
                        <td className="p-0">
                          <EditableCell
                            value={newRowData.contract_value}
                            onSave={(value) => handleNewRowChange('contract_value', value)}
                            type="number"
                            placeholder="0.00"
                            isNewRow={true}
                          />
                        </td>
                        <td className="p-0">
                          <EditableCell
                            value={newRowData.payment_status}
                            onSave={(value) => handleNewRowChange('payment_status', value)}
                            type="select"
                            options={[
                              { value: 'pendente', label: 'Pendente' },
                              { value: 'pago', label: 'Pago' },
                              { value: 'atrasado', label: 'Atrasado' }
                            ]}
                            isNewRow={true}
                          />
                        </td>
                        <td className="p-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={createNewProvider}
                            disabled={isCreatingNew || !newRowData.name?.trim()}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      
                      {/* Existing providers */}
                      {providers.map((provider) => (
                        <tr key={provider.id} className="border-b hover:bg-muted/50">
                          <td className="p-0">
                            <EditableCell
                              value={provider.name}
                              onSave={(value) => handleUpdateProvider(provider.id, 'name', value)}
                              placeholder="Nome do contrato"
                            />
                          </td>
                          <td className="p-0">
                            <EditableCell
                              value={provider.service_type}
                              onSave={(value) => handleUpdateProvider(provider.id, 'service_type', value)}
                              placeholder="Tipo de serviço"
                            />
                          </td>
                          <td className="p-0">
                            <EditableCell
                              value={provider.stage_id || null}
                              onSave={(value) => handleUpdateProvider(provider.id, 'stage_id', value)}
                              type="select"
                              options={[
                                { value: null, label: 'N/A' },
                                ...stages.map(stage => ({ value: stage.id, label: stage.name }))
                              ]}
                            />
                          </td>
                          <td className="p-0">
                            <EditableCell
                              value={provider.contract_value}
                              onSave={(value) => handleUpdateProvider(provider.id, 'contract_value', value)}
                              type="number"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="p-0">
                            <EditableCell
                              value={provider.payment_status}
                              onSave={(value) => handleUpdateProvider(provider.id, 'payment_status', value)}
                              type="select"
                              options={[
                                { value: 'pendente', label: 'Pendente' },
                                { value: 'pago', label: 'Pago' },
                                { value: 'atrasado', label: 'Atrasado' }
                              ]}
                            />
                          </td>
                          <td className="p-2">
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
                          <td colSpan={6} className="text-center py-8 text-gray-500">
                            Clique na primeira linha para adicionar um novo contrato.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectFinancial;