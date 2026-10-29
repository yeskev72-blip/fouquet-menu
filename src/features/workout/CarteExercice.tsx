import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { IconeChevronBas, IconeChevronHaut, IconePlus, IconeCorbeille } from '@/components/Icones'
import { SetRow, SetRowHeader } from '@/components/SetRow'
import { valeursPrecedentes } from '@/db/requetes'
import type { Exercise, WorkoutSet } from '@/db/types'
import { analyserNombre, formaterNombre, kgVersUnite, uniteVersKg } from '@/lib/nombres'
import { useSeanceStore } from '@/store/seance'
import type { Unite } from '@/db/types'
import { ajouterSerie, annulerValidation, enregistrerChiffres, retirerExercice, supprimerSerie, validerSerie } from './actions'

interface CarteExerciceProps {
  workoutId: string
  workoutExerciseId: string
  exercice: Exercise
  series: WorkoutSet[]
  unite: Unite
  ouvert: boolean
  onBasculer: () => void
  onSerieValidee: () => void
}

/** Chiffres à afficher : le brouillon en cours prime sur ce qui est en base. */
function valeurAffichee(enregistre: number, brouillon: string | undefined, unite: Unite): string {
  if (brouillon !== undefined) return brouillon
  if (enregistre <= 0) return ''
  return formaterNombre(kgVersUnite(enregistre, unite), unite === 'lb' ? 1 : 2)
}

export function CarteExercice({
  workoutId,
  workoutExerciseId,
  exercice,
  series,
  unite,
  ouvert,
  onBasculer,
  onSerieValidee,
}: CarteExerciceProps) {
  const brouillons = useSeanceStore((etat) => etat.brouillons)
  const ecrireBrouillon = useSeanceStore((etat) => etat.ecrireBrouillon)
  const oublierBrouillon = useSeanceStore((etat) => etat.oublierBrouillon)

  const precedentes = useLiveQuery(
    () => valeursPrecedentes(exercice.id, workoutId),
    [exercice.id, workoutId],
    [],
  )

  const faites = series.filter((serie) => serie.isDone).length

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={onBasculer}
        aria-expanded={false}
        className="flex min-h-16 w-full items-center gap-3 rounded-card border border-border bg-surface px-4 py-3 text-left active:bg-field"
      >
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="text-lg font-semibold text-text">{exercice.name}</span>
          <span className="text-sm text-muted">
            {series.length} série{series.length > 1 ? 's' : ''} · {faites}/{series.length} faites
          </span>
        </span>
        <IconeChevronBas taille={20} className="text-muted" />
      </button>
    )
  }

  return (
    <section aria-label={exercice.name} className="rounded-card">
      <div className="flex min-h-11 items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">
          <Link to={`/exercice/${exercice.id}`} className="text-accent-text underline-offset-4">
            {exercice.name}
          </Link>
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">{exercice.equipment}</span>
          <button
            type="button"
            onClick={onBasculer}
            aria-expanded
            aria-label={`Replier ${exercice.name}`}
            className="flex h-12 w-12 items-center justify-center rounded-btn text-muted active:bg-field"
          >
            <IconeChevronHaut taille={20} />
          </button>
        </div>
      </div>

      <SetRowHeader />

      <div className="flex flex-col gap-1">
        {series.map((serie, index) => {
          const brouillon = brouillons[serie.id]
          const poids = valeurAffichee(serie.weightKg, brouillon?.poids, unite)
          const reps = valeurAffichee(serie.reps, brouillon?.reps, 'kg')
          const reference = precedentes[index]

          return (
            <SetRow
              key={serie.id}
              numero={index + 1}
              precedent={
                reference
                  ? `${formaterNombre(kgVersUnite(reference.weightKg, unite))} × ${reference.reps}`
                  : null
              }
              poids={poids}
              reps={reps}
              validee={serie.isDone}
              record={serie.isPr}
              onPoidsChange={(valeur) => {
                ecrireBrouillon(serie.id, { poids: valeur, reps })
                const nombre = analyserNombre(valeur)
                if (nombre !== null) {
                  void enregistrerChiffres(serie.id, { weightKg: uniteVersKg(nombre, unite) })
                }
              }}
              onRepsChange={(valeur) => {
                ecrireBrouillon(serie.id, { poids, reps: valeur })
                const nombre = analyserNombre(valeur)
                if (nombre !== null) {
                  void enregistrerChiffres(serie.id, { reps: Math.round(nombre) })
                }
              }}
              onToggle={() => {
                if (serie.isDone) {
                  void annulerValidation(serie.id)
                  return
                }
                const poidsSaisi = analyserNombre(poids) ?? 0
                const repsSaisies = analyserNombre(reps) ?? 0
                if (repsSaisies <= 0) return
                void validerSerie(serie.id, {
                  weightKg: uniteVersKg(poidsSaisi, unite),
                  reps: Math.round(repsSaisies),
                }).then(() => {
                  oublierBrouillon(serie.id)
                  onSerieValidee()
                })
              }}
            />
          )
        })}
      </div>

      <div className="mt-2 flex gap-2">
        <Button
          variante="secondaire"
          pleineLargeur
          onClick={() => void ajouterSerie(workoutExerciseId)}
        >
          <IconePlus taille={18} />
          Ajouter une série
        </Button>
        {series.length > 0 ? (
          <Button
            variante="secondaire"
            aria-label={`Retirer la dernière série de ${exercice.name}`}
            onClick={() => {
              const derniere = series[series.length - 1]
              if (derniere) void supprimerSerie(derniere.id)
            }}
          >
            <IconeCorbeille taille={18} />
          </Button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => void retirerExercice(workoutExerciseId)}
        className="mt-2 min-h-touch w-full rounded-btn text-sm font-semibold text-muted active:bg-field"
      >
        Retirer {exercice.name} de la séance
      </button>
    </section>
  )
}
