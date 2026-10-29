import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { IconeAccueil, IconeCalendrier, IconeProfil } from './Icones'

const ONGLETS = [
  { to: '/', libelle: 'Accueil', Icone: IconeAccueil, exact: true },
  { to: '/historique', libelle: 'Historique', Icone: IconeCalendrier, exact: false },
  { to: '/profil', libelle: 'Profil', Icone: IconeProfil, exact: false },
] as const

/** Navigation principale, posée au-dessus de la barre de gestes du téléphone. */
export function TabBar() {
  return (
    <nav
      aria-label="Navigation principale"
      className="flex flex-none border-t border-border bg-bg px-3 pb-safe"
    >
      {ONGLETS.map(({ to, libelle, Icone, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className={({ isActive }) =>
            cn(
              'flex h-19 flex-1 flex-col items-center justify-center gap-1 text-legend font-semibold',
              isActive ? 'text-accent-text' : 'text-muted',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icone taille={24} />
              {libelle}
              {isActive ? <span className="sr-only">(page active)</span> : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
