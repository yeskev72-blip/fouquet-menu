import { describe, expect, it } from 'vitest'
import {
  calculerMarques,
  detecterRecord,
  integrerSerie,
  marquesVides,
  unRepMax,
  volumeSeance,
  volumeSerie,
} from '@/lib/calculs'

describe('1RM estimé (Epley)', () => {
  it('rend le poids lui-même à une répétition', () => {
    expect(unRepMax({ weightKg: 100, reps: 1 })).toBeCloseTo(103.33, 2)
  })

  it('suit la formule poids × (1 + reps / 30)', () => {
    expect(unRepMax({ weightKg: 82.5, reps: 8 })).toBeCloseTo(104.5, 2)
    expect(unRepMax({ weightKg: 60, reps: 10 })).toBeCloseTo(80, 2)
  })

  it('vaut zéro sans charge ou sans répétition', () => {
    expect(unRepMax({ weightKg: 0, reps: 12 })).toBe(0)
    expect(unRepMax({ weightKg: 80, reps: 0 })).toBe(0)
  })
})

describe('volume', () => {
  it('multiplie le poids par les répétitions', () => {
    expect(volumeSerie({ weightKg: 80, reps: 8 })).toBe(640)
  })

  it('ne compte que les séries validées', () => {
    const series = [
      { weightKg: 80, reps: 8, isDone: true },
      { weightKg: 80, reps: 8, isDone: false },
      { weightKg: 85, reps: 6, isDone: true },
    ]
    expect(volumeSeance(series)).toBe(640 + 510)
  })

  it('rend zéro sur une séance sans série validée', () => {
    expect(volumeSeance([{ weightKg: 100, reps: 5, isDone: false }])).toBe(0)
  })
})

describe('détection des records', () => {
  it('signale un record de charge', () => {
    const marques = calculerMarques([{ weightKg: 80, reps: 8 }])
    expect(detecterRecord({ weightKg: 82.5, reps: 8 }, marques)).toBe('poids')
  })

  it('signale un record de 1RM sans record de charge', () => {
    // 80 × 10 estime 106,7, au-dessus des 104,5 de 82,5 × 8, sans soulever plus lourd.
    const marques = calculerMarques([{ weightKg: 82.5, reps: 8 }])
    expect(detecterRecord({ weightKg: 80, reps: 10 }, marques)).toBe('1rm')
  })

  it('signale un record de répétitions à un poids déjà travaillé', () => {
    const marques = calculerMarques([
      { weightKg: 80, reps: 8 },
      { weightKg: 100, reps: 5 },
    ])
    // 80 × 9 ne bat ni la charge (100) ni le 1RM (116,7), mais bat les 8 reps à 80.
    expect(detecterRecord({ weightKg: 80, reps: 9 }, marques)).toBe('reps')
  })

  it('traite le poids du corps par les répétitions', () => {
    const marques = calculerMarques([{ weightKg: 0, reps: 12 }])
    expect(detecterRecord({ weightKg: 0, reps: 15 }, marques)).toBe('reps')
    expect(detecterRecord({ weightKg: 0, reps: 10 }, marques)).toBeNull()
  })

  it('ne signale rien quand la série n’améliore rien', () => {
    const marques = calculerMarques([{ weightKg: 100, reps: 10 }])
    expect(detecterRecord({ weightKg: 80, reps: 8 }, marques)).toBeNull()
  })

  it('ne signale rien sans répétition', () => {
    expect(detecterRecord({ weightKg: 200, reps: 0 }, marquesVides())).toBeNull()
  })

  it('donne un seul type par série, la charge primant', () => {
    const marques = calculerMarques([{ weightKg: 80, reps: 8 }])
    // 85 × 10 bat la charge, le 1RM et les reps : un seul badge, le plus parlant.
    expect(detecterRecord({ weightKg: 85, reps: 10 }, marques)).toBe('poids')
  })

  it('fait de la toute première série un record', () => {
    expect(detecterRecord({ weightKg: 40, reps: 10 }, marquesVides())).toBe('poids')
  })
})

describe('mise à jour des marques au fil de la séance', () => {
  it('empêche deux records de charge consécutifs sur la même valeur', () => {
    let marques = marquesVides()
    const serie = { weightKg: 60, reps: 10 }

    expect(detecterRecord(serie, marques)).toBe('poids')
    marques = integrerSerie(marques, serie)
    expect(detecterRecord(serie, marques)).toBeNull()
  })

  it('retient le meilleur nombre de répétitions par poids', () => {
    const marques = calculerMarques([
      { weightKg: 80, reps: 6 },
      { weightKg: 80, reps: 9 },
      { weightKg: 80, reps: 7 },
    ])
    expect(marques.repsParPoids.get(80)).toBe(9)
    expect(marques.poidsMax).toBe(80)
  })
})
