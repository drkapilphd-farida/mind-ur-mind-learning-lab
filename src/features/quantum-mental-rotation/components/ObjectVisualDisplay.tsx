'use client'

import type { CubeState, ObjectSkin } from '../quantumMentalRotationDataset'
import { getColorSwatch } from '../quantumMentalRotationDataset'

type Dimensions = { width: number; depth: number; height: number }

// Two visual skins sharing the identical 3-face rendering — a true cube
// (equal width/depth/height) and a taller crystal/prism shard (narrower
// footprint, taller) — genuine visual variety from the same real CSS 3D
// structure, not a re-skinned image swap.
function getSkinDimensions(skin: ObjectSkin): Dimensions {
  if (skin === 'prism') return { width: 76, depth: 76, height: 132 }
  return { width: 96, depth: 96, height: 96 }
}

type ObjectVisualDisplayProps = {
  skin: ObjectSkin
  state: CubeState
}

// Renders only the 3 faces a fixed camera angle can ever actually show
// (top/front/right) — the standard CSS 3D cube pattern (perspective +
// preserve-3d on the group, each face positioned via translateZ to its
// own half-depth, with rotateX(90deg) for the top face and rotateY(90deg)
// for the right face). Bottom/back/left are never rendered at all, since
// they'd never be visible from this angle regardless.
export function ObjectVisualDisplay({ skin, state }: ObjectVisualDisplayProps): React.JSX.Element {
  const { width, depth, height } = getSkinDimensions(skin)
  const frontColor = getColorSwatch(state.front).hex
  const rightColor = getColorSwatch(state.right).hex
  const topColor = getColorSwatch(state.top).hex

  return (
    <div className="flex size-56 items-center justify-center sm:size-64" style={{ perspective: '700px' }}>
      <div
        style={{
          position: 'relative',
          width: `${width}px`,
          height: `${height}px`,
          transformStyle: 'preserve-3d',
          transform: 'rotateX(-20deg) rotateY(-35deg)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: frontColor,
            transform: `translateZ(${depth / 2}px)`,
            borderRadius: '6px',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: `${depth}px`,
            height: `${height}px`,
            backgroundColor: rightColor,
            transform: `rotateY(90deg) translateZ(${width / 2}px)`,
            borderRadius: '6px',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: `${width}px`,
            height: `${depth}px`,
            backgroundColor: topColor,
            transform: `rotateX(90deg) translateZ(${height / 2}px)`,
            borderRadius: '6px',
          }}
        />
      </div>
    </div>
  )
}
