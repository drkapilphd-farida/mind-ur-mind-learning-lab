import { ImageFixationSessionScreen } from '../../imageFixation/ImageFixationSessionScreen'
import type { ImagePersistenceImageDefinition } from '../../imagePersistencePool'

type ImagePersistenceSessionScreenProps = {
  image: ImagePersistenceImageDefinition
  durationSeconds: number
  onComplete: () => void
  onExit: () => void
}

// A thin wrapper resolving the picked image + its real anchor coordinates,
// mirrors MandalaSessionScreen.tsx — hands everything else to the shared,
// reusable ImageFixationSessionScreen. Sprint 53: premium pool entries carry
// a real pre-generated `invertedSrc` (see imagePersistencePool.ts) that's
// used directly — no CSS filter needed. Legacy entries without one still
// fall back to Sprint 52's CSS `invert` on `src`, so behavior for those is
// unchanged. Mandala's own call site never passes `invert`/`invertedSrc`,
// so Mandala's rendering is unaffected either way.
export function ImagePersistenceSessionScreen({ image, durationSeconds, onComplete, onExit }: ImagePersistenceSessionScreenProps): React.JSX.Element {
  return (
    <ImageFixationSessionScreen
      imageSrc={image.invertedSrc ?? image.src}
      imageAlt={image.alt}
      durationSeconds={durationSeconds}
      onComplete={onComplete}
      anchorXPercent={image.anchorXPercent}
      anchorYPercent={image.anchorYPercent}
      pulse
      anchorSize={5}
      onExit={onExit}
      invert={image.invertedSrc === undefined}
    />
  )
}
