import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useParams, NavLink } from "react-router-dom";
import { Calendar } from "lucide-react";

const AddStep = () => {
  const { id } = useParams();

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Nova etapa</h1>
          <hr className="border-gray-300" />
        </div>

        <Card className="p-6 max-w-4xl">
          <h2 className="text-lg font-semibold mb-6">Dados</h2>
          
          <div className="space-y-6">
            {/* Step Name */}
            <div>
              <Label htmlFor="stepName" className="text-base font-medium">
                nome da etapa
              </Label>
              <Input 
                id="stepName" 
                className="mt-2" 
                placeholder="Digite o nome da etapa"
              />
            </div>

            {/* Position in Project */}
            <div>
              <Label className="text-base font-medium">
                Posição no projeto
              </Label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione etapa prévia" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="fundacao">Fundação</SelectItem>
                  <SelectItem value="estrutura">Estrutura</SelectItem>
                  <SelectItem value="alvenaria">Alvenaria</SelectItem>
                  <SelectItem value="cobertura">Cobertura</SelectItem>
                  <SelectItem value="acabamento">Acabamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date and Duration */}
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
                />
              </div>
            </div>

            {/* Tasks */}
            <div>
              <Label className="text-base font-medium">
                Tarefas
              </Label>
              <div className="space-y-3 mt-2">
                <Textarea 
                  placeholder="Garantir cobrimento dos recartes com as loucas"
                  className="min-h-[60px]"
                />
                <Textarea 
                  placeholder="+ Tarefas"
                  className="min-h-[60px]"
                />
              </div>
            </div>

            {/* Save Button */}
            <Button className="w-full bg-black text-white hover:bg-gray-800 py-3 text-base">
              salvar dados
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AddStep;