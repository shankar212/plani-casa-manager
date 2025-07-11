import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface PDFViewerProps {
  filePath: string;
}

export const PDFViewer = ({ filePath }: PDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const getPdfUrl = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('technical-documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      setPdfUrl(data.signedUrl);
    } catch (error) {
      console.error('Error getting PDF URL:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get PDF URL when component mounts or filePath changes
  useEffect(() => {
    if (filePath) {
      getPdfUrl();
    }
  }, [filePath]);

  const handleDownload = async () => {
    if (!pdfUrl) return;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'document.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <p className="text-muted-foreground">Carregando PDF...</p>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <p className="text-muted-foreground">Erro ao carregar PDF</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-muted p-2 rounded">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Documento PDF</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(pdfUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir
          </Button>
        </div>
      </div>

      {/* PDF Embed */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <iframe
          src={pdfUrl}
          className="w-full h-96"
          title="PDF Viewer"
        />
      </div>
    </div>
  );
};