import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

export type VarianteBouton = 'principal' | 'secondaire' | 'pointille' | 'validation' | 'discret'
export type TailleBouton = 'normale' | 'grande'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBouton
  taille?: TailleBouton
  /** Occupe toute la largeur disponible. */
  pleineLargeur?: boolean
  children: ReactNode
}

const VARIANTES: Record<VarianteBouton, string> = {
  principal:
    'bg-accent text-on-accent font-bold rounded-card active:bg-accent-pressed disabled:bg-border disabled:text-faint',
  secondaire:
    'bg-field text-text font-semibold rounded-btn active:bg-border disabled:bg-border disabled:text-faint',
  pointille:
    'border border-accent border-dashed text-accent-text font-semibold rounded-card active:bg-accent-soft disabled:border-border disabled:text-faint',
  validation:
    'bg-ok text-on-ok font-bold rounded-btn active:opacity-90 disabled:bg-border disabled:text-faint',
  discret: 'text-muted font-semibold rounded-btn active:bg-field disabled:text-faint',
}

const TAILLES: Record<TailleBouton, string> = {
  // 48 px minimum : c'est la zone tactile plancher du design system.
  normale: 'min-h-touch px-4 text-md',
  grande: 'min-h-15 px-5 text-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variante = 'principal', taille = 'normale', pleineLargeur = false, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-colors duration-fast disabled:cursor-not-allowed',
        VARIANTES[variante],
        TAILLES[taille],
        pleineLargeur && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
})
