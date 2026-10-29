import { base } from './index'
import {
  calculerMarques,
  marquesVides,
  unRepMax,
  volumeSerie,
  type MeilleuresMarques,
  type SerieChiffree,
} from '@/lib/calculs'
import { cleDeJour, debutDeMois, debutDeSemaine } from '@/lib/dates'
import type { Exercise, Workout, WorkoutExercise, WorkoutSet } from './types'

/** Une séance chargée avec ses exercices et ses séries. */
export interface SeanceComplete {
  workout: Workout
  exercices: Array<{
    lien: WorkoutExercise
    exercice: Exercise
    series: WorkoutSet[]
  }>
}

export async function seanceEnCours(): Promise<Workout | undefined> {
  // endedAt est indexé : `null` n'est pas indexable, d'où le filtre en mémoire
  // sur un jeu volontairement minuscule (au plus une séance ouverte).
  const ouvertes = await base.workouts.filter((seance) => seance.endedAt === null).toArray()
  return ouvertes.sort((a, b) => b.startedAt - a.startedAt)[0]
}

export async function chargerSeance(workoutId: string): Promise<SeanceComplete | null> {
  const workout = await base.workouts.get(workoutId)
  if (!workout) return null

  const liens = await base.workoutExercises.where('workoutId').equals(workoutId).toArray()
  liens.sort((a, b) => a.position - b.position)

  const [exercices, series] = await Promise.all([
    base.exercises.bulkGet(liens.map((lien) => lien.exerciseId)),
    base.sets.where('workoutExerciseId').anyOf(liens.map((lien) => lien.id)).toArray(),
  ])

  const exerciceParId = new Map(
    exercices.filter((e): e is Exercise => e !== undefined).map((e) => [e.id, e]),
  )
  const seriesParLien = new Map<string, WorkoutSet[]>()
  for (const serie of series) {
    const liste = seriesParLien.get(serie.workoutExerciseId) ?? []
    liste.push(serie)
    seriesParLien.set(serie.workoutExerciseId, liste)
  }

  return {
    workout,
    exercices: liens.flatMap((lien) => {
      const exercice = exerciceParId.get(lien.exerciseId)
      if (!exercice) return []
      const liste = (seriesParLien.get(lien.id) ?? []).sort((a, b) => a.position - b.position)
      return [{ lien, exercice, series: liste }]
    }),
  }
}

/**
 * Valeurs de la dernière séance contenant cet exercice, série par série.
 * C'est ce qui s'affiche en grisé dans la colonne « Précédent » : la cible
 * à égaler ou à dépasser.
 */
export async function valeursPrecedentes(
  exerciseId: string,
  exclureWorkoutId: string | null,
): Promise<SerieChiffree[]> {
  const liens = await base.workoutExercises.where('exerciseId').equals(exerciseId).toArray()
  const candidats = liens.filter((lien) => lien.workoutId !== exclureWorkoutId)
  if (candidats.length === 0) return []

  const seances = await base.workouts.bulkGet(candidats.map((lien) => lien.workoutId))
  const parDate = candidats
    .map((lien, index) => ({ lien, seance: seances[index] }))
    .filter((entree): entree is { lien: WorkoutExercise; seance: Workout } => entree.seance !== undefined)
    .sort((a, b) => b.seance.startedAt - a.seance.startedAt)

  // On remonte jusqu'à trouver une séance où cet exercice a vraiment été fait :
  // une séance où il a été ajouté puis laissé vide n'est pas une référence.
  for (const { lien } of parDate) {
    const series = await base.sets.where('workoutExerciseId').equals(lien.id).toArray()
    const validees = series.filter((serie) => serie.isDone).sort((a, b) => a.position - b.position)
    if (validees.length > 0) {
      return validees.map((serie) => ({ weightKg: serie.weightKg, reps: serie.reps }))
    }
  }
  return []
}

/** Toutes les séries validées d'un exercice, de la plus ancienne à la plus récente. */
export async function seriesValideesDe(
  exerciseId: string,
): Promise<Array<{ serie: WorkoutSet; seance: Workout }>> {
  const liens = await base.workoutExercises.where('exerciseId').equals(exerciseId).toArray()
  if (liens.length === 0) return []

  const [series, seances] = await Promise.all([
    base.sets.where('workoutExerciseId').anyOf(liens.map((lien) => lien.id)).toArray(),
    base.workouts.bulkGet(liens.map((lien) => lien.workoutId)),
  ])

  const seanceParLien = new Map<string, Workout>()
  liens.forEach((lien, index) => {
    const seance = seances[index]
    if (seance) seanceParLien.set(lien.id, seance)
  })

  return series
    .filter((serie) => serie.isDone)
    .flatMap((serie) => {
      const seance = seanceParLien.get(serie.workoutExerciseId)
      return seance ? [{ serie, seance }] : []
    })
    .sort((a, b) => a.seance.startedAt - b.seance.startedAt || a.serie.position - b.serie.position)
}

/**
 * Meilleures marques d'un exercice. `exclureWorkoutId` sert pendant une
 * séance : un record se compare à ce qui précède, pas à la série en cours.
 */
export async function marquesExercice(
  exerciseId: string,
  exclureWorkoutId: string | null = null,
): Promise<MeilleuresMarques> {
  const entrees = await seriesValideesDe(exerciseId)
  const retenues = entrees.filter(({ seance }) => seance.id !== exclureWorkoutId)
  if (retenues.length === 0) return marquesVides()
  return calculerMarques(retenues.map(({ serie }) => serie))
}

export interface ResumeSeance {
  workout: Workout
  volumeKg: number
  dureeMs: number
  nbRecords: number
  nbSeries: number
}

async function resumer(seances: Workout[]): Promise<ResumeSeance[]> {
  if (seances.length === 0) return []
  const liens = await base.workoutExercises
    .where('workoutId')
    .anyOf(seances.map((seance) => seance.id))
    .toArray()
  const series = await base.sets
    .where('workoutExerciseId')
    .anyOf(liens.map((lien) => lien.id))
    .toArray()

  const seanceParLien = new Map(liens.map((lien) => [lien.id, lien.workoutId]))
  const agrege = new Map<string, { volume: number; records: number; series: number }>()
  for (const serie of series) {
    if (!serie.isDone) continue
    const workoutId = seanceParLien.get(serie.workoutExerciseId)
    if (!workoutId) continue
    const courant = agrege.get(workoutId) ?? { volume: 0, records: 0, series: 0 }
    courant.volume += volumeSerie(serie)
    courant.series += 1
    if (serie.isPr) courant.records += 1
    agrege.set(workoutId, courant)
  }

  return seances.map((workout) => {
    const chiffres = agrege.get(workout.id) ?? { volume: 0, records: 0, series: 0 }
    return {
      workout,
      volumeKg: chiffres.volume,
      dureeMs: (workout.endedAt ?? Date.now()) - workout.startedAt,
      nbRecords: chiffres.records,
      nbSeries: chiffres.series,
    }
  })
}

/** Séances terminées, de la plus récente à la plus ancienne. */
export async function seancesTerminees(limite?: number): Promise<ResumeSeance[]> {
  const toutes = await base.workouts.filter((seance) => seance.endedAt !== null).toArray()
  toutes.sort((a, b) => b.startedAt - a.startedAt)
  return resumer(limite ? toutes.slice(0, limite) : toutes)
}

export async function seancesDuMois(mois: Date): Promise<ResumeSeance[]> {
  const debut = debutDeMois(mois).getTime()
  const finDate = debutDeMois(mois)
  finDate.setMonth(finDate.getMonth() + 1)
  const fin = finDate.getTime()

  const seances = await base.workouts
    .where('startedAt')
    .between(debut, fin, true, false)
    .toArray()
  const terminees = seances.filter((seance) => seance.endedAt !== null)
  terminees.sort((a, b) => b.startedAt - a.startedAt)
  return resumer(terminees)
}

export interface ResumeSemaine {
  /** Clés « 2026-10-29 » des jours où une séance a eu lieu. */
  joursEntraines: Set<string>
  volumeKg: number
  dureeMs: number
  nbRecords: number
  nbSeances: number
}

export async function statistiquesSemaine(reference = new Date()): Promise<ResumeSemaine> {
  const debut = debutDeSemaine(reference).getTime()
  const seances = await base.workouts.where('startedAt').aboveOrEqual(debut).toArray()
  const resumes = await resumer(seances.filter((seance) => seance.endedAt !== null))

  return {
    joursEntraines: new Set(resumes.map(({ workout }) => cleDeJour(new Date(workout.startedAt)))),
    volumeKg: resumes.reduce((total, r) => total + r.volumeKg, 0),
    dureeMs: resumes.reduce((total, r) => total + r.dureeMs, 0),
    nbRecords: resumes.reduce((total, r) => total + r.nbRecords, 0),
    nbSeances: resumes.length,
  }
}

export interface StatistiquesGlobales {
  nbSeances: number
  volumeTotalKg: number
  dureeMoyenneMs: number
}

export async function statistiquesGlobales(): Promise<StatistiquesGlobales> {
  const resumes = await seancesTerminees()
  const volumeTotalKg = resumes.reduce((total, r) => total + r.volumeKg, 0)
  const dureeTotale = resumes.reduce((total, r) => total + r.dureeMs, 0)
  return {
    nbSeances: resumes.length,
    volumeTotalKg,
    dureeMoyenneMs: resumes.length > 0 ? dureeTotale / resumes.length : 0,
  }
}

export interface RecordPersonnel {
  exercice: Exercise
  poidsKg: number
  reps: number
  /** 1RM estimé de la série record. */
  unRepMaxKg: number
  date: number
}

/**
 * Meilleure charge par exercice, de la plus lourde à la plus légère.
 * Les exercices au poids du corps sont départagés sur les répétitions.
 */
export async function recordsPersonnels(): Promise<RecordPersonnel[]> {
  const [series, liens, exercices] = await Promise.all([
    base.sets.filter((serie) => serie.isDone).toArray(),
    base.workoutExercises.toArray(),
    base.exercises.toArray(),
  ])

  const exerciceParLien = new Map(liens.map((lien) => [lien.id, lien.exerciseId]))
  const exerciceParId = new Map(exercices.map((exercice) => [exercice.id, exercice]))

  const meilleurs = new Map<string, { serie: WorkoutSet; score: number }>()
  for (const serie of series) {
    const exerciseId = exerciceParLien.get(serie.workoutExerciseId)
    if (!exerciseId || serie.reps <= 0) continue
    // Le score départage : la charge d'abord, les répétitions ensuite, ce qui
    // garde un classement cohérent pour les exercices au poids du corps.
    const score = serie.weightKg * 1000 + serie.reps
    const courant = meilleurs.get(exerciseId)
    if (!courant || score > courant.score) meilleurs.set(exerciseId, { serie, score })
  }

  return [...meilleurs.entries()]
    .flatMap(([exerciseId, { serie }]) => {
      const exercice = exerciceParId.get(exerciseId)
      if (!exercice) return []
      return [
        {
          exercice,
          poidsKg: serie.weightKg,
          reps: serie.reps,
          unRepMaxKg: unRepMax(serie),
          date: serie.doneAt ?? 0,
        },
      ]
    })
    .sort((a, b) => b.poidsKg - a.poidsKg || b.reps - a.reps)
}

export interface SeanceDUnExercice {
  workout: Workout
  series: WorkoutSet[]
  poidsMaxKg: number
  volumeKg: number
  meilleur1RMKg: number
  aRecord: boolean
}

/**
 * Historique d'un exercice, séance par séance, de la plus ancienne à la plus
 * récente. Sert à la fois aux courbes et à la liste du détail.
 */
export async function historiqueExercice(exerciseId: string): Promise<SeanceDUnExercice[]> {
  const entrees = await seriesValideesDe(exerciseId)

  const parSeance = new Map<string, { workout: Workout; series: WorkoutSet[] }>()
  for (const { serie, seance } of entrees) {
    const courant = parSeance.get(seance.id) ?? { workout: seance, series: [] }
    courant.series.push(serie)
    parSeance.set(seance.id, courant)
  }

  return [...parSeance.values()]
    .map(({ workout, series }) => ({
      workout,
      series,
      poidsMaxKg: Math.max(...series.map((serie) => serie.weightKg)),
      volumeKg: series.reduce((total, serie) => total + volumeSerie(serie), 0),
      meilleur1RMKg: Math.max(...series.map((serie) => unRepMax(serie))),
      aRecord: series.some((serie) => serie.isPr),
    }))
    .sort((a, b) => a.workout.startedAt - b.workout.startedAt)
}
