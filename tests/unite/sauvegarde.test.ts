import { beforeEach, describe, expect, it } from 'vitest'
import { amorcerBase, base, viderBase } from '@/db'
import { ecrireReglage } from '@/db/reglages'
import { nouvelId } from '@/db/types'
import { construireSauvegarde, importerDepuisTexte, nomDeFichier, VERSION_SAUVEGARDE } from '@/lib/sauvegarde'

/** Pose une séance complète, pour avoir du contenu dans chaque table. */
async function poserDesDonnees() {
  await amorcerBase()
  const couche = await base.exercises.where('name').equals('Développé couché').first()
  const workoutId = nouvelId()
  const lienId = nouvelId()

  await base.workouts.add({
    id: workoutId, name: 'Push', startedAt: 1_700_000_000_000,
    endedAt: 1_700_003_600_000, templateId: null, notes: 'bonne séance',
  })
  await base.workoutExercises.add({ id: lienId, workoutId, exerciseId: couche!.id, position: 0 })
  await base.sets.bulkAdd([
    { id: nouvelId(), workoutExerciseId: lienId, position: 0, weightKg: 80, reps: 8, isDone: true, isPr: true, doneAt: 1_700_000_600_000 },
    { id: nouvelId(), workoutExerciseId: lienId, position: 1, weightKg: 82.5, reps: 8, isDone: true, isPr: true, doneAt: 1_700_001_200_000 },
  ])
  await base.bodyWeights.add({ id: nouvelId(), weightKg: 78.4, measuredAt: 1_700_000_000_000 })
  await ecrireReglage('unite', 'lb')
  await ecrireReglage('reposParDefaut', 90)
}

/** Lit toutes les tables, triées, pour comparer deux états de la base. */
async function photographier() {
  const tri = <T extends { id?: string; key?: string }>(lignes: T[]) =>
    [...lignes].sort((a, b) => String(a.id ?? a.key).localeCompare(String(b.id ?? b.key)))
  return {
    exercises: tri(await base.exercises.toArray()),
    templates: tri(await base.templates.toArray()),
    workouts: tri(await base.workouts.toArray()),
    workoutExercises: tri(await base.workoutExercises.toArray()),
    sets: tri(await base.sets.toArray()),
    bodyWeights: tri(await base.bodyWeights.toArray()),
    settings: tri(await base.settings.toArray()),
  }
}

beforeEach(async () => {
  await base.open()
  await viderBase()
})

describe('export puis import', () => {
  it('restitue exactement les mêmes données', async () => {
    await poserDesDonnees()
    const avant = await photographier()
    const fichier = JSON.stringify(await construireSauvegarde())

    await viderBase()
    expect(await base.workouts.count()).toBe(0)

    const resultat = await importerDepuisTexte(fichier)
    expect(resultat.ok).toBe(true)

    expect(await photographier()).toEqual(avant)
  })

  it('rend un résumé de ce qui a été importé', async () => {
    await poserDesDonnees()
    const fichier = JSON.stringify(await construireSauvegarde())
    const resultat = await importerDepuisTexte(fichier)

    expect(resultat).toMatchObject({ ok: true, resume: { seances: 1, series: 2 } })
  })

  it('porte la marque et la version du format', async () => {
    await poserDesDonnees()
    const sauvegarde = await construireSauvegarde()
    expect(sauvegarde.format).toBe('fonte-sauvegarde')
    expect(sauvegarde.version).toBe(VERSION_SAUVEGARDE)
  })

  it('nomme le fichier avec la date du jour', () => {
    expect(nomDeFichier(new Date(2026, 9, 29))).toBe('fonte-sauvegarde-2026-10-29.json')
  })
})

describe('import de fichiers invalides', () => {
  it('refuse un fichier qui n’est pas du JSON', async () => {
    await poserDesDonnees()
    const resultat = await importerDepuisTexte('ceci n’est pas du json')
    expect(resultat).toEqual({ ok: false, raison: "Ce fichier n'est pas un JSON lisible." })
  })

  it('refuse un JSON qui n’est pas une sauvegarde Fonte', async () => {
    const resultat = await importerDepuisTexte(JSON.stringify({ hello: 'world' }))
    expect(resultat.ok).toBe(false)
  })

  it('refuse une sauvegarde issue d’une version plus récente', async () => {
    await poserDesDonnees()
    const sauvegarde = await construireSauvegarde()
    const futur = JSON.stringify({ ...sauvegarde, version: VERSION_SAUVEGARDE + 1 })

    const resultat = await importerDepuisTexte(futur)
    expect(resultat.ok).toBe(false)
    if (!resultat.ok) expect(resultat.raison).toContain('plus récente')
  })

  it('laisse la base intacte quand le fichier est refusé', async () => {
    await poserDesDonnees()
    const avant = await photographier()

    await importerDepuisTexte('{"format":"fonte-sauvegarde","version":1}')

    expect(await photographier()).toEqual(avant)
  })
})
