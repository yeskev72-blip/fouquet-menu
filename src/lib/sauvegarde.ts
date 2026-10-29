import { z } from 'zod'
import { amorcerBase, base, viderBase } from '@/db'
import { GROUPES_MUSCULAIRES, MATERIELS } from '@/db/types'
import { cleDeJour } from './dates'

/**
 * Format de sauvegarde. Le numéro de version permet de faire évoluer le
 * schéma sans rendre les anciens fichiers illisibles : un import lit la
 * version, puis applique les conversions nécessaires.
 */
export const VERSION_SAUVEGARDE = 1
const MARQUE = 'fonte-sauvegarde'

const exerciceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  muscleGroup: z.enum(GROUPES_MUSCULAIRES),
  equipment: z.enum(MATERIELS),
  isCustom: z.boolean(),
  createdAt: z.number(),
})

const modeleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  exerciseIds: z.array(z.string()),
  createdAt: z.number(),
  lastUsedAt: z.number().nullable(),
})

const seanceSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  startedAt: z.number(),
  endedAt: z.number().nullable(),
  templateId: z.string().nullable(),
  notes: z.string(),
})

const lienSchema = z.object({
  id: z.string().min(1),
  workoutId: z.string().min(1),
  exerciseId: z.string().min(1),
  position: z.number(),
})

const serieSchema = z.object({
  id: z.string().min(1),
  workoutExerciseId: z.string().min(1),
  position: z.number(),
  weightKg: z.number(),
  reps: z.number(),
  isDone: z.boolean(),
  isPr: z.boolean(),
  doneAt: z.number().nullable(),
})

const poidsCorpsSchema = z.object({
  id: z.string().min(1),
  weightKg: z.number(),
  measuredAt: z.number(),
})

const reglageSchema = z.object({ key: z.string().min(1), value: z.unknown() })

export const sauvegardeSchema = z.object({
  format: z.literal(MARQUE),
  version: z.number().int().positive(),
  exporteLe: z.number(),
  donnees: z.object({
    exercises: z.array(exerciceSchema),
    templates: z.array(modeleSchema),
    workouts: z.array(seanceSchema),
    workoutExercises: z.array(lienSchema),
    sets: z.array(serieSchema),
    bodyWeights: z.array(poidsCorpsSchema),
    settings: z.array(reglageSchema),
  }),
})

export type Sauvegarde = z.infer<typeof sauvegardeSchema>

export async function construireSauvegarde(): Promise<Sauvegarde> {
  const [exercises, templates, workouts, workoutExercises, sets, bodyWeights, settings] =
    await Promise.all([
      base.exercises.toArray(),
      base.templates.toArray(),
      base.workouts.toArray(),
      base.workoutExercises.toArray(),
      base.sets.toArray(),
      base.bodyWeights.toArray(),
      base.settings.toArray(),
    ])

  return {
    format: MARQUE,
    version: VERSION_SAUVEGARDE,
    exporteLe: Date.now(),
    donnees: { exercises, templates, workouts, workoutExercises, sets, bodyWeights, settings },
  }
}

export function nomDeFichier(date = new Date()): string {
  return `fonte-sauvegarde-${cleDeJour(date)}.json`
}

/** Déclenche le téléchargement du fichier de sauvegarde. */
export async function exporterVersFichier(): Promise<void> {
  const sauvegarde = await construireSauvegarde()
  const blob = new Blob([JSON.stringify(sauvegarde, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const lien = document.createElement('a')
  lien.href = url
  lien.download = nomDeFichier()
  document.body.append(lien)
  lien.click()
  lien.remove()
  // Révocation différée : Safari a encore besoin de l'URL après le clic.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export type ResultatImport =
  | { ok: true; resume: { seances: number; exercices: number; series: number } }
  | { ok: false; raison: string }

/**
 * Remplace toutes les données par celles de la sauvegarde. Le fichier est
 * validé avant que quoi que ce soit ne soit effacé : un fichier douteux ne
 * doit pas pouvoir laisser la base à moitié écrasée.
 */
export async function importerDepuisTexte(texte: string): Promise<ResultatImport> {
  let brut: unknown
  try {
    brut = JSON.parse(texte)
  } catch {
    return { ok: false, raison: "Ce fichier n'est pas un JSON lisible." }
  }

  const analyse = sauvegardeSchema.safeParse(brut)
  if (!analyse.success) {
    const champ = analyse.error.issues[0]?.path.join('.')
    return {
      ok: false,
      raison: champ
        ? `Ce fichier ne correspond pas au format attendu (champ « ${champ} »).`
        : "Ce fichier ne correspond pas au format d'une sauvegarde Fonte.",
    }
  }

  const sauvegarde = analyse.data
  if (sauvegarde.version > VERSION_SAUVEGARDE) {
    return {
      ok: false,
      raison: `Cette sauvegarde vient d'une version plus récente de Fonte (format ${sauvegarde.version}). Mets l'appli à jour avant de l'importer.`,
    }
  }

  const { donnees } = sauvegarde
  await viderBase()
  await base.transaction(
    'rw',
    [
      base.exercises,
      base.templates,
      base.workouts,
      base.workoutExercises,
      base.sets,
      base.bodyWeights,
      base.settings,
    ],
    async () => {
      await base.exercises.bulkAdd(donnees.exercises)
      await base.templates.bulkAdd(donnees.templates)
      await base.workouts.bulkAdd(donnees.workouts)
      await base.workoutExercises.bulkAdd(donnees.workoutExercises)
      await base.sets.bulkAdd(donnees.sets)
      await base.bodyWeights.bulkAdd(donnees.bodyWeights)
      // z.unknown() rend le champ optionnel à l'inférence : on referme le
      // trou pour que la table garde toujours une valeur définie.
      await base.settings.bulkAdd(
        donnees.settings.map((reglage) => ({ key: reglage.key, value: reglage.value ?? null })),
      )
    },
  )
  // Une sauvegarde d'une version plus ancienne peut ignorer des exercices
  // ajoutés depuis : on les remet sans toucher au reste.
  await amorcerBase()

  return {
    ok: true,
    resume: {
      seances: donnees.workouts.length,
      exercices: donnees.exercises.length,
      series: donnees.sets.length,
    },
  }
}
