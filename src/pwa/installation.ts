import { useCallback, useEffect, useState } from 'react'

/** Événement Chrome, absent des types DOM standard. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type PlateformeInstallation = 'invite' | 'ios' | 'installee' | 'indisponible'

export interface EtatInstallation {
  /**
   * - « invite » : Android/Chrome, un vrai bouton d'installation est possible
   * - « ios » : iPhone, il faut passer par Partager puis Sur l'écran d'accueil
   * - « installee » : l'appli tourne déjà depuis l'écran d'accueil
   * - « indisponible » : navigateur sans installation
   */
  plateforme: PlateformeInstallation
  /** Déclenche l'invite native. Ne fait rien hors plateforme « invite ». */
  installer: () => Promise<'accepted' | 'dismissed' | 'indisponible'>
}

function estInstallee(): boolean {
  if (typeof window === 'undefined') return false
  const autonome = window.matchMedia?.('(display-mode: standalone)').matches ?? false
  // Safari iOS expose navigator.standalone au lieu de display-mode.
  const iosAutonome = (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  return autonome || iosAutonome
}

function estIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  // iPadOS 13+ se présente comme un Mac : le test tactile le démasque.
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1
  return /iPad|iPhone|iPod/.test(ua) || iPadOS
}

export function useInstallation(): EtatInstallation {
  const [invite, setInvite] = useState<BeforeInstallPromptEvent | null>(null)
  const [installee, setInstallee] = useState(estInstallee)

  useEffect(() => {
    const surInvite = (evenement: Event): void => {
      // Sans preventDefault, Chrome affiche sa propre mini-bannière.
      evenement.preventDefault()
      setInvite(evenement as BeforeInstallPromptEvent)
    }
    const surInstallation = (): void => {
      setInstallee(true)
      setInvite(null)
    }
    window.addEventListener('beforeinstallprompt', surInvite)
    window.addEventListener('appinstalled', surInstallation)
    return () => {
      window.removeEventListener('beforeinstallprompt', surInvite)
      window.removeEventListener('appinstalled', surInstallation)
    }
  }, [])

  const installer = useCallback(async () => {
    if (!invite) return 'indisponible' as const
    await invite.prompt()
    const { outcome } = await invite.userChoice
    if (outcome === 'accepted') setInstallee(true)
    setInvite(null)
    return outcome
  }, [invite])

  let plateforme: PlateformeInstallation = 'indisponible'
  if (installee) plateforme = 'installee'
  else if (invite) plateforme = 'invite'
  else if (estIOS()) plateforme = 'ios'

  return { plateforme, installer }
}
