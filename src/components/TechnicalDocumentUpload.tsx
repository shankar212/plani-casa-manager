import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, Trash2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface TechnicalDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

interface TechnicalDocumentUploadProps {
  projectId: string;
  documentType: string;
  document: TechnicalDocument | null;
  onDocumentChange: (document: TechnicalDocument | null) => void;
}

export const TechnicalDocumentUpload = ({ 
  projectId, 
  documentType, 
  document, 
  onDocumentChange 
}: TechnicalDocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Erro",
        description: "Arquivo muito grande. Máximo 10MB",
        variant: "destructive",
      });
      return;
    }

    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      toast({
        title: "Erro",
        description: "Apenas arquivos PDF são permitidos",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = 'pdf';
      const fileName = `${projectId}/${documentType}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('technical-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data, error: insertError } = await supabase
        .from('technical_documents')
        .insert({
          project_id: projectId,
          document_type: documentType,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onDocumentChange(data);
      toast({
        title: "Sucesso",
        description: "Documento técnico enviado com sucesso",
      });
    } catch (error) {
      logger.error('TechnicalDocumentUpload.handleFileUpload', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o documento",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      const { data, error } = await supabase.storage
        .from('technical-documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('TechnicalDocumentUpload.handleDownload', error);
      toast({
        title: "Erro",
        description: "Não foi possível baixar o documento",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!document) return;

    try {
      const { error: deleteStorageError } = await supabase.storage
        .from('technical-documents')
        .remove([document.file_path]);

      if (deleteStorageError) throw deleteStorageError;

      const { error: deleteDbError } = await supabase
        .from('technical_documents')
        .delete()
        .eq('id', document.id);

      if (deleteDbError) throw deleteDbError;

      onDocumentChange(null);
      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso",
      });
    } catch (error) {
      logger.error('TechnicalDocumentUpload.handleDelete', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o documento",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {!document ? (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            Nenhum documento enviado
          </p>
          <div className="relative">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button disabled={uploading}>
              {uploading ? "Enviando..." : "Enviar PDF"}
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-sm">{document.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {(document.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};