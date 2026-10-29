/** Préférence de thème telle que l'utilisateur la choisit dans les réglages. */
export type ThemePreference = 'system' | 'dark' | 'light'

/** Thème réellement appliqué au document. */
export type ResolvedTheme = 'dark' | 'light'

const MIRROR_KEY = 'fonte.theme'

export function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? systemTheme() : preference
}

/**
 * Applique le thème au document et met à jour le miroir localStorage lu par
 * le script d'amorçage de index.html. La base reste la source de vérité ;
 * ce miroir ne sert qu'à éviter un flash au prochain démarrage.
 */
export function applyTheme(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference)
  document.documentElement.setAttribute('data-theme', resolved)
  try {
    localStorage.setItem(MIRROR_KEY, resolved)
  } catch {
    // Navigation privée ou stockage bloqué : le thème reste correct pour
    // cette session, seul le pré-rendu du prochain démarrage est perdu.
  }
  return resolved
}

/**
 * Suit les changements de préférence système tant que l'utilisateur est en
 * mode « système ». Renvoie la fonction de désabonnement.
 */
export function watchSystemTheme(onChange: (theme: ResolvedTheme) => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const query = window.matchMedia('(prefers-color-scheme: light)')
  const handler = (): void => onChange(query.matches ? 'light' : 'dark')
  query.addEventListener('change', handler)
  return () => query.removeEventListener('change', handler)
}
