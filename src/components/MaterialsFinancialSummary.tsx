import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Material } from "@/hooks/useMaterials";

interface MaterialSupplier {
  id: string;
  name: string;
}

interface ProjectStage {
  id: string;
  name: string;
}

interface MaterialsFinancialSummaryProps {
  materials: Material[];
  suppliers: MaterialSupplier[];
  stages: ProjectStage[];
  projectId: string;
}

interface GroupedMaterials {
  [supplierId: string]: {
    supplier: MaterialSupplier;
    totalCost: number;
    stages: {
      [stageId: string]: {
        stage: ProjectStage | null;
        materials: Material[];
        totalCost: number;
      };
    };
  };
}

export const MaterialsFinancialSummary = ({ 
  materials, 
  suppliers, 
  stages, 
  projectId 
}: MaterialsFinancialSummaryProps) => {
  const [expandedSuppliers, setExpandedSuppliers] = useState<Set<string>>(new Set());
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  // Filter materials for this project
  const projectMaterials = materials.filter(material => material.project_id === projectId);

  // Group materials by supplier and stage
  const groupedMaterials: GroupedMaterials = projectMaterials.reduce((acc, material) => {
    const supplierId = material.supplier_id || 'no-supplier';
    const stageId = material.stage_id || 'no-stage';
    
    if (!acc[supplierId]) {
      const supplier = suppliers.find(s => s.id === supplierId) || { id: supplierId, name: 'Sem fornecedor' };
      acc[supplierId] = {
        supplier,
        totalCost: 0,
        stages: {}
      };
    }

    if (!acc[supplierId].stages[stageId]) {
      const stage = stages.find(s => s.id === stageId) || null;
      acc[supplierId].stages[stageId] = {
        stage: stage || { id: stageId, name: 'Sem etapa' },
        materials: [],
        totalCost: 0
      };
    }

    const materialCost = (material.estimated_total_cost || 0);
    acc[supplierId].stages[stageId].materials.push(material);
    acc[supplierId].stages[stageId].totalCost += materialCost;
    acc[supplierId].totalCost += materialCost;

    return acc;
  }, {} as GroupedMaterials);

  const totalMaterialsCost = Object.values(groupedMaterials).reduce(
    (sum, supplier) => sum + supplier.totalCost, 
    0
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const toggleSupplier = (supplierId: string) => {
    setExpandedSuppliers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(supplierId)) {
        newSet.delete(supplierId);
      } else {
        newSet.add(supplierId);
      }
      return newSet;
    });
  };

  const toggleStage = (key: string) => {
    setExpandedStages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  if (projectMaterials.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">materiais</h2>
        <p className="text-muted-foreground text-center py-8">
          Nenhum material cadastrado para este projeto
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">materiais</h2>
        <div className="text-right">
          <div className="text-lg font-semibold">{formatCurrency(totalMaterialsCost)}</div>
          <div className="text-sm text-muted-foreground">total em materiais</div>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(groupedMaterials).map(([supplierId, supplierGroup]) => {
          const isSupplierExpanded = expandedSuppliers.has(supplierId);
          
          return (
            <div key={supplierId} className="border rounded-lg">
              <button
                onClick={() => toggleSupplier(supplierId)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {isSupplierExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="font-medium">{supplierGroup.supplier.name}</span>
                </div>
                <span className="font-medium">{formatCurrency(supplierGroup.totalCost)}</span>
              </button>

              {isSupplierExpanded && (
                <div className="border-t bg-muted/20">
                  {Object.entries(supplierGroup.stages).map(([stageId, stageGroup]) => {
                    const stageKey = `${supplierId}-${stageId}`;
                    const isStageExpanded = expandedStages.has(stageKey);
                    
                    return (
                      <div key={stageKey} className="border-b last:border-b-0">
                        <button
                          onClick={() => toggleStage(stageKey)}
                          className="w-full flex items-center justify-between p-3 pl-8 text-left hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            {isStageExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                            <span className="text-sm">{stageGroup.stage?.name}</span>
                          </div>
                          <span className="text-sm font-medium">{formatCurrency(stageGroup.totalCost)}</span>
                        </button>

                        {isStageExpanded && (
                          <div className="bg-muted/30">
                            {stageGroup.materials.map((material) => (
                              <div key={material.id} className="flex justify-between items-center p-3 pl-12 text-sm border-b last:border-b-0">
                                <div>
                                  <span className="font-medium">{material.material_name}</span>
                                  <span className="text-muted-foreground ml-2">
                                    {material.quantity} {material.unit}
                                  </span>
                                </div>
                                <span className="font-medium">
                                  {formatCurrency(material.estimated_total_cost || 0)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};