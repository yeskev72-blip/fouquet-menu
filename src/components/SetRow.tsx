import { cn } from '@/lib/cn'
import { CheckButton } from './CheckButton'
import { NumberInput } from './NumberInput'
import { PRBadge } from './PRBadge'

/**
 * Gabarit de colonnes de la table des séries, déclaré une seule fois pour
 * que l'en-tête et les lignes restent alignés : n°, précédent, kg, reps, coche.
 */
export const COLONNES_SERIE = 'grid grid-cols-[28px_1fr_78px_68px_48px] gap-2 items-center'

interface SetRowProps {
  numero: number
  /** Valeurs de la même série lors de la dernière séance, ou null. */
  precedent: string | null
  poids: string
  reps: string
  validee: boolean
  /** La série validée a battu un record. */
  record?: boolean
  onPoidsChange: (valeur: string) => void
  onRepsChange: (valeur: string) => void
  onToggle: () => void
}

export function SetRow({
  numero,
  precedent,
  poids,
  reps,
  validee,
  record = false,
  onPoidsChange,
  onRepsChange,
  onToggle,
}: SetRowProps) {
  const prete = poids.trim() !== '' && reps.trim() !== '' && !validee

  return (
    <div
      className={cn(
        COLONNES_SERIE,
        'rounded-btn',
        validee && 'bg-ok-soft p-1',
        prete && 'border border-accent bg-surface p-0.75',
        !validee && !prete && 'p-1',
      )}
    >
      <span
        className={cn('text-center text-md font-bold', prete ? 'text-accent-text' : 'text-muted')}
        aria-hidden="true"
      >
        {numero}
      </span>

      <span className="text-base text-muted">{precedent ?? '–'}</span>

      <span className="relative block">
        <NumberInput
          valeur={poids}
          onValeurChange={onPoidsChange}
          clavier="decimal"
          placeholder="kg"
          transparent={validee}
          record={validee && record}
          aria-label={`Poids de la série ${numero}, en kilos`}
        />
        {validee && record ? <PRBadge className="absolute -right-1 -top-1" /> : null}
      </span>

      <NumberInput
        valeur={reps}
        onValeurChange={onRepsChange}
        clavier="numeric"
        placeholder="reps"
        transparent={validee}
        aria-label={`Répétitions de la série ${numero}`}
      />

      <CheckButton numero={numero} validee={validee} prete={prete} onToggle={onToggle} />
    </div>
  )
}

/** En-tête de la table des séries. */
export function SetRowHeader() {
  return (
    <div
      className={cn(
        COLONNES_SERIE,
        'mb-1 mt-1 px-1 text-cap font-semibold uppercase tracking-wider text-muted',
      )}
    >
      <span className="text-center">Sér.</span>
      <span>Précédent</span>
      <span className="text-center">Kg</span>
      <span className="text-center">Reps</span>
      <span className="text-center">OK</span>
    </div>
  )
}
