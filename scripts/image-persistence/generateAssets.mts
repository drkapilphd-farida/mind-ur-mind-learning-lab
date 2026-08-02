/* eslint-disable no-console */
// Image Persistence™ — Premium Asset Generator (Sprint 53). Writes the
// static SVG files under public/assets/image-persistence/ from the design
// data in src/features/tratak-intelligence/imagePersistenceAssetKit.ts.
// Committed to the repo (not run-once-and-discarded) so it doubles as the
// project's documented, re-runnable "inversion workflow" — see
// docs/IMAGE_PERSISTENCE_ASSET_PIPELINE.md. Run with:
//
//   node scripts/image-persistence/generateAssets.mts
//
// Requires no dependency beyond Node's own built-in TypeScript support
// (Node 22.6+/23.6+ strips types natively) and the Node built-in `fs`/`path`
// modules — this script is never bundled into the app or imported at runtime.

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildFaceMotifSvg,
  buildMandalaSvg,
  FACE_MOTIF_DESIGNS,
  MANDALA_DESIGNS,
} from '../../src/features/tratak-intelligence/imagePersistenceAssetKit.ts'

const here = dirname(fileURLToPath(import.meta.url))
const publicRoot = join(here, '..', '..', 'public', 'assets', 'image-persistence')

function writeFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content, 'utf8')
  console.log(`wrote ${path}`)
}

for (const design of MANDALA_DESIGNS) {
  writeFile(join(publicRoot, 'mandalas', `${design.id}.svg`), buildMandalaSvg(design, false))
  writeFile(join(publicRoot, 'inverted', 'mandalas', `${design.id}.svg`), buildMandalaSvg(design, true))
}

for (const design of FACE_MOTIF_DESIGNS) {
  writeFile(join(publicRoot, 'human-faces', `${design.id}.svg`), buildFaceMotifSvg(design, false))
  writeFile(join(publicRoot, 'inverted', 'human-faces', `${design.id}.svg`), buildFaceMotifSvg(design, true))
}

writeFile(
  join(publicRoot, 'generated', 'README.md'),
  `# Image Persistence™ — Generated Asset Staging

Drop future real (photorealistic/raster) AI-generated assets here before curating them into
../human-faces/, ../mandalas/, and their ../inverted/ counterparts. See
docs/IMAGE_PERSISTENCE_ASSET_PIPELINE.md for the required resolution, naming convention, and
inversion workflow before adding anything to this folder.
`,
)

console.log(`\nDone: ${MANDALA_DESIGNS.length} mandala designs + ${FACE_MOTIF_DESIGNS.length} face-motif designs, each with an original + pre-generated inverted SVG.`)
