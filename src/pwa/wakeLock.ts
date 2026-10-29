import { useEffect, useRef } from 'react'

/**
 * Garde l'écran allumé pendant une séance : poser le téléphone entre deux
 * séries ne doit pas obliger à le déverrouiller pour noter la suivante.
 *
 * Le verrou est relâché par le navigateur quand l'onglet passe en arrière-plan,
 * d'où la reprise sur « visibilitychange ». L'API manque sur Safari iOS avant
 * la version 16.4 : l'absence est silencieuse, l'appli marche sans.
 */
export function useWakeLock(actif: boolean): void {
  const verrou = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!actif || !('wakeLock' in navigator)) return

    let annule = false

    const demander = async (): Promise<void> => {
      if (annule || verrou.current || document.visibilityState !== 'visible') return
      try {
        verrou.current = await navigator.wakeLock.request('screen')
        verrou.current.addEventListener('release', () => {
          verrou.current = null
        })
      } catch {
        // Refus possible si la batterie est faible : sans gravité.
      }
    }

    const surVisibilite = (): void => {
      if (document.visibilityState === 'visible') void demander()
    }

    void demander()
    document.addEventListener('visibilitychange', surVisibilite)

    return () => {
      annule = true
      document.removeEventListener('visibilitychange', surVisibilite)
      void verrou.current?.release().catch(() => {})
      verrou.current = null
    }
  }, [actif])
}
