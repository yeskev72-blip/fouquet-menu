import { cn } from '@/lib/cn'
import { IconeCoche } from './Icones'

interface CheckButtonProps {
  validee: boolean
  /** Série prête : les deux chiffres sont renseignés. */
  prete?: boolean
  onToggle: () => void
  /** Numéro de la série, pour l'étiquette d'accessibilité. */
  numero: number
  disabled?: boolean
}

/** La coche qui valide une série : le geste le plus répété de l'appli. */
export function CheckButton({ validee, prete = false, onToggle, numero, disabled = false }: CheckButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={validee}
      aria-label={validee ? `Annuler la série ${numero}` : `Valider la série ${numero}`}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        'flex h-12 w-12 items-center justify-center rounded-btn transition-colors duration-fast',
        validee
          ? 'border-0 bg-ok text-on-ok'
          : prete
            ? 'border-2 border-accent bg-field text-accent-text'
            : 'border border-border bg-field text-muted',
        disabled && 'opacity-50',
      )}
    >
      <IconeCoche taille={24} />
    </button>
  )
}
