import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, Download, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FollowUpNote {
  id: string;
  project_id: string;
  date: string;
  description: string;
  created_at: string;
}

interface FollowUpReportProps {
  projectId: string;
  projectName: string;
}

const FollowUpReport = ({ projectId, projectName }: FollowUpReportProps) => {
  const [notes, setNotes] = useState<FollowUpNote[]>([]);
  const [newNote, setNewNote] = useState({ date: "", description: "" });
  const [showAll, setShowAll] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotes();
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setNewNote(prev => ({ ...prev, date: today }));
  }, [projectId]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('follow_up_notes' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });

      if (error) throw error;
      setNotes(data as unknown as FollowUpNote[] || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNote = async () => {
    if (!newNote.date || !newNote.description.trim()) {
      toast.error('Preencha a data e a descrição');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('follow_up_notes' as any)
        .insert({
          project_id: projectId,
          date: newNote.date,
          description: newNote.description.trim()
        });

      if (error) throw error;

      toast.success('Nota adicionada com sucesso');
      setNewNote({ date: new Date().toISOString().split('T')[0], description: "" });
      setIsAdding(false);
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Erro ao salvar nota');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const generatePDF = () => {
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório de Acompanhamento - ${projectName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .note { margin-bottom: 30px; page-break-inside: avoid; }
            .date { font-weight: bold; margin-bottom: 10px; }
            .description { margin-left: 20px; line-height: 1.6; }
            hr { margin: 20px 0; border: none; border-top: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Acompanhamento</h1>
            <h2>${projectName}</h2>
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          ${notes.map(note => `
            <div class="note">
              <div class="date">Data: ${formatDate(note.date)}</div>
              <div class="description">${note.description}</div>
            </div>
            <hr>
          `).join('')}
        </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-acompanhamento-${projectName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateWord = () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>Relatório de Acompanhamento</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>90</w:Zoom>
              <w:DoNotPromptForConvert/>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            body { font-family: Arial, sans-serif; }
            .header { text-align: center; margin-bottom: 30px; }
            .note { margin-bottom: 20px; }
            .date { font-weight: bold; margin-bottom: 5px; }
            .description { margin-left: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Acompanhamento</h1>
            <h2>${projectName}</h2>
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          ${notes.map(note => `
            <div class="note">
              <div class="date">Data: ${formatDate(note.date)}</div>
              <div class="description">${note.description}</div>
            </div>
            <br>
          `).join('')}
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-acompanhamento-${projectName}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayedNotes = showAll ? notes : notes.slice(0, 3);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">relatório de acompanhamento</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generatePDF}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={generateWord}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Word
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Nova Nota
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="p-4 mb-4 bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Data</label>
              <Input
                type="date"
                value={newNote.date}
                onChange={(e) => setNewNote(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Descrição</label>
              <Textarea
                placeholder="Descreva o progresso do dia..."
                value={newNote.description}
                onChange={(e) => setNewNote(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={saveNote}
                disabled={loading}
                size="sm"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewNote({ date: new Date().toISOString().split('T')[0], description: "" });
                }}
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {displayedNotes.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>Nenhuma nota de acompanhamento ainda.</p>
            <p className="text-sm">Clique em "Nova Nota" para começar.</p>
          </div>
        ) : (
          displayedNotes.map((note) => (
            <div key={note.id} className="text-sm border-b border-gray-100 pb-3 last:border-b-0">
              <div className="font-medium">Data: {formatDate(note.date)}</div>
              <div className="text-gray-600 mt-1">{note.description}</div>
            </div>
          ))
        )}

        {notes.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full flex items-center justify-center gap-1 text-gray-600 hover:text-gray-900"
          >
            {showAll ? (
              <>
                <EyeOff className="h-4 w-4" />
                Mostrar menos
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Ver todas ({notes.length} notas)
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default FollowUpReport;