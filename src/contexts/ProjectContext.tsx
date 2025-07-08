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
  deleteEtapa: (etapaId: string) => void;
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
      id: 'etapa-1',
      nome: 'Alvenaria',
      dataInicio: '01/06/2024',
      prazoEstimado: '30',
      progresso: '75%',
      custo: 'R$ 87.000,00',
      status: 'andamento',
      tarefas: [
        { id: 'tarefa-1-1', nome: 'Assentamento blocos' },
        { id: 'tarefa-1-2', nome: 'Concretagem Colunas' }
      ]
    },
    {
      id: 'etapa-2',
      nome: 'Cobertura',
      dataInicio: '01/07/2024',
      prazoEstimado: '45',
      progresso: '0%',
      custo: 'R$ 120.000,00',
      status: 'proximo',
      tarefas: [
        { id: 'tarefa-2-1', nome: 'Concretagem Laje' },
        { id: 'tarefa-2-2', nome: 'Madeiramento' },
        { id: 'tarefa-2-3', nome: 'Colocação Telhado' }
      ]
    },
    {
      id: 'etapa-3',
      nome: 'Acabamento',
      dataInicio: '01/09/2024',
      prazoEstimado: '60',
      progresso: '0%',
      custo: 'R$ 200.000,00',
      status: 'proximo',
      tarefas: [
        { id: 'tarefa-3-1', nome: 'Assentamento pisos' }
      ]
    }
  ]);

  const addEtapa = (newEtapa: NewEtapa) => {
    const id = `etapa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const etapaWithIds: Etapa = {
      ...newEtapa,
      id,
      tarefas: newEtapa.tarefas.map((tarefa, index) => ({
        ...tarefa,
        id: `tarefa-${id}-${index}-${Math.random().toString(36).substr(2, 9)}`
      }))
    };
    setEtapas(prev => [...prev, etapaWithIds]);
  };

  const addTarefa = (etapaId: string, newTarefa: Omit<Tarefa, 'id'>) => {
    const id = `tarefa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

  const deleteEtapa = (etapaId: string) => {
    setEtapas(prev => prev.filter(etapa => etapa.id !== etapaId));
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
      deleteEtapa,
      updateEtapaStatus,
      getEtapasByStatus
    }}>
      {children}
    </ProjectContext.Provider>
  );
};