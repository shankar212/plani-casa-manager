import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Plus, X, Edit2 } from "lucide-react";
import { toast } from "sonner";
import FollowUpReport from "@/components/FollowUpReport";
import { useProjectData } from "@/hooks/useProjectData";
import { ProjectHeader } from "@/components/ProjectHeader";
import { useFinancialData } from "@/hooks/useFinancialData";
import { logError } from "@/lib/errorHandler";

interface ProjectPhoto {
  id: string;
  etapa_id: string;
  file_name: string;
  file_size: number;
  file_path: string;
  uploaded_at: string;
}

const ProjectReports = () => {
  const { id } = useParams();
  const { project, loading: projectLoading } = useProjectData(id);
  const { etapas } = useProject();
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const { financialData, loading: financialLoading, updateSaleValue, formatCurrency } = useFinancialData(id);
  const [editingSaleValue, setEditingSaleValue] = useState(false);
  const [saleValueInput, setSaleValueInput] = useState('');

  const reports = [
    { date: "15/01/2025", description: "Concluída a fundação do bloco A. Iniciados trabalhos de alvenaria." },
    { date: "14/01/2025", description: "Finalizada a instalação elétrica da subsolo. Testes iniciados." },
    { date: "13/01/2025", description: "Entrega de materiais para acabamento do bloco B." }
  ];

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('project_photos')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
      
      // Load signed URLs for all photos
      if (data) {
        const urls: Record<string, string> = {};
        await Promise.all(
          data.map(async (photo) => {
            const { data: urlData } = await supabase.storage
              .from('project-photos')
              .createSignedUrl(photo.file_path, 3600);
            if (urlData) {
              urls[photo.id] = urlData.signedUrl;
            }
          })
        );
        setPhotoUrls(urls);
      }
    } catch (error) {
      logError('ProjectReports.loadPhotos', error);
      toast.error('Erro ao carregar fotos');
    }
  };

  const handleFileUpload = async (etapaId: string, file: File) => {
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Imagem muito grande. Máximo 5MB');
      return;
    }

    // Validate image type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Apenas JPEG, PNG e WebP são permitidos');
      return;
    }

    try {
      setUploading(etapaId);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${etapaId}/${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('project-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('project_photos')
        .insert({
          etapa_id: etapaId,
          file_name: file.name,
          file_size: file.size,
          file_path: fileName
        });

      if (dbError) throw dbError;

      toast.success('Foto adicionada com sucesso');
      loadPhotos();
    } catch (error) {
      logError('ProjectReports.handleFileUpload', error);
      toast.error('Erro ao fazer upload da foto');
    } finally {
      setUploading(null);
    }
  };

  const deletePhoto = async (photo: ProjectPhoto) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project-photos')
        .remove([photo.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('project_photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      toast.success('Foto removida com sucesso');
      loadPhotos();
    } catch (error) {
      logError('ProjectReports.deletePhoto', error);
      toast.error('Erro ao remover foto');
    }
  };

  const getPhotoUrl = (photoId: string): string => {
    return photoUrls[photoId] || '';
  };

  const getPhotosForEtapa = (etapaId: string) => {
    return photos.filter(photo => photo.etapa_id === etapaId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  if (!id) {
    return (
      <Layout>
        <div className="p-8">
          <div className="text-center">Projeto não encontrado</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 lg:p-8 max-w-full overflow-x-hidden">
        <ProjectHeader 
          projectId={id} 
          projectName={project?.name || "Carregando..."} 
          loading={projectLoading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
          {/* Monthly Expenses Chart */}
          <Card className="p-4 md:p-6 w-full max-w-full">
            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Gastos mensais</h2>
            <div className="flex justify-center items-end space-x-2 h-24 md:h-32">
              {[80, 70, 85, 60, 50].map((height, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    className="w-8 bg-purple-500 rounded-t" 
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs mt-1">
                    {["Jan", "Fev", "Mar", "Abr", "Mai"][i]}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Financial Results */}
          <Card className="p-4 md:p-6 w-full max-w-full">
            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Resultados Financeiros</h2>
            {financialLoading ? (
              <div className="space-y-3">
                <div className="bg-gray-100 p-3 rounded animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
                <div className="bg-gray-100 p-3 rounded animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
                <div className="bg-gray-100 p-3 rounded animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                <div className="bg-gray-100 p-2 md:p-3 rounded">
                  <div className="text-xs md:text-sm font-medium text-gray-800">Custo Material</div>
                  <div className="text-base md:text-lg font-semibold text-gray-900">
                    {formatCurrency(financialData.materialCost)}
                  </div>
                </div>
                <div className="bg-gray-100 p-2 md:p-3 rounded">
                  <div className="text-xs md:text-sm font-medium text-gray-800">Custo Mão de Obra</div>
                  <div className="text-base md:text-lg font-semibold text-gray-900">
                    {formatCurrency(financialData.laborCost)}
                  </div>
                </div>
                <div className="bg-gray-100 p-2 md:p-3 rounded">
                  <div className="text-xs md:text-sm font-medium text-gray-800">Valor de venda projeto</div>
                  {editingSaleValue ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        value={saleValueInput}
                        onChange={(e) => setSaleValueInput(e.target.value)}
                        className="h-8 text-sm"
                        placeholder="0.00"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const value = parseFloat(saleValueInput) || 0;
                            updateSaleValue(value);
                            setEditingSaleValue(false);
                          }
                          if (e.key === 'Escape') {
                            setEditingSaleValue(false);
                            setSaleValueInput('');
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const value = parseFloat(saleValueInput) || 0;
                          updateSaleValue(value);
                          setEditingSaleValue(false);
                        }}
                      >
                        Salvar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(financialData.saleValue)}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingSaleValue(true);
                          setSaleValueInput(financialData.saleValue.toString());
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Follow Up Report */}
          <FollowUpReport 
            projectId={id || ""} 
            projectName={project?.name || "Carregando..."} 
          />
        </div>

        {/* Photo Report by Etapa */}
        <Card className="p-4 md:p-6 w-full max-w-full overflow-hidden">
          <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">relatório fotográfico</h2>
          <div className="space-y-4 md:space-y-6">
            {etapas.map((etapa) => {
              const etapaPhotos = getPhotosForEtapa(etapa.id);
              return (
                <div key={etapa.id}>
                  <h3 className="text-sm md:text-base font-medium mb-2 md:mb-3">{etapa.nome}</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-4">
                    {/* Uploaded Photos */}
                    {etapaPhotos.map((photo) => (
                      <div key={photo.id} className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden group">
                        <img 
                          src={getPhotoUrl(photo.id)} 
                          alt={photo.file_name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={() => deletePhoto(photo)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 hidden sm:block">
                          <div className="truncate">{photo.file_name}</div>
                          <div className="text-gray-300">{formatFileSize(photo.file_size)}</div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Image Button */}
                    <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors duration-200">
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(etapa.id, file);
                              e.target.value = '';
                            }
                          }}
                          disabled={uploading === etapa.id}
                        />
                        {uploading === etapa.id ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mb-1"></div>
                            <span className="text-xs text-gray-600">Enviando...</span>
                          </div>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 md:h-6 md:w-6 text-gray-500 mb-1" />
                            <span className="text-[10px] md:text-xs text-gray-600">+ Imagem</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ProjectReports;