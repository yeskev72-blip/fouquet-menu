import { cn } from '@/lib/cn'

interface PRBadgeProps {
  /** « pastille » posée sur un champ, « etiquette » en bout de ligne. */
  variante?: 'pastille' | 'etiquette'
  children?: string
  className?: string
}

/**
 * Marque un record. Discret et animé une seule fois : l'information doit se
 * voir sans couper le geste de saisie.
 */
export function PRBadge({ variante = 'pastille', children, className }: PRBadgeProps) {
  const texte = children ?? 'PR'
  return (
    <span
      className={cn(
        'animate-pr-pop inline-flex items-center bg-ok font-bold text-on-ok',
        variante === 'pastille'
          ? 'rounded-badge px-2 py-px text-cap'
          : 'rounded-field px-3 py-0.5 text-legend',
        className,
      )}
    >
      {texte}
      <span className="sr-only"> record personnel</span>
    </span>
  )
}
