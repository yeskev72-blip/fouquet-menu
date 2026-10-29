import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { IconeChrono, IconePlus } from '@/components/Icones'
import { RestTimerBar } from '@/components/RestTimerBar'
import { chargerSeance, seanceEnCours } from '@/db/requetes'
import { ecrireReglage, lireReglages } from '@/db/reglages'
import { formaterChrono } from '@/lib/nombres'
import { useHorloge } from '@/lib/useHorloge'
import { preparerSon, signalerFinDeRepos } from '@/pwa/retour'
import { useWakeLock } from '@/pwa/wakeLock'
import { restantRepos, useSeanceStore } from '@/store/seance'
import { useReglages } from '@/features/reglages/useReglages'
import { CarteExercice } from './CarteExercice'
import { annulerSeance, renommerSeance, terminerSeance } from './actions'

export function PageSeance() {
  const navigate = useNavigate()
  const reglages = useReglages()
  const maintenant = useHorloge(1000)

  const repos = useSeanceStore((etat) => etat.repos)
  const demarrerRepos = useSeanceStore((etat) => etat.demarrerRepos)
  const ajusterRepos = useSeanceStore((etat) => etat.ajusterRepos)
  const arreterRepos = useSeanceStore((etat) => etat.arreterRepos)
  const exerciceOuvert = useSeanceStore((etat) => etat.exerciceOuvert)
  const ouvrirExercice = useSeanceStore((etat) => etat.ouvrirExercice)
  const seanceInitialisee = useSeanceStore((etat) => etat.seanceInitialisee)
  const marquerInitialisee = useSeanceStore((etat) => etat.marquerInitialisee)
  const reinitialiser = useSeanceStore((etat) => etat.reinitialiser)

  const [confirmationFin, setConfirmationFin] = useState(false)
  const [renommage, setRenommage] = useState<string | null>(null)

  const seance = useLiveQuery(async () => {
    const courante = await seanceEnCours()
    return courante ? chargerSeance(courante.id) : null
  }, [])

  // L'écran reste allumé tant qu'une séance est ouverte.
  useWakeLock(seance != null)

  const restant = restantRepos(repos, maintenant)
  const dejaSignale = useRef<number | null>(null)

  useEffect(() => {
    if (!repos || restant === null || restant > 0) return
    if (dejaSignale.current === repos.finAt) return
    dejaSignale.current = repos.finAt
    signalerFinDeRepos()
  }, [repos, restant])

  // Sans séance en cours, cet écran n'a rien à montrer.
  useEffect(() => {
    if (seance === null) navigate('/', { replace: true })
  }, [seance, navigate])

  const exercices = seance?.exercices ?? []
  const workoutId = seance?.workout.id ?? null

  // Premier exercice non terminé déplié à l'ouverture, une seule fois par
  // séance : ensuite c'est l'utilisateur qui décide ce qui est déplié, et
  // tout replier doit tenir.
  useEffect(() => {
    if (!workoutId || seanceInitialisee === workoutId) return
    const cible =
      exercices.find(({ series }) => series.some((serie) => !serie.isDone))?.lien.id ??
      exercices[0]?.lien.id ??
      null
    ouvrirExercice(cible)
    marquerInitialisee(workoutId)
  }, [workoutId, seanceInitialisee, exercices, ouvrirExercice, marquerInitialisee])

  // Exercice terminé : on enchaîne sur le suivant qui reste à faire.
  useEffect(() => {
    if (!exerciceOuvert) return
    const courant = exercices.find(({ lien }) => lien.id === exerciceOuvert)
    if (!courant || courant.series.length === 0) return
    if (courant.series.some((serie) => !serie.isDone)) return
    const suivant = exercices.find(
      ({ lien, series }) => lien.id !== exerciceOuvert && series.some((serie) => !serie.isDone),
    )
    if (suivant) ouvrirExercice(suivant.lien.id)
  }, [exerciceOuvert, exercices, ouvrirExercice])

  if (seance === undefined) {
    return <p className="p-5 text-base text-muted">Chargement…</p>
  }
  if (seance === null) return null

  const { workout } = seance
  const seriesFaites = exercices.reduce(
    (total, { series }) => total + series.filter((serie) => serie.isDone).length,
    0,
  )

  const terminer = async (): Promise<void> => {
    const { seancesDepuisExport } = await lireReglages()
    await terminerSeance(workout.id)
    await ecrireReglage('seancesDepuisExport', seancesDepuisExport + 1)
    reinitialiser()
    navigate('/', { replace: true })
  }

  const abandonner = async (): Promise<void> => {
    await annulerSeance(workout.id)
    reinitialiser()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex h-screen flex-col overscroll-none-y bg-bg text-text">
      <div className="flex-1 overflow-y-auto overscroll-none-y">
        <header className="flex items-center justify-between gap-3 px-5 pt-7">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="font-display text-d-xl font-bold">
              {renommage === null ? (
                <button
                  type="button"
                  onClick={() => setRenommage(workout.name)}
                  className="block w-full truncate text-left"
                >
                  {workout.name}
                  <span className="sr-only"> — renommer la séance</span>
                </button>
              ) : (
                <input
                  autoFocus
                  value={renommage}
                  aria-label="Nom de la séance"
                  onChange={(evenement) => setRenommage(evenement.target.value)}
                  onBlur={() => {
                    void renommerSeance(workout.id, renommage)
                    setRenommage(null)
                  }}
                  onKeyDown={(evenement) => {
                    if (evenement.key === 'Enter') evenement.currentTarget.blur()
                  }}
                  className="w-full rounded-field bg-field px-2 py-1 font-[inherit] text-[length:inherit] font-bold"
                />
              )}
            </h1>
            <p className="flex items-center gap-2 text-base text-muted">
              <IconeChrono taille={16} />
              <span aria-hidden="true">{formaterChrono(maintenant - workout.startedAt)}</span>
              <span className="sr-only">Séance en cours</span>· {seriesFaites} série
              {seriesFaites > 1 ? 's' : ''} faite{seriesFaites > 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variante="validation"
            onClick={() => {
              if (seriesFaites === 0) setConfirmationFin(true)
              else void terminer()
            }}
          >
            Terminer
          </Button>
        </header>

        {confirmationFin ? (
          <div
            role="alertdialog"
            aria-label="Terminer une séance vide"
            className="animate-fade-up mx-5 mt-4 rounded-card border border-border bg-surface p-4"
          >
            <p className="text-base text-text">
              Aucune série validée. Terminer quand même enregistrera une séance vide.
            </p>
            <div className="mt-3 flex gap-2">
              <Button variante="secondaire" pleineLargeur onClick={() => setConfirmationFin(false)}>
                Continuer la séance
              </Button>
              <Button variante="principal" pleineLargeur onClick={() => void abandonner()}>
                Abandonner
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-5 px-5 pb-6 pt-5">
          {exercices.length === 0 ? (
            <p className="text-base text-muted">
              Séance vide. Ajoute un premier exercice pour commencer.
            </p>
          ) : null}

          {exercices.map(({ lien, exercice, series }) => (
            <CarteExercice
              key={lien.id}
              workoutId={workout.id}
              workoutExerciseId={lien.id}
              exercice={exercice}
              series={series}
              unite={reglages.unite}
              ouvert={exerciceOuvert === lien.id}
              onBasculer={() => ouvrirExercice(exerciceOuvert === lien.id ? null : lien.id)}
              onSerieValidee={() => {
                // Le son doit être préparé pendant un geste de l'utilisateur,
                // sinon iOS refuse de jouer le bip à la fin du repos.
                preparerSon()
                demarrerRepos(reglages.reposParDefaut)
              }}
            />
          ))}

          <Button variante="pointille" pleineLargeur onClick={() => navigate('/seance/exercices')}>
            <IconePlus taille={18} />
            Ajouter un exercice
          </Button>
        </div>
      </div>

      {repos && restant !== null ? (
        <RestTimerBar
          restantMs={restant}
          totalMs={repos.dureeMs}
          onAjuster={(secondes) => ajusterRepos(secondes)}
          onPasser={arreterRepos}
        />
      ) : null}
    </div>
  )
}
