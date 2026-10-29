import { base } from '@/db'
import { nouvelId, type BodyWeight } from '@/db/types'

export async function ajouterPoidsCorps(weightKg: number, measuredAt = Date.now()): Promise<void> {
  await base.bodyWeights.add({ id: nouvelId(), weightKg, measuredAt })
}

export async function supprimerPoidsCorps(id: string): Promise<void> {
  await base.bodyWeights.delete(id)
}

/** Mesures de poids de corps, de la plus ancienne à la plus récente. */
export async function historiquePoidsCorps(): Promise<BodyWeight[]> {
  return base.bodyWeights.orderBy('measuredAt').toArray()
}

export interface ResumePoidsCorps {
  dernier: BodyWeight | null
  /** Écart avec la mesure la plus ancienne de la fenêtre, ou null. */
  deltaKg: number | null
  joursDeFenetre: number
  mesures: BodyWeight[]
}

const FENETRE_JOURS = 30

export function resumerPoidsCorps(
  mesures: BodyWeight[],
  maintenant = Date.now(),
): ResumePoidsCorps {
  const dernier = mesures[mesures.length - 1] ?? null
  const debutFenetre = maintenant - FENETRE_JOURS * 86_400_000
  const dansLaFenetre = mesures.filter((mesure) => mesure.measuredAt >= debutFenetre)

  // Il faut au moins deux points dans la fenêtre pour parler d'évolution.
  const premier = dansLaFenetre[0]
  const deltaKg =
    dernier && premier && dansLaFenetre.length >= 2 ? dernier.weightKg - premier.weightKg : null

  return { dernier, deltaKg, joursDeFenetre: FENETRE_JOURS, mesures }
}
