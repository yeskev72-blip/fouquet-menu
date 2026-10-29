import { useCallback, useEffect, useState } from 'react'

export type EtatDurabilite = 'inconnu' | 'durable' | 'fragile' | 'indisponible'

export interface StockageDurable {
  /**
   * - « durable » : le navigateur s'engage à ne pas effacer les données
   * - « fragile » : elles peuvent être effacées si l'espace manque
   * - « indisponible » : le navigateur ne répond pas sur la question
   */
  etat: EtatDurabilite
  /** Demande la persistance. Le navigateur peut refuser sans explication. */
  demander: () => Promise<boolean>
}

/**
 * Sur iPhone, les données d'un site non installé peuvent être effacées après
 * quelques semaines sans visite. On demande la persistance, et on le dit
 * honnêtement à l'utilisateur plutôt que de promettre une garantie.
 */
export function useStockageDurable(): StockageDurable {
  const [etat, setEtat] = useState<EtatDurabilite>('inconnu')

  useEffect(() => {
    let annule = false
    const verifier = async (): Promise<void> => {
      if (!navigator.storage?.persisted) {
        if (!annule) setEtat('indisponible')
        return
      }
      try {
        const deja = await navigator.storage.persisted()
        if (annule) return
        if (deja) {
          setEtat('durable')
          return
        }
        // Chrome accorde la persistance en silence sur un site réutilisé ;
        // inutile de l'attendre d'un geste de l'utilisateur.
        const accorde = (await navigator.storage.persist?.()) ?? false
        if (!annule) setEtat(accorde ? 'durable' : 'fragile')
      } catch {
        if (!annule) setEtat('indisponible')
      }
    }
    void verifier()
    return () => {
      annule = true
    }
  }, [])

  const demander = useCallback(async () => {
    if (!navigator.storage?.persist) return false
    try {
      const accorde = await navigator.storage.persist()
      setEtat(accorde ? 'durable' : 'fragile')
      return accorde
    } catch {
      setEtat('indisponible')
      return false
    }
  }, [])

  return { etat, demander }
}
