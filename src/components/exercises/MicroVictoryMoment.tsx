'use client'

import { useRef } from 'react'
import { Check } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { MICRO_VICTORY_HEADLINES, MICRO_VICTORY_MESSAGES, pickMicroVictoryLine } from '@/lib/exercises/microVictoryMessages'
import { cn } from '@/lib/utils'

// Module-level (not React state) so consecutive victories across different
// exercise mounts — e.g. finishing level 1, then level 2 a minute later —
// don't repeat the same line back to back. Resets on a full page reload,
// which is fine: the brief asks for variety within a session, not a
// permanent no-repeat ledger.
let lastHeadline: string | null = null
let lastMessage: string | null = null

type MicroVictoryMomentProps = {
  // Optional small progress readout — e.g. "Level 2 of 5", "Step 3 of 6" —
  // the brief's "1 of 5 Complete" framing, using data the caller already
  // has. Omit when there's nothing meaningful to count (e.g. a single
  // untiered session).
  progressLabel?: string | null
}

// Sprint-13 — Micro Victory System™. The one shared "exercise just ended"
// beat, dropped in front of whatever screen already renders next (a result
// screen, a pass screen, a report screen, the next exercise) — never a
// popup, never confetti, never a reward count-up. A checkmark, one
// headline, one rotating encouraging line, calm motion tokens already used
// elsewhere in the app. Auto-reveals via useMicroVictoryReveal at each call
// site; this component only renders the flash itself.
export function MicroVictoryMoment({ progressLabel }: MicroVictoryMomentProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  const headlineRef = useRef<string | null>(null)
  const messageRef = useRef<string | null>(null)
  if (headlineRef.current === null) {
    headlineRef.current = pickMicroVictoryLine(MICRO_VICTORY_HEADLINES, lastHeadline)
    messageRef.current = pickMicroVictoryLine(MICRO_VICTORY_MESSAGES, lastMessage)
    lastHeadline = headlineRef.current
    lastMessage = messageRef.current
  }

  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center gap-3 text-center',
        !prefersReducedMotion && 'animate-in fade-in zoom-in-95 duration-(--duration-slow) ease-out',
      )}
    >
      <div
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        <Check className="size-6" />
      </div>
      <p className="font-heading text-2xl font-bold tracking-tight text-foreground">{headlineRef.current}</p>
      <p className="text-sm text-muted-foreground">{messageRef.current}</p>
      {progressLabel !== null && progressLabel !== undefined && (
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70">{progressLabel}</p>
      )}
    </div>
  )
}
