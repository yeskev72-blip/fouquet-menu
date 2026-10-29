import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  /** Texte brut : l'utilisateur tape « 82,5 », on ne reformate pas sous ses doigts. */
  valeur: string
  onValeurChange: (valeur: string) => void
  /** « decimal » pour les kilos, « numeric » pour les répétitions. */
  clavier?: 'decimal' | 'numeric'
  /** Fond transparent une fois la série validée, comme dans le design. */
  transparent?: boolean
  /** Contour ambre sur la série en cours. */
  actif?: boolean
  /** Chiffre affiché en vert quand la série bat un record. */
  record?: boolean
}

/**
 * Champ de saisie des chiffres d'une série. Gros, centré, en Barlow
 * Condensed : lisible d'un coup d'œil entre deux séries.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { valeur, onValeurChange, clavier = 'decimal', transparent = false, actif = false, record = false, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type="text"
      inputMode={clavier}
      autoComplete="off"
      enterKeyHint="done"
      value={valeur}
      onChange={(evenement) => {
        // On filtre à la saisie : chiffres, virgule et point seulement.
        const brut = evenement.target.value.replace(/[^\d.,]/g, '')
        onValeurChange(brut)
      }}
      onFocus={(evenement) => {
        // Taper par-dessus la valeur précédente plutôt que l'éditer.
        evenement.target.select()
        props.onFocus?.(evenement)
      }}
      className={cn(
        'h-12 w-full rounded-field border-0 p-0 text-center font-display text-d-sm font-bold',
        'placeholder:text-faint focus:outline-none',
        transparent ? 'bg-transparent' : 'bg-field',
        actif && 'ring-2 ring-accent',
        record ? 'text-ok' : 'text-text',
        className,
      )}
      {...props}
    />
  )
})
