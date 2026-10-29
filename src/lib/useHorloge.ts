import { useEffect, useState } from 'react'

/**
 * Horloge partagée : rend l'heure courante et se rafraîchit à l'intervalle
 * demandé. Les durées affichées se calculent toujours à partir d'elle et
 * d'un horodatage de départ, jamais en incrémentant un compteur — sinon
 * elles dérivent dès que l'onglet passe en arrière-plan.
 */
export function useHorloge(intervalleMs = 1000, actif = true): number {
  const [maintenant, setMaintenant] = useState(() => Date.now())

  useEffect(() => {
    if (!actif) return
    setMaintenant(Date.now())
    const minuterie = window.setInterval(() => setMaintenant(Date.now()), intervalleMs)

    // Au retour au premier plan, l'intervalle a pu être ralenti ou suspendu :
    // on resynchronise tout de suite plutôt que d'attendre le prochain tic.
    const surVisibilite = (): void => {
      if (document.visibilityState === 'visible') setMaintenant(Date.now())
    }
    document.addEventListener('visibilitychange', surVisibilite)

    return () => {
      window.clearInterval(minuterie)
      document.removeEventListener('visibilitychange', surVisibilite)
    }
  }, [intervalleMs, actif])

  return maintenant
}
