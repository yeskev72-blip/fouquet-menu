import { cn } from '@/lib/cn'
import { chronoEnMots, formaterChrono } from '@/lib/nombres'

interface RestTimerBarProps {
  /** Millisecondes restantes, déjà calculées à partir d'un horodatage. */
  restantMs: number
  /** Durée totale du repos en cours, pour la barre de progression. */
  totalMs: number
  onAjuster: (secondes: number) => void
  onPasser: () => void
}

/**
 * Chrono de repos, fixé en bas de l'écran de séance. Il ne compte pas de
 * ticks : la valeur vient toujours d'un horodatage, donc elle reste juste
 * même si l'appli est passée en arrière-plan pendant le repos.
 */
export function RestTimerBar({ restantMs, totalMs, onAjuster, onPasser }: RestTimerBarProps) {
  const avancement = totalMs > 0 ? Math.min(1, Math.max(0, 1 - restantMs / totalMs)) : 0
  const termine = restantMs <= 0

  return (
    <div className="flex-none border-t border-border bg-surface px-5 pb-safe">
      <div className="flex flex-col justify-center gap-3 py-3">
        <div
          className="h-1 rounded-pill bg-border"
          role="progressbar"
          aria-label="Avancement du repos"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(avancement * 100)}
        >
          <div
            className={cn('h-1 rounded-pill transition-[width] duration-fast', termine ? 'bg-ok' : 'bg-accent')}
            style={{ width: `${avancement * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-1 flex-col">
            <span className="text-cap font-semibold uppercase tracking-wider text-muted">
              {termine ? 'Repos terminé' : 'Repos'}
            </span>
            {/* Le chiffre défile chaque seconde : annoncer chaque changement
                noierait le lecteur d'écran, d'où aria-hidden et un résumé
                poli à côté. */}
            <span
              aria-hidden="true"
              className={cn('font-display text-d-3xl font-bold', termine ? 'text-ok' : 'text-accent-text')}
            >
              {formaterChrono(Math.max(0, restantMs))}
            </span>
            <span role="status" className="sr-only">
              {termine ? 'Repos terminé, à toi.' : `Repos, ${chronoEnMots(restantMs)} restantes.`}
            </span>
          </div>

          <button
            type="button"
            aria-label="Retirer 15 secondes au repos"
            onClick={() => onAjuster(-15)}
            className="h-12 w-12 rounded-btn bg-field text-md font-bold text-text active:bg-border"
          >
            −15
          </button>
          <button
            type="button"
            aria-label="Ajouter 15 secondes au repos"
            onClick={() => onAjuster(15)}
            className="h-12 w-12 rounded-btn bg-field text-md font-bold text-text active:bg-border"
          >
            +15
          </button>
          <button
            type="button"
            onClick={onPasser}
            className="h-12 rounded-btn bg-accent px-4 text-md font-bold text-on-accent active:bg-accent-pressed"
          >
            {termine ? 'OK' : 'Passer'}
          </button>
        </div>
      </div>
    </div>
  )
}
