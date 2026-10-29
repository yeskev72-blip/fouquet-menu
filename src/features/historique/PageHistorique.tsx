import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { IconeChevronDroite, IconeChevronGauche } from '@/components/Icones'
import { PRBadge } from '@/components/PRBadge'
import { seancesDuMois } from '@/db/requetes'
import { cleDeJour, debutDeMois, INITIALES_SEMAINE, jourCourt, memeJour, moisEtAnnee } from '@/lib/dates'
import { formaterDuree, formaterVolume } from '@/lib/nombres'
import { cn } from '@/lib/cn'

/** Grille du mois, lundi en tête, avec les cases vides du début. */
function grilleDuMois(mois: Date): Array<Date | null> {
  const premier = debutDeMois(mois)
  const decalage = (premier.getDay() + 6) % 7
  const dansLeMois = new Date(premier)
  dansLeMois.setMonth(dansLeMois.getMonth() + 1)
  dansLeMois.setDate(0)
  const nbJours = dansLeMois.getDate()

  return [
    ...Array.from({ length: decalage }, () => null),
    ...Array.from({ length: nbJours }, (_, index) => {
      const jour = new Date(premier)
      jour.setDate(index + 1)
      return jour
    }),
  ]
}

export function PageHistorique() {
  const aujourdhui = new Date()
  const [mois, setMois] = useState(() => debutDeMois(aujourdhui))

  const seances = useLiveQuery(() => seancesDuMois(mois), [mois.getTime()], [])
  const grille = useMemo(() => grilleDuMois(mois), [mois])

  const joursEntraines = useMemo(
    () => new Set(seances.map(({ workout }) => cleDeJour(new Date(workout.startedAt)))),
    [seances],
  )

  const changerMois = (pas: number): void => {
    const suivant = new Date(mois)
    suivant.setMonth(suivant.getMonth() + pas)
    setMois(debutDeMois(suivant))
  }

  // Pas de navigation au-delà du mois courant : il n'y a rien à y voir.
  const moisProchainPossible = debutDeMois(mois).getTime() < debutDeMois(aujourdhui).getTime()

  return (
    <div className="flex flex-col pb-6">
      <header className="px-5 pt-7">
        <h1 className="font-display text-d-4xl font-bold">Historique</h1>
      </header>

      <div className="flex items-center justify-between px-5 pt-2">
        <button
          type="button"
          aria-label="Mois précédent"
          onClick={() => changerMois(-1)}
          className="flex h-12 w-12 items-center justify-center rounded-btn bg-surface text-text active:bg-field"
        >
          <IconeChevronGauche taille={20} />
        </button>
        <h2 className="font-display text-d-sm font-semibold">{moisEtAnnee(mois)}</h2>
        <button
          type="button"
          aria-label="Mois suivant"
          disabled={!moisProchainPossible}
          onClick={() => changerMois(1)}
          className="flex h-12 w-12 items-center justify-center rounded-btn bg-surface text-muted active:bg-field disabled:opacity-40"
        >
          <IconeChevronDroite taille={20} />
        </button>
      </div>

      <div className="px-5 pt-2">
        <div className="grid h-6 grid-cols-7 items-center text-center text-legend font-semibold text-muted">
          {INITIALES_SEMAINE.map((initiale, index) => (
            <span key={index}>{initiale}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 justify-items-center" role="grid" aria-label={`Séances de ${moisEtAnnee(mois)}`}>
          {grille.map((jour, index) => {
            if (!jour) return <span key={`vide-${index}`} className="h-12" />
            const entraine = joursEntraines.has(cleDeJour(jour))
            const estAujourdhui = memeJour(jour, aujourdhui)
            return (
              <span key={cleDeJour(jour)} className="flex h-12 items-center justify-center">
                <span
                  className={cn(
                    'flex items-center justify-center rounded-pill text-md',
                    entraine && 'h-10 w-10 bg-accent font-bold text-on-accent',
                    !entraine && estAujourdhui && 'h-9 w-9 border-2 border-accent font-bold text-text',
                    !entraine && !estAujourdhui && 'text-muted',
                  )}
                >
                  {jour.getDate()}
                  {entraine ? <span className="sr-only"> — séance ce jour</span> : null}
                </span>
              </span>
            )
          })}
        </div>
      </div>

      <section className="px-5 pt-3">
        <p className="mb-3 text-sm text-muted">
          {seances.length === 0
            ? 'Aucune séance ce mois-ci.'
            : `${seances.length} séance${seances.length > 1 ? 's' : ''} ce mois-ci`}
        </p>

        <ul className="flex list-none flex-col gap-2">
          {seances.map(({ workout, volumeKg, dureeMs, nbRecords }) => {
            const date = new Date(workout.startedAt)
            return (
              <li
                key={workout.id}
                className="flex min-h-18 items-center gap-3 rounded-card border border-border bg-surface px-4 py-3"
              >
                <span className="flex w-11 flex-none flex-col items-center">
                  <span className="font-display text-d-md font-bold">{date.getDate()}</span>
                  <span className="text-legend text-muted">{jourCourt(date)}</span>
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-xl font-semibold">{workout.name}</span>
                  <span className="text-sm text-muted">
                    {formaterDuree(dureeMs)} · {formaterVolume(volumeKg)}
                  </span>
                </span>
                {nbRecords > 0 ? (
                  <PRBadge variante="etiquette">
                    {nbRecords > 1 ? `${nbRecords} records` : '1 record'}
                  </PRBadge>
                ) : null}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
