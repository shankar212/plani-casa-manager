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
import { Plus, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import { EditableCell } from "@/components/EditableCell";
import { useMaterials } from "@/hooks/useMaterials";
import { useMaterialSuppliers } from "@/hooks/useSuppliers";
import { MaterialsFinancialSummary } from "@/components/MaterialsFinancialSummary";

const ProjectFinancial = () => {
  const { id } = useParams();
  const { providers, loading, createProvider, updateProvider } = useServiceProviders(id);
  const { stages } = useProjectStages(id);
  const { materials, loading: materialsLoading } = useMaterials();
  const { suppliers } = useMaterialSuppliers();
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
  const contractsAmount = providers.reduce((sum, provider) => sum + provider.contract_value, 0);
  const materialsAmount = materials
    .filter(material => material.project_id === id)
    .reduce((sum, material) => sum + (material.estimated_total_cost || 0), 0);
  const usedAmount = contractsAmount + materialsAmount;
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('R$', '').trim();
  };

  const handleCellNavigation = (currentRowIndex: number, currentCellIndex: number, direction: 'next' | 'prev' | 'down' | 'up') => {
    const totalRows = providers.length + 1; // +1 for the new provider row at index 0
    const totalCells = 5; // 5 editable columns (excluding actions)
    let newRowIndex = currentRowIndex;
    let newCellIndex = currentCellIndex;

    switch (direction) {
      case 'next':
        newCellIndex++;
        if (newCellIndex >= totalCells) {
          newCellIndex = 0;
          newRowIndex++;
          if (newRowIndex >= totalRows) {
            newRowIndex = 0; // Wrap to first row
          }
        }
        
        // Special case: if we're in new row and going to next from last cell
        if (currentRowIndex === 0 && currentCellIndex === totalCells - 1) {
          createNewProvider();
          return;
        }
        break;
      case 'prev':
        newCellIndex--;
        if (newCellIndex < 0) {
          newCellIndex = totalCells - 1;
          newRowIndex--;
          if (newRowIndex < 0) {
            newRowIndex = totalRows - 1; // Wrap to last row
          }
        }
        break;
      case 'down':
        // Special case: if we're in new row and press Enter/Down, create provider
        if (currentRowIndex === 0) {
          createNewProvider();
          return;
        }
        
        newRowIndex++;
        if (newRowIndex >= totalRows) {
          newRowIndex = 0; // Wrap to first row
        }
        break;
      case 'up':
        newRowIndex--;
        if (newRowIndex < 0) {
          newRowIndex = totalRows - 1; // Wrap to last row
        }
        break;
    }

    // Find the cell using ID for more reliable focusing
    const cellId = `contract-cell-${newRowIndex}-${newCellIndex}`;
    const newCell = document.getElementById(cellId) as HTMLElement;
    
    if (newCell) {
      newCell.focus();
    }
  };

  const getTabIndex = (rowIndex: number, cellIndex: number) => {
    const cellsPerRow = 5; // 5 editable columns
    return (rowIndex * cellsPerRow) + cellIndex + 1;
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
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <div>Usado: R$ {usedAmount.toLocaleString('pt-BR')}</div>
              <div className="text-xs text-muted-foreground">
                Contratos: R$ {contractsAmount.toLocaleString('pt-BR')} • 
                Materiais: R$ {materialsAmount.toLocaleString('pt-BR')}
              </div>
            </div>
          </Card>

          {/* Payments and Contracts */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">pagamentos e contratos confirmados</h2>
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
                      </tr>
                    </thead>
                    <tbody>
                      {/* New provider row */}
                      <tr className="bg-muted/20 border-b">
                        <td className="p-0">
                          <EditableCell
                            id="contract-cell-0-0"
                            value={newRowData.name}
                            onSave={(value) => handleNewRowChange('name', value)}
                            onNavigate={(direction) => handleCellNavigation(0, 0, direction)}
                            placeholder="Clique para adicionar contrato..."
                            isNewRow={true}
                            tabIndex={getTabIndex(0, 0)}
                          />
                        </td>
                        <td className="p-0">
                          <EditableCell
                            id="contract-cell-0-1"
                            value={newRowData.service_type}
                            onSave={(value) => handleNewRowChange('service_type', value)}
                            onNavigate={(direction) => handleCellNavigation(0, 1, direction)}
                            placeholder="Tipo de serviço"
                            isNewRow={true}
                            tabIndex={getTabIndex(0, 1)}
                          />
                        </td>
                        <td className="p-0">
                          <EditableCell
                            id="contract-cell-0-2"
                            value={newRowData.stage_id}
                            onSave={(value) => handleNewRowChange('stage_id', value)}
                            onNavigate={(direction) => handleCellNavigation(0, 2, direction)}
                            type="select"
                            options={[
                              { value: null, label: 'Selecionar etapa' },
                              ...stages.map(stage => ({ value: stage.id, label: stage.name }))
                            ]}
                            isNewRow={true}
                            tabIndex={getTabIndex(0, 2)}
                          />
                        </td>
                        <td className="p-0">
                          <EditableCell
                            id="contract-cell-0-3"
                            value={newRowData.contract_value}
                            onSave={(value) => handleNewRowChange('contract_value', value)}
                            onNavigate={(direction) => handleCellNavigation(0, 3, direction)}
                            type="number"
                            placeholder="0"
                            isNewRow={true}
                            tabIndex={getTabIndex(0, 3)}
                          />
                        </td>
                        <td className="p-0">
                          <EditableCell
                            id="contract-cell-0-4"
                            value={newRowData.payment_status}
                            onSave={(value) => handleNewRowChange('payment_status', value)}
                            onNavigate={(direction) => handleCellNavigation(0, 4, direction)}
                            type="select"
                            options={[
                              { value: 'pendente', label: 'Pendente' },
                              { value: 'pago', label: 'Pago' },
                              { value: 'atrasado', label: 'Atrasado' }
                            ]}
                            isNewRow={true}
                            tabIndex={getTabIndex(0, 4)}
                            className={`${
                              newRowData.payment_status === 'pago' 
                                ? 'bg-green-100 text-green-800' 
                                : newRowData.payment_status === 'atrasado'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          />
                        </td>
                      </tr>
                      
                      {/* Existing providers */}
                      {providers.map((provider, providerIndex) => {
                        const rowIndex = providerIndex + 1;
                        return (
                          <tr key={provider.id} className="border-b hover:bg-muted/50">
                            <td className="p-0">
                              <EditableCell
                                id={`contract-cell-${rowIndex}-0`}
                                value={provider.name}
                                onSave={(value) => handleUpdateProvider(provider.id, 'name', value)}
                                onNavigate={(direction) => handleCellNavigation(rowIndex, 0, direction)}
                                placeholder="Nome do contrato"
                                tabIndex={getTabIndex(rowIndex, 0)}
                              />
                            </td>
                            <td className="p-0">
                              <EditableCell
                                id={`contract-cell-${rowIndex}-1`}
                                value={provider.service_type}
                                onSave={(value) => handleUpdateProvider(provider.id, 'service_type', value)}
                                onNavigate={(direction) => handleCellNavigation(rowIndex, 1, direction)}
                                placeholder="Tipo de serviço"
                                tabIndex={getTabIndex(rowIndex, 1)}
                              />
                            </td>
                            <td className="p-0">
                              <EditableCell
                                id={`contract-cell-${rowIndex}-2`}
                                value={provider.stage_id || null}
                                onSave={(value) => handleUpdateProvider(provider.id, 'stage_id', value)}
                                onNavigate={(direction) => handleCellNavigation(rowIndex, 2, direction)}
                                type="select"
                                options={[
                                  { value: null, label: 'N/A' },
                                  ...stages.map(stage => ({ value: stage.id, label: stage.name }))
                                ]}
                                tabIndex={getTabIndex(rowIndex, 2)}
                              />
                            </td>
                            <td className="p-0">
                              <EditableCell
                                id={`contract-cell-${rowIndex}-3`}
                                value={provider.contract_value}
                                onSave={(value) => handleUpdateProvider(provider.id, 'contract_value', value)}
                                onNavigate={(direction) => handleCellNavigation(rowIndex, 3, direction)}
                                type="number"
                                placeholder="0"
                                tabIndex={getTabIndex(rowIndex, 3)}
                                className="text-right"
                              />
                            </td>
                            <td className="p-0">
                              <EditableCell
                                id={`contract-cell-${rowIndex}-4`}
                                value={provider.payment_status}
                                onSave={(value) => handleUpdateProvider(provider.id, 'payment_status', value)}
                                onNavigate={(direction) => handleCellNavigation(rowIndex, 4, direction)}
                                type="select"
                                options={[
                                  { value: 'pendente', label: 'Pendente' },
                                  { value: 'pago', label: 'Pago' },
                                  { value: 'atrasado', label: 'Atrasado' }
                                ]}
                                tabIndex={getTabIndex(rowIndex, 4)}
                                className={`${
                                  provider.payment_status === 'pago' 
                                    ? 'bg-green-100 text-green-800' 
                                    : provider.payment_status === 'atrasado'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                      
                      {providers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">
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

          {/* Materials Section */}
          <MaterialsFinancialSummary 
            materials={materials}
            suppliers={suppliers}
            stages={stages}
            projectId={id || ''}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ProjectFinancial;