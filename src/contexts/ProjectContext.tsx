import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Tarefa {
  id: string;
  nome: string;
  descricao?: string;
}

export interface Etapa {
  id: string;
  nome: string;
  dataInicio?: string;
  prazoEstimado?: string;
  progresso: string;
  custo?: string;
  tarefas: Tarefa[];
  status: 'finalizado' | 'andamento' | 'proximo';
}

export interface NewEtapa {
  nome: string;
  dataInicio?: string;
  prazoEstimado?: string;
  progresso: string;
  custo?: string;
  tarefas: { nome: string; descricao?: string; }[];
  status: 'finalizado' | 'andamento' | 'proximo';
}

interface ProjectContextType {
  etapas: Etapa[];
  addEtapa: (etapa: NewEtapa) => void;
  addTarefa: (etapaId: string, tarefa: Omit<Tarefa, 'id'>) => void;
  deleteTarefa: (etapaId: string, tarefaId: string) => void;
  updateEtapaStatus: (etapaId: string, status: 'finalizado' | 'andamento' | 'proximo') => void;
  getEtapasByStatus: (status: 'finalizado' | 'andamento' | 'proximo') => Etapa[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [etapas, setEtapas] = useState<Etapa[]>([
    {
      id: '1',
      nome: 'Alvenaria',
      dataInicio: '01/06/2024',
      prazoEstimado: '30',
      progresso: '75%',
      custo: 'R$ 87.000,00',
      status: 'andamento',
      tarefas: [
        { id: '1', nome: 'Assentamento blocos' },
        { id: '2', nome: 'Concretagem Colunas' }
      ]
    },
    {
      id: '2',
      nome: 'Cobertura',
      dataInicio: '01/07/2024',
      prazoEstimado: '45',
      progresso: '0%',
      custo: 'R$ 120.000,00',
      status: 'proximo',
      tarefas: [
        { id: '3', nome: 'Concretagem Laje' },
        { id: '4', nome: 'Madeiramento' },
        { id: '5', nome: 'Colocação Telhado' }
      ]
    },
    {
      id: '3',
      nome: 'Acabamento',
      dataInicio: '01/09/2024',
      prazoEstimado: '60',
      progresso: '0%',
      custo: 'R$ 200.000,00',
      status: 'proximo',
      tarefas: [
        { id: '6', nome: 'Assentamento pisos' }
      ]
    }
  ]);

  const addEtapa = (newEtapa: NewEtapa) => {
    const id = Date.now().toString();
    const etapaWithIds: Etapa = {
      ...newEtapa,
      id,
      tarefas: newEtapa.tarefas.map((tarefa, index) => ({
        ...tarefa,
        id: `${id}-${index}`
      }))
    };
    setEtapas(prev => [...prev, etapaWithIds]);
  };

  const addTarefa = (etapaId: string, newTarefa: Omit<Tarefa, 'id'>) => {
    const id = Date.now().toString();
    setEtapas(prev => prev.map(etapa => 
      etapa.id === etapaId 
        ? { ...etapa, tarefas: [...etapa.tarefas, { ...newTarefa, id }] }
        : etapa
    ));
  };

  const deleteTarefa = (etapaId: string, tarefaId: string) => {
    setEtapas(prev => prev.map(etapa => 
      etapa.id === etapaId 
        ? { ...etapa, tarefas: etapa.tarefas.filter(tarefa => tarefa.id !== tarefaId) }
        : etapa
    ));
  };

  const updateEtapaStatus = (etapaId: string, status: 'finalizado' | 'andamento' | 'proximo') => {
    setEtapas(prev => prev.map(etapa => 
      etapa.id === etapaId ? { ...etapa, status } : etapa
    ));
  };

  const getEtapasByStatus = (status: 'finalizado' | 'andamento' | 'proximo') => {
    return etapas.filter(etapa => etapa.status === status);
  };

  return (
    <ProjectContext.Provider value={{
      etapas,
      addEtapa,
      addTarefa,
      deleteTarefa,
      updateEtapaStatus,
      getEtapasByStatus
    }}>
      {children}
    </ProjectContext.Provider>
  );
};