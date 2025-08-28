// Utility functions for normalizing and validating stage status values
export type StageStatus = 'finalizado' | 'andamento' | 'proximo';

const mapping: Record<string, StageStatus> = {
  // finalizado variants
  'finalizado': 'finalizado',
  'finalizados': 'finalizado',
  'finalizada': 'finalizado',
  'finalizadas': 'finalizado',
  'finalizado(s)': 'finalizado',
  'finalizados(s)': 'finalizado',
  'finalizado(s).': 'finalizado',
  'finalizado.': 'finalizado',
  'finalizados.': 'finalizado',
  'finalizado ': 'finalizado',
  'finalizados ': 'finalizado',
  'finalizado(a)': 'finalizado',
  'finalizado(a).': 'finalizado',
  'finalizados(a)': 'finalizado',
  'finalizado(a)s': 'finalizado',
  'finalized': 'finalizado',
  'finalizados_pt': 'finalizado',
  'finalizados_br': 'finalizado',
  'finalizados (pt-br)': 'finalizado',
  'finalizados (pt)': 'finalizado',
  'finalizado (pt)': 'finalizado',
  'finalizado (pt-br)': 'finalizado',
  'finalizado (br)': 'finalizado',
  'finalizados (br)': 'finalizado',
  'finalised': 'finalizado',
  'final': 'finalizado',
  'done': 'finalizado',
  'concluido': 'finalizado',
  'concluído': 'finalizado',
  'concluida': 'finalizado',
  'concluída': 'finalizado',
  'concluidas': 'finalizado',
  'concluídas': 'finalizado',

  // andamento variants
  'andamento': 'andamento',
  'em andamento': 'andamento',
  'andando': 'andamento',
  'progress': 'andamento',
  'processing': 'andamento',
  'em-progresso': 'andamento',
  'em_progresso': 'andamento',

  // proximo variants
  'proximo': 'proximo',
  'próximo': 'proximo',
  'proximos': 'proximo',
  'próximos': 'proximo',
  'next': 'proximo',
  'a seguir': 'proximo',
};

export function normalizeStageStatus(input: unknown): StageStatus | null {
  if (typeof input !== 'string') return null;

  const cleaned = input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // remove accents
    .trim()
    .toLowerCase();

  if (cleaned in mapping) return mapping[cleaned];

  // direct matches after cleaning
  if (cleaned === 'finalizado' || cleaned === 'andamento' || cleaned === 'proximo') {
    return cleaned as StageStatus;
  }

  return null;
}

export function isValidStageStatus(input: unknown): input is StageStatus {
  return normalizeStageStatus(input) !== null;
}
