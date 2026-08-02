import { ImageFixationSessionScreen } from '../../imageFixation/ImageFixationSessionScreen'
import { MANDALA_IMAGE_BY_ORDER } from '../../mandalaImages'
import type { MandalaLevelOrder } from '../../mandalaLevels'

type MandalaSessionScreenProps = {
  levelOrder: MandalaLevelOrder
  durationSeconds: number
  onComplete: () => void
}

// A thin, mission-specific wrapper: resolves this level's real mandala
// image and hands everything else to the shared, reusable
// ImageFixationSessionScreen — the piece future missions (Color/Nature/
// Portrait/Candle Persistence) reuse unchanged.
export function MandalaSessionScreen({ levelOrder, durationSeconds, onComplete }: MandalaSessionScreenProps): React.JSX.Element {
  return (
    <ImageFixationSessionScreen
      imageSrc={MANDALA_IMAGE_BY_ORDER[levelOrder]}
      imageAlt={`Mandala Tratak™ Level ${levelOrder} fixation artwork`}
      durationSeconds={durationSeconds}
      onComplete={onComplete}
    />
  )
}
