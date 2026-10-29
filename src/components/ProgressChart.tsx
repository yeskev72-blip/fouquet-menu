import { useId, useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { formaterGrandNombre } from '@/lib/nombres'

export interface PointCourbe {
  /** Étiquette courte, affichée aux extrémités de l'axe. « 9 sept. » */
  etiquette: string
  valeur: number
  /** Marque le point qui a battu un record. */
  record?: boolean
}

interface ProgressChartProps {
  points: PointCourbe[]
  /** Titre de la courbe, qui tient lieu de légende : une seule série. */
  titre: string
  unite: string
  className?: string
}

// Géométrie du tracé, reprise du design : 318 × 170, axe des ordonnées à
// gauche, étiquettes de dates sous la grille.
const L = 318
const H = 170
const X_MIN = 34
const X_MAX = 306
const Y_HAUT = 28
const Y_BAS = 140
const NB_LIGNES = 5

/** Échelle lisible : des graduations qui tombent sur des nombres ronds. */
function graduations(min: number, max: number): number[] {
  if (min === max) {
    // Une seule valeur : on l'encadre pour qu'elle ne colle pas au bord.
    const marge = Math.max(1, Math.abs(min) * 0.1)
    min -= marge
    max += marge
  }
  const brut = (max - min) / (NB_LIGNES - 1)
  const magnitude = 10 ** Math.floor(Math.log10(brut))
  const pas = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((candidat) => candidat >= brut) ?? magnitude * 10
  const bas = Math.floor(min / pas) * pas
  return Array.from({ length: NB_LIGNES }, (_, i) => Number((bas + i * pas).toFixed(6)))
}

/**
 * Courbe d'évolution, faite main en SVG : une seule série, pas de librairie
 * à télécharger. Le titre nomme la série, donc pas de légende. Toucher la
 * courbe affiche la valeur du point le plus proche ; la même information
 * est disponible en texte pour les lecteurs d'écran.
 */
export function ProgressChart({ points, titre, unite, className }: ProgressChartProps) {
  const idGradient = useId()
  const [survole, setSurvole] = useState<number | null>(null)

  const trace = useMemo(() => {
    if (points.length === 0) return null

    const valeurs = points.map((p) => p.valeur)
    const ticks = graduations(Math.min(...valeurs), Math.max(...valeurs))
    const yMin = ticks[0] ?? 0
    const yMax = ticks[ticks.length - 1] ?? 1
    const etendue = yMax - yMin || 1

    const x = (index: number): number =>
      points.length === 1 ? (X_MIN + X_MAX) / 2 : X_MIN + (index * (X_MAX - X_MIN)) / (points.length - 1)
    const y = (valeur: number): number => Y_BAS - ((valeur - yMin) / etendue) * (Y_BAS - Y_HAUT)

    const coords = points.map((point, index) => ({ ...point, x: x(index), y: y(point.valeur), index }))
    const ligne = coords.map((c) => `${c.x},${c.y}`).join(' ')
    const aire = `M${coords.map((c) => `${c.x} ${c.y}`).join(' L')} L${X_MAX} ${Y_BAS} L${coords[0]?.x ?? X_MIN} ${Y_BAS} Z`

    return { coords, ligne, aire, ticks, y }
  }, [points])

  if (!trace) {
    return (
      <div className={cn('rounded-card border border-border bg-surface p-4', className)}>
        <p className="text-sm text-muted">{titre}</p>
        <p className="py-6 text-center text-base text-muted">
          Pas encore de données. Valide une série pour voir la courbe démarrer.
        </p>
      </div>
    )
  }

  const { coords, ligne, aire, ticks, y } = trace
  const premier = coords[0]
  const dernier = coords[coords.length - 1]
  const actif = survole === null ? null : coords[survole]

  const resume = `${titre} : de ${formaterGrandNombre(premier?.valeur ?? 0)} ${unite} le ${premier?.etiquette ?? ''} à ${formaterGrandNombre(dernier?.valeur ?? 0)} ${unite} le ${dernier?.etiquette ?? ''}.`

  return (
    <div className={cn('rounded-card border border-border bg-surface p-4 pb-3', className)}>
      <p className="mb-2 text-sm text-muted">{titre}</p>

      <svg
        viewBox={`0 0 ${L} ${H}`}
        width="100%"
        role="img"
        aria-label={resume}
        className="block touch-none text-chart-line"
        onPointerLeave={() => setSurvole(null)}
        onPointerDown={(evenement) => {
          const rect = evenement.currentTarget.getBoundingClientRect()
          const xSvg = ((evenement.clientX - rect.left) / rect.width) * L
          let plusProche = 0
          for (let i = 1; i < coords.length; i += 1) {
            const candidat = coords[i]
            const courant = coords[plusProche]
            if (candidat && courant && Math.abs(candidat.x - xSvg) < Math.abs(courant.x - xSvg)) plusProche = i
          }
          setSurvole(plusProche)
        }}
      >
        <defs>
          {/* currentColor hérite de text-chart-line posé sur le <svg>. */}
          <linearGradient id={`aire-${idGradient}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g className="stroke-border" strokeWidth="1">
          {ticks.map((valeur) => (
            <line key={valeur} x1={X_MIN - 4} y1={y(valeur)} x2={X_MAX + 6} y2={y(valeur)} />
          ))}
        </g>

        <g className="fill-muted font-sans" fontSize="11">
          {ticks.map((valeur) => (
            <text key={valeur} x="0" y={y(valeur) + 4}>
              {formaterGrandNombre(valeur)}
            </text>
          ))}
          <text x={X_MIN} y={H - 6}>
            {premier?.etiquette}
          </text>
          {coords.length > 1 ? (
            <text x={X_MAX} y={H - 6} textAnchor="end">
              {dernier?.etiquette}
            </text>
          ) : null}
        </g>

        <path d={aire} fill={`url(#aire-${idGradient})`} />
        <polyline
          points={ligne}
          fill="none"
          className="stroke-chart-line"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Marqueurs : 8 px de diamètre, cerclés de la surface pour rester
            lisibles quand deux points se touchent. */}
        <g className="fill-surface stroke-chart-line" strokeWidth="2">
          {coords.slice(0, -1).map((c) => (
            <circle key={c.index} cx={c.x} cy={c.y} r="4" />
          ))}
        </g>

        {dernier ? (
          <circle
            cx={dernier.x}
            cy={dernier.y}
            r="6"
            className={cn('stroke-surface', dernier.record ? 'fill-ok' : 'fill-chart-line')}
            strokeWidth="3"
          />
        ) : null}

        {actif ? (
          <g>
            <line
              x1={actif.x}
              y1={Y_HAUT - 10}
              x2={actif.x}
              y2={Y_BAS}
              className="stroke-border"
              strokeWidth="1"
            />
            <circle cx={actif.x} cy={actif.y} r="6" className="fill-chart-line stroke-surface" strokeWidth="3" />
            <rect
              x={Math.min(Math.max(actif.x - 38, 0), L - 76)}
              y="0"
              width="76"
              height="22"
              rx="11"
              className="fill-field"
            />
            <text
              x={Math.min(Math.max(actif.x, 38), L - 38)}
              y="15"
              textAnchor="middle"
              className="fill-text font-sans"
              fontSize="11"
              fontWeight="700"
            >
              {formaterGrandNombre(actif.valeur)} {unite}
            </text>
          </g>
        ) : dernier?.record ? (
          <g>
            <rect x={L - 70} y="6" width="64" height="22" rx="11" className="fill-ok" />
            <text
              x={L - 38}
              y="21"
              textAnchor="middle"
              className="fill-on-ok font-sans"
              fontSize="11"
              fontWeight="700"
            >
              PR {formaterGrandNombre(dernier.valeur)}
            </text>
          </g>
        ) : null}
      </svg>

      {/* Mêmes données en texte : une courbe seule n'est pas lisible au clavier
          ni au lecteur d'écran. */}
      <details className="mt-2">
        <summary className="min-h-touch cursor-pointer list-none py-2 text-sm font-semibold text-muted">
          Voir les valeurs
        </summary>
        <table className="w-full text-base">
          <caption className="sr-only">{titre}</caption>
          <thead>
            <tr className="text-left text-sm text-muted">
              <th scope="col" className="py-1 font-semibold">
                Séance
              </th>
              <th scope="col" className="py-1 text-right font-semibold">
                {unite}
              </th>
            </tr>
          </thead>
          <tbody>
            {coords.map((c) => (
              <tr key={c.index} className="border-t border-border">
                <td className="py-1 text-muted">{c.etiquette}</td>
                <td className={cn('py-1 text-right font-display text-lg font-bold', c.record && 'text-ok')}>
                  {formaterGrandNombre(c.valeur)}
                  {c.record ? <span className="sr-only"> record</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}

/** Mini-courbe sans axes, pour le poids de corps dans Profil. */
export function Sparkline({ valeurs, className }: { valeurs: number[]; className?: string }) {
  if (valeurs.length < 2) return null
  const min = Math.min(...valeurs)
  const max = Math.max(...valeurs)
  const etendue = max - min || 1
  const points = valeurs
    .map((valeur, index) => {
      const x = 2 + (index * 116) / (valeurs.length - 1)
      const y = 42 - ((valeur - min) / etendue) * 36
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const dernier = points.split(' ').at(-1)?.split(',') ?? ['118', '38']

  return (
    <svg
      width="120"
      height="48"
      viewBox="0 0 120 48"
      role="img"
      aria-label="Évolution du poids de corps"
      className={cn('block flex-none', className)}
    >
      <polyline
        points={points}
        fill="none"
        className="stroke-ok"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={dernier[0]} cy={dernier[1]} r="4" className="fill-ok" />
    </svg>
  )
}
