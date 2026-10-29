import { useLiveQuery } from 'dexie-react-hooks'
import { lireReglages, REGLAGES_PAR_DEFAUT, type Reglages } from '@/db/reglages'

/** Réglages suivis en direct : un changement se propage à tous les écrans. */
export function useReglages(): Reglages {
  return useLiveQuery(lireReglages, [], REGLAGES_PAR_DEFAUT)
}
