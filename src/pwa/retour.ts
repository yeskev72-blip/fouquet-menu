/**
 * Retour de fin de repos : vibration et petit bip.
 *
 * Les notifications en arrière-plan ne sont pas fiables sur une PWA (iOS ne
 * les délivre pas pour un site non installé, Android les coupe quand l'onglet
 * dort). On ne s'appuie donc que sur ce qui marche au premier plan, et le
 * chrono affiche le temps écoulé au retour dans l'appli.
 */

export function vibrer(motif: number | number[] = [120, 60, 120]): void {
  try {
    navigator.vibrate?.(motif)
  } catch {
    // Pas de vibreur, ou geste utilisateur manquant : sans gravité.
  }
}

let contexte: AudioContext | null = null

function contexteAudio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Constructeur =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Constructeur) return null
  contexte ??= new Constructeur()
  return contexte
}

/**
 * Prépare le contexte audio pendant un geste de l'utilisateur. Sans cela,
 * iOS refuse de jouer le bip quand le repos se termine tout seul.
 */
export function preparerSon(): void {
  const ctx = contexteAudio()
  if (ctx && ctx.state === 'suspended') void ctx.resume().catch(() => {})
}

export function biper(): void {
  const ctx = contexteAudio()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {})

  const maintenant = ctx.currentTime
  const oscillateur = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillateur.type = 'sine'
  oscillateur.frequency.setValueAtTime(880, maintenant)
  // Attaque courte puis extinction : un bip sec, pas une alarme.
  gain.gain.setValueAtTime(0, maintenant)
  gain.gain.linearRampToValueAtTime(0.25, maintenant + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, maintenant + 0.35)

  oscillateur.connect(gain).connect(ctx.destination)
  oscillateur.start(maintenant)
  oscillateur.stop(maintenant + 0.36)
}

export function signalerFinDeRepos(): void {
  vibrer()
  biper()
}
