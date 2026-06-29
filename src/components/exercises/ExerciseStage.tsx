import { REDUCED_MOTION_CAPTION } from './exerciseStyles'

type ExerciseStageProps = {
  children: React.ReactNode
  caption?: string
}

// Spread-ready `caption` prop for the reduced-motion case — exists so call
// sites never retype the conditional-spread idiom or the caption string.
export function getReducedMotionCaptionProps(
  prefersReducedMotion: boolean,
): { caption: string } | Record<string, never> {
  return prefersReducedMotion ? { caption: REDUCED_MOTION_CAPTION } : {}
}

// A responsive, centered, container-query-sized box for visual exercises
// (eye-tracking motion today; any future centered-visual drill can reuse it).
// `cqmin` units inside `children` resolve against this box, not the
// viewport, so motion amplitude scales correctly on any screen size.
export function ExerciseStage({ children, caption }: ExerciseStageProps): React.JSX.Element {
  return (
    <div
      className="relative flex aspect-square w-full max-w-sm items-center justify-center sm:max-w-md"
      style={{ containerType: 'size' }}
    >
      {caption !== undefined && (
        <p className="absolute inset-x-4 top-0 text-center text-xs text-muted-foreground">{caption}</p>
      )}
      {children}
    </div>
  )
}
