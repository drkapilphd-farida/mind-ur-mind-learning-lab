'use client'

// Sprint LW-1A — Arrival Experience™. Shared "living premium background"
// for both /welcome screens (Arrival Experience™ and Learning Goal™) —
// extracted so neither screen duplicates this markup. Neutral-toned only
// (this app's --primary/--accent/--foreground tokens are grayscale, no
// colour system exists — confirmed in an earlier sprint), matching the
// brief's own "avoid bright colours." Purely decorative, `aria-hidden`.

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'

const PARTICLES = [
  { top: '18%', left: '12%', size: 10, delay: 0 },
  { top: '30%', left: '82%', size: 14, delay: 1.4 },
  { top: '68%', left: '20%', size: 8, delay: 2.8 },
  { top: '78%', left: '70%', size: 12, delay: 0.7 },
  { top: '48%', left: '48%', size: 6, delay: 2.1 },
] as const

export function ArrivalBackground(): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-background to-background" />

      <div
        className="absolute -top-1/4 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-foreground/[0.05] blur-3xl"
        style={!prefersReducedMotion ? { animation: 'arrival-ambient-drift 18s ease-in-out infinite' } : undefined}
      />

      {/* Sprint LW-1C.1 — a second, independent wash (different position,
          size, duration, and direction) so the two overlap and drift out of
          phase with each other, reading as soft aurora-like depth — still
          pure monochrome (no new colour), still slow enough that no single
          frame reads as "something moving." */}
      <div
        className="absolute -bottom-1/3 right-0 size-[30rem] rounded-full bg-foreground/[0.035] blur-3xl"
        style={
          !prefersReducedMotion
            ? { animation: 'arrival-ambient-drift 26s ease-in-out infinite', animationDirection: 'reverse', animationDelay: '-6s' }
            : undefined
        }
      />

      {!prefersReducedMotion &&
        PARTICLES.map((particle, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-foreground/20"
            style={{
              top: particle.top,
              left: particle.left,
              width: particle.size,
              height: particle.size,
              animation: `arrival-particle-float ${7 + particle.delay}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
    </div>
  )
}
