/**
 * Modèle de données local. Les noms de tables et de champs suivent la
 * spécification ; les commentaires et l'interface restent en français.
 *
 * Les identifiants sont des UUID plutôt que des entiers auto-incrémentés :
 * à l'import d'une sauvegarde, deux appareils ne peuvent pas entrer en
 * collision sur les mêmes identifiants.
 */

export const GROUPES_MUSCULAIRES = [
  'Pectoraux',
  'Dos',
  'Jambes',
  'Épaules',
  'Bras',
  'Abdominaux',
] as const
export type GroupeMusculaire = (typeof GROUPES_MUSCULAIRES)[number]

/** Matériel courant, y compris celui des salles peu équipées. */
export const MATERIELS = [
  'Poids du corps',
  'Haltères',
  'Barre',
  'Machine',
  'Poulie',
  'Élastique',
  'Kettlebell',
] as const
export type Materiel = (typeof MATERIELS)[number]

export interface Exercise {
  id: string
  name: string
  muscleGroup: GroupeMusculaire
  equipment: Materiel
  /** Créé par l'utilisateur, donc supprimable et jamais écrasé par un amorçage. */
  isCustom: boolean
  createdAt: number
}

export interface Template {
  id: string
  name: string
  /** Ordre voulu des exercices dans la séance. */
  exerciseIds: string[]
  createdAt: number
  lastUsedAt: number | null
}

export interface Workout {
  id: string
  name: string
  startedAt: number
  /** null tant que la séance est en cours. */
  endedAt: number | null
  templateId: string | null
  notes: string
}

export interface WorkoutExercise {
  id: string
  workoutId: string
  exerciseId: string
  position: number
}

export interface WorkoutSet {
  id: string
  workoutExerciseId: string
  position: number
  weightKg: number
  reps: number
  isDone: boolean
  /** Record détecté à la validation de la série. */
  isPr: boolean
  doneAt: number | null
}

export interface BodyWeight {
  id: string
  weightKg: number
  measuredAt: number
}

/** Clé/valeur : chaque réglage est une ligne, pour migrer sans casser. */
export interface Setting {
  key: string
  value: unknown
}

export type Unite = 'kg' | 'lb'

/** Identifiant unique, avec repli pour les contextes sans crypto.randomUUID. */
export function nouvelId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
