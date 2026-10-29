/** Dates en français, sans dépendance : l'appli doit rester légère. */

const JOURS_COURTS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'] as const
const JOURS_LONGS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as const
const MOIS_COURTS = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
] as const
const MOIS_LONGS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
] as const

/** Initiales de la semaine, du lundi au dimanche, comme dans le design. */
export const INITIALES_SEMAINE = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const

function elements(date: Date) {
  return {
    jourSemaine: date.getDay(),
    jour: date.getDate(),
    mois: date.getMonth(),
    annee: date.getFullYear(),
  }
}

/** « Jeudi 29 octobre » */
export function dateLongue(date: Date): string {
  const { jourSemaine, jour, mois } = elements(date)
  return `${JOURS_LONGS[jourSemaine]} ${jour} ${MOIS_LONGS[mois]}`
}

/** « jeu. 29 oct. » */
export function dateCourte(date: Date): string {
  const { jourSemaine, jour, mois } = elements(date)
  return `${JOURS_COURTS[jourSemaine]} ${jour} ${MOIS_COURTS[mois]}`
}

/** « Octobre 2026 » */
export function moisEtAnnee(date: Date): string {
  const { mois, annee } = elements(date)
  const nom = MOIS_LONGS[mois] ?? ''
  return `${nom.charAt(0).toUpperCase()}${nom.slice(1)} ${annee}`
}

/** « 22 oct. », « aujourd'hui », « hier » — sans jour de semaine. */
export function dateCompacte(date: Date, maintenant = new Date()): string {
  const jours = ecartEnJours(date, maintenant)
  if (jours === 0) return "auj."
  if (jours === 1) return 'hier'
  return `${date.getDate()} ${moisCourt(date)}`
}

export function jourCourt(date: Date): string {
  return JOURS_COURTS[date.getDay()] ?? ''
}

export function moisCourt(date: Date): string {
  return MOIS_COURTS[date.getMonth()] ?? ''
}

/**
 * « aujourd'hui », « hier », « il y a 3 j », puis la date.
 * Les comparaisons se font sur le jour calendaire, pas sur 24 heures.
 */
export function dateRelative(date: Date, maintenant = new Date()): string {
  const jours = ecartEnJours(date, maintenant)
  if (jours === 0) return "aujourd'hui"
  if (jours === 1) return 'hier'
  if (jours < 7) return `il y a ${jours} j`
  return dateCourte(date)
}

export function debutDeJour(date: Date): Date {
  const copie = new Date(date)
  copie.setHours(0, 0, 0, 0)
  return copie
}

export function ecartEnJours(date: Date, reference: Date): number {
  const unJour = 86_400_000
  return Math.round((debutDeJour(reference).getTime() - debutDeJour(date).getTime()) / unJour)
}

export function memeJour(a: Date, b: Date): boolean {
  return debutDeJour(a).getTime() === debutDeJour(b).getTime()
}

/** Lundi de la semaine contenant la date. */
export function debutDeSemaine(date: Date): Date {
  const jour = debutDeJour(date)
  // getDay() : 0 = dimanche. La semaine française commence le lundi.
  const decalage = (jour.getDay() + 6) % 7
  jour.setDate(jour.getDate() - decalage)
  return jour
}

export function debutDeMois(date: Date): Date {
  const copie = debutDeJour(date)
  copie.setDate(1)
  return copie
}

/** Clé « 2026-10-29 », stable quel que soit le fuseau. */
export function cleDeJour(date: Date): string {
  const { jour, mois, annee } = elements(date)
  return `${annee}-${String(mois + 1).padStart(2, '0')}-${String(jour).padStart(2, '0')}`
}
