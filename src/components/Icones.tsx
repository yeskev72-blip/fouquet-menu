import type { SVGProps } from 'react'

/**
 * Jeu d'icônes repris du design : un seul trait, 24 × 24, couleur héritée.
 * Toutes sont décoratives — le sens est porté par le texte ou l'aria-label
 * du bouton qui les contient.
 */
type IconeProps = SVGProps<SVGSVGElement> & { taille?: number }

function Trait({ taille = 24, children, strokeWidth = 2, ...props }: IconeProps) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconePlus = (p: IconeProps) => (
  <Trait strokeWidth={2.4} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Trait>
)

export const IconeCoche = (p: IconeProps) => (
  <Trait strokeWidth={3} {...p}>
    <path d="M5 12l5 5 9-10" />
  </Trait>
)

export const IconeChevronDroite = (p: IconeProps) => (
  <Trait {...p}>
    <path d="M9 6l6 6-6 6" />
  </Trait>
)

export const IconeChevronGauche = (p: IconeProps) => (
  <Trait strokeWidth={2.2} {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Trait>
)

export const IconeChevronBas = (p: IconeProps) => (
  <Trait {...p}>
    <path d="M6 9l6 6 6-6" />
  </Trait>
)

export const IconeChevronHaut = (p: IconeProps) => (
  <Trait {...p}>
    <path d="M6 15l6-6 6 6" />
  </Trait>
)

export const IconeAccueil = (p: IconeProps) => (
  <Trait {...p}>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
  </Trait>
)

export const IconeCalendrier = (p: IconeProps) => (
  <Trait {...p}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Trait>
)

export const IconeProfil = (p: IconeProps) => (
  <Trait {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
  </Trait>
)

export const IconeChrono = (p: IconeProps) => (
  <Trait {...p}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l3 2M9 2h6" />
  </Trait>
)

export const IconeRecherche = (p: IconeProps) => (
  <Trait {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </Trait>
)

export const IconeHaltere = (p: IconeProps) => (
  <Trait {...p}>
    <path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12" />
  </Trait>
)

export const IconeTrophee = (p: IconeProps) => (
  <Trait {...p}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 13v4M8 21h8M10 17h4" />
  </Trait>
)

export const IconeReglages = (p: IconeProps) => (
  <Trait {...p}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Trait>
)

export const IconeCorbeille = (p: IconeProps) => (
  <Trait {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Trait>
)

/** Logo Fonte : disque de musculation sur carré ambre. */
export function LogoFonte({ taille = 120, ...props }: SVGProps<SVGSVGElement> & { taille?: number }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Fonte"
      {...props}
    >
      <rect width="120" height="120" rx="30" className="fill-accent" />
      <circle cx="60" cy="60" r="40" className="fill-on-accent" />
      <circle cx="60" cy="60" r="27" fill="none" className="stroke-accent" strokeWidth="3" />
      <circle cx="60" cy="60" r="9" className="fill-accent" />
    </svg>
  )
}
