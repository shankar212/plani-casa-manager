import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Download, Trash2, CheckSquare } from "lucide-react";
import { useParams, NavLink } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
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
    
    selectedDocuments.forEach(docKey => {
      const [sector, indexStr] = docKey.split('-');
      const index = parseInt(indexStr);
      if (newDocuments[sector]) {
        newDocuments[sector] = newDocuments[sector].filter((_, i) => i !== index);
      }
    });

    // Reindex remaining documents to maintain consistency
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