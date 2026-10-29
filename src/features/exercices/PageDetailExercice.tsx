import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/Card'
import { IconeChevronGauche } from '@/components/Icones'
import { PRBadge } from '@/components/PRBadge'
import { ProgressChart, type PointCourbe } from '@/components/ProgressChart'
import { TitreSection } from '@/components/Card'
import { base } from '@/db'
import { historiqueExercice, seanceEnCours } from '@/db/requetes'
import { useReglages } from '@/features/reglages/useReglages'
import { cn } from '@/lib/cn'
import { dateCompacte, dateCourte, moisCourt } from '@/lib/dates'
import { formaterNombre, formaterVolume, kgVersUnite } from '@/lib/nombres'

type Mesure = 'poids' | 'volume' | '1rm'

const MESURES: Array<{ cle: Mesure; libelle: string }> = [
  { cle: 'poids', libelle: 'Poids max' },
  { cle: 'volume', libelle: 'Volume' },
  { cle: '1rm', libelle: '1RM estimé' },
]

export function PageDetailExercice() {
  const { exerciceId } = useParams<{ exerciceId: string }>()
  const navigate = useNavigate()
  const reglages = useReglages()
  const [mesure, setMesure] = useState<Mesure>('poids')

  const exercice = useLiveQuery(
    () => (exerciceId ? base.exercises.get(exerciceId) : undefined),
    [exerciceId],
  )
  const historique = useLiveQuery(
    () => (exerciceId ? historiqueExercice(exerciceId) : []),
    [exerciceId],
    [],
  )
  const courante = useLiveQuery(() => seanceEnCours(), [])

  if (exercice === undefined) return <p className="p-5 text-base text-muted">Chargement…</p>
  if (exercice === null) {
    return (
      <div className="p-5">
        <p className="text-base text-muted">Cet exercice n'existe plus.</p>
      </div>
    )
  }

  const unite = reglages.unite
  const enUnite = (kg: number): string => formaterNombre(kgVersUnite(kg, unite), unite === 'lb' ? 1 : 2)

  // Meilleure série jamais faite, départagée sur la charge puis les reps.
  const toutesSeries = historique.flatMap(({ series, workout }) =>
    series.map((serie) => ({ serie, workout })),
  )
  const record = toutesSeries.reduce<(typeof toutesSeries)[number] | null>(
    (meilleur, candidat) => {
      if (!meilleur) return candidat
      const score = (e: (typeof toutesSeries)[number]): number => e.serie.weightKg * 1000 + e.serie.reps
      return score(candidat) > score(meilleur) ? candidat : meilleur
    },
    null,
  )
  const meilleur1RM = historique.reduce(
    (max, seance) => (seance.meilleur1RMKg > max.valeur ? { valeur: seance.meilleur1RMKg, seance } : max),
    { valeur: 0, seance: historique[0] },
  )
  const volumeMax = historique.reduce(
    (max, seance) => (seance.volumeKg > max.valeur ? { valeur: seance.volumeKg, seance } : max),
    { valeur: 0, seance: historique[0] },
  )

  const points: PointCourbe[] = historique.map((seance) => {
    const date = new Date(seance.workout.startedAt)
    const valeur =
      mesure === 'poids'
        ? kgVersUnite(seance.poidsMaxKg, unite)
        : mesure === 'volume'
          ? kgVersUnite(seance.volumeKg, unite)
          : kgVersUnite(seance.meilleur1RMKg, unite)
    return {
      etiquette: `${date.getDate()} ${moisCourt(date)}`,
      valeur: Math.round(valeur * 10) / 10,
      record: seance.aRecord,
    }
  })

  const titreCourbe =
    mesure === 'poids'
      ? `Poids max par séance, en ${unite}`
      : mesure === 'volume'
        ? `Volume par séance, en ${unite}`
        : `1RM estimé par séance, en ${unite}`

  return (
    <div className="flex flex-col pb-6">
      <header className="px-5 pt-7">
        <button
          type="button"
          onClick={() => navigate(courante ? '/seance' : '/')}
          className="inline-flex min-h-11 items-center gap-1 text-md font-semibold text-muted"
        >
          <IconeChevronGauche taille={20} />
          {courante ? 'Séance' : 'Accueil'}
        </button>
        <h1 className="font-display text-d-2xl font-bold">{exercice.name}</h1>
        <p className="mt-0.5 text-base text-muted">
          {exercice.muscleGroup} · {exercice.equipment}
        </p>
      </header>

      {historique.length === 0 ? (
        <p className="px-5 pt-6 text-base text-muted">
          Pas encore de série validée sur cet exercice. Les chiffres apparaîtront ici dès ta
          première séance.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 px-5 pt-4">
            <Card className="flex flex-col gap-0.5 rounded-ctl p-3">
              <span className="text-legend text-muted">Record</span>
              <span className="whitespace-nowrap font-display text-d-sm font-bold text-ok">
                {record ? `${enUnite(record.serie.weightKg)}\u00a0${unite}` : '–'}
              </span>
              <span className="truncate text-legend text-muted">
                {record
                  ? `× ${record.serie.reps} · ${dateCompacte(new Date(record.workout.startedAt))}`
                  : ''}
              </span>
            </Card>
            <Card className="flex flex-col gap-0.5 rounded-ctl p-3">
              <span className="text-legend text-muted">1RM estimé</span>
              <span className="whitespace-nowrap font-display text-d-sm font-bold">
                {`${enUnite(meilleur1RM.valeur)}\u00a0${unite}`}
              </span>
              <span className="text-legend text-muted">
                {meilleur1RM.seance
                  ? dateCompacte(new Date(meilleur1RM.seance.workout.startedAt))
                  : ''}
              </span>
            </Card>
            <Card className="flex flex-col gap-0.5 rounded-ctl p-3">
              <span className="text-legend text-muted">Volume max</span>
              <span className="whitespace-nowrap font-display text-d-sm font-bold">
                {formaterVolume(kgVersUnite(volumeMax.valeur, unite))}
              </span>
              <span className="text-legend text-muted">
                {volumeMax.seance ? dateCompacte(new Date(volumeMax.seance.workout.startedAt)) : ''}
              </span>
            </Card>
          </div>

          <div className="px-5 pt-4">
            <div
              role="group"
              aria-label="Type de courbe"
              className="flex gap-1 rounded-ctl border border-border bg-surface p-1"
            >
              {MESURES.map(({ cle, libelle }) => (
                <button
                  key={cle}
                  type="button"
                  aria-pressed={mesure === cle}
                  onClick={() => setMesure(cle)}
                  className={cn(
                    'h-11 flex-1 rounded-field text-base',
                    mesure === cle
                      ? 'bg-accent font-bold text-on-accent'
                      : 'font-semibold text-text active:bg-field',
                  )}
                >
                  {libelle}
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 pt-3">
            <ProgressChart titre={titreCourbe} unite={unite} points={points} />
          </div>

          <section className="px-5 pt-5">
            <TitreSection className="mb-3">Historique</TitreSection>
            <ul className="flex list-none flex-col gap-2">
              {[...historique].reverse().map((seance) => (
                <li
                  key={seance.workout.id}
                  className="flex min-h-15 items-center gap-3 rounded-ctl border border-border bg-surface px-4 py-3"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-md font-semibold">
                      {dateCourte(new Date(seance.workout.startedAt))}
                      {seance.workout.endedAt === null ? ' · en cours' : ''}
                    </span>
                    <span className="text-base text-muted">
                      {seance.series
                        .map((serie) => `${enUnite(serie.weightKg)} × ${serie.reps}`)
                        .join(' · ')}
                    </span>
                  </span>
                  {seance.aRecord ? <PRBadge variante="etiquette">Record</PRBadge> : null}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
