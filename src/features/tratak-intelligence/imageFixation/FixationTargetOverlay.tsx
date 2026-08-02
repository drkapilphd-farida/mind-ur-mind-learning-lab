import { cn } from '@/lib/utils'

type FixationTargetOverlayProps = {
  size?: number
  /** Position as a percentage of the container's width/height. Defaults to
   * dead center — Mandala Tratak™'s existing call site doesn't pass these,
   * so its exact current appearance is unchanged. */
  xPercent?: number
  yPercent?: number
  /** Sprint 10F: a very gentle glow pulse every 3.5s (never distracting,
   * never moves/resizes the dot itself). Defaults to false, preserving
   * Mandala's "never animates, never moves" static dot exactly. Callers
   * gate this off usePrefersReducedMotion, same convention as every other
   * animation in this pack. */
  pulse?: boolean
}

// A single, perfectly stable glowing fixation point — composable over any
// mission's background image so the artwork itself never needs a baked-in
// fixation dot. Never moves; optionally pulses its glow very gently.
export function FixationTargetOverlay({ size = 14, xPercent = 50, yPercent = 50, pulse = false }: FixationTargetOverlayProps): React.JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        className={cn(
          'absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300 shadow-[0_0_18px_4px_rgba(252,211,77,0.55)]',
          pulse && 'animate-[anchor-glow-pulse_3.5s_ease-in-out_infinite]',
        )}
        style={{ width: size, height: size, left: `${xPercent}%`, top: `${yPercent}%` }}
      />
    </div>
  )
}
