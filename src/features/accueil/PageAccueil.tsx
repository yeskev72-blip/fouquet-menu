import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Card, TitreSection } from '@/components/Card'
import { IconeChevronDroite, IconeCoche, IconeHaltere, IconePlus } from '@/components/Icones'
import { base } from '@/db'
import { seanceEnCours, statistiquesSemaine } from '@/db/requetes'
import { cleDeJour, dateLongue, dateRelative, debutDeSemaine, INITIALES_SEMAINE, memeJour } from '@/lib/dates'
import { formaterDuree, formaterVolume } from '@/lib/nombres'
import { demarrerDepuisModele, demarrerSeance } from '@/features/workout/actions'
import { cn } from '@/lib/cn'

/** Noms courts, pour tenir sur une ligne sous le nom du modèle. */
const MUSCLES_COURTS: Record<string, string> = {
  Pectoraux: 'Pecs',
  Abdominaux: 'Abdos',
}

/** « Pecs, Épaules, Bras · 6 exercices » */
function resumeModele(groupes: string[], nbExercices: number): string {
  const muscles = [...new Set(groupes)]
    .map((groupe) => MUSCLES_COURTS[groupe] ?? groupe)
    .slice(0, 3)
    .join(', ')
  const compte = `${nbExercices} exercice${nbExercices > 1 ? 's' : ''}`
  return muscles ? `${muscles} · ${compte}` : compte
}

export function PageAccueil() {
  const navigate = useNavigate()
  const aujourdhui = new Date()

  const courante = useLiveQuery(() => seanceEnCours(), [])
  const semaine = useLiveQuery(() => statistiquesSemaine(), [])
  const modeles = useLiveQuery(async () => {
    const liste = await base.templates.toArray()
    const exercices = await base.exercises.toArray()
    const parId = new Map(exercices.map((exercice) => [exercice.id, exercice]))
    return liste
      .map((modele) => ({
        modele,
        groupes: modele.exerciseIds.flatMap((id) => {
          const exercice = parId.get(id)
          return exercice ? [exercice.muscleGroup] : []
        }),
      }))
      .sort((a, b) => (b.modele.lastUsedAt ?? 0) - (a.modele.lastUsedAt ?? 0))
  }, [], [])

  const jours = Array.from({ length: 7 }, (_, index) => {
    const jour = debutDeSemaine(aujourdhui)
    jour.setDate(jour.getDate() + index)
    return jour
  })

  const lancerModele = (templateId: string): void => {
    void demarrerDepuisModele(templateId).then((id) => {
      if (id) navigate('/seance')
    })
  }

  return (
    <div className="flex flex-col pb-6">
      <header className="flex flex-col gap-1 px-5 pt-8">
        <p className="text-sm uppercase tracking-wide text-muted">{dateLongue(aujourdhui)}</p>
        <h1 className="font-display text-d-4xl font-bold">
          {courante ? 'Séance en cours' : 'Prêt à soulever ?'}
        </h1>
      </header>

      <div className="px-5 pt-5">
        {courante ? (
          <Button
            variante="principal"
            taille="grande"
            pleineLargeur
            onClick={() => navigate('/seance')}
          >
            Reprendre « {courante.name} »
          </Button>
        ) : (
          <Button
            variante="principal"
            taille="grande"
            pleineLargeur
            onClick={() => void demarrerSeance({}).then(() => navigate('/seance'))}
          >
            <IconePlus taille={22} />
            Démarrer une séance
          </Button>
        )}
        <p className="mt-2 text-center text-sm text-muted">
          {courante
            ? 'Reprends là où tu en étais.'
            : 'Séance vide, ou lance un modèle ci-dessous'}
        </p>
      </div>

      {modeles.length > 0 ? (
        <section className="px-5 pt-7">
          <TitreSection className="mb-3">Mes modèles</TitreSection>
          <div className="flex flex-col gap-2">
            {modeles.map(({ modele, groupes }) => (
              <button
                key={modele.id}
                type="button"
                disabled={courante != null}
                onClick={() => lancerModele(modele.id)}
                className="flex min-h-18 items-center gap-3 rounded-card border border-border bg-surface px-4 py-3 text-left active:bg-field disabled:opacity-50"
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-btn bg-field text-accent-text">
                  <IconeHaltere taille={22} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-xl font-semibold">{modele.name}</span>
                  <span className="truncate text-sm text-muted">
                    {resumeModele(groupes, modele.exerciseIds.length)}
                  </span>
                </span>
                {modele.lastUsedAt ? (
                  <span className="text-legend text-muted">
                    {dateRelative(new Date(modele.lastUsedAt))}
                  </span>
                ) : null}
                <IconeChevronDroite taille={18} className="flex-none text-muted" />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="px-5 pt-6">
        <div className="mb-3 flex items-baseline justify-between">
          <TitreSection>Cette semaine</TitreSection>
          <span className="text-sm text-muted">
            {semaine?.nbSeances ?? 0} séance{(semaine?.nbSeances ?? 0) > 1 ? 's' : ''}
          </span>
        </div>

        <Card className="flex flex-col gap-4">
          <ul className="flex list-none justify-between">
            {jours.map((jour, index) => {
              const entraine = semaine?.joursEntraines.has(cleDeJour(jour)) ?? false
              const estAujourdhui = memeJour(jour, aujourdhui)
              return (
                <li key={cleDeJour(jour)} className="flex flex-col items-center gap-2">
                  <span
                    className={cn(
                      'text-legend',
                      estAujourdhui ? 'font-bold text-text' : 'text-muted',
                    )}
                  >
                    {INITIALES_SEMAINE[index]}
                  </span>
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-pill',
                      entraine && 'bg-accent text-on-accent',
                      !entraine && estAujourdhui && 'border-2 border-accent',
                      !entraine && !estAujourdhui && 'bg-field',
                    )}
                  >
                    {entraine ? <IconeCoche taille={16} /> : null}
                    <span className="sr-only">
                      {entraine ? 'Entraînement ce jour' : 'Pas de séance'}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>

          <dl className="flex justify-between border-t border-border pt-4">
            <div className="flex flex-col gap-0.5">
              <dt className="text-legend text-muted">Volume</dt>
              <dd className="font-display text-d-sm font-bold">
                {formaterVolume(semaine?.volumeKg ?? 0)}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-legend text-muted">Durée</dt>
              <dd className="font-display text-d-sm font-bold">
                {formaterDuree(semaine?.dureeMs ?? 0)}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-legend text-muted">Records</dt>
              <dd className="font-display text-d-sm font-bold text-ok">{semaine?.nbRecords ?? 0}</dd>
            </div>
          </dl>
        </Card>
      </section>
    </div>
  )
}
