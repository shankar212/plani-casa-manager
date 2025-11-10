import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditableCell } from "./EditableCell";
import { useMaterials, Material, NewMaterial } from "@/hooks/useMaterials";
import { useProjects } from "@/hooks/useProjects";
import { useMaterialSuppliers } from "@/hooks/useSuppliers";
import { useAuth } from "@/contexts/AuthContext";
import { materialSchema } from "@/lib/validationSchemas";
import {
  Trash2,
  Check,
  Search,
  Package,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AddMaterialDialog } from "./AddMaterialDialog";
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

// Local interface for the new row data (all strings from inputs) - No longer needed
// Material addition is now handled by AddMaterialDialog

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
  const [addMaterialDialogOpen, setAddMaterialDialogOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch all stages accessible to the user
  useEffect(() => {
    const fetchStages = async () => {
      try {
        setStagesLoading(true);
        const { data, error } = await supabase.from("project_stages").select("*").order("created_at");

        if (error) throw error;
        setStages(data || []);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error fetching stages:", error);
        }
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
          if (import.meta.env.DEV) {
            console.log("Materials table changed, refetching...");
          }
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

  const createSupplierWithName = async () => {
    if (!supplierName.trim()) return;

    if (!user?.id) {
      toast.error("Você precisa estar autenticado para criar fornecedores");
      return;
    }

    setIsCreatingSupplier(true);
    try {
      const newSupplier = await createSupplier({
        name: supplierName.trim(),
        contact_info: {},
        user_id: user.id,
      });

      if (newSupplier && materialForNewSupplier && materialForNewSupplier !== "from-add-dialog") {
        // Update existing material
        await updateMaterial(materialForNewSupplier, { supplier_id: newSupplier.id });
      }

      // Close dialog and reset state
      setSupplierDialogOpen(false);
      setSupplierName("");
      setMaterialForNewSupplier(null);

      // Reopen the add material dialog if we came from there
      if (materialForNewSupplier === "from-add-dialog") {
        setAddMaterialDialogOpen(true);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error creating supplier:", error);
      }
    } finally {
      setIsCreatingSupplier(false);
    }
  };

  const handleOpenCreateSupplierFromDialog = () => {
    setMaterialForNewSupplier("from-add-dialog");
    setSupplierDialogOpen(true);
  };

  const handleUpdateField = async (id: string, field: keyof Material, value: string | number | null) => {
    try {
      const material = materials.find((m) => m.id === id);
      if (!material) return;

      const updates: any = { [field]: value };

      // If updating total cost or quantity, recalculate unit cost
      if (field === "estimated_total_cost" || field === "quantity") {
        const newTotalCost = field === "estimated_total_cost" ? Number(value) : material.estimated_total_cost;
        const newQuantity = field === "quantity" ? Number(value) : material.quantity;

        if (newTotalCost && newQuantity) {
          updates.estimated_unit_cost = calculateUnitCost(Number(newTotalCost), Number(newQuantity));
        }
      }

      // Build complete material object for validation
      const updatedMaterial = { ...material, ...updates };
      const materialData = {
        material_name: updatedMaterial.material_name,
        quantity: Number(updatedMaterial.quantity),
        unit: updatedMaterial.unit,
        estimated_unit_cost: updatedMaterial.estimated_unit_cost ? Number(updatedMaterial.estimated_unit_cost) : undefined,
        notes: updatedMaterial.notes || undefined,
        invoice_number: updatedMaterial.invoice_number || undefined,
      };

      // Validate the updated material data
      const validation = materialSchema.safeParse(materialData);
      if (!validation.success) {
        toast.error("Erro de validação", {
          description: validation.error.errors[0].message,
        });
        return;
      }

      await updateMaterial(id, updates);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error updating material:", error);
      }
    }
  };

  const createNewMaterial = async (newMaterial: NewMaterial) => {
    try {
      // Prepare material data for validation
      const materialData = {
        material_name: newMaterial.material_name,
        quantity: Number(newMaterial.quantity),
        unit: newMaterial.unit,
        estimated_unit_cost: newMaterial.estimated_unit_cost ? Number(newMaterial.estimated_unit_cost) : undefined,
        notes: newMaterial.notes || undefined,
        invoice_number: newMaterial.invoice_number || undefined,
      };

      // Validate material data before creation
      const validation = materialSchema.safeParse(materialData);
      if (!validation.success) {
        toast.error("Erro de validação", {
          description: validation.error.errors[0].message,
        });
        throw new Error(validation.error.errors[0].message);
      }

      await createMaterial(newMaterial);
      // Force refetch to ensure the new material appears
      setTimeout(() => {
        refetch();
      }, 100);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error creating material:", error);
      }
      throw error;
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
        if (import.meta.env.DEV) {
          console.error("Error deleting material:", error);
        }
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
      if (import.meta.env.DEV) {
        console.error("Error bulk deleting materials:", error);
      }
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
      if (import.meta.env.DEV) {
        console.error("Error bulk updating material status:", error);
      }
    }
    setBulkStatusDialogOpen(false);
  };

  const toggleRowExpansion = (materialId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(materialId)) {
      newExpanded.delete(materialId);
    } else {
      newExpanded.add(materialId);
    }
    setExpandedRows(newExpanded);
  };

  // Filter and search materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const matchesSearch =
        searchQuery === "" ||
        material.material_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.projects?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || material.status === statusFilter;
      const matchesProject = projectFilter === "all" || material.project_id === projectFilter;

      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [materials, searchQuery, statusFilter, projectFilter]);

  const handleExpandAll = () => {
    setExpandedRows(new Set(filteredMaterials.map((m) => m.id)));
  };

  const handleCollapseAll = () => {
    setExpandedRows(new Set());
  };

  const allExpanded = filteredMaterials.length > 0 && expandedRows.size === filteredMaterials.length;

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalMaterials = filteredMaterials.length;
    const totalCost = filteredMaterials.reduce((sum, m) => sum + (m.estimated_total_cost || 0), 0);
    const deliveredCount = filteredMaterials.filter((m) => m.status === "delivered").length;
    const requestedCount = filteredMaterials.filter((m) => m.status === "requested").length;

    return {
      totalMaterials,
      totalCost,
      deliveredCount,
      requestedCount,
      deliveryRate: totalMaterials > 0 ? (deliveredCount / totalMaterials) * 100 : 0,
    };
  }, [filteredMaterials]);

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Entregue
          </Badge>
        );
      case "requested":
        return (
          <Badge variant="default" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Solicitado
          </Badge>
        );
      case "used":
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
    if (import.meta.env.DEV) {
      console.log("Navigation called:", { currentRowIndex, currentCellIndex, direction });
    }

    const totalRows = materials.length;
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

    if (import.meta.env.DEV) {
      console.log("Calculated new position:", { newRowIndex, newCellIndex });
    }

    // Find the cell using ID instead of tab index for more reliable focusing
    const cellId = `cell-${newRowIndex}-${newCellIndex}`;
    const newCell = document.getElementById(cellId) as HTMLElement;

    if (newCell) {
      newCell.focus();
      if (import.meta.env.DEV) {
        console.log("Successfully focused cell:", cellId);
      }
    } else {
      if (import.meta.env.DEV) {
        console.log("Could not find cell with ID:", cellId);
      }

      // Fallback to tab index method
      const newTabIndex = getTabIndex(newRowIndex, newCellIndex);
      const newCellByTabIndex = document.querySelector(`[tabindex="${newTabIndex}"]`) as HTMLElement;
      if (newCellByTabIndex) {
        newCellByTabIndex.focus();
        if (import.meta.env.DEV) {
          console.log("Successfully focused cell with tab index:", newTabIndex);
        }
      } else {
        if (import.meta.env.DEV) {
          console.log("Could not find cell with tab index:", newTabIndex);
        }
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
      <div className="space-y-6 animate-fade-in" style={{ animationDuration: '0.5s' }}>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Total de Materiais</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{summaryStats.totalMaterials}</p>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-5 hover:shadow-lg hover:border-accent/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                  <DollarSign className="h-4 w-4 text-accent" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Custo Total Est.</span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                R$ {summaryStats.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-5 hover:shadow-lg hover:border-green-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Entregues</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{summaryStats.deliveredCount}</p>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Taxa de Entrega</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{summaryStats.deliveryRate.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-3 flex-1 w-full md:w-auto">
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar materiais..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-border/60 focus:border-primary"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[160px] border-border/60">
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
                <SelectTrigger className="w-full md:w-[200px] border-border/60">
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

            <div className="flex gap-2 w-full md:w-auto">
              {selectedMaterials.size > 0 && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 flex-1 md:flex-initial shadow-sm bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20 hover:border-destructive/50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Excluir ({selectedMaterials.size})</span>
                        <span className="sm:hidden">({selectedMaterials.size})</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir materiais selecionados</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleBulkStatusChange}
                        className="flex items-center gap-2 flex-1 md:flex-initial shadow-sm"
                      >
                        <Check className="h-4 w-4" />
                        <span className="hidden sm:inline">Marcar ({selectedMaterials.size})</span>
                        <span className="sm:hidden">({selectedMaterials.size})</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Marcar materiais como entregues</TooltipContent>
                  </Tooltip>
                </>
              )}
              <Button
                onClick={() => setAddMaterialDialogOpen(true)}
                className="flex items-center gap-2 flex-1 md:flex-initial shadow-sm hover:shadow-md transition-shadow"
              >
                <Plus className="h-4 w-4" />
                Novo Material
              </Button>
            </div>
          </div>
        </div>

        {filteredMaterials.length === 0 && materials.length === 0 ? (
          <div className="bg-card/50 border border-border/50 rounded-xl p-12 text-center space-y-6 backdrop-blur-sm animate-fade-in">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground">Nenhum material cadastrado</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Comece adicionando seu primeiro material para começar a gerenciar seu estoque de forma eficiente.
              </p>
            </div>
            <Button 
              onClick={() => setAddMaterialDialogOpen(true)} 
              size="lg"
              className="mt-2 shadow-md hover:shadow-lg transition-shadow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Material
            </Button>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="bg-card/50 border border-border/50 rounded-xl p-12 text-center space-y-6 backdrop-blur-sm animate-fade-in">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground">Nenhum material encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Tente ajustar os filtros de busca ou limpar os filtros para encontrar os materiais desejados.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/60 bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-[50px] font-semibold">
                      <Checkbox
                        checked={selectedMaterials.size === filteredMaterials.length && filteredMaterials.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">Projeto</TableHead>
                    <TableHead className="font-semibold text-foreground">Etapa</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground">Material</TableHead>
                    <TableHead className="font-semibold text-foreground">Quantidade</TableHead>
                    <TableHead className="w-[100px] font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <span>Ações</span>
                        {filteredMaterials.length > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={allExpanded ? handleCollapseAll : handleExpandAll}
                                className="h-6 w-6 p-0 hover:bg-primary/10"
                              >
                                {allExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{allExpanded ? "Recolher Todos" : "Expandir Todos"}</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Existing materials */}
                  {filteredMaterials.map((material, materialIndex) => {
                    const rowIndex = materialIndex;
                    const isExpanded = expandedRows.has(material.id);
                    return (
                      <React.Fragment key={material.id}>
                        <TableRow
                          className={`group hover:bg-muted/40 transition-all duration-200 ${materialIndex % 2 === 0 ? "bg-background" : "bg-muted/20"} ${isExpanded ? "border-l-4 border-l-primary shadow-sm" : ""}`}
                        >
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
                          <TableCell className="p-2">
                            <div className="flex items-center gap-3">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleRowExpansion(material.id)}
                                    className="h-6 w-6 p-0 bg-white hover:bg-white/90 rounded-full border border-black shadow-md hover:shadow-lg transition-all"
                                    tabIndex={-1}
                                  >
                                    <ChevronDown
                                      className={`h-3 w-3 text-black transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                                      strokeWidth={3}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{isExpanded ? "Collapse" : "Expand"}</TooltipContent>
                              </Tooltip>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMaterial(material.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                tabIndex={-1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {/* Expanded details */}
                        {isExpanded && (
                          <TableRow className="bg-gradient-to-br from-muted/60 to-muted/30 border-l-4 border-l-primary">
                            <TableCell colSpan={7} className="p-0">
                              <div className="p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Unidade</Label>
                                    <EditableCell
                                      id={`cell-expanded-${rowIndex}-6`}
                                      value={material.unit}
                                      onSave={(value) => handleUpdateField(material.id, "unit", value)}
                                      onNavigate={(direction) => handleCellNavigation(rowIndex, 6, direction)}
                                      placeholder="un"
                                      tabIndex={getTabIndex(rowIndex, 6)}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Custo Total Est.</Label>
                                    <EditableCell
                                      id={`cell-expanded-${rowIndex}-8`}
                                      value={material.estimated_total_cost?.toString() || ""}
                                      onSave={(value) =>
                                        handleUpdateField(material.id, "estimated_total_cost", Number(value))
                                      }
                                      onNavigate={(direction) => handleCellNavigation(rowIndex, 8, direction)}
                                      type="number"
                                      placeholder="0.00"
                                      tabIndex={getTabIndex(rowIndex, 8)}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Custo Unit. Est.</Label>
                                    <div className="p-2 text-sm text-muted-foreground italic bg-background border rounded-md mt-1">
                                      {material.estimated_unit_cost
                                        ? `R$ ${material.estimated_unit_cost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : "-"}
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Fornecedor</Label>
                                    <Select
                                      value={material.supplier_id || "none"}
                                      onValueChange={(value) => handleSupplierChange(material.id, value)}
                                    >
                                      <SelectTrigger className="w-full mt-1">
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
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Data de Pagamento</Label>
                                    <EditableCell
                                      id={`cell-expanded-${rowIndex}-10`}
                                      value={material.delivery_date || ""}
                                      onSave={(value) => handleUpdateField(material.id, "delivery_date", value)}
                                      onNavigate={(direction) => handleCellNavigation(rowIndex, 10, direction)}
                                      type="date"
                                      placeholder="DD/MM/AAAA"
                                      tabIndex={getTabIndex(rowIndex, 10)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
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
                // Reopen add material dialog if we came from there
                if (materialForNewSupplier === "from-add-dialog") {
                  setAddMaterialDialogOpen(true);
                }
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

      {/* Add Material Dialog */}
      <AddMaterialDialog
        open={addMaterialDialogOpen}
        onOpenChange={setAddMaterialDialogOpen}
        onSubmit={createNewMaterial}
        projects={projects}
        stages={stages}
        suppliers={materialSuppliers}
        userId={user?.id}
        onCreateSupplier={handleOpenCreateSupplierFromDialog}
      />
    </TooltipProvider>
  );
};
