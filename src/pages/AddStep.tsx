import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const AddStep = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { etapas, addEtapa, addTarefa, setProjectId, projectId } = useProject();

  // Set project ID in context when component mounts
  useEffect(() => {
    if (id && id !== projectId) {
      setProjectId(id);
    }
  }, [id, projectId, setProjectId]);
  
  const [isNewEtapa, setIsNewEtapa] = useState(false);
  const [selectedEtapaId, setSelectedEtapaId] = useState<string>("");
  const [newEtapaName, setNewEtapaName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [tarefas, setTarefas] = useState<string[]>(["", ""]);

  const resetForm = () => {
    setIsNewEtapa(false);
    setSelectedEtapaId("");
    setNewEtapaName("");
    setStartDate("");
    setEstimatedDuration("");
    setTarefas(["", ""]);
  };

  const handleSave = async () => {
    if (isNewEtapa && newEtapaName.trim()) {
      // Create new etapa
      const newEtapa = {
        nome: newEtapaName.trim(),
        dataInicio: startDate,
        prazoEstimado: estimatedDuration,
        progresso: "0%",
        custo: "",
        status: "proximo" as const,
        tarefas: tarefas.filter(t => t.trim()).map(t => ({ nome: t.trim() }))
      };
      await addEtapa(newEtapa);
      toast({
        title: "Etapa criada",
        description: `Etapa "${newEtapaName}" criada com sucesso!`
      });
    } else if (selectedEtapaId && !isNewEtapa) {
      // Add tarefas to existing etapa
      const validTarefas = tarefas.filter(t => t.trim());
      for (const tarefa of validTarefas) {
        await addTarefa(selectedEtapaId, { nome: tarefa.trim() });
      }
      toast({
        title: "Tarefas adicionadas",
        description: `${validTarefas.length} tarefa(s) adicionada(s) com sucesso!`
      });
    }
    
    // Reset form for next entry
    resetForm();
  };

  const handleCancel = () => {
    navigate(`/projetos/${id}`);
  };

  const handleTarefaChange = (index: number, value: string) => {
    const newTarefas = [...tarefas];
    newTarefas[index] = value;
    setTarefas(newTarefas);
  };

  const addTarefaField = () => {
    setTarefas([...tarefas, ""]);
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Nova Etapa/Tarefa</h1>
          <hr className="border-gray-300" />
        </div>

        <Card className="p-6 max-w-4xl">
          <h2 className="text-lg font-semibold mb-6">Dados</h2>
          
          <div className="space-y-6">
            {/* Etapa Selection */}
            <div>
              <Label className="text-base font-medium">
                Etapa
              </Label>
              <Select 
                value={isNewEtapa ? "new" : selectedEtapaId} 
                onValueChange={(value) => {
                  if (value === "new") {
                    setIsNewEtapa(true);
                    setSelectedEtapaId("");
                  } else {
                    setIsNewEtapa(false);
                    setSelectedEtapaId(value);
                  }
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione uma etapa ou crie nova" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {etapas.map((etapa) => (
                    <SelectItem key={etapa.id} value={etapa.id}>
                      {etapa.nome}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Criar nova etapa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* New Etapa Name */}
            {isNewEtapa && (
              <div>
                <Label htmlFor="newEtapaName" className="text-base font-medium">
                  Nome da nova etapa
                </Label>
                <Input 
                  id="newEtapaName" 
                  className="mt-2" 
                  placeholder="Digite o nome da etapa"
                  value={newEtapaName}
                  onChange={(e) => setNewEtapaName(e.target.value)}
                />
              </div>
            )}


            {/* Date and Duration - Only show for new etapa */}
            {isNewEtapa && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-base font-medium">
                    data de início
                  </Label>
                  <div className="relative mt-2">
                    <Input 
                      id="startDate" 
                      placeholder="dd/mm/aaaa"
                      className="pr-10"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="estimatedDuration" className="text-base font-medium">
                    Prazo estimado
                  </Label>
                  <Input 
                    id="estimatedDuration" 
                    placeholder="Dias"
                    className="mt-2"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Tasks */}
            <div>
              <Label className="text-base font-medium">
                Tarefas
              </Label>
              <div className="space-y-3 mt-2">
                {tarefas.map((tarefa, index) => (
                  <Textarea 
                    key={index}
                    placeholder={index === 0 ? "Digite a primeira tarefa" : "Digite outra tarefa"}
                    className="min-h-[60px]"
                    value={tarefa}
                    onChange={(e) => handleTarefaChange(index, e.target.value)}
                  />
                ))}
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={addTarefaField}
                  className="w-full"
                >
                  + Adicionar mais tarefa
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button 
                onClick={handleSave}
                className="flex-1 bg-black text-white hover:bg-gray-800 py-3 text-base"
                disabled={(!isNewEtapa && !selectedEtapaId) || (isNewEtapa && !newEtapaName.trim())}
              >
                salvar dados
              </Button>
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="flex-1 py-3 text-base"
              >
                voltar ao projeto
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AddStep;