import type { GroupeMusculaire, Materiel } from './types'

export interface ExerciceCatalogue {
  name: string
  muscleGroup: GroupeMusculaire
  equipment: Materiel
}

/**
 * Bibliothèque chargée au premier lancement. Le choix penche volontairement
 * vers le poids du corps, les haltères et l'élastique : beaucoup de salles
 * n'ont ni poulie ni machine.
 */
export const CATALOGUE_EXERCICES: ExerciceCatalogue[] = [
  // Pectoraux
  { name: 'Développé couché', muscleGroup: 'Pectoraux', equipment: 'Barre' },
  { name: 'Développé incliné haltères', muscleGroup: 'Pectoraux', equipment: 'Haltères' },
  { name: 'Développé couché haltères', muscleGroup: 'Pectoraux', equipment: 'Haltères' },
  { name: 'Développé décliné', muscleGroup: 'Pectoraux', equipment: 'Barre' },
  { name: 'Pompes', muscleGroup: 'Pectoraux', equipment: 'Poids du corps' },
  { name: 'Pompes surélevées', muscleGroup: 'Pectoraux', equipment: 'Poids du corps' },
  { name: 'Pompes diamant', muscleGroup: 'Pectoraux', equipment: 'Poids du corps' },
  { name: 'Dips', muscleGroup: 'Pectoraux', equipment: 'Poids du corps' },
  { name: 'Écartés à la poulie', muscleGroup: 'Pectoraux', equipment: 'Poulie' },
  { name: 'Écartés haltères', muscleGroup: 'Pectoraux', equipment: 'Haltères' },
  { name: 'Développé à la machine', muscleGroup: 'Pectoraux', equipment: 'Machine' },
  { name: 'Pec-deck', muscleGroup: 'Pectoraux', equipment: 'Machine' },
  { name: 'Pompes à l’élastique', muscleGroup: 'Pectoraux', equipment: 'Élastique' },
  { name: 'Écartés à l’élastique', muscleGroup: 'Pectoraux', equipment: 'Élastique' },
  { name: 'Pull-over haltère', muscleGroup: 'Pectoraux', equipment: 'Haltères' },

  // Dos
  { name: 'Tractions pronation', muscleGroup: 'Dos', equipment: 'Poids du corps' },
  { name: 'Tractions supination', muscleGroup: 'Dos', equipment: 'Poids du corps' },
  { name: 'Tractions australiennes', muscleGroup: 'Dos', equipment: 'Poids du corps' },
  { name: 'Rowing barre', muscleGroup: 'Dos', equipment: 'Barre' },
  { name: 'Rowing haltère', muscleGroup: 'Dos', equipment: 'Haltères' },
  { name: 'Soulevé de terre', muscleGroup: 'Dos', equipment: 'Barre' },
  { name: 'Soulevé de terre roumain', muscleGroup: 'Dos', equipment: 'Barre' },
  { name: 'Tirage vertical', muscleGroup: 'Dos', equipment: 'Poulie' },
  { name: 'Tirage horizontal', muscleGroup: 'Dos', equipment: 'Poulie' },
  { name: 'Rowing T-bar', muscleGroup: 'Dos', equipment: 'Barre' },
  { name: 'Rowing à l’élastique', muscleGroup: 'Dos', equipment: 'Élastique' },
  { name: 'Tirage vertical à l’élastique', muscleGroup: 'Dos', equipment: 'Élastique' },
  { name: 'Shrugs haltères', muscleGroup: 'Dos', equipment: 'Haltères' },
  { name: 'Extension lombaire', muscleGroup: 'Dos', equipment: 'Poids du corps' },
  { name: 'Rowing machine', muscleGroup: 'Dos', equipment: 'Machine' },
  { name: 'Face pull', muscleGroup: 'Dos', equipment: 'Poulie' },

  // Jambes
  { name: 'Squat', muscleGroup: 'Jambes', equipment: 'Barre' },
  { name: 'Squat avant', muscleGroup: 'Jambes', equipment: 'Barre' },
  { name: 'Squat gobelet', muscleGroup: 'Jambes', equipment: 'Haltères' },
  { name: 'Presse à cuisses', muscleGroup: 'Jambes', equipment: 'Machine' },
  { name: 'Fentes marchées', muscleGroup: 'Jambes', equipment: 'Haltères' },
  { name: 'Fentes bulgares', muscleGroup: 'Jambes', equipment: 'Haltères' },
  { name: 'Soulevé de terre jambes tendues', muscleGroup: 'Jambes', equipment: 'Barre' },
  { name: 'Leg curl', muscleGroup: 'Jambes', equipment: 'Machine' },
  { name: 'Leg extension', muscleGroup: 'Jambes', equipment: 'Machine' },
  { name: 'Hip thrust', muscleGroup: 'Jambes', equipment: 'Barre' },
  { name: 'Squat au poids du corps', muscleGroup: 'Jambes', equipment: 'Poids du corps' },
  { name: 'Chaise murale', muscleGroup: 'Jambes', equipment: 'Poids du corps' },
  { name: 'Montées sur banc', muscleGroup: 'Jambes', equipment: 'Haltères' },
  { name: 'Mollets debout', muscleGroup: 'Jambes', equipment: 'Machine' },
  { name: 'Mollets assis', muscleGroup: 'Jambes', equipment: 'Machine' },
  { name: 'Mollets au poids du corps', muscleGroup: 'Jambes', equipment: 'Poids du corps' },
  { name: 'Soulevé de terre sumo', muscleGroup: 'Jambes', equipment: 'Barre' },
  { name: 'Good morning', muscleGroup: 'Jambes', equipment: 'Barre' },
  { name: 'Squat à l’élastique', muscleGroup: 'Jambes', equipment: 'Élastique' },
  { name: 'Abduction des hanches à l’élastique', muscleGroup: 'Jambes', equipment: 'Élastique' },
  { name: 'Swing kettlebell', muscleGroup: 'Jambes', equipment: 'Kettlebell' },
  { name: 'Fentes sautées', muscleGroup: 'Jambes', equipment: 'Poids du corps' },

  // Épaules
  { name: 'Développé militaire', muscleGroup: 'Épaules', equipment: 'Barre' },
  { name: 'Développé haltères', muscleGroup: 'Épaules', equipment: 'Haltères' },
  { name: 'Élévations latérales', muscleGroup: 'Épaules', equipment: 'Haltères' },
  { name: 'Élévations frontales', muscleGroup: 'Épaules', equipment: 'Haltères' },
  { name: 'Oiseau', muscleGroup: 'Épaules', equipment: 'Haltères' },
  { name: 'Développé Arnold', muscleGroup: 'Épaules', equipment: 'Haltères' },
  { name: 'Élévations latérales à l’élastique', muscleGroup: 'Épaules', equipment: 'Élastique' },
  { name: 'Développé épaules machine', muscleGroup: 'Épaules', equipment: 'Machine' },
  { name: 'Rowing menton', muscleGroup: 'Épaules', equipment: 'Barre' },
  { name: 'Pompes piquées', muscleGroup: 'Épaules', equipment: 'Poids du corps' },
  { name: 'Élévations latérales à la poulie', muscleGroup: 'Épaules', equipment: 'Poulie' },

  // Bras
  { name: 'Curl barre', muscleGroup: 'Bras', equipment: 'Barre' },
  { name: 'Curl haltères', muscleGroup: 'Bras', equipment: 'Haltères' },
  { name: 'Curl marteau', muscleGroup: 'Bras', equipment: 'Haltères' },
  { name: 'Curl pupitre', muscleGroup: 'Bras', equipment: 'Barre' },
  { name: 'Curl à la poulie', muscleGroup: 'Bras', equipment: 'Poulie' },
  { name: 'Curl à l’élastique', muscleGroup: 'Bras', equipment: 'Élastique' },
  { name: 'Extension triceps à la poulie', muscleGroup: 'Bras', equipment: 'Poulie' },
  { name: 'Barre au front', muscleGroup: 'Bras', equipment: 'Barre' },
  { name: 'Extension nuque haltère', muscleGroup: 'Bras', equipment: 'Haltères' },
  { name: 'Dips entre deux bancs', muscleGroup: 'Bras', equipment: 'Poids du corps' },
  { name: 'Kickback triceps', muscleGroup: 'Bras', equipment: 'Haltères' },
  { name: 'Extension triceps à l’élastique', muscleGroup: 'Bras', equipment: 'Élastique' },
  { name: 'Curl inversé', muscleGroup: 'Bras', equipment: 'Barre' },
  { name: 'Curl poignets', muscleGroup: 'Bras', equipment: 'Barre' },

  // Abdominaux
  { name: 'Crunch', muscleGroup: 'Abdominaux', equipment: 'Poids du corps' },
  { name: 'Relevé de jambes suspendu', muscleGroup: 'Abdominaux', equipment: 'Poids du corps' },
  { name: 'Gainage planche', muscleGroup: 'Abdominaux', equipment: 'Poids du corps' },
  { name: 'Gainage latéral', muscleGroup: 'Abdominaux', equipment: 'Poids du corps' },
  { name: 'Russian twist', muscleGroup: 'Abdominaux', equipment: 'Haltères' },
  { name: 'Crunch à la poulie', muscleGroup: 'Abdominaux', equipment: 'Poulie' },
  { name: 'Roulette abdominale', muscleGroup: 'Abdominaux', equipment: 'Poids du corps' },
  { name: 'Mountain climbers', muscleGroup: 'Abdominaux', equipment: 'Poids du corps' },
  { name: 'Relevé de jambes au sol', muscleGroup: 'Abdominaux', equipment: 'Poids du corps' },
  { name: 'V-ups', muscleGroup: 'Abdominaux', equipment: 'Poids du corps' },
  { name: 'Crunch à l’élastique', muscleGroup: 'Abdominaux', equipment: 'Élastique' },
]

/** Modèles livrés d'origine, repris du design : Push, Pull, Jambes. */
export const CATALOGUE_MODELES: Array<{ name: string; exercices: string[] }> = [
  {
    name: 'Push',
    exercices: [
      'Développé couché',
      'Développé incliné haltères',
      'Dips',
      'Développé militaire',
      'Élévations latérales',
      'Extension triceps à la poulie',
    ],
  },
  {
    name: 'Pull',
    exercices: [
      'Tractions pronation',
      'Rowing barre',
      'Tirage vertical',
      'Face pull',
      'Curl haltères',
    ],
  },
  {
    name: 'Jambes',
    exercices: [
      'Squat',
      'Presse à cuisses',
      'Leg curl',
      'Fentes bulgares',
      'Mollets debout',
    ],
  },
]
