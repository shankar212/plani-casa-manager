import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, NavLink } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

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
  const { etapas } = useProject();
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);

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
    } catch (error) {
      console.error('Error loading photos:', error);
      toast.error('Erro ao carregar fotos');
    }
  };

  const handleFileUpload = async (etapaId: string, file: File) => {
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
      console.error('Error uploading photo:', error);
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
      console.error('Error deleting photo:', error);
      toast.error('Erro ao remover foto');
    }
  };

  const getPhotoUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('project-photos')
      .getPublicUrl(filePath);
    return data.publicUrl;
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Monthly Expenses Chart */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Gastos mensais</h2>
            <div className="flex justify-center items-end space-x-2 h-32">
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
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Resultados Financeiros</h2>
            <div className="space-y-3">
              <div className="bg-gray-100 p-3 rounded">
                <div className="text-sm text-gray-600">Custo: R$ XX</div>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <div className="text-sm text-gray-600">Valor Presente líquido: R$ XX</div>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <div className="text-sm text-gray-600">Exp. Retorno líquido: R$ XX</div>
              </div>
            </div>
          </Card>

          {/* Progress Reports */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">relatório de acompanhamento</h2>
            <div className="space-y-3">
              {reports.map((report, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium">Data: {report.date}</div>
                  <div className="text-gray-600">{report.description}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Photo Report by Etapa */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">relatório fotográfico</h2>
          <div className="space-y-6">
            {etapas.map((etapa) => {
              const etapaPhotos = getPhotosForEtapa(etapa.id);
              return (
                <div key={etapa.id}>
                  <h3 className="font-medium mb-3">{etapa.nome}</h3>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                    {/* Uploaded Photos */}
                    {etapaPhotos.map((photo) => (
                      <div key={photo.id} className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden group">
                        <img 
                          src={getPhotoUrl(photo.file_path)} 
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
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1">
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
                            <Plus className="h-6 w-6 text-gray-500 mb-1" />
                            <span className="text-xs text-gray-600">+ Imagem</span>
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