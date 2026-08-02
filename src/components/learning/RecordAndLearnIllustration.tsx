'use client'

import { Mic } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'

// Matches AIPresenceLogo's PRESENCE_GLOW_COLOR — LivingBrainLogo's own
// internal full-color glow hex, reused here (Sprint LW-1C.1) rather than a
// second, invented blue, so Record & Learn™'s "soft blue pulse" reads as
// the same brand accent as the Living AI Symbol™ itself.
const RECORD_GLOW_COLOR = '#4FE0FF'

// Record & Learn™'s "premium microphone illustration" — a large, existing
// lucide-react Mic icon over a soft, breathing radial glow, reusing this
// session's own established calm-breathing-glow idiom (see
// AIPresenceLogo.tsx) rather than commissioning new bespoke SVG artwork.
// Proportionate to a hero-card illustration, not a full brand mark.
export function RecordAndLearnIllustration(): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="relative flex size-24 items-center justify-center" aria-hidden="true">
      {/* Nested opacity — the outer wrapper caps intensity low (opacity-20)
          while the inner div reuses the existing breathing-pulse keyframe
          (which animates its own opacity 0.7→1) — the two compose
          multiplicatively, so the effective glow never exceeds ~0.2, "very
          low intensity... never bright," without a new keyframe. */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 rounded-full opacity-20">
          <div className="size-full rounded-full blur-2xl" style={{ backgroundColor: RECORD_GLOW_COLOR, animation: 'breathing-pulse 5s ease-in-out infinite' }} />
        </div>
      )}
      <Mic className="relative size-12 text-foreground/70" strokeWidth={1.5} />
    </div>
  )
}
