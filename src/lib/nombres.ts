/**
 * Formats français : virgule décimale, espace insécable comme séparateur
 * de milliers. Tout passe par ici pour que l'appli parle la même langue
 * partout, y compris dans les étiquettes d'accessibilité.
 */

// L'espace fine insécable (U+202F) manque à Barlow Condensed et disparaît
// à l'affichage : l'espace insécable ordinaire passe dans toutes les polices.
const ESPACE_MILLIERS = ' '

/** Analyse une saisie utilisateur : « 82,5 » et « 82.5 » sont acceptés. */
export function analyserNombre(saisie: string): number | null {
  const propre = saisie.replace(/\s/g, '').replace(',', '.')
  if (propre === '' || propre === '.') return null
  const valeur = Number(propre)
  return Number.isFinite(valeur) ? valeur : null
}

/** « 82,5 » — au plus deux décimales, sans zéro inutile. */
export function formaterNombre(valeur: number, decimalesMax = 2): string {
  const arrondi = Number(valeur.toFixed(decimalesMax))
  return String(arrondi).replace('.', ',')
}

/** « 1 740 kg » — séparateur de milliers pour les gros volumes. */
export function formaterPoids(kg: number, unite: 'kg' | 'lb' = 'kg'): string {
  return `${formaterGrandNombre(kg)}\u00a0${unite}`
}

export function formaterGrandNombre(valeur: number): string {
  const arrondi = Math.round(valeur * 100) / 100
  const [entier = '0', decimales] = String(arrondi).split('.')
  const groupe = entier.replace(/\B(?=(\d{3})+(?!\d))/g, ESPACE_MILLIERS)
  return decimales ? `${groupe},${decimales}` : groupe
}

/** Volume d'une séance : « 10 200 kg », ou « 412 t » au-delà de 100 tonnes. */
export function formaterVolume(kg: number): string {
  if (kg >= 100_000) return `${formaterGrandNombre(Math.round(kg / 1000))} t`
  return `${formaterGrandNombre(Math.round(kg))} kg`
}

/** Durée d'une séance : « 1 h 04 », ou « 47 min » en dessous d'une heure. */
export function formaterDuree(millisecondes: number): string {
  const totalMinutes = Math.max(0, Math.floor(millisecondes / 60_000))
  const heures = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (heures === 0) return `${minutes} min`
  return `${heures} h ${String(minutes).padStart(2, '0')}`
}

/** Chrono d'une séance ou d'un repos : « 47:12 », « 01:12 ». */
export function formaterChrono(millisecondes: number): string {
  const totalSecondes = Math.max(0, Math.round(millisecondes / 1000))
  const heures = Math.floor(totalSecondes / 3600)
  const minutes = Math.floor((totalSecondes % 3600) / 60)
  const secondes = totalSecondes % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(secondes).padStart(2, '0')
  return heures > 0 ? `${heures}:${mm}:${ss}` : `${mm}:${ss}`
}

/** Lecture à voix haute du chrono, pour les lecteurs d'écran. */
export function chronoEnMots(millisecondes: number): string {
  const totalSecondes = Math.max(0, Math.round(millisecondes / 1000))
  const minutes = Math.floor(totalSecondes / 60)
  const secondes = totalSecondes % 60
  if (minutes === 0) return `${secondes} secondes`
  return `${minutes} minute${minutes > 1 ? 's' : ''} et ${secondes} seconde${secondes > 1 ? 's' : ''}`
}

const KG_PAR_LIVRE = 0.45359237

export function kgVersUnite(kg: number, unite: 'kg' | 'lb'): number {
  return unite === 'lb' ? kg / KG_PAR_LIVRE : kg
}

export function uniteVersKg(valeur: number, unite: 'kg' | 'lb'): number {
  return unite === 'lb' ? valeur * KG_PAR_LIVRE : valeur
}
