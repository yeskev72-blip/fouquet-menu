import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Card, TitreSection } from '@/components/Card'
import { IconePlus, IconeReglages, IconeTrophee } from '@/components/Icones'
import { InstallBanner } from '@/components/InstallBanner'
import { NumberInput } from '@/components/NumberInput'
import { Sparkline } from '@/components/ProgressChart'
import { recordsPersonnels, statistiquesGlobales } from '@/db/requetes'
import { SEANCES_AVANT_RAPPEL_EXPORT } from '@/db/reglages'
import { useReglages } from '@/features/reglages/useReglages'
import { cn } from '@/lib/cn'
import { dateCompacte } from '@/lib/dates'
import { analyserNombre, formaterDuree, formaterNombre, formaterVolume, kgVersUnite, uniteVersKg } from '@/lib/nombres'
import { ajouterPoidsCorps, historiquePoidsCorps, resumerPoidsCorps } from './poidsCorps'

export function PageProfil() {
  const navigate = useNavigate()
  const reglages = useReglages()
  const unite = reglages.unite

  const [saisiePoids, setSaisiePoids] = useState<string | null>(null)

  const mesures = useLiveQuery(() => historiquePoidsCorps(), [], [])
  const records = useLiveQuery(() => recordsPersonnels(), [], [])
  const globales = useLiveQuery(() => statistiquesGlobales(), [])

  const resume = resumerPoidsCorps(mesures)
  const enUnite = (kg: number): string => formaterNombre(kgVersUnite(kg, unite), unite === 'lb' ? 1 : 2)

  const enregistrerPoids = async (): Promise<void> => {
    const valeur = analyserNombre(saisiePoids ?? '')
    if (valeur === null || valeur <= 0) return
    await ajouterPoidsCorps(uniteVersKg(valeur, unite))
    setSaisiePoids(null)
  }

  const rappelExport = reglages.seancesDepuisExport >= SEANCES_AVANT_RAPPEL_EXPORT

  return (
    <div className="flex flex-col gap-5 pb-6">
      <header className="flex items-center justify-between gap-3 px-5 pt-7">
        <h1 className="font-display text-d-4xl font-bold">Profil et progrès</h1>
        <button
          type="button"
          aria-label="Réglages"
          onClick={() => navigate('/profil/reglages')}
          className="flex h-12 w-12 flex-none items-center justify-center rounded-btn bg-surface text-text active:bg-field"
        >
          <IconeReglages taille={22} />
        </button>
      </header>

      {rappelExport ? (
        <div className="mx-5 rounded-card border border-accent-soft-border bg-accent-soft p-4">
          <p className="text-base text-text">
            {reglages.seancesDepuisExport} séances depuis ta dernière sauvegarde. Un export te met
            à l'abri d'un effacement par le navigateur.
          </p>
          <Button
            variante="secondaire"
            pleineLargeur
            className="mt-3"
            onClick={() => navigate('/profil/reglages')}
          >
            Exporter mes données
          </Button>
        </div>
      ) : null}

      <section aria-label="Poids de corps" className="px-5">
        <Card className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm text-muted">Poids de corps</span>
              <span className="whitespace-nowrap font-display text-d-5xl font-bold">
                {resume.dernier ? `${enUnite(resume.dernier.weightKg)} ${unite}` : '–'}
              </span>
              {resume.deltaKg !== null ? (
                <span
                  className={cn(
                    'text-base font-semibold',
                    resume.deltaKg <= 0 ? 'text-ok' : 'text-muted',
                  )}
                >
                  {resume.deltaKg > 0 ? '+' : '−'}
                  {enUnite(Math.abs(resume.deltaKg))}&nbsp;{unite} en {resume.joursDeFenetre} jours
                </span>
              ) : (
                <span className="text-base text-muted">
                  {resume.dernier ? 'Encore une mesure pour voir la tendance.' : 'Aucune mesure.'}
                </span>
              )}
            </div>
            {resume.mesures.length >= 2 ? (
              <Sparkline valeurs={resume.mesures.slice(-12).map((mesure) => mesure.weightKg)} />
            ) : null}
          </div>

          {saisiePoids === null ? (
            <Button variante="secondaire" pleineLargeur onClick={() => setSaisiePoids('')}>
              <IconePlus taille={18} />
              Ajouter une mesure
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-24">
                <NumberInput
                  valeur={saisiePoids}
                  onValeurChange={setSaisiePoids}
                  placeholder={unite}
                  aria-label={`Poids de corps, en ${unite}`}
                  autoFocus
                />
              </div>
              <Button variante="validation" onClick={() => void enregistrerPoids()}>
                Enregistrer
              </Button>
              <Button variante="discret" onClick={() => setSaisiePoids(null)}>
                Annuler
              </Button>
            </div>
          )}
        </Card>
      </section>

      <section className="px-5">
        <TitreSection className="mb-3">Records personnels</TitreSection>
        {records.length === 0 ? (
          <p className="text-base text-muted">
            Pas encore de record. Valide une première série pour en poser un.
          </p>
        ) : (
          <ul className="flex list-none flex-col gap-2">
            {records.slice(0, 10).map((record) => (
              <li
                key={record.exercice.id}
                className="flex min-h-16 items-center gap-3 rounded-card border border-border bg-surface px-4 py-2"
              >
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-btn bg-ok-soft text-ok">
                  <IconeTrophee taille={20} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-md font-semibold">{record.exercice.name}</span>
                  <span className="text-sm text-muted">
                    × {record.reps} · {dateCompacte(new Date(record.date))}
                  </span>
                </span>
                <span className="whitespace-nowrap font-display text-d-md font-bold">
                  {record.poidsKg > 0 ? `${enUnite(record.poidsKg)} ${unite}` : `${record.reps} reps`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="px-5">
        <TitreSection className="mb-3">Statistiques globales</TitreSection>
        <dl className="grid grid-cols-3 gap-2">
          <Card className="flex flex-col gap-0.5 rounded-ctl p-3">
            <dd className="font-display text-d-lg font-bold">{globales?.nbSeances ?? 0}</dd>
            <dt className="text-legend text-muted">Séances</dt>
          </Card>
          <Card className="flex flex-col gap-0.5 rounded-ctl p-3">
            <dd className="whitespace-nowrap font-display text-d-lg font-bold">
              {formaterVolume(kgVersUnite(globales?.volumeTotalKg ?? 0, unite))}
            </dd>
            <dt className="text-legend text-muted">Volume total</dt>
          </Card>
          <Card className="flex flex-col gap-0.5 rounded-ctl p-3">
            <dd className="whitespace-nowrap font-display text-d-lg font-bold">
              {formaterDuree(globales?.dureeMoyenneMs ?? 0)}
            </dd>
            <dt className="text-legend text-muted">Durée moyenne</dt>
          </Card>
        </dl>
      </section>

      <section className="px-5">
        <InstallBanner />
      </section>
    </div>
  )
}
