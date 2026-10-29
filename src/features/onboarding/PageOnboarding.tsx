import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { IconeCoche } from '@/components/Icones'
import { ecrireReglage } from '@/db/reglages'
import { cn } from '@/lib/cn'

/** Aperçu de la validation d'une série : deux taps, c'est tout. */
function ApercuSeries() {
  return (
    <div className="flex w-full flex-col gap-3 rounded-xcard border border-border bg-surface p-5">
      <p className="text-lg font-bold text-accent-text">Développé couché</p>
      <div className="grid grid-cols-[24px_1fr_1fr_52px] items-center gap-3 text-cap font-semibold uppercase tracking-wider text-muted">
        <span className="text-center">#</span>
        <span className="text-center">Kg</span>
        <span className="text-center">Reps</span>
        <span />
      </div>
      <div className="grid grid-cols-[24px_1fr_1fr_52px] items-center gap-3 rounded-ctl bg-ok-soft p-2">
        <span className="text-center font-bold text-muted">1</span>
        <span className="text-center font-display text-d-lg font-bold">80</span>
        <span className="text-center font-display text-d-lg font-bold">8</span>
        <span className="flex h-13 w-13 items-center justify-center rounded-ctl bg-ok text-on-ok">
          <IconeCoche taille={26} />
        </span>
      </div>
      <div className="grid grid-cols-[24px_1fr_1fr_52px] items-center gap-3 rounded-ctl border border-accent p-2">
        <span className="text-center font-bold text-accent-text">2</span>
        <span className="text-center font-display text-d-lg font-bold">82,5</span>
        <span className="text-center font-display text-d-lg font-bold">8</span>
        <span className="relative flex h-13 w-13 items-center justify-center rounded-ctl border border-border bg-field text-muted">
          <IconeCoche taille={26} />
          <span className="absolute -inset-2 rounded-section border-2 border-dashed border-accent" />
        </span>
      </div>
    </div>
  )
}

/** Aperçu d'un record battu. */
function ApercuRecord() {
  return (
    <div className="flex w-full flex-col gap-3 rounded-xcard border border-border bg-surface p-5">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-muted">Développé couché</span>
          <span className="whitespace-nowrap font-display text-d-5xl font-bold text-ok">
            82,5&nbsp;kg
          </span>
        </div>
        <span className="rounded-btn bg-ok px-3 py-1 text-sm font-bold text-on-ok">
          Nouveau record
        </span>
      </div>
      <svg viewBox="0 0 280 90" width="100%" role="img" aria-label="Courbe en progression" className="text-chart-line">
        <polyline
          points="8,78 52,64 96,64 140,48 184,34 228,22 272,10"
          fill="none"
          className="stroke-chart-line"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="272" cy="10" r="6" className="fill-ok" />
      </svg>
    </div>
  )
}

/** Aperçu du mode hors ligne. */
function ApercuHorsLigne() {
  return (
    <div className="flex w-full flex-col items-center gap-5 rounded-xcard border border-border bg-surface px-5 py-7">
      <span className="flex h-24 w-24 items-center justify-center rounded-pill border border-accent-soft-border bg-accent-soft text-accent-text">
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 8.8a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" />
          <circle cx="12" cy="19.5" r="1" />
          <path d="M3 3l18 18" />
        </svg>
      </span>
      <ul className="flex w-full list-none flex-col gap-3">
        {['Séances enregistrées sur ton téléphone', 'Aucune connexion nécessaire'].map((texte) => (
          <li key={texte} className="flex items-center gap-3 rounded-ctl bg-field px-4 py-3">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-pill bg-ok text-on-ok">
              <IconeCoche taille={16} strokeWidth={3.2} />
            </span>
            <span className="text-md font-semibold">{texte}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface Etape {
  titre: string
  texte: string
  apercu: ReactNode
}

const ETAPES: Etape[] = [
  {
    titre: 'Note chaque série en 2 taps',
    texte:
      "Poids, répétitions, une coche. Les chiffres de ta dernière séance s'affichent déjà : tu n'as qu'à ajuster.",
    apercu: <ApercuSeries />,
  },
  {
    titre: 'Vois ta progression',
    texte:
      "Une courbe par exercice, tes records et ton volume : tu sais si tu progresses, chiffres à l'appui.",
    apercu: <ApercuRecord />,
  },
  {
    titre: 'Même sans réseau',
    texte:
      'Fonte est légère et marche hors ligne : plus besoin de data à la salle pour noter tes séries.',
    apercu: <ApercuHorsLigne />,
  },
]

export function PageOnboarding() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const etape = ETAPES[index]

  const terminer = async (): Promise<void> => {
    await ecrireReglage('onboardingTermine', true)
    navigate('/', { replace: true })
  }

  if (!etape) return null

  return (
    <div className="flex h-screen flex-col bg-bg text-text">
      <header className="flex flex-none justify-end px-5 pt-7">
        <Button variante="discret" onClick={() => void terminer()}>
          Passer
        </Button>
      </header>

      <div aria-hidden="true" className="flex flex-1 items-center justify-center px-5">
        {etape.apercu}
      </div>

      <div className="flex-none px-5">
        <h1 className="font-display text-d-3xl font-bold">{etape.titre}</h1>
        <p className="mt-3 text-lg leading-6 text-muted">{etape.texte}</p>
      </div>

      <div
        role="img"
        aria-label={`Étape ${index + 1} sur ${ETAPES.length}`}
        className="flex flex-none items-center justify-center gap-2 py-6"
      >
        {ETAPES.map((_, position) => (
          <span
            key={position}
            className={cn(
              'h-2 rounded-pill',
              position === index ? 'w-6 bg-accent' : 'w-2 bg-border',
            )}
          />
        ))}
      </div>

      <div className="flex-none px-5 pb-7 pb-safe">
        <Button
          variante="principal"
          taille="grande"
          pleineLargeur
          onClick={() => {
            if (index < ETAPES.length - 1) setIndex(index + 1)
            else void terminer()
          }}
        >
          {index < ETAPES.length - 1 ? 'Continuer' : 'Commencer'}
        </Button>
      </div>
    </div>
  )
}
