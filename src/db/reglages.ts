import { base } from './index'
import type { Unite } from './types'
import type { ThemePreference } from '@/styles/theme'

/**
 * Réglages typés au-dessus de la table clé/valeur. Chaque clé a une valeur
 * par défaut : une base neuve se comporte comme une base remplie.
 */
export interface Reglages {
  theme: ThemePreference
  unite: Unite
  /** Durée de repos par défaut, en secondes. */
  reposParDefaut: number
  onboardingTermine: boolean
  /** Horodatage du dernier export de sauvegarde, ou null. */
  dernierExport: number | null
  /** Séances terminées depuis le dernier export, pour le rappel. */
  seancesDepuisExport: number
}

export const REGLAGES_PAR_DEFAUT: Reglages = {
  theme: 'system',
  unite: 'kg',
  reposParDefaut: 120,
  onboardingTermine: false,
  dernierExport: null,
  seancesDepuisExport: 0,
}

/** Nombre de séances après lequel l'appli propose un export. */
export const SEANCES_AVANT_RAPPEL_EXPORT = 10

export async function lireReglages(): Promise<Reglages> {
  const lignes = await base.settings.toArray()
  const valeurs = new Map(lignes.map((ligne) => [ligne.key, ligne.value]))
  const reglages = { ...REGLAGES_PAR_DEFAUT }

  for (const cle of Object.keys(REGLAGES_PAR_DEFAUT) as Array<keyof Reglages>) {
    const valeur = valeurs.get(cle)
    if (valeur === undefined) continue
    // Une valeur du mauvais type (base corrompue, import bancal) est ignorée
    // au profit du défaut plutôt que de faire planter un écran.
    if (typeof valeur === typeof REGLAGES_PAR_DEFAUT[cle] || REGLAGES_PAR_DEFAUT[cle] === null) {
      Object.assign(reglages, { [cle]: valeur })
    }
  }
  return reglages
}

export async function ecrireReglage<C extends keyof Reglages>(
  cle: C,
  valeur: Reglages[C],
): Promise<void> {
  await base.settings.put({ key: cle, value: valeur })
}
