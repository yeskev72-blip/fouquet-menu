import { useLiveQuery } from 'dexie-react-hooks'
import { lireReglages, REGLAGES_PAR_DEFAUT, type Reglages } from '@/db/reglages'

/**
 * Réglages suivis en direct : un changement se propage à tous les écrans.
 *
 * `initiaux` évite le temps mort du premier rendu, où useLiveQuery n'a pas
 * encore de résultat. Sans lui, l'appli afficherait brièvement les valeurs
 * par défaut — dont un onboarding non terminé — à chaque démarrage.
 */
export function useReglages(initiaux: Reglages = REGLAGES_PAR_DEFAUT): Reglages {
  return useLiveQuery(lireReglages, [], initiaux)
}
