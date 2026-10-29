import { LogoFonte } from '@/components/Icones'

/**
 * Écran de lancement, affiché le temps que la base s'ouvre et que les
 * réglages soient lus. Il porte la promesse de l'appli, pas un sablier.
 */
export function EcranLancement() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-7 bg-bg text-text">
      <LogoFonte taille={128} />
      <div className="flex flex-col items-center gap-2">
        <h1 className="pl-[0.1em] font-display text-d-6xl font-bold uppercase tracking-widest">
          Fonte
        </h1>
        <p className="text-center text-lg text-muted">Note ta série, vois ta progression.</p>
      </div>
      <div
        role="status"
        aria-label="Chargement"
        className="absolute bottom-16 h-1 w-24 overflow-hidden rounded-pill bg-border"
      >
        <div className="h-1 w-10 rounded-pill bg-accent" />
      </div>
    </div>
  )
}
