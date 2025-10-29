import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditableCell } from "./EditableCell";
import { useMaterials, Material, NewMaterial } from "@/hooks/useMaterials";
import { useProjects } from "@/hooks/useProjects";
import { useMaterialSuppliers } from "@/hooks/useSuppliers";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Check, X, Search, Package, DollarSign, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { materialSchema } from "@/lib/validationSchemas";
import { toast } from "sonner";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

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

  const projectOptions = [
    { value: null, label: "Sem Projeto" },
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
      // Open dialog to get supplier name
      setMaterialForNewSupplier(materialId);
      setSupplierDialogOpen(true);
    } else {
      await updateMaterial(materialId, { supplier_id: supplierId === "none" ? null : supplierId });
    }
  };

  const handleNewRowSupplierChange = (supplierId: string) => {
    if (supplierId === "new") {
      // Open dialog to get supplier name for new row
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
          // Update new row data
          handleNewRowChange("supplier_id", newSupplier.id);
        } else if (materialForNewSupplier) {
          // Update existing material
          await updateMaterial(materialForNewSupplier, { supplier_id: newSupplier.id });
        }
      }

      // Close dialog and reset state
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

      // If updating total cost or quantity, recalculate unit cost
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
    console.log("Updating new row field:", field, "with value:", value);
    setNewRowData((prev) => ({
      ...prev,
      [field]: value?.toString() || "",
    }));
  };

  const createNewMaterial = async () => {
    if (isCreatingNew) return;

    // Check if we have at least a material name
    if (!newRowData.material_name?.trim()) {
      console.log("No material name provided, not creating material");
      return;
    }

    setIsCreatingNew(true);

    try {
      // Convert string values to proper types for database
      const quantity = Number(newRowData.quantity) || 1;
      const estimatedTotalCost = Number(newRowData.estimated_total_cost) || 0;
      const status = (newRowData.status as "requested" | "delivered") || "requested";

      // Validate input using zod schema
      const validationResult = materialSchema.safeParse({
        material_name: newRowData.material_name.trim(),
        quantity: quantity,
        unit: newRowData.unit || "un",
        estimated_unit_cost: 0,
        notes: "",
        invoice_number: "",
      });

      if (!validationResult.success) {
        toast.error(validationResult.error.errors[0].message);
        setIsCreatingNew(false);
        return;
      }

      const newMaterial: NewMaterial = {
        material_name: validationResult.data.material_name,
        quantity: validationResult.data.quantity,
        unit: validationResult.data.unit,
        status: status,
        estimated_total_cost: estimatedTotalCost,
        estimated_unit_cost: 0,
        project_id: newRowData.project_id || null,
        stage_id: newRowData.stage_id || null,
        supplier_id: newRowData.supplier_id && newRowData.supplier_id !== "none" ? newRowData.supplier_id : null,
        user_id: user?.id || null,
        delivery_date: newRowData.payment_date || null,
      };

      // Calculate unit cost if both total cost and quantity are available
      if (newMaterial.estimated_total_cost && newMaterial.quantity) {
        newMaterial.estimated_unit_cost = calculateUnitCost(newMaterial.estimated_total_cost, newMaterial.quantity);
      }

      console.log("Creating new material:", newMaterial);
      const createdMaterial = await createMaterial(newMaterial);
      console.log("Material created successfully:", createdMaterial);

      // Clear the new row data
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

      // Force refetch to ensure the new material appears
      setTimeout(() => {
        refetch();
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
      try {
        await deleteMaterial(materialToDelete);
      } catch (error) {
        console.error("Error deleting material:", error);
      }
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
      setSelectedMaterials(new Set(materials.map((m) => m.id)));
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

  // Filter and search materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const matchesSearch = searchQuery === "" || 
        material.material_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.projects?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || material.status === statusFilter;
      const matchesProject = projectFilter === "all" || material.project_id === projectFilter;
      
      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [materials, searchQuery, statusFilter, projectFilter]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalMaterials = filteredMaterials.length;
    const totalCost = filteredMaterials.reduce((sum, m) => sum + (m.estimated_total_cost || 0), 0);
    const deliveredCount = filteredMaterials.filter(m => m.status === 'delivered').length;
    const requestedCount = filteredMaterials.filter(m => m.status === 'requested').length;
    
    return {
      totalMaterials,
      totalCost,
      deliveredCount,
      requestedCount,
      deliveryRate: totalMaterials > 0 ? (deliveredCount / totalMaterials) * 100 : 0
    };
  }, [filteredMaterials]);

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Entregue
          </Badge>
        );
      case 'requested':
        return (
          <Badge variant="default" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Solicitado
          </Badge>
        );
      case 'used':
        return (
          <Badge variant="default" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
            <Check className="h-3 w-3 mr-1" />
            Usado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate tab index for a cell
  const getTabIndex = (rowIndex: number, cellIndex: number) => {
    const editableCellsPerRow = 9; // 11 total cells - 2 disabled cells (unit cost at index 9)

    // Skip the disabled cell (unit cost at index 9) in tab order
    let adjustedCellIndex = cellIndex;
    if (cellIndex > 9) {
      adjustedCellIndex = cellIndex - 1;
    }

    return rowIndex * editableCellsPerRow + adjustedCellIndex + 1;
  };

  const handleCellNavigation = (
    currentRowIndex: number,
    currentCellIndex: number,
    direction: "next" | "prev" | "down" | "up",
  ) => {
    console.log("Navigation called:", { currentRowIndex, currentCellIndex, direction });

    const totalRows = materials.length + 1; // +1 for the new material row at index 0
    let newRowIndex = currentRowIndex;
    let newCellIndex = currentCellIndex;

    switch (direction) {
      case "next":
        newCellIndex++;
        // Skip checkbox column (index 0) and disabled cell (unit cost at index 9)
        if (newCellIndex === 9) {
          newCellIndex = 10;
        }
        if (newCellIndex > 10) {
          newCellIndex = 1; // Skip checkbox column
          newRowIndex++;
          if (newRowIndex >= totalRows) {
            newRowIndex = 0; // Wrap to first row
          }
        }

        // Special case: if we're in new row and going to next from payment_date column (last cell)
        if (currentRowIndex === 0 && currentCellIndex === 10) {
          createNewMaterial();
          return;
        }
        break;
      case "prev":
        newCellIndex--;
        // Skip checkbox column (index 0) and disabled cell (unit cost at index 9)
        if (newCellIndex === 9) {
          newCellIndex = 8;
        }
        if (newCellIndex < 1) {
          // Skip checkbox column
          newCellIndex = 10;
          newRowIndex--;
          if (newRowIndex < 0) {
            newRowIndex = totalRows - 1; // Wrap to last row
          }
        }
        break;
      case "down":
        // Special case: if we're in new row and press Enter/Down, create material
        if (currentRowIndex === 0) {
          createNewMaterial();
          return;
        }

        newRowIndex++;
        if (newRowIndex >= totalRows) {
          newRowIndex = 0; // Wrap to first row
        }
        break;
      case "up":
        newRowIndex--;
        if (newRowIndex < 0) {
          newRowIndex = totalRows - 1; // Wrap to last row
        }
        break;
    }

    console.log("Calculated new position:", { newRowIndex, newCellIndex });

    // Find the cell using ID instead of tab index for more reliable focusing
    const cellId = `cell-${newRowIndex}-${newCellIndex}`;
    const newCell = document.getElementById(cellId) as HTMLElement;

    if (newCell) {
      newCell.focus();
      console.log("Successfully focused cell:", cellId);
    } else {
      console.log("Could not find cell with ID:", cellId);

      // Fallback to tab index method
      const newTabIndex = getTabIndex(newRowIndex, newCellIndex);
      const newCellByTabIndex = document.querySelector(`[tabindex="${newTabIndex}"]`) as HTMLElement;
      if (newCellByTabIndex) {
        newCellByTabIndex.focus();
        console.log("Successfully focused cell with tab index:", newTabIndex);
      } else {
        console.log("Could not find cell with tab index:", newTabIndex);
      }
    }
  };

  if (loading || stagesLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Package className="h-4 w-4" />
              <span>Total de Materiais</span>
            </div>
            <p className="text-2xl font-bold">{summaryStats.totalMaterials}</p>
          </div>
          <div className="bg-card border rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <DollarSign className="h-4 w-4" />
              <span>Custo Total Est.</span>
            </div>
            <p className="text-2xl font-bold">
              R$ {summaryStats.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Entregues</span>
            </div>
            <p className="text-2xl font-bold">{summaryStats.deliveredCount}</p>
          </div>
          <div className="bg-card border rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Taxa de Entrega</span>
            </div>
            <p className="text-2xl font-bold">{summaryStats.deliveryRate.toFixed(0)}%</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 flex-1 w-full md:w-auto">
            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar materiais..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="requested">Solicitado</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="used">Usado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Projetos</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedMaterials.size > 0 && (
            <div className="flex gap-2 w-full md:w-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="flex items-center gap-2 flex-1 md:flex-initial">
                    <Trash2 className="h-4 w-4" />
                    Excluir ({selectedMaterials.size})
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Excluir materiais selecionados</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="default" size="sm" onClick={handleBulkStatusChange} className="flex items-center gap-2 flex-1 md:flex-initial">
                    <Check className="h-4 w-4" />
                    Marcar Entregue ({selectedMaterials.size})
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Marcar materiais como entregues</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {filteredMaterials.length === 0 && materials.length === 0 ? (
          <div className="border rounded-lg p-12 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Nenhum material cadastrado</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Comece adicionando seu primeiro material usando o formulário acima da tabela.
              </p>
            </div>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="border rounded-lg p-12 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Nenhum material encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Tente ajustar os filtros de busca para encontrar os materiais desejados.
              </p>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
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
              {/* New material row - at the top (index 0) */}
              <TableRow className="bg-muted/20">
                <TableCell className="p-2">{/* Empty checkbox column for new row */}</TableCell>
                <TableCell className="p-0">
                  <EditableCell
                    id="cell-0-1"
                    value={newRowData.project_id}
                    onSave={(value) => {
                      handleNewRowChange("project_id", value);
                      // Clear stage when project changes
                      if (value !== newRowData.project_id) {
                        handleNewRowChange("stage_id", "");
                      }
                    }}
                    onNavigate={(direction) => handleCellNavigation(0, 1, direction)}
                    type="select"
                    options={projectOptions}
                    isNewRow={true}
                    tabIndex={getTabIndex(0, 1)}
                  />
                </TableCell>
                <TableCell className="p-0">
                  <EditableCell
                    id="cell-0-2"
                    value={newRowData.stage_id}
                    onSave={(value) => {
                      handleNewRowChange("stage_id", value);
                      console.log("Setting stage_id to:", value);
                    }}
                    onNavigate={(direction) => handleCellNavigation(0, 2, direction)}
                    type="select"
                    options={
                      newRowData.project_id
                        ? getStageOptions(newRowData.project_id)
                        : [{ value: "", label: "Selecione um projeto primeiro" }]
                    }
                    isNewRow={true}
                    tabIndex={getTabIndex(0, 2)}
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
                    tabIndex={getTabIndex(0, 3)}
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
                    tabIndex={getTabIndex(0, 4)}
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
                    tabIndex={getTabIndex(0, 5)}
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
                    tabIndex={getTabIndex(0, 6)}
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
                    tabIndex={getTabIndex(0, 8)}
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
                    tabIndex={getTabIndex(0, 10)}
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
                          // Clear stage when project changes
                          if (value !== material.project_id) {
                            handleUpdateField(material.id, "stage_id", "");
                          }
                          handleUpdateField(material.id, "project_id", value);
                        }}
                        onNavigate={(direction) => handleCellNavigation(rowIndex, 1, direction)}
                        type="select"
                        options={projectOptions}
                        tabIndex={getTabIndex(rowIndex, 1)}
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
                        tabIndex={getTabIndex(rowIndex, 2)}
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
                        tabIndex={getTabIndex(rowIndex, 3)}
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <EditableCell
                        id={`cell-${rowIndex}-4`}
                        value={material.material_name}
                        onSave={(value) => handleUpdateField(material.id, "material_name", value)}
                        onNavigate={(direction) => handleCellNavigation(rowIndex, 4, direction)}
                        placeholder="Nome do material"
                        tabIndex={getTabIndex(rowIndex, 4)}
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
                        tabIndex={getTabIndex(rowIndex, 5)}
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <EditableCell
                        id={`cell-${rowIndex}-6`}
                        value={material.unit}
                        onSave={(value) => handleUpdateField(material.id, "unit", value)}
                        onNavigate={(direction) => handleCellNavigation(rowIndex, 6, direction)}
                        placeholder="un"
                        tabIndex={getTabIndex(rowIndex, 6)}
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
                        tabIndex={getTabIndex(rowIndex, 8)}
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
                        tabIndex={getTabIndex(rowIndex, 10)}
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
        )}
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
    </TooltipProvider>
  );
};
