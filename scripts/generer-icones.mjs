/**
 * Génère les PNG de l'icône Fonte à partir du logo du design (un disque de
 * musculation sombre sur carré ambre, une seule couleur d'accent).
 *
 *   node scripts/generer-icones.mjs
 *
 * Deux variantes :
 *  - « any » : coins arrondis, affichée telle quelle par le système.
 *  - « maskable » / apple-touch-icon : fond ambre à bord perdu, parce que le
 *    système applique son propre masque et rognerait des coins transparents.
 */
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const publicDir = fileURLToPath(new URL('../public/', import.meta.url))

/** @param {{ rx: number, disc: number }} forme */
const svg = ({ rx, disc }) => {
  const ring = disc * 0.675
  const hub = disc * 0.225
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="${rx}" fill="#FF9F1C"/>
  <circle cx="60" cy="60" r="${disc}" fill="#1A1204"/>
  <circle cx="60" cy="60" r="${ring}" fill="none" stroke="#FF9F1C" stroke-width="3"/>
  <circle cx="60" cy="60" r="${hub}" fill="#FF9F1C"/>
</svg>`
}

const cibles = [
  { fichier: 'icone-192.png', taille: 192, forme: { rx: 30, disc: 40 } },
  { fichier: 'icone-512.png', taille: 512, forme: { rx: 30, disc: 40 } },
  // Zone sûre maskable : le contenu tient dans le cercle central de 80 %.
  { fichier: 'icone-maskable-512.png', taille: 512, forme: { rx: 0, disc: 34 } },
  { fichier: 'apple-touch-icon.png', taille: 180, forme: { rx: 0, disc: 40 } },
]

const navigateur = await chromium.launch({ args: ['--no-sandbox'] })
try {
  await mkdir(publicDir, { recursive: true })
  for (const { fichier, taille, forme } of cibles) {
    const page = await navigateur.newPage({
      viewport: { width: taille, height: taille },
      deviceScaleFactor: 1,
    })
    await page.setContent(
      `<body style="margin:0"><div style="width:${taille}px;height:${taille}px">${svg(forme)}</div></body>`,
    )
    const png = await page.screenshot({ omitBackground: true })
    await writeFile(new URL(fichier, `file://${publicDir}`), png)
    await page.close()
    console.log(`${fichier} · ${taille}×${taille}`)
  }
} finally {
  await navigateur.close()
}
