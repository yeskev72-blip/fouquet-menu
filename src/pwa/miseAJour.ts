import { useRegisterSW } from 'virtual:pwa-register/react'

export interface EtatMiseAJour {
  /** Une nouvelle version est prête et attend le feu vert de l'utilisateur. */
  nouvelleVersion: boolean
  /** L'appli est précachée : elle fonctionnera hors ligne. */
  pretHorsLigne: boolean
  /** Installe la nouvelle version et recharge la page. */
  appliquer: () => void
  /** Referme le bandeau sans mettre à jour. */
  ignorer: () => void
}

/**
 * La mise à jour n'est jamais automatique : recharger la page au milieu
 * d'une série ferait perdre la saisie en cours. Le service worker attend,
 * un bandeau propose, l'utilisateur décide.
 */
export function useMiseAJour(): EtatMiseAJour {
  const {
    needRefresh: [nouvelleVersion, setNouvelleVersion],
    offlineReady: [pretHorsLigne, setPretHorsLigne],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(erreur) {
      console.warn("Le service worker n'a pas pu s'enregistrer.", erreur)
    },
  })

  return {
    nouvelleVersion,
    pretHorsLigne,
    appliquer: () => {
      void updateServiceWorker(true)
    },
    ignorer: () => {
      setNouvelleVersion(false)
      setPretHorsLigne(false)
    },
  }
}
