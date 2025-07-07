
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const CreateProject = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Criar novo projeto</h1>
          <hr className="border-gray-300" />
        </div>

        <Card className="p-8 max-w-4xl">
          <h2 className="text-lg font-semibold mb-6">Dados gerais do projeto</h2>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="project-name">Nome do projeto</Label>
              <Input id="project-name" className="mt-2" />
            </div>

            <div>
              <Label>Tipo de construção</Label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="apartamento">Apartamento</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Data de início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full mt-2 justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : "dd/mm/aaaa"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Data de término prevista</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full mt-2 justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy") : "dd/mm/aaaa"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label>Status do projeto</Label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planejamento">Planejamento</SelectItem>
                  <SelectItem value="em-andamento">Em andamento</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Cliente</Label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente1">Cliente 1</SelectItem>
                  <SelectItem value="cliente2">Cliente 2</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600 mt-1">Possibilidade de criar novo cliente</p>
            </div>

            <div>
              <Label htmlFor="engineer">Engenheiro ou arquiteto responsável</Label>
              <Input id="engineer" className="mt-2" />
            </div>

            <div>
              <Label htmlFor="team">Equipe</Label>
              <Textarea 
                id="team" 
                placeholder="Liste os membros da equipe, incluindo contratos e subcontratos"
                className="mt-2"
                rows={4}
              />
            </div>

            <Button className="w-full py-3 bg-black hover:bg-gray-800">
              Salvar dados
            </Button>
          </div>
        </Card>

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium mb-2">Próximos passos:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Add endereço</li>
            <li>• Informações as built</li>
            <li>• Doc</li>
            <li>• Planta</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProject;
