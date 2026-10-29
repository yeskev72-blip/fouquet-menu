import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  actif: boolean
  children: ReactNode
}

/** Filtre en pilule : muscle, matériel, période. */
export function Chip({ actif, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      className={cn(
        'inline-flex flex-none items-center rounded-pill border px-5 text-md transition-colors duration-fast',
        // 44 px de haut, mais la rangée laisse 48 px de zone tactile.
        'min-h-11',
        actif
          ? 'border-accent bg-accent font-bold text-on-accent'
          : 'border-border bg-surface font-semibold text-text active:bg-field',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
