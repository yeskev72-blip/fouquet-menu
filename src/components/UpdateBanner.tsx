import { useMiseAJour } from '@/pwa/miseAJour'

/**
 * Bandeau de mise à jour. Monté une seule fois dans l'appli : c'est lui qui
 * enregistre le service worker, via useMiseAJour.
 */
export function UpdateBanner() {
  const { nouvelleVersion, appliquer, ignorer } = useMiseAJour()

  if (!nouvelleVersion) return null

  return (
    <div
      role="status"
      className="animate-fade-up fixed inset-x-4 bottom-4 z-50 flex items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-lg mb-safe"
    >
      <p className="flex-1 text-base text-text">Nouvelle version disponible.</p>
      <button
        type="button"
        onClick={ignorer}
        className="min-h-touch rounded-btn px-3 text-md font-semibold text-muted"
      >
        Plus tard
      </button>
      <button
        type="button"
        onClick={appliquer}
        className="min-h-touch rounded-btn bg-accent px-4 text-md font-bold text-on-accent active:bg-accent-pressed"
      >
        Mettre à jour
      </button>
    </div>
  )
}
