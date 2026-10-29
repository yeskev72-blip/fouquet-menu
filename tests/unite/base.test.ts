import { beforeEach, describe, expect, it } from 'vitest'
import { amorcerBase, base, viderBase } from '@/db'
import { CATALOGUE_EXERCICES, CATALOGUE_MODELES } from '@/db/exercices'
import { lireReglages, REGLAGES_PAR_DEFAUT, ecrireReglage } from '@/db/reglages'
import { nouvelId } from '@/db/types'

beforeEach(async () => {
  await base.open()
  await viderBase()
})

describe('amorçage de la base', () => {
  it('charge la bibliothèque et les modèles au premier lancement', async () => {
    await amorcerBase()

    expect(await base.exercises.count()).toBe(CATALOGUE_EXERCICES.length)
    expect(await base.exercises.count()).toBeGreaterThanOrEqual(80)
    expect(await base.templates.count()).toBe(CATALOGUE_MODELES.length)

    const push = await base.templates.where('name').equals('Push').first()
    expect(push?.exerciseIds).toHaveLength(6)
  })

  it('est idempotent : relancer n’ajoute pas de doublon', async () => {
    await amorcerBase()
    await amorcerBase()
    expect(await base.exercises.count()).toBe(CATALOGUE_EXERCICES.length)
    expect(await base.templates.count()).toBe(CATALOGUE_MODELES.length)
  })

  it('ne recrée pas un modèle que l’utilisateur a supprimé', async () => {
    await amorcerBase()
    const push = await base.templates.where('name').equals('Push').first()
    await base.templates.delete(push!.id)

    await amorcerBase()

    expect(await base.templates.count()).toBe(CATALOGUE_MODELES.length - 1)
    expect(await base.templates.where('name').equals('Push').count()).toBe(0)
  })

  it('laisse intacts les exercices personnalisés', async () => {
    await amorcerBase()
    await base.exercises.add({
      id: nouvelId(),
      name: 'Tirage à la corde du village',
      muscleGroup: 'Dos',
      equipment: 'Élastique',
      isCustom: true,
      createdAt: Date.now(),
    })

    await amorcerBase()

    const perso = await base.exercises.where('name').equals('Tirage à la corde du village').first()
    expect(perso?.isCustom).toBe(true)
    expect(await base.exercises.count()).toBe(CATALOGUE_EXERCICES.length + 1)
  })
})

describe('réglages', () => {
  it('rend les valeurs par défaut sur une base neuve', async () => {
    expect(await lireReglages()).toEqual(REGLAGES_PAR_DEFAUT)
  })

  it('relit ce qui a été écrit', async () => {
    await ecrireReglage('unite', 'lb')
    await ecrireReglage('reposParDefaut', 90)
    const reglages = await lireReglages()
    expect(reglages.unite).toBe('lb')
    expect(reglages.reposParDefaut).toBe(90)
    expect(reglages.theme).toBe(REGLAGES_PAR_DEFAUT.theme)
  })

  it('ignore une valeur du mauvais type plutôt que de la propager', async () => {
    await base.settings.put({ key: 'reposParDefaut', value: 'beaucoup' })
    expect((await lireReglages()).reposParDefaut).toBe(REGLAGES_PAR_DEFAUT.reposParDefaut)
  })
})
