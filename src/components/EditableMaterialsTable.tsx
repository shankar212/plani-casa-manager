
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EditableCell } from './EditableCell';
import { useMaterials, Material, NewMaterial } from '@/hooks/useMaterials';
import { useProjects } from '@/hooks/useProjects';
import { Trash2, Plus } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';

export const EditableMaterialsTable: React.FC = () => {
  const { materials, loading, createMaterial, updateMaterial, deleteMaterial, refetch } = useMaterials();
  const { projects } = useProjects();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [pendingNewRow, setPendingNewRow] = useState<Partial<NewMaterial> | null>(null);

  // Set up real-time subscription for materials
  useEffect(() => {
    const channel = supabase
      .channel('materials-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'materials'
        },
        () => {
          console.log('Materials table changed, refetching...');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const projectOptions = [
    { value: null, label: 'Sem Projeto' },
    ...projects.map(p => ({ value: p.id, label: p.name }))
  ];

  const calculateUnitCost = (totalCost: number, quantity: number) => {
    return quantity > 0 ? totalCost / quantity : 0;
  };

  const handleUpdateField = async (id: string, field: keyof Material, value: string | number | null) => {
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

  const handleCreateNewMaterial = async () => {
    if (isCreatingNew) return;
    
    setIsCreatingNew(true);
    
    try {
      const newMaterial: NewMaterial = {
        material_name: 'Novo Material',
        quantity: 1,
        unit: 'un',
        status: 'requested',
        estimated_total_cost: 0,
        estimated_unit_cost: 0,
        project_id: null,
        stage_id: null,
        supplier_id: null,
        user_id: null,
      };

      console.log('Creating new material:', newMaterial);
      const createdMaterial = await createMaterial(newMaterial);
      console.log('Material created successfully:', createdMaterial);
      
      // Focus on the first cell of the new material
      setTimeout(() => {
        const newCellId = `cell-0-0`;
        const newCell = document.getElementById(newCellId);
        if (newCell) {
          newCell.focus();
          newCell.click();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error creating material:', error);
    } finally {
      setIsCreatingNew(false);
    }
  };

  const handleNewRowEdit = (field: keyof NewMaterial, value: string | number | null) => {
    setPendingNewRow(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewRowSave = async () => {
    if (!pendingNewRow || isCreatingNew) return;
    
    setIsCreatingNew(true);
    
    try {
      const newMaterial: NewMaterial = {
        material_name: pendingNewRow.material_name || 'Novo Material',
        quantity: pendingNewRow.quantity || 1,
        unit: pendingNewRow.unit || 'un',
        status: pendingNewRow.status || 'requested',
        estimated_total_cost: pendingNewRow.estimated_total_cost || 0,
        estimated_unit_cost: 0,
        project_id: pendingNewRow.project_id || null,
        stage_id: null,
        supplier_id: null,
        user_id: null,
      };

      // Calculate unit cost if both total cost and quantity are available
      if (newMaterial.estimated_total_cost && newMaterial.quantity) {
        newMaterial.estimated_unit_cost = calculateUnitCost(newMaterial.estimated_total_cost, newMaterial.quantity);
      }

      console.log('Creating new material:', newMaterial);
      const createdMaterial = await createMaterial(newMaterial);
      console.log('Material created successfully:', createdMaterial);
      
      // Clear pending new row
      setPendingNewRow(null);
      
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

  const handleCellNavigation = (currentRowIndex: number, currentCellIndex: number, direction: 'next' | 'prev' | 'down' | 'up') => {
    const totalCells = 7; // Number of editable cells per row
    let newRowIndex = currentRowIndex;
    let newCellIndex = currentCellIndex;

    switch (direction) {
      case 'next':
        newCellIndex++;
        if (newCellIndex >= totalCells) {
          newCellIndex = 0;
          newRowIndex++;
        }
        break;
      case 'prev':
        newCellIndex--;
        if (newCellIndex < 0) {
          newCellIndex = totalCells - 1;
          newRowIndex--;
        }
        break;
      case 'down':
        newRowIndex++;
        break;
      case 'up':
        newRowIndex--;
        break;
    }

    // Focus the new cell
    const newCellId = `cell-${newRowIndex}-${newCellIndex}`;
    const newCell = document.getElementById(newCellId);
    if (newCell) {
      newCell.focus();
      newCell.click();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando materiais...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Almoxarifado Digital</h2>
          <Button 
            onClick={handleCreateNewMaterial}
            disabled={isCreatingNew}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {isCreatingNew ? 'Criando...' : 'Criar Novo Material'}
          </Button>
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
              {materials.map((material, rowIndex) => (
                <TableRow key={material.id}>
                  <TableCell className="p-0">
                    <EditableCell
                      id={`cell-${rowIndex}-0`}
                      value={material.material_name}
                      onSave={(value) => handleUpdateField(material.id, 'material_name', value)}
                      onNavigate={(direction) => handleCellNavigation(rowIndex, 0, direction)}
                      placeholder="Nome do material"
                      tabIndex={1}
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      id={`cell-${rowIndex}-1`}
                      value={material.project_id || null}
                      onSave={(value) => handleUpdateField(material.id, 'project_id', value)}
                      onNavigate={(direction) => handleCellNavigation(rowIndex, 1, direction)}
                      type="select"
                      options={projectOptions}
                      tabIndex={1}
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      id={`cell-${rowIndex}-2`}
                      value={material.quantity}
                      onSave={(value) => handleUpdateField(material.id, 'quantity', value)}
                      onNavigate={(direction) => handleCellNavigation(rowIndex, 2, direction)}
                      type="number"
                      placeholder="0"
                      tabIndex={1}
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      id={`cell-${rowIndex}-3`}
                      value={material.unit}
                      onSave={(value) => handleUpdateField(material.id, 'unit', value)}
                      onNavigate={(direction) => handleCellNavigation(rowIndex, 3, direction)}
                      placeholder="un"
                      tabIndex={1}
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      id={`cell-${rowIndex}-4`}
                      value={material.estimated_total_cost}
                      onSave={(value) => handleUpdateField(material.id, 'estimated_total_cost', value)}
                      onNavigate={(direction) => handleCellNavigation(rowIndex, 4, direction)}
                      type="number"
                      placeholder="0.00"
                      tabIndex={1}
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      id={`cell-${rowIndex}-5`}
                      value={material.estimated_unit_cost}
                      onSave={() => {}}
                      onNavigate={(direction) => handleCellNavigation(rowIndex, 5, direction)}
                      disabled={true}
                      className="bg-muted/30"
                      tabIndex={-1}
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      id={`cell-${rowIndex}-6`}
                      value={material.status}
                      onSave={(value) => handleUpdateField(material.id, 'status', value)}
                      onNavigate={(direction) => handleCellNavigation(rowIndex, 6, direction)}
                      type="select"
                      options={[
                        { value: 'requested', label: 'Solicitado' },
                        { value: 'delivered', label: 'Entregue' },
                        { value: 'used', label: 'Utilizado' },
                      ]}
                      tabIndex={1}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      tabIndex={-1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Quick add row - only shows when there's pending data */}
              {pendingNewRow && (
                <TableRow className="bg-muted/20 border-2 border-dashed border-primary/30">
                  <TableCell className="p-0">
                    <EditableCell
                      id={`cell-new-0`}
                      value={pendingNewRow.material_name || ''}
                      onSave={(value) => {
                        handleNewRowEdit('material_name', value);
                        if (value) handleNewRowSave();
                      }}
                      placeholder="Nome do material..."
                      className="italic text-muted-foreground"
                      tabIndex={1}
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      id={`cell-new-1`}
                      value={pendingNewRow.project_id || ''}
                      onSave={(value) => handleNewRowEdit('project_id', value)}
                      type="select"
                      options={projectOptions}
                      className="italic text-muted-foreground"
                      tabIndex={1}
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      id={`cell-new-2`}
                      value={pendingNewRow.quantity || ''}
                      onSave={(value) => handleNewRowEdit('quantity', value)}
                      type="number"
                      placeholder="0"
                      className="italic text-muted-foreground"
                      tabIndex={1}
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      id={`cell-new-3`}
                      value={pendingNewRow.unit || ''}
                      onSave={(value) => handleNewRowEdit('unit', value)}
                      placeholder="un"
                      className="italic text-muted-foreground"
                      tabIndex={1}
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      id={`cell-new-4`}
                      value={pendingNewRow.estimated_total_cost || ''}
                      onSave={(value) => handleNewRowEdit('estimated_total_cost', value)}
                      type="number"
                      placeholder="0.00"
                      className="italic text-muted-foreground"
                      tabIndex={1}
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <div className="p-2 text-sm text-muted-foreground italic bg-muted/30" tabIndex={-1}>
                      -
                    </div>
                  </TableCell>
                  <TableCell className="p-0">
                    <EditableCell
                      id={`cell-new-6`}
                      value={pendingNewRow.status || ''}
                      onSave={(value) => handleNewRowEdit('status', value)}
                      type="select"
                      options={[
                        { value: 'requested', label: 'Solicitado' },
                        { value: 'delivered', label: 'Entregue' },
                        { value: 'used', label: 'Utilizado' },
                      ]}
                      className="italic text-muted-foreground"
                      tabIndex={1}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNewRowSave}
                      className="h-8 w-8 p-0 text-primary hover:text-primary"
                      tabIndex={-1}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              
              {/* Add new row trigger - always at the bottom */}
              {!pendingNewRow && (
                <TableRow className="bg-muted/10 hover:bg-muted/20 cursor-pointer" onClick={() => setPendingNewRow({})}>
                  <TableCell colSpan={8} className="p-4 text-center text-muted-foreground italic">
                    + Clique aqui para adicionar um novo material
                  </TableCell>
                </TableRow>
              )}
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
