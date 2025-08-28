import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Download, Trash2, CheckSquare } from "lucide-react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useProjectData } from "@/hooks/useProjectData";
import { ProjectHeader } from "@/components/ProjectHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ProjectLegal = () => {
  const { id } = useParams();
  const { project, loading: projectLoading } = useProjectData(id);
  const { toast } = useToast();
  
  const [documents, setDocuments] = useState<Record<string, string[]>>({});
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());

  const sectors = [
    "Pré-Projeto",
    "Projeto", 
    "Obras",
    "Pós obra",
    "Financiamento"
  ];

  const handleAddDocument = (sector: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setDocuments(prev => ({
          ...prev,
          [sector]: [...(prev[sector] || []), file.name]
        }));
        toast({
          title: "Document uploaded",
          description: `${file.name} added to ${sector} sector`,
        });
      }
    };
    input.click();
  };

  const handleDownloadDocument = (docName: string) => {
    // Simulate download - in real app this would be actual file download
    toast({
      title: "Download started",
      description: `Downloading ${docName}`,
    });
  };

  const handleDocumentSelection = (docKey: string, checked: boolean) => {
    const newSelected = new Set(selectedDocuments);
    if (checked) {
      newSelected.add(docKey);
    } else {
      newSelected.delete(docKey);
    }
    setSelectedDocuments(newSelected);
  };

  const handleSelectAll = () => {
    const allDocKeys: string[] = [];
    Object.entries(documents).forEach(([sector, docs]) => {
      docs.forEach((doc, index) => {
        allDocKeys.push(`${sector}-${index}`);
      });
    });
    setSelectedDocuments(new Set(allDocKeys));
  };

  const handleDeleteSelected = () => {
    const selectedCount = selectedDocuments.size;
    const newDocuments = { ...documents };
    
    // Sort selected docs by index in descending order to avoid index shifting issues
    const sortedSelected = Array.from(selectedDocuments)
      .map(docKey => {
        const [sector, indexStr] = docKey.split('-');
        return { sector, index: parseInt(indexStr), key: docKey };
      })
      .sort((a, b) => b.index - a.index);
    
    // Remove documents starting from highest index
    sortedSelected.forEach(({ sector, index }) => {
      if (newDocuments[sector] && newDocuments[sector][index]) {
        newDocuments[sector].splice(index, 1);
      }
    });

    // Clean up empty sectors
    Object.keys(newDocuments).forEach(sector => {
      if (newDocuments[sector]?.length === 0) {
        delete newDocuments[sector];
      }
    });

    setDocuments(newDocuments);
    setSelectedDocuments(new Set());
    
    toast({
      title: "Documents deleted",
      description: `${selectedCount} document(s) deleted successfully`,
    });
  };

  const getTotalDocuments = () => {
    return Object.values(documents).reduce((total, docs) => total + docs.length, 0);
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
      <div className="p-8">
        <ProjectHeader 
          projectId={id} 
          projectName={project?.name || "Carregando..."} 
          loading={projectLoading}
        />

        {getTotalDocuments() > 0 && (
          <div className="mb-4 flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSelectAll}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Select All
            </Button>
            
            {selectedDocuments.size > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected ({selectedDocuments.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Do you want to delete all {selectedDocuments.size} selected document(s)? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSelected}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}

        <div className="space-y-4">
          {sectors.map((sector, index) => (
            <Card key={index} className="p-4 w-full">
              <h3 className="font-semibold mb-4 border-b pb-2">{sector}</h3>
              
              {documents[sector] && documents[sector].length > 0 && (
                <div className="mb-4 space-y-2">
                  {documents[sector].map((doc, docIndex) => {
                    const docKey = `${sector}-${docIndex}`;
                    const isSelected = selectedDocuments.has(docKey);
                    
                    return (
                      <div key={docIndex} className="text-sm flex items-center space-x-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleDocumentSelection(docKey, checked as boolean)}
                        />
                        <span className="w-2 h-2 bg-black rounded-full flex-shrink-0"></span>
                        <button
                          className="truncate hover:text-blue-600 text-left flex-1"
                          title={doc}
                          onClick={() => handleDownloadDocument(doc)}
                        >
                          {doc}
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto"
                          onClick={() => handleDownloadDocument(doc)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                className="w-fit"
                onClick={() => handleAddDocument(sector)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Documento
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectLegal;