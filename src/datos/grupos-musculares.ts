// Los 13 grupos musculares del catálogo (Ejercicios_PIA.docx).
export const GRUPOS = [
  { id: 'pecho', nombre: 'Pecho' },
  { id: 'hombros', nombre: 'Hombros' },
  { id: 'biceps', nombre: 'Bíceps' },
  { id: 'triceps', nombre: 'Tríceps' },
  { id: 'antebrazos', nombre: 'Antebrazos' },
  { id: 'abdomen', nombre: 'Abdomen' },
  { id: 'espalda-alta', nombre: 'Espalda alta' },
  { id: 'dorsales', nombre: 'Dorsales' },
  { id: 'espalda-baja', nombre: 'Espalda baja' },
  { id: 'gluteos', nombre: 'Glúteos' },
  { id: 'cuadriceps', nombre: 'Cuádriceps' },
  { id: 'femoral', nombre: 'Femoral (isquiotibiales)' },
  { id: 'pantorrillas', nombre: 'Pantorrillas' },
] as const;

export type GrupoId = (typeof GRUPOS)[number]['id'];

export function nombreDeGrupo(id: string): string {
  return GRUPOS.find((g) => g.id === id)?.nombre ?? id;
}

export function esGrupoValido(id: string): id is GrupoId {
  return GRUPOS.some((g) => g.id === id);
}
