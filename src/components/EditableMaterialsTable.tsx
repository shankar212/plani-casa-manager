
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EditableCell } from './EditableCell';
import { useMaterials, Material, NewMaterial } from '@/hooks/useMaterials';
import { useProjects } from '@/hooks/useProjects';
import { Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const EditableMaterialsTable: React.FC = () => {
  const { materials, loading, createMaterial, updateMaterial, deleteMaterial } = useMaterials();
  const { projects } = useProjects();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const projectOptions = [
    { value: '', label: 'Sem Projeto' },
    ...projects.map(p => ({ value: p.id, label: p.name }))
  ];

  const calculateUnitCost = (totalCost: number, quantity: number) => {
    return quantity > 0 ? totalCost / quantity : 0;
  };

  const handleUpdateField = async (id: string, field: keyof Material, value: string | number) => {
    try {
      const updates: any = { [field]: value };
      
      // If updating total cost or quantity, recalculate unit cost
      const material = materials.find(m => m.id === id);
      if (material && (field === 'estimated_total_cost' || field === 'quantity')) {
        const newTotalCost = field === 'estimated_total_cost' ? Number(value) : material.estimated_total_cost;
        const newQuantity = field === 'quantity' ? Number(value) : material.quantity;
        
        if (newTotalCost && newQuantity) {
          updates.estimated_unit_cost = calculateUnitCost(Number(newTotalCost), Number(newQuantity));
        }
      }
      
      await updateMaterial(id, updates);
    } catch (error) {
      console.error('Error updating material:', error);
    }
  };

  const handleNewRowEdit = async (field: keyof NewMaterial, value: string | number) => {
    if (isCreatingNew) return; // Prevent multiple simultaneous creations
    
    setIsCreatingNew(true);
    
    const newMaterial: NewMaterial = {
      material_name: field === 'material_name' ? String(value) : 'Novo Material',
      quantity: field === 'quantity' ? Number(value) : 1,
      unit: field === 'unit' ? String(value) : 'un',
      status: field === 'status' ? value as any : 'requested',
      estimated_total_cost: field === 'estimated_total_cost' ? Number(value) : 0,
      estimated_unit_cost: 0,
      project_id: field === 'project_id' ? (value ? String(value) : null) : null,
      stage_id: null,
      supplier_id: null,
      user_id: null, // Will be set by the hook
    };

    // Calculate unit cost if both total cost and quantity are available
    if (newMaterial.estimated_total_cost && newMaterial.quantity) {
      newMaterial.estimated_unit_cost = calculateUnitCost(newMaterial.estimated_total_cost, newMaterial.quantity);
    }

    try {
      await createMaterial(newMaterial);
    } catch (error) {
      console.error('Error creating material:', error);
    } finally {
      setIsCreatingNew(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    setMaterialToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (materialToDelete) {
      try {
        await deleteMaterial(materialToDelete);
      } catch (error) {
        console.error('Error deleting material:', error);
      }
    }
    setDeleteDialogOpen(false);
    setMaterialToDelete(null);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando materiais...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Almoxarifado Digital</h2>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Material</TableHead>
                <TableHead className="w-[150px]">Projeto</TableHead>
                <TableHead className="w-[100px]">Quantidade</TableHead>
                <TableHead className="w-[80px]">Unidade</TableHead>
                <TableHead className="w-[120px]">Custo Total Est.</TableHead>
                <TableHead className="w-[120px]">Custo Unit. Est.</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="p-0">
                    <EditableCell
                      value={material.material_name}
                      onSave={(value) => handleUpdateField(material.id, 'material_name', value)}
                      placeholder="Nome do material"
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      value={material.project_id || ''}
                      onSave={(value) => handleUpdateField(material.id, 'project_id', value || null)}
                      type="select"
                      options={projectOptions}
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      value={material.quantity}
                      onSave={(value) => handleUpdateField(material.id, 'quantity', value)}
                      type="number"
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      value={material.unit}
                      onSave={(value) => handleUpdateField(material.id, 'unit', value)}
                      placeholder="un"
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      value={material.estimated_total_cost}
                      onSave={(value) => handleUpdateField(material.id, 'estimated_total_cost', value)}
                      type="number"
                      placeholder="0.00"
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      value={material.estimated_unit_cost}
                      onSave={() => {}} // This is calculated automatically
                      disabled={true}
                      className="bg-muted/30"
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      value={material.status}
                      onSave={(value) => handleUpdateField(material.id, 'status', value)}
                      type="select"
                      options={[
                        { value: 'requested', label: 'Solicitado' },
                        { value: 'delivered', label: 'Entregue' },
                        { value: 'used', label: 'Utilizado' },
                      ]}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* New material row - always at the bottom */}
              <TableRow className="bg-muted/20">
                <TableCell className="p-0">
                  <EditableCell
                    value=""
                    onSave={(value) => handleNewRowEdit('material_name', value)}
                    placeholder="Clique para adicionar material..."
                    className="italic text-muted-foreground"
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableCell
                    value=""
                    onSave={(value) => handleNewRowEdit('project_id', value)}
                    type="select"
                    options={projectOptions}
                    className="italic text-muted-foreground"
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableCell
                    value=""
                    onSave={(value) => handleNewRowEdit('quantity', value)}
                    type="number"
                    placeholder="0"
                    className="italic text-muted-foreground"
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableCell
                    value=""
                    onSave={(value) => handleNewRowEdit('unit', value)}
                    placeholder="un"
                    className="italic text-muted-foreground"
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableCell
                    value=""
                    onSave={(value) => handleNewRowEdit('estimated_total_cost', value)}
                    type="number"
                    placeholder="0.00"
                    className="italic text-muted-foreground"
                  />
                </TableCell>
                <TableCell className="p-0">
                  <div className="p-2 text-sm text-muted-foreground italic bg-muted/30">
                    -
                  </div>
                </TableCell>
                <TableCell className="p-0">
                  <EditableCell
                    value=""
                    onSave={(value) => handleNewRowEdit('status', value)}
                    type="select"
                    options={[
                      { value: 'requested', label: 'Solicitado' },
                      { value: 'delivered', label: 'Entregue' },
                      { value: 'used', label: 'Utilizado' },
                    ]}
                    className="italic text-muted-foreground"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <div className="h-8 w-8"></div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este material? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
