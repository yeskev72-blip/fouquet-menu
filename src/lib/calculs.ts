/**
 * Logique métier : 1RM, volume et détection des records.
 * Fonctions pures, sans accès à la base, pour rester testables.
 */

export interface SerieChiffree {
  weightKg: number
  reps: number
}

/**
 * 1RM estimé par la formule d'Epley : poids × (1 + reps / 30).
 * À une seule répétition, elle rend exactement le poids soulevé.
 */
export function unRepMax({ weightKg, reps }: SerieChiffree): number {
  if (reps <= 0 || weightKg <= 0) return 0
  return weightKg * (1 + reps / 30)
}

/** Volume d'une série : poids × répétitions. */
export function volumeSerie({ weightKg, reps }: SerieChiffree): number {
  if (reps <= 0 || weightKg <= 0) return 0
  return weightKg * reps
}

/** Volume d'une séance : somme des séries validées uniquement. */
export function volumeSeance(series: Array<SerieChiffree & { isDone: boolean }>): number {
  return series.reduce((total, serie) => (serie.isDone ? total + volumeSerie(serie) : total), 0)
}

export type TypeRecord = 'poids' | '1rm' | 'reps'

/**
 * Meilleures marques d'un exercice, construites à partir de son historique.
 * `repsParPoids` retient, pour chaque poids déjà soulevé, le plus grand
 * nombre de répétitions atteint.
 */
export interface MeilleuresMarques {
  poidsMax: number
  meilleur1RM: number
  repsParPoids: Map<number, number>
}

export function marquesVides(): MeilleuresMarques {
  return { poidsMax: 0, meilleur1RM: 0, repsParPoids: new Map() }
}

/** Agrège un historique de séries validées en meilleures marques. */
export function calculerMarques(series: SerieChiffree[]): MeilleuresMarques {
  const marques = marquesVides()
  for (const serie of series) {
    if (serie.reps <= 0) continue
    if (serie.weightKg > marques.poidsMax) marques.poidsMax = serie.weightKg
    const rm = unRepMax(serie)
    if (rm > marques.meilleur1RM) marques.meilleur1RM = rm
    const meilleuresReps = marques.repsParPoids.get(serie.weightKg) ?? 0
    if (serie.reps > meilleuresReps) marques.repsParPoids.set(serie.weightKg, serie.reps)
  }
  return marques
}

/**
 * Un record est détecté à la validation d'une série, par rapport à tout ce
 * qui précède. Trois façons d'en battre un : soulever plus lourd, faire plus
 * de répétitions à un poids déjà travaillé, ou améliorer son 1RM estimé.
 *
 * Un seul badge par série : le poids maximal prime, puis le 1RM, puis les
 * répétitions — du plus parlant au plus technique.
 */
export function detecterRecord(
  serie: SerieChiffree,
  marques: MeilleuresMarques,
): TypeRecord | null {
  if (serie.reps <= 0) return null

  if (serie.weightKg > 0 && serie.weightKg > marques.poidsMax) return 'poids'
  if (serie.weightKg > 0 && unRepMax(serie) > marques.meilleur1RM) return '1rm'

  // Au poids du corps, le poids vaut 0 : seules les répétitions progressent.
  const meilleuresReps = marques.repsParPoids.get(serie.weightKg)
  if (meilleuresReps !== undefined && serie.reps > meilleuresReps) return 'reps'

  return null
}

/** Ajoute une série aux marques, une fois le record détecté. */
export function integrerSerie(marques: MeilleuresMarques, serie: SerieChiffree): MeilleuresMarques {
  if (serie.reps <= 0) return marques
  const repsParPoids = new Map(marques.repsParPoids)
  const meilleuresReps = repsParPoids.get(serie.weightKg) ?? 0
  if (serie.reps > meilleuresReps) repsParPoids.set(serie.weightKg, serie.reps)
  return {
    poidsMax: Math.max(marques.poidsMax, serie.weightKg),
    meilleur1RM: Math.max(marques.meilleur1RM, unRepMax(serie)),
    repsParPoids,
  }
}

/** Libellé d'un record, pour l'annonce aux lecteurs d'écran. */
export function libelleRecord(type: TypeRecord): string {
  switch (type) {
    case 'poids':
      return 'Record de charge'
    case '1rm':
      return 'Record de 1RM estimé'
    case 'reps':
      return 'Record de répétitions'
  }
}
