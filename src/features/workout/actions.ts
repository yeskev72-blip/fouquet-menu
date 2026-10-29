import { base } from '@/db'
import { nouvelId, type Workout, type WorkoutSet } from '@/db/types'
import { calculerMarques, detecterRecord, integrerSerie, marquesVides } from '@/lib/calculs'
import { valeursPrecedentes } from '@/db/requetes'

/** Nombre de séries créées d'office quand un exercice entre dans la séance. */
const SERIES_PAR_DEFAUT = 3

export async function demarrerSeance(options: {
  nom?: string
  templateId?: string
}): Promise<string> {
  const maintenant = Date.now()
  const workout: Workout = {
    id: nouvelId(),
    name: options.nom ?? 'Séance',
    startedAt: maintenant,
    endedAt: null,
    templateId: options.templateId ?? null,
    notes: '',
  }
  await base.workouts.add(workout)
  return workout.id
}

/** Lance une séance à partir d'un modèle, exercices et séries déjà posés. */
export async function demarrerDepuisModele(templateId: string): Promise<string | null> {
  const modele = await base.templates.get(templateId)
  if (!modele) return null

  const workoutId = await demarrerSeance({ nom: modele.name, templateId })
  await ajouterExercices(workoutId, modele.exerciseIds)
  await base.templates.update(templateId, { lastUsedAt: Date.now() })
  return workoutId
}

/**
 * Ajoute des exercices à la séance, avec leurs séries vides pré-remplies
 * d'après la dernière fois : au départ d'un exercice, il n'y a plus qu'à
 * valider si les chiffres conviennent.
 */
export async function ajouterExercices(workoutId: string, exerciseIds: string[]): Promise<void> {
  if (exerciseIds.length === 0) return

  const dejaLa = await base.workoutExercises.where('workoutId').equals(workoutId).toArray()
  let position = dejaLa.length

  for (const exerciseId of exerciseIds) {
    const lienId = nouvelId()
    const precedentes = await valeursPrecedentes(exerciseId, workoutId)
    const nbSeries = Math.max(SERIES_PAR_DEFAUT, precedentes.length)

    const series: WorkoutSet[] = Array.from({ length: nbSeries }, (_, index) => {
      const reference = precedentes[index] ?? precedentes[precedentes.length - 1]
      return {
        id: nouvelId(),
        workoutExerciseId: lienId,
        position: index,
        weightKg: reference?.weightKg ?? 0,
        reps: reference?.reps ?? 0,
        isDone: false,
        isPr: false,
        doneAt: null,
      }
    })

    await base.transaction('rw', base.workoutExercises, base.sets, async () => {
      await base.workoutExercises.add({ id: lienId, workoutId, exerciseId, position })
      await base.sets.bulkAdd(series)
    })
    position += 1
  }
}

export async function ajouterSerie(workoutExerciseId: string): Promise<void> {
  const series = await base.sets.where('workoutExerciseId').equals(workoutExerciseId).toArray()
  const derniere = series.sort((a, b) => b.position - a.position)[0]
  await base.sets.add({
    id: nouvelId(),
    workoutExerciseId,
    position: (derniere?.position ?? -1) + 1,
    // On recopie la dernière ligne : la série suivante ressemble presque
    // toujours à la précédente.
    weightKg: derniere?.weightKg ?? 0,
    reps: derniere?.reps ?? 0,
    isDone: false,
    isPr: false,
    doneAt: null,
  })
}

export async function supprimerSerie(setId: string): Promise<void> {
  const serie = await base.sets.get(setId)
  if (!serie) return
  await base.sets.delete(setId)
  const lien = await base.workoutExercises.get(serie.workoutExerciseId)
  if (lien) await recalculerRecords(lien.exerciseId)
}

export async function retirerExercice(workoutExerciseId: string): Promise<void> {
  const lien = await base.workoutExercises.get(workoutExerciseId)
  if (!lien) return
  await base.transaction('rw', base.workoutExercises, base.sets, async () => {
    await base.sets.where('workoutExerciseId').equals(workoutExerciseId).delete()
    await base.workoutExercises.delete(workoutExerciseId)
  })
  await recalculerRecords(lien.exerciseId)
}

/**
 * Enregistre un champ saisi sans valider la série. On n'écrit que le champ
 * modifié : écrire les deux ferait que la frappe sur l'un écrase l'autre
 * quand les deux changent coup sur coup.
 */
export async function enregistrerChiffres(
  setId: string,
  chiffres: Partial<Pick<WorkoutSet, 'weightKg' | 'reps'>>,
): Promise<void> {
  await base.sets.update(setId, chiffres)
}

export interface ResultatValidation {
  /** Type de record battu, ou null. */
  record: ReturnType<typeof detecterRecord>
}

/**
 * Valide une série : enregistre les chiffres, détecte un éventuel record et
 * relance le chrono de repos côté appelant.
 */
export async function validerSerie(
  setId: string,
  chiffres: { weightKg: number; reps: number },
): Promise<ResultatValidation> {
  const serie = await base.sets.get(setId)
  if (!serie) return { record: null }

  const lien = await base.workoutExercises.get(serie.workoutExerciseId)
  if (!lien) return { record: null }

  const maintenant = Date.now()
  // Un record se juge sur tout ce qui précède, donc sur les séries déjà
  // validées, celle-ci exclue.
  const anterieures = await seriesValideesAnterieures(lien.exerciseId, setId)
  const record = detecterRecord(chiffres, calculerMarques(anterieures))

  await base.sets.update(setId, {
    ...chiffres,
    isDone: true,
    isPr: record !== null,
    doneAt: maintenant,
  })

  return { record }
}

/** Annule la validation d'une série et remet les records au clair. */
export async function annulerValidation(setId: string): Promise<void> {
  const serie = await base.sets.get(setId)
  if (!serie) return
  await base.sets.update(setId, { isDone: false, isPr: false, doneAt: null })
  const lien = await base.workoutExercises.get(serie.workoutExerciseId)
  if (lien) await recalculerRecords(lien.exerciseId)
}

async function seriesValideesAnterieures(exerciseId: string, exclureSetId: string) {
  const liens = await base.workoutExercises.where('exerciseId').equals(exerciseId).toArray()
  const series = await base.sets
    .where('workoutExerciseId')
    .anyOf(liens.map((lien) => lien.id))
    .toArray()
  return series
    .filter((serie) => serie.isDone && serie.id !== exclureSetId)
    .sort((a, b) => (a.doneAt ?? 0) - (b.doneAt ?? 0))
}

/**
 * Reprend tout l'historique d'un exercice et réattribue les badges de record
 * dans l'ordre chronologique. Appelé après une annulation ou une suppression :
 * sans cela, défaire une série laisserait un record orphelin sur une autre.
 */
export async function recalculerRecords(exerciseId: string): Promise<void> {
  const liens = await base.workoutExercises.where('exerciseId').equals(exerciseId).toArray()
  if (liens.length === 0) return

  const series = await base.sets
    .where('workoutExerciseId')
    .anyOf(liens.map((lien) => lien.id))
    .toArray()
  const validees = series
    .filter((serie) => serie.isDone)
    .sort((a, b) => (a.doneAt ?? 0) - (b.doneAt ?? 0))

  let marques = marquesVides()
  const aEcrire: WorkoutSet[] = []
  for (const serie of validees) {
    const estRecord = detecterRecord(serie, marques) !== null
    if (serie.isPr !== estRecord) aEcrire.push({ ...serie, isPr: estRecord })
    marques = integrerSerie(marques, serie)
  }
  if (aEcrire.length > 0) await base.sets.bulkPut(aEcrire)
}

/** Termine la séance et compte une séance de plus depuis le dernier export. */
export async function terminerSeance(workoutId: string): Promise<void> {
  await base.workouts.update(workoutId, { endedAt: Date.now() })
}

/** Abandonne une séance : elle disparaît au lieu de polluer l'historique. */
export async function annulerSeance(workoutId: string): Promise<void> {
  const liens = await base.workoutExercises.where('workoutId').equals(workoutId).toArray()
  const exerciseIds = [...new Set(liens.map((lien) => lien.exerciseId))]

  await base.transaction('rw', base.workouts, base.workoutExercises, base.sets, async () => {
    await base.sets.where('workoutExerciseId').anyOf(liens.map((lien) => lien.id)).delete()
    await base.workoutExercises.where('workoutId').equals(workoutId).delete()
    await base.workouts.delete(workoutId)
  })

  for (const exerciseId of exerciseIds) await recalculerRecords(exerciseId)
}

export async function renommerSeance(workoutId: string, nom: string): Promise<void> {
  await base.workouts.update(workoutId, { name: nom.trim() || 'Séance' })
}
