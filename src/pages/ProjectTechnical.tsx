import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TechnicalDocumentUpload } from "@/components/TechnicalDocumentUpload";
import { PDFViewer } from "@/components/PDFViewer";
import { calculateEndDate } from "@/lib/dateUtils";
import { useProjectData } from "@/hooks/useProjectData";
import { ProjectHeader } from "@/components/ProjectHeader";

interface TechnicalDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

const ProjectTechnical = () => {
  const { id } = useParams();
  const { project, loading: projectLoading } = useProjectData(id);
  const { etapas } = useProject();
  const [activeTab, setActiveTab] = useState("estrutural");
  const [documents, setDocuments] = useState<Record<string, TechnicalDocument | null>>({});

  const documentTypes = [
    { key: "estrutural", label: "estrutural" },
    { key: "hidrossanitario", label: "hidrossanitário" },
    { key: "eletrico", label: "elétrico" },
    { key: "arquitetonico", label: "arquitetônico" }
  ];

  useEffect(() => {
    if (id) {
      loadDocuments();
    }
  }, [id]);

  const loadDocuments = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('technical_documents')
        .select('*')
        .eq('project_id', id);

      if (error) throw error;

      const docsMap: Record<string, TechnicalDocument | null> = {};
      documentTypes.forEach(type => {
        docsMap[type.key] = null;
      });

      data?.forEach(doc => {
        docsMap[doc.document_type] = doc;
      });

      setDocuments(docsMap);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleDocumentChange = (documentType: string, document: TechnicalDocument | null) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: document
    }));
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

        <div className="space-y-4 md:space-y-6">
          {/* Physical Financial Schedule */}
          <Card className="p-4 md:p-6 w-full max-w-full overflow-hidden">
            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4 break-words">cronograma físico financeiro</h2>
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 md:px-0 text-xs md:text-sm text-gray-600">etapa</th>
                    <th className="text-left py-2 px-2 md:px-0 text-xs md:text-sm text-gray-600">início</th>
                    <th className="text-left py-2 px-2 md:px-0 text-xs md:text-sm text-gray-600">fim</th>
                    <th className="text-left py-2 px-2 md:px-0 text-xs md:text-sm text-gray-600">progresso</th>
                    <th className="text-left py-2 px-2 md:px-0 text-xs md:text-sm text-gray-600">custo (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {etapas.map((etapa) => (
                    <tr key={etapa.id} className="border-b">
                      <td className="py-2 md:py-3 px-2 md:px-0 text-xs md:text-sm">{etapa.nome}</td>
                      <td className="py-2 md:py-3 px-2 md:px-0 text-xs md:text-sm">{etapa.dataInicio || '-'}</td>
                      <td className="py-2 md:py-3 px-2 md:px-0 text-xs md:text-sm">{calculateEndDate(etapa.dataInicio, etapa.prazoEstimado)}</td>
                      <td className="py-2 md:py-3 px-2 md:px-0 text-xs md:text-sm">{etapa.progresso}</td>
                      <td className="py-2 md:py-3 px-2 md:px-0 text-xs md:text-sm">{etapa.custo || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Technical Plans and Projects */}
          <Card className="p-4 md:p-6 w-full max-w-full overflow-hidden">
            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4 break-words">plantas e projetos técnicos</h2>
            
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto space-x-2 mb-4 md:mb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide w-full">
              {documentTypes.map(type => (
                <button
                  key={type.key}
                  onClick={() => setActiveTab(type.key)}
                  className={`px-3 py-1 rounded text-xs md:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === type.key 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Document Upload/Management */}
            <div className="space-y-6">
              <TechnicalDocumentUpload
                projectId={id!}
                documentType={activeTab}
                document={documents[activeTab]}
                onDocumentChange={(doc) => handleDocumentChange(activeTab, doc)}
              />

              {/* PDF Preview */}
              {documents[activeTab] && (
                <div>
                  <h3 className="text-sm md:text-base font-medium mb-3">Visualização do Documento</h3>
                  <PDFViewer filePath={documents[activeTab]!.file_path} />
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectTechnical;