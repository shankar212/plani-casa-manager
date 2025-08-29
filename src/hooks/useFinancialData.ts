import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProjects } from './useProjects';

interface FinancialData {
  materialCost: number;
  laborCost: number;
  saleValue: number;
}

export const useFinancialData = (projectId: string | undefined) => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    materialCost: 0,
    laborCost: 0,
    saleValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const { updateProject } = useProjects();

  const fetchFinancialData = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch material costs
      const { data: materials, error: materialError } = await supabase
        .from('materials')
        .select('total_cost')
        .eq('project_id', projectId)
        .not('total_cost', 'is', null);

      if (materialError) throw materialError;

      // Fetch labor costs (confirmed payments only)
      const { data: serviceProviders, error: serviceError } = await supabase
        .from('service_providers')
        .select('contract_value')
        .eq('project_id', projectId)
        .eq('payment_status', 'pago');

      if (serviceError) throw serviceError;

      // Fetch project sale value
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('sale_value')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Calculate totals
      const materialCost = materials?.reduce((sum, material) => sum + (material.total_cost || 0), 0) || 0;
      const laborCost = serviceProviders?.reduce((sum, provider) => sum + (provider.contract_value || 0), 0) || 0;
      const saleValue = project?.sale_value || 0;

      setFinancialData({
        materialCost,
        laborCost,
        saleValue,
      });

    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const updateSaleValue = async (newSaleValue: number) => {
    if (!projectId) return;

    try {
      await updateProject(projectId, { sale_value: newSaleValue });
      setFinancialData(prev => ({ ...prev, saleValue: newSaleValue }));
      toast.success('Valor de venda atualizado');
    } catch (error) {
      console.error('Error updating sale value:', error);
      toast.error('Erro ao atualizar valor de venda');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  useEffect(() => {
    fetchFinancialData();
  }, [projectId]);

  return {
    financialData,
    loading,
    updateSaleValue,
    formatCurrency,
    refetch: fetchFinancialData,
  };
};