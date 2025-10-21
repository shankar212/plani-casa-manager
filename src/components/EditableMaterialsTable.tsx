import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditableCell } from "./EditableCell";
import { useMaterials, Material, NewMaterial } from "@/hooks/useMaterials";
import { useProjects } from "@/hooks/useProjects";
import { useMaterialSuppliers } from "@/hooks/useSuppliers";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Check, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

// Local interface for the new row data (all strings from inputs)
interface NewRowData {
  material_name: string;
  quantity: string;
  unit: string;
  estimated_total_cost: string;
  status: string;
  project_id: string;
  stage_id: string;
  supplier_id: string;
  payment_date: string;
}

export const EditableMaterialsTable: React.FC = () => {
  const { materials, loading, createMaterial, updateMaterial, deleteMaterial, refetch } = useMaterials();
  const { projects } = useProjects();
  const { suppliers: materialSuppliers, createSupplier } = useMaterialSuppliers();

  // Local state for all stages accessible to the user
  const [stages, setStages] = useState<any[]>([]);
  const [stagesLoading, setStagesLoading] = useState(true);
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [materialForNewSupplier, setMaterialForNewSupplier] = useState<string | null>(null);
  const [isCreatingSupplier, setIsCreatingSupplier] = useState(false);

  // **New: Filter by Project**
  const [filterProjectId, setFilterProjectId] = useState<string>("all");

  // Local state for new row data - all strings from form inputs
  const [newRowData, setNewRowData] = useState<NewRowData>({
    material_name: "",
    quantity: "",
    unit: "",
    estimated_total_cost: "",
    status: "requested",
    project_id: "",
    stage_id: "",
    supplier_id: "",
    payment_date: "",
  });

  // Refs for managing focus
  const firstCellRef = useRef<HTMLInputElement>(null);

  // Fetch all stages accessible to the user
  useEffect(() => {
    const fetchStages = async () => {
      try {
        setStagesLoading(true);
        const { data, error } = await supabase.from("project_stages").select("*").order("created_at");

        if (error) throw error;
        setStages(data || []);
      } catch (error) {
        console.error("Error fetching stages:", error);
      } finally {
        setStagesLoading(false);
      }
    };

    fetchStages();
  }, []);

  // Set up real-time subscription for materials
  useEffect(() => {
    const channel = supabase
      .channel("materials-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "materials",
        },
        () => {
          console.log("Materials table changed, refetching...");
          refetch();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Force initial refetch on component mount to ensure fresh data
  useEffect(() => {
    refetch();
  }, []);

  // Filter materials based on selected project
  const filteredMaterials =
    filterProjectId === "all" ? materials : materials.filter((m) => m.project_id === filterProjectId);

  const projectOptions = [
    { value: null, label: "Sem Projeto" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  const filterProjectOptions = [
    { value: "all", label: "Todos os Projetos" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  const getStageOptions = (projectId: string) => {
    if (!projectId) {
      return [{ value: "", label: "Selecione um projeto primeiro" }];
    }

    const projectStages = stages.filter((stage) => stage.project_id === projectId);
    return [
      { value: "", label: "Selecionar etapa" },
      ...projectStages.map((stage) => ({
        value: stage.id,
        label: `${stage.name}`,
      })),
    ];
  };

  const calculateUnitCost = (totalCost: number, quantity: number) => {
    return quantity > 0 ? totalCost / quantity : 0;
  };

  const handleSupplierChange = async (materialId: string, supplierId: string) => {
    if (supplierId === "new") {
      setMaterialForNewSupplier(materialId);
      setSupplierDialogOpen(true);
    } else {
      await updateMaterial(materialId, { supplier_id: supplierId === "none" ? null : supplierId });
    }
  };

  const handleNewRowSupplierChange = (supplierId: string) => {
    if (supplierId === "new") {
      setMaterialForNewSupplier("new-row");
      setSupplierDialogOpen(true);
    } else {
      handleNewRowChange("supplier_id", supplierId);
    }
  };

  const createSupplierWithName = async () => {
    if (!supplierName.trim()) return;

    setIsCreatingSupplier(true);
    try {
      const newSupplier = await createSupplier({
        name: supplierName.trim(),
        contact_info: {},
      });

      if (newSupplier) {
        if (materialForNewSupplier === "new-row") {
          handleNewRowChange("supplier_id", newSupplier.id);
        } else if (materialForNewSupplier) {
          await updateMaterial(materialForNewSupplier, { supplier_id: newSupplier.id });
        }
      }

      setSupplierDialogOpen(false);
      setSupplierName("");
      setMaterialForNewSupplier(null);
    } catch (error) {
      console.error("Error creating supplier:", error);
    } finally {
      setIsCreatingSupplier(false);
    }
  };

  const handleUpdateField = async (id: string, field: keyof Material, value: string | number | null) => {
    try {
      const updates: any = { [field]: value };

      const material = materials.find((m) => m.id === id);
      if (material && (field === "estimated_total_cost" || field === "quantity")) {
        const newTotalCost = field === "estimated_total_cost" ? Number(value) : material.estimated_total_cost;
        const newQuantity = field === "quantity" ? Number(value) : material.quantity;

        if (newTotalCost && newQuantity) {
          updates.estimated_unit_cost = calculateUnitCost(Number(newTotalCost), Number(newQuantity));
        }
      }

      await updateMaterial(id, updates);
    } catch (error) {
      console.error("Error updating material:", error);
    }
  };

  const handleNewRowChange = (field: keyof NewRowData, value: string | number | null) => {
    setNewRowData((prev) => ({
      ...prev,
      [field]: value?.toString() || "",
    }));
  };

  const createNewMaterial = async () => {
    if (isCreatingNew) return;

    if (!newRowData.material_name?.trim()) {
      return;
    }

    setIsCreatingNew(true);

    try {
      const quantity = Number(newRowData.quantity) || 1;
      const estimatedTotalCost = Number(newRowData.estimated_total_cost) || 0;
      const status = (newRowData.status as "requested" | "delivered") || "requested";

      const newMaterial: NewMaterial = {
        material_name: newRowData.material_name.trim() || "Novo Material",
        quantity: quantity,
        unit: newRowData.unit || "un",
        status: status,
        estimated_total_cost: estimatedTotalCost,
        estimated_unit_cost: 0,
        project_id: newRowData.project_id || null,
        stage_id: newRowData.stage_id || null,
        supplier_id: newRowData.supplier_id && newRowData.supplier_id !== "none" ? newRowData.supplier_id : null,
        user_id: user?.id || null,
        delivery_date: newRowData.payment_date || null,
      };

      if (newMaterial.estimated_total_cost && newMaterial.quantity) {
        newMaterial.estimated_unit_cost = calculateUnitCost(newMaterial.estimated_total_cost, newMaterial.quantity);
      }

      const createdMaterial = await createMaterial(newMaterial);

      // Clear the new row
      setNewRowData({
        material_name: "",
        quantity: "",
        unit: "",
        estimated_total_cost: "",
        status: "requested",
        project_id: "",
        stage_id: "",
        supplier_id: "",
        payment_date: "",
      });

      // Focus back to first cell after creation
      setTimeout(() => {
        firstCellRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error("Error creating material:", error);
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
      await deleteMaterial(materialToDelete);
    }
    setDeleteDialogOpen(false);
    setMaterialToDelete(null);
  };

  const handleSelectMaterial = (materialId: string, checked: boolean) => {
    const newSelected = new Set(selectedMaterials);
    if (checked) {
      newSelected.add(materialId);
    } else {
      newSelected.delete(materialId);
    }
    setSelectedMaterials(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMaterials(new Set(filteredMaterials.map((m) => m.id)));
    } else {
      setSelectedMaterials(new Set());
    }
  };

  const handleBulkDelete = () => {
    if (selectedMaterials.size > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(Array.from(selectedMaterials).map((id) => deleteMaterial(id)));
      setSelectedMaterials(new Set());
    } catch (error) {
      console.error("Error bulk deleting materials:", error);
    }
    setBulkDeleteDialogOpen(false);
  };

  const handleBulkStatusChange = () => {
    if (selectedMaterials.size > 0) {
      setBulkStatusDialogOpen(true);
    }
  };

  const confirmBulkStatusChange = async () => {
    try {
      await Promise.all(Array.from(selectedMaterials).map((id) => updateMaterial(id, { status: "delivered" })));
      setSelectedMaterials(new Set());
    } catch (error) {
      console.error("Error bulk updating material status:", error);
    }
    setBulkStatusDialogOpen(false);
  };

  // Keyboard navigation with TAB and Enter
  const handleCellNavigation = (
    currentRowIndex: number,
    currentCellIndex: number,
    direction: "next" | "prev" | "down" | "up",
  ) => {
    const totalRows = filteredMaterials.length + 1; // +1 for new row
    let newRowIndex = currentRowIndex;
    let newCellIndex = currentCellIndex;

    switch (direction) {
      case "next":
        newCellIndex++;
        if (newCellIndex === 9) newCellIndex = 10; // Skip unit cost
        if (newCellIndex > 10) {
          newCellIndex = 1;
          newRowIndex++;
          if (newRowIndex >= totalRows) newRowIndex = 0;
        }
        if (currentRowIndex === 0 && currentCellIndex === 10) {
          createNewMaterial();
          return;
        }
        break;
      case "prev":
        newCellIndex--;
        if (newCellIndex === 9) newCellIndex = 8;
        if (newCellIndex < 1) {
          newCellIndex = 10;
          newRowIndex--;
          if (newRowIndex < 0) newRowIndex = totalRows - 1;
        }
        break;
      case "down":
        if (currentRowIndex === 0) {
          createNewMaterial();
          return;
        }
        newRowIndex++;
        if (newRowIndex >= totalRows) newRowIndex = 0;
        break;
      case "up":
        newRowIndex--;
        if (newRowIndex < 0) newRowIndex = totalRows - 1;
        break;
    }

    const cellId = `cell-${newRowIndex}-${newCellIndex}`;
    const newCell = document.getElementById(cellId) as HTMLElement;
    if (newCell) {
      newCell.focus();
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
          <div className="flex items-center gap-4">
            {/* Project Filter */}
            <Select value={filterProjectId} onValueChange={setFilterProjectId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por projeto" />
              </SelectTrigger>
              <SelectContent>
                {filterProjectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedMaterials.size > 0 && (
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Excluir ({selectedMaterials.size})
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBulkStatusChange}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Marcar como Entregue ({selectedMaterials.size})
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedMaterials.size === filteredMaterials.length && filteredMaterials.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[150px]">Projeto</TableHead>
                <TableHead className="w-[120px]">Etapa</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[200px]">Material</TableHead>
                <TableHead className="w-[100px]">Quantidade</TableHead>
                <TableHead className="w-[80px]">Unidade</TableHead>
                <TableHead className="w-[150px]">Fornecedor</TableHead>
                <TableHead className="w-[120px]">Custo Total Est.</TableHead>
                <TableHead className="w-[120px]">Custo Unit. Est.</TableHead>
                <TableHead className="w-[120px]">Data de Pagamento</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* New material row */}
              <TableRow className="bg-muted/20">
                <TableCell className="p-2"></TableCell>
                <TableCell className="p-0">
                  <EditableCell
                    id="cell-0-1"
                    value={newRowData.project_id}
                    onSave={(value) => {
                      handleNewRowChange("project_id", value);
                      if (value !== newRowData.project_id) {
                        handleNewRowChange("stage_id", "");
                      }
                    }}
                    onNavigate={(direction) => handleCellNavigation(0, 1, direction)}
                    type="select"
                    options={projectOptions}
                    isNewRow={true}
                    tabIndex={1}
                    ref={firstCellRef}
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableCell
                    id="cell-0-2"
                    value={newRowData.stage_id}
                    onSave={(value) => handleNewRowChange("stage_id", value)}
                    onNavigate={(direction) => handleCellNavigation(0, 2, direction)}
                    type="select"
                    options={
                      newRowData.project_id
                        ? getStageOptions(newRowData.project_id)
                        : [{ value: "", label: "Selecione um projeto primeiro" }]
                    }
                    isNewRow={true}
                    tabIndex={2}
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableCell
                    id="cell-0-3"
                    value={newRowData.status}
                    onSave={(value) => handleNewRowChange("status", value)}
                    onNavigate={(direction) => handleCellNavigation(0, 3, direction)}
                    type="select"
                    options={[
                      { value: "requested", label: "Solicitado" },
                      { value: "delivered", label: "Entregue" },
                    ]}
                    isNewRow={true}
                    tabIndex={3}
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableCell
                    id="cell-0-4"
                    value={newRowData.material_name}
                    onSave={(value) => handleNewRowChange("material_name", value)}
                    onNavigate={(direction) => handleCellNavigation(0, 4, direction)}
                    placeholder="Clique para adicionar material..."
                    isNewRow={true}
                    tabIndex={4}
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableCell
                    id="cell-0-5"
                    value={newRowData.quantity}
                    onSave={(value) => handleNewRowChange("quantity", value)}
                    onNavigate={(direction) => handleCellNavigation(0, 5, direction)}
                    type="number"
                    placeholder="0"
                    isNewRow={true}
                    tabIndex={5}
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableCell
                    id="cell-0-6"
                    value={newRowData.unit}
                    onSave={(value) => handleNewRowChange("unit", value)}
                    onNavigate={(direction) => handleCellNavigation(0, 6, direction)}
                    placeholder="un"
                    isNewRow={true}
                    tabIndex={6}
                  />
                </TableCell>
                <TableCell className="p-0">
                  <Select value={newRowData.supplier_id || "none"} onValueChange={handleNewRowSupplierChange}>
                    <SelectTrigger className="w-full border-0 h-full">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem fornecedor</SelectItem>
                      <SelectItem value="new">+ Novo Fornecedor</SelectItem>
                      {materialSuppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-0">
                  <EditableCell
                    id="cell-0-8"
                    value={newRowData.estimated_total_cost}
                    onSave={(value) => handleNewRowChange("estimated_total_cost", value)}
                    onNavigate={(direction) => handleCellNavigation(0, 8, direction)}
                    type="number"
                    placeholder="0.00"
                    isNewRow={true}
                    tabIndex={7}
                  />
                </TableCell>
                <TableCell className="p-0">
                  <div className="p-2 text-sm text-muted-foreground italic bg-muted/30" tabIndex={-1}>
                    -
                  </div>
                </TableCell>
                <TableCell className="p-0">
                  <EditableCell
                    id="cell-0-10"
                    value={newRowData.payment_date}
                    onSave={(value) => handleNewRowChange("payment_date", value)}
                    onNavigate={(direction) => handleCellNavigation(0, 10, direction)}
                    type="date"
                    placeholder="DD/MM/AAAA"
                    isNewRow={true}
                    tabIndex={8}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={createNewMaterial}
                    disabled={isCreatingNew || !newRowData.material_name?.trim()}
                    className="h-8 w-8 p-0"
                    tabIndex={-1}
                  >
                    +
                  </Button>
                </TableCell>
              </TableRow>

              {/* Existing materials */}
              {filteredMaterials.map((material, materialIndex) => {
                const rowIndex = materialIndex + 1;
                return (
                  <TableRow key={material.id}>
                    <TableCell className="p-2">
                      <Checkbox
                        checked={selectedMaterials.has(material.id)}
                        onCheckedChange={(checked) => handleSelectMaterial(material.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <EditableCell
                        id={`cell-${rowIndex}-1`}
                        value={material.project_id || null}
                        onSave={(value) => {
                          if (value !== material.project_id) {
                            handleUpdateField(material.id, "stage_id", "");
                          }
                          handleUpdateField(material.id, "project_id", value);
                        }}
                        onNavigate={(direction) => handleCellNavigation(rowIndex, 1, direction)}
                        type="select"
                        options={projectOptions}
                        tabIndex={rowIndex * 8 + 1}
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <EditableCell
                        id={`cell-${rowIndex}-2`}
                        value={material.stage_id || ""}
                        onSave={(value) => handleUpdateField(material.id, "stage_id", value)}
                        onNavigate={(direction) => handleCellNavigation(rowIndex, 2, direction)}
                        type="select"
                        options={getStageOptions(material.project_id || "")}
                        tabIndex={rowIndex * 8 + 2}
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <EditableCell
                        id={`cell-${rowIndex}-3`}
                        value={material.status}
                        onSave={(value) => handleUpdateField(material.id, "status", value)}
                        onNavigate={(direction) => handleCellNavigation(rowIndex, 3, direction)}
                        type="select"
                        options={[
                          { value: "requested", label: "Solicitado" },
                          { value: "delivered", label: "Entregue" },
                          { value: "used", label: "Usado" },
                        ]}
                        tabIndex={rowIndex * 8 + 3}
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <EditableCell
                        id={`cell-${rowIndex}-4`}
                        value={material.material_name}
                        onSave={(value) => handleUpdateField(material.id, "material_name", value)}
                        onNavigate={(direction) => handleCellNavigation(rowIndex, 4, direction)}
                        placeholder="Nome do material"
                        tabIndex={rowIndex * 8 + 4}
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <EditableCell
                        id={`cell-${rowIndex}-5`}
                        value={material.quantity?.toString() || ""}
                        onSave={(value) => handleUpdateField(material.id, "quantity", Number(value))}
                        onNavigate={(direction) => handleCellNavigation(rowIndex, 5, direction)}
                        type="number"
                        placeholder="0"
                        tabIndex={rowIndex * 8 + 5}
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <EditableCell
                        id={`cell-${rowIndex}-6`}
                        value={material.unit}
                        onSave={(value) => handleUpdateField(material.id, "unit", value)}
                        onNavigate={(direction) => handleCellNavigation(rowIndex, 6, direction)}
                        placeholder="un"
                        tabIndex={rowIndex * 8 + 6}
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <Select
                        value={material.supplier_id || "none"}
                        onValueChange={(value) => handleSupplierChange(material.id, value)}
                      >
                        <SelectTrigger className="w-full border-0 h-full">
                          <SelectValue placeholder="Selecionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem fornecedor</SelectItem>
                          <SelectItem value="new">+ Novo Fornecedor</SelectItem>
                          {materialSuppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-0">
                      <EditableCell
                        id={`cell-${rowIndex}-8`}
                        value={material.estimated_total_cost?.toString() || ""}
                        onSave={(value) => handleUpdateField(material.id, "estimated_total_cost", Number(value))}
                        onNavigate={(direction) => handleCellNavigation(rowIndex, 8, direction)}
                        type="number"
                        placeholder="0.00"
                        tabIndex={rowIndex * 8 + 7}
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <div className="p-2 text-sm text-muted-foreground italic bg-muted/30" tabIndex={-1}>
                        {material.estimated_unit_cost
                          ? `R$ ${material.estimated_unit_cost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="p-0">
                      <EditableCell
                        id={`cell-${rowIndex}-10`}
                        value={material.delivery_date || ""}
                        onSave={(value) => handleUpdateField(material.id, "delivery_date", value)}
                        onNavigate={(direction) => handleCellNavigation(rowIndex, 10, direction)}
                        type="date"
                        placeholder="DD/MM/AAAA"
                        tabIndex={rowIndex * 8 + 8}
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        tabIndex={-1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Single Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir este material? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão em lote</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir {selectedMaterials.size} materiais? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Status Change Dialog */}
      <AlertDialog open={bulkStatusDialogOpen} onOpenChange={setBulkStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar mudança de status</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja marcar {selectedMaterials.size} materiais como "Entregue"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkStatusChange}>Marcar como Entregue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Supplier Name Input Dialog */}
      <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Fornecedor</DialogTitle>
            <DialogDescription>Digite o nome do fornecedor que você deseja adicionar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="supplier-name">Nome do Fornecedor</Label>
              <Input
                id="supplier-name"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Digite o nome do fornecedor..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && supplierName.trim()) {
                    createSupplierWithName();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSupplierDialogOpen(false);
                setSupplierName("");
                setMaterialForNewSupplier(null);
              }}
              disabled={isCreatingSupplier}
            >
              Cancelar
            </Button>
            <Button onClick={createSupplierWithName} disabled={isCreatingSupplier || !supplierName.trim()}>
              {isCreatingSupplier ? "Criando..." : "Criar Fornecedor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
