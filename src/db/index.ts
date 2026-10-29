import Dexie, { type EntityTable } from 'dexie'
import { CATALOGUE_EXERCICES, CATALOGUE_MODELES } from './exercices'
import {
  nouvelId,
  type BodyWeight,
  type Exercise,
  type Setting,
  type Template,
  type Workout,
  type WorkoutExercise,
  type WorkoutSet,
} from './types'

/**
 * Base locale de Fonte. Rien ne sort de l'appareil en v1 : IndexedDB est la
 * seule source de vérité, et la sauvegarde passe par un export de fichier.
 *
 * Ajouter une version : appeler `.version(n+1).stores({...})` à la suite,
 * avec un `.upgrade()` quand des données existantes doivent être réécrites.
 * Dexie rejoue les versions dans l'ordre sur les bases déjà installées, donc
 * une version publiée ne se modifie jamais — on en ajoute une nouvelle.
 */
class BaseFonte extends Dexie {
  exercises!: EntityTable<Exercise, 'id'>
  templates!: EntityTable<Template, 'id'>
  workouts!: EntityTable<Workout, 'id'>
  workoutExercises!: EntityTable<WorkoutExercise, 'id'>
  sets!: EntityTable<WorkoutSet, 'id'>
  bodyWeights!: EntityTable<BodyWeight, 'id'>
  settings!: EntityTable<Setting, 'key'>

  constructor() {
    super('fonte')

    // Version 1 — schéma initial.
    // Les booléens ne sont pas indexables en IndexedDB : isCustom, isDone et
    // isPr restent de simples champs, filtrés en mémoire.
    this.version(1).stores({
      exercises: 'id, name, muscleGroup, equipment',
      templates: 'id, name, lastUsedAt',
      workouts: 'id, startedAt, endedAt, templateId',
      workoutExercises: 'id, workoutId, exerciseId, [workoutId+position]',
      sets: 'id, workoutExerciseId, [workoutExerciseId+position]',
      bodyWeights: 'id, measuredAt',
      settings: 'key',
    })
  }
}

export const base = new BaseFonte()

/**
 * Remplit la bibliothèque au premier lancement. Appelé à chaque démarrage
 * plutôt que depuis `populate` : si une mise à jour ajoute des exercices,
 * ils arrivent chez les utilisateurs déjà installés, sans toucher à ceux
 * qu'ils ont créés ni aux noms qu'ils ont renommés.
 */
export async function amorcerBase(): Promise<void> {
  await base.transaction('rw', base.exercises, base.templates, async () => {
    const existants = await base.exercises.toArray()
    const parNom = new Map(existants.map((exercice) => [exercice.name, exercice]))

    const maintenant = Date.now()
    const manquants: Exercise[] = CATALOGUE_EXERCICES.filter(
      (modele) => !parNom.has(modele.name),
    ).map((modele) => ({
      id: nouvelId(),
      name: modele.name,
      muscleGroup: modele.muscleGroup,
      equipment: modele.equipment,
      isCustom: false,
      createdAt: maintenant,
    }))

    if (manquants.length > 0) {
      await base.exercises.bulkAdd(manquants)
      for (const exercice of manquants) parNom.set(exercice.name, exercice)
    }

    // Les modèles d'origine ne sont posés qu'une fois : l'utilisateur doit
    // pouvoir les supprimer sans les voir revenir au prochain démarrage.
    const nbModeles = await base.templates.count()
    if (nbModeles === 0) {
      const modeles: Template[] = CATALOGUE_MODELES.map((modele) => ({
        id: nouvelId(),
        name: modele.name,
        exerciseIds: modele.exercices
          .map((nom) => parNom.get(nom)?.id)
          .filter((id): id is string => id !== undefined),
        createdAt: maintenant,
        lastUsedAt: null,
      }))
      await base.templates.bulkAdd(modeles)
    }
  })
}

/** Vide toutes les tables. Utilisé par l'import de sauvegarde. */
export async function viderBase(): Promise<void> {
  // Au-delà de cinq tables, Dexie attend un tableau plutôt que des arguments.
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
      await Promise.all([
        base.exercises.clear(),
        base.templates.clear(),
        base.workouts.clear(),
        base.workoutExercises.clear(),
        base.sets.clear(),
        base.bodyWeights.clear(),
        base.settings.clear(),
      ])
    },
  )
}
