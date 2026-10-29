import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Brouillon {
  poids: string
  reps: string
}

interface EtatRepos {
  /** Horodatage de fin. Le temps restant s'en déduit, il ne se compte pas. */
  finAt: number
  dureeMs: number
}

interface EtatSeance {
  /** Chiffres tapés mais pas encore validés, par identifiant de série. */
  brouillons: Record<string, Brouillon>
  repos: EtatRepos | null
  /** Exercice déplié dans l'écran de séance. null = tout est replié. */
  exerciceOuvert: string | null
  /** Séance dont le dépliage initial a déjà été appliqué. */
  seanceInitialisee: string | null

  lireBrouillon: (setId: string) => Brouillon | undefined
  ecrireBrouillon: (setId: string, brouillon: Partial<Brouillon>) => void
  oublierBrouillon: (setId: string) => void

  demarrerRepos: (dureeSecondes: number) => void
  ajusterRepos: (secondes: number) => void
  arreterRepos: () => void

  ouvrirExercice: (workoutExerciseId: string | null) => void
  marquerInitialisee: (workoutId: string) => void
  /** Remet l'état à zéro à la fin ou à l'abandon d'une séance. */
  reinitialiser: () => void
}

/**
 * État éphémère de la séance en cours. Ce qui est validé part aussitôt dans
 * IndexedDB ; ici ne restent que les chiffres en train d'être tapés et le
 * chrono de repos, persistés pour survivre à un rechargement ou à la
 * fermeture de l'onglet au milieu d'une série.
 */
export const useSeanceStore = create<EtatSeance>()(
  persist(
    (set, get) => ({
      brouillons: {},
      repos: null,
      exerciceOuvert: null,
      seanceInitialisee: null,

      lireBrouillon: (setId) => get().brouillons[setId],

      ecrireBrouillon: (setId, brouillon) =>
        set((etat) => {
          const courant = etat.brouillons[setId] ?? { poids: '', reps: '' }
          return { brouillons: { ...etat.brouillons, [setId]: { ...courant, ...brouillon } } }
        }),

      oublierBrouillon: (setId) =>
        set((etat) => {
          const { [setId]: _retire, ...reste } = etat.brouillons
          return { brouillons: reste }
        }),

      demarrerRepos: (dureeSecondes) =>
        set({ repos: { finAt: Date.now() + dureeSecondes * 1000, dureeMs: dureeSecondes * 1000 } }),

      ajusterRepos: (secondes) =>
        set((etat) => {
          if (!etat.repos) return etat
          const finAt = etat.repos.finAt + secondes * 1000
          // Retirer du temps ne doit pas remonter une barre de progression
          // au-delà de son total : la durée suit l'ajustement.
          const dureeMs = Math.max(1000, etat.repos.dureeMs + secondes * 1000)
          return { repos: { finAt, dureeMs } }
        }),

      arreterRepos: () => set({ repos: null }),

      ouvrirExercice: (workoutExerciseId) => set({ exerciceOuvert: workoutExerciseId }),

      marquerInitialisee: (workoutId) => set({ seanceInitialisee: workoutId }),

      reinitialiser: () =>
        set({ brouillons: {}, repos: null, exerciceOuvert: null, seanceInitialisee: null }),
    }),
    {
      name: 'fonte.seance',
      // Le stockage peut être bloqué (navigation privée) : l'appli doit
      // continuer à marcher, seule la reprise après rechargement est perdue.
      storage: {
        getItem: (nom) => {
          try {
            const brut = localStorage.getItem(nom)
            return brut ? JSON.parse(brut) : null
          } catch {
            return null
          }
        },
        setItem: (nom, valeur) => {
          try {
            localStorage.setItem(nom, JSON.stringify(valeur))
          } catch {
            // Quota plein ou stockage bloqué : sans gravité pour la séance.
          }
        },
        removeItem: (nom) => {
          try {
            localStorage.removeItem(nom)
          } catch {
            // Idem.
          }
        },
      },
    },
  ),
)

/** Millisecondes restantes de repos, ou null si aucun repos n'est en cours. */
export function restantRepos(repos: EtatRepos | null, maintenant = Date.now()): number | null {
  if (!repos) return null
  return repos.finAt - maintenant
}
