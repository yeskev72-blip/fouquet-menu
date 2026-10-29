import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** « grande » pour les blocs de haut de page, aux coins plus ouverts. */
  taille?: 'normale' | 'grande'
  children: ReactNode
}

export function Card({ taille = 'normale', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'border border-border bg-surface',
        taille === 'grande' ? 'rounded-xcard p-5' : 'rounded-card p-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/** Intitulé de section en petites majuscules, repris sur tous les écrans. */
export function TitreSection({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-sm font-semibold uppercase tracking-wider text-muted', className)}
      {...props}
    >
      {children}
    </h2>
  )
}
