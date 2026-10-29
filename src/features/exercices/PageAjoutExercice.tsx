import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { IconeChevronGauche, IconeCoche, IconeHaltere, IconePlus, IconeRecherche } from '@/components/Icones'
import { base } from '@/db'
import { seanceEnCours } from '@/db/requetes'
import { GROUPES_MUSCULAIRES, MATERIELS, nouvelId, type Exercise, type GroupeMusculaire, type Materiel } from '@/db/types'
import { ajouterExercices } from '@/features/workout/actions'
import { cn } from '@/lib/cn'

/** Compare sans tenir compte des accents ni de la casse. */
function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export function PageAjoutExercice() {
  const navigate = useNavigate()
  const [recherche, setRecherche] = useState('')
  const [muscle, setMuscle] = useState<GroupeMusculaire | null>(null)
  const [materiel, setMateriel] = useState<Materiel | null>(null)
  const [choisis, setChoisis] = useState<string[]>([])

  const exercices = useLiveQuery(() => base.exercises.toArray(), [], [])
  const seance = useLiveQuery(() => seanceEnCours(), [])

  // Un exercice déjà présent dans la séance ne doit pas pouvoir y entrer
  // deux fois : il s'affiche, barré du choix, pour rester repérable.
  const dejaLa = useLiveQuery(
    async () => {
      if (!seance) return new Set<string>()
      const liens = await base.workoutExercises.where('workoutId').equals(seance.id).toArray()
      return new Set(liens.map((lien) => lien.exerciseId))
    },
    [seance?.id],
    new Set<string>(),
  )

  const filtres = useMemo(() => {
    const terme = normaliser(recherche.trim())
    return exercices
      .filter((exercice) => {
        if (muscle && exercice.muscleGroup !== muscle) return false
        if (materiel && exercice.equipment !== materiel) return false
        if (terme && !normaliser(exercice.name).includes(terme)) return false
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  }, [exercices, recherche, muscle, materiel])

  const basculer = (id: string): void =>
    setChoisis((courant) =>
      courant.includes(id) ? courant.filter((autre) => autre !== id) : [...courant, id],
    )

  const creerPuisChoisir = async (): Promise<void> => {
    const nom = recherche.trim()
    if (!nom) return
    const exercice: Exercise = {
      id: nouvelId(),
      name: nom,
      muscleGroup: muscle ?? 'Pectoraux',
      equipment: materiel ?? 'Poids du corps',
      isCustom: true,
      createdAt: Date.now(),
    }
    await base.exercises.add(exercice)
    setChoisis((courant) => [...courant, exercice.id])
    setRecherche('')
  }

  const valider = async (): Promise<void> => {
    if (choisis.length === 0 || !seance) return
    await ajouterExercices(seance.id, choisis)
    navigate('/seance', { replace: true })
  }

  return (
    <div className="flex h-screen flex-col bg-bg text-text">
      <header className="flex-none px-5 pt-7">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex min-h-11 items-center gap-1 text-md font-semibold text-muted"
        >
          <IconeChevronGauche taille={20} />
          Annuler
        </button>
        <h1 className="font-display text-d-xl font-bold">Ajouter un exercice</h1>
      </header>

      <div className="flex-none px-5 pt-3">
        <label className="flex min-h-13 items-center gap-2 rounded-ctl border border-border bg-surface px-4 text-muted">
          <IconeRecherche taille={20} />
          <input
            type="search"
            value={recherche}
            onChange={(evenement) => setRecherche(evenement.target.value)}
            placeholder="Rechercher un exercice"
            aria-label="Rechercher un exercice"
            className="h-12 min-w-0 flex-1 border-0 bg-transparent p-0 text-lg text-text outline-none placeholder:text-muted"
          />
        </label>
      </div>

      <div className="flex-none pt-3">
        <p className="mb-1 px-5 text-cap font-semibold uppercase tracking-wider text-muted">Muscle</p>
        <div className="flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
          <Chip actif={muscle === null} onClick={() => setMuscle(null)}>
            Tous
          </Chip>
          {GROUPES_MUSCULAIRES.map((groupe) => (
            <Chip key={groupe} actif={muscle === groupe} onClick={() => setMuscle(groupe)}>
              {groupe}
            </Chip>
          ))}
        </div>

        <p className="mb-1 mt-3 px-5 text-cap font-semibold uppercase tracking-wider text-muted">
          Matériel
        </p>
        <div className="flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
          <Chip actif={materiel === null} onClick={() => setMateriel(null)}>
            Tout
          </Chip>
          {MATERIELS.map((type) => (
            <Chip key={type} actif={materiel === type} onClick={() => setMateriel(type)}>
              {type}
            </Chip>
          ))}
        </div>
      </div>

      <ul className="flex-1 list-none overflow-y-auto px-5 py-3">
        {filtres.length === 0 ? (
          <li className="py-6 text-center">
            <p className="text-base text-muted">Aucun exercice ne correspond.</p>
            {recherche.trim() ? (
              <Button variante="pointille" className="mt-3" onClick={() => void creerPuisChoisir()}>
                <IconePlus taille={18} />
                Créer « {recherche.trim()} »
              </Button>
            ) : null}
          </li>
        ) : null}

        {filtres.map((exercice) => {
          const actif = choisis.includes(exercice.id)
          const present = dejaLa.has(exercice.id)
          return (
            <li key={exercice.id}>
              <button
                type="button"
                aria-pressed={actif}
                disabled={present}
                onClick={() => basculer(exercice.id)}
                className={cn(
                  'flex min-h-16 w-full items-center gap-3 rounded-ctl border px-3 text-left',
                  actif ? 'border-accent-soft-border bg-accent-soft' : 'border-transparent active:bg-surface',
                  present && 'opacity-50',
                )}
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-btn bg-field text-accent-text">
                  <IconeHaltere taille={22} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-lg font-semibold">{exercice.name}</span>
                  <span className="text-sm text-muted">
                    {present ? 'Déjà dans la séance' : `${exercice.muscleGroup} · ${exercice.equipment}`}
                  </span>
                </span>
                {present ? null : (
                  <span
                    className={cn(
                      'flex h-7 w-7 flex-none items-center justify-center rounded-pill',
                      actif ? 'bg-accent text-on-accent' : 'border-2 border-border',
                    )}
                  >
                    {actif ? <IconeCoche taille={16} strokeWidth={3.2} /> : null}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <div className="flex-none border-t border-border bg-bg px-5 pb-safe pt-4">
        <Button
          variante="principal"
          taille="grande"
          pleineLargeur
          disabled={choisis.length === 0}
          onClick={() => void valider()}
          className="mb-4"
        >
          {choisis.length <= 1
            ? `Ajouter ${choisis.length} exercice`
            : `Ajouter ${choisis.length} exercices`}
        </Button>
      </div>
    </div>
  )
}
