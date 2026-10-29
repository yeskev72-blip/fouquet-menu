import { useInstallation } from '@/pwa/installation'

interface InstallBannerProps {
  /** Affiché en entier dans Profil, en version compacte ailleurs. */
  variante?: 'carte' | 'compact'
}

/**
 * Invite d'installation. Sur Android, un vrai bouton. Sur iPhone, un rappel
 * du geste à faire, parce que Safari ne propose aucune invite programmable.
 */
export function InstallBanner({ variante = 'carte' }: InstallBannerProps) {
  const { plateforme, installer } = useInstallation()

  if (plateforme === 'installee' || plateforme === 'indisponible') return null

  if (plateforme === 'ios') {
    return (
      <div className="rounded-card border border-border bg-surface p-4">
        <p className="text-lg font-semibold text-text">Ajouter Fonte à l'écran d'accueil</p>
        <p className="mt-2 text-base text-muted">
          Dans Safari, touche le bouton Partager, puis « Sur l'écran d'accueil ». Fonte s'ouvrira en
          plein écran, et tes données seront mieux protégées de l'effacement automatique.
        </p>
      </div>
    )
  }

  if (variante === 'compact') {
    return (
      <button
        type="button"
        onClick={() => void installer()}
        className="min-h-touch w-full rounded-btn bg-field px-4 text-md font-semibold text-text active:bg-border"
      >
        Installer Fonte
      </button>
    )
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="text-lg font-semibold text-text">Installer Fonte</p>
      <p className="mt-2 text-base text-muted">
        Lancée depuis l'écran d'accueil, Fonte s'ouvre en plein écran et démarre sans réseau.
      </p>
      <button
        type="button"
        onClick={() => void installer()}
        className="mt-3 min-h-touch w-full rounded-btn bg-accent px-4 text-md font-bold text-on-accent active:bg-accent-pressed"
      >
        Installer Fonte
      </button>
    </div>
  )
}
