import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Package, MapPin, DollarSign, Truck } from "lucide-react";
import { NewMaterial } from "@/hooks/useMaterials";
import { materialSchema } from "@/lib/validationSchemas";
import { toast } from "sonner";

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (material: NewMaterial) => Promise<void>;
  projects: Array<{ id: string; name: string }>;
  stages: Array<{ id: string; name: string; project_id: string }>;
  suppliers: Array<{ id: string; name: string }>;
  userId: string | undefined;
  onCreateSupplier: () => void;
}

export const AddMaterialDialog: React.FC<AddMaterialDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  projects,
  stages,
  suppliers,
  userId,
  onCreateSupplier,
}) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    material_name: "",
    quantity: "1",
    unit: "un",
    project_id: "",
    stage_id: "",
    supplier_id: "",
    estimated_total_cost: "",
    status: "requested" as "requested" | "delivered",
    delivery_date: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear stage when project changes
    if (field === "project_id" && value !== formData.project_id) {
      setFormData((prev) => ({ ...prev, stage_id: "" }));
    }
  };

  const getStageOptions = () => {
    if (!formData.project_id) {
      return [];
    }
    return stages.filter((stage) => stage.project_id === formData.project_id);
  };

  const calculateUnitCost = (totalCost: number, quantity: number) => {
    return quantity > 0 ? totalCost / quantity : 0;
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.material_name.trim()) {
      toast.error("Nome do material é obrigatório");
      setActiveTab("basic");
      return;
    }

    const quantity = Number(formData.quantity) || 1;
    const estimatedTotalCost = Number(formData.estimated_total_cost) || 0;

    // Validate using zod schema
    const validationResult = materialSchema.safeParse({
      material_name: formData.material_name.trim(),
      quantity: quantity,
      unit: formData.unit || "un",
      estimated_unit_cost: 0,
      notes: "",
      invoice_number: "",
    });

    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      const newMaterial: NewMaterial = {
        material_name: validationResult.data.material_name,
        quantity: validationResult.data.quantity,
        unit: validationResult.data.unit,
        status: formData.status,
        estimated_total_cost: estimatedTotalCost,
        estimated_unit_cost: 0,
        project_id: formData.project_id || null,
        stage_id: formData.stage_id || null,
        supplier_id: formData.supplier_id && formData.supplier_id !== "none" ? formData.supplier_id : null,
        user_id: userId || null,
        delivery_date: formData.delivery_date || null,
      };

      // Calculate unit cost if both total cost and quantity are available
      if (newMaterial.estimated_total_cost && newMaterial.quantity) {
        newMaterial.estimated_unit_cost = calculateUnitCost(newMaterial.estimated_total_cost, newMaterial.quantity);
      }

      await onSubmit(newMaterial);

      // Reset form
      setFormData({
        material_name: "",
        quantity: "1",
        unit: "un",
        project_id: "",
        stage_id: "",
        supplier_id: "",
        estimated_total_cost: "",
        status: "requested",
        delivery_date: "",
      });
      setActiveTab("basic");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating material:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    const tabs = ["basic", "location", "financial", "delivery"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    const tabs = ["basic", "location", "financial", "delivery"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const isLastTab = activeTab === "delivery";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Novo Material
          </DialogTitle>
          <DialogDescription>Preencha os dados do material. Use as abas para navegar entre as seções.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              <span className="hidden sm:inline">Básico</span>
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="hidden sm:inline">Local</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span className="hidden sm:inline">Financeiro</span>
            </TabsTrigger>
            <TabsTrigger value="delivery" className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              <span className="hidden sm:inline">Entrega</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="material_name" className="text-sm font-medium">
                Nome do Material <span className="text-destructive">*</span>
              </Label>
              <Input
                id="material_name"
                value={formData.material_name}
                onChange={(e) => handleChange("material_name", e.target.value)}
                placeholder="Ex: Cimento, Tijolo, Areia..."
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Quantidade <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  placeholder="1"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-sm font-medium">
                  Unidade <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => handleChange("unit", e.target.value)}
                  placeholder="Ex: un, kg, m³..."
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="project_id" className="text-sm font-medium">
                Projeto
              </Label>
              <Select value={formData.project_id} onValueChange={(value) => handleChange("project_id", value)}>
                <SelectTrigger id="project_id" className="w-full">
                  <SelectValue placeholder="Selecione um projeto (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem Projeto</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage_id" className="text-sm font-medium">
                Etapa
              </Label>
              <Select
                value={formData.stage_id}
                onValueChange={(value) => handleChange("stage_id", value)}
                disabled={!formData.project_id}
              >
                <SelectTrigger id="stage_id" className="w-full">
                  <SelectValue placeholder={formData.project_id ? "Selecione uma etapa (opcional)" : "Selecione um projeto primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem Etapa</SelectItem>
                  {getStageOptions().map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="supplier_id" className="text-sm font-medium">
                Fornecedor
              </Label>
              <div className="flex gap-2">
                <Select value={formData.supplier_id} onValueChange={(value) => handleChange("supplier_id", value)} >
                  <SelectTrigger id="supplier_id" className="flex-1">
                    <SelectValue placeholder="Selecione um fornecedor (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem Fornecedor</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={onCreateSupplier}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_total_cost" className="text-sm font-medium">
                Custo Total Estimado (R$)
              </Label>
              <Input
                id="estimated_total_cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimated_total_cost}
                onChange={(e) => handleChange("estimated_total_cost", e.target.value)}
                placeholder="0.00"
                className="w-full"
              />
            </div>
            {formData.estimated_total_cost && formData.quantity && Number(formData.quantity) > 0 && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                  Custo unitário estimado:{" "}
                  <span className="font-semibold text-foreground">
                    R${" "}
                    {calculateUnitCost(Number(formData.estimated_total_cost), Number(formData.quantity)).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="delivery" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requested">Solicitado</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_date" className="text-sm font-medium">
                Data de Entrega
              </Label>
              <Input
                id="delivery_date"
                type="date"
                value={formData.delivery_date}
                onChange={(e) => handleChange("delivery_date", e.target.value)}
                className="w-full"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handlePrevious} disabled={activeTab === "basic" || isSubmitting}>
            Anterior
          </Button>
          <Button type="button" onClick={handleNext} disabled={isSubmitting}>
            {isLastTab ? (isSubmitting ? "Criando..." : "Criar Material") : "Próximo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
