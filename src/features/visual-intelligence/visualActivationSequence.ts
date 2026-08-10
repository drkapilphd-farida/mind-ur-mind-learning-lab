import type { ExerciseSequenceItem } from '@/lib/exercises/sequence'

// Visual Activation Suite™ — rebuilt as a modern, oculomotor/neural-
// activation-focused suite (see src/components/qsr/visual-activation/),
// replacing the old breath/eye-relaxation/Tratak-persistence sequence
// this file used to define.
//
// Only the exercises that actually exist and are completable are listed
// here, since this export drives REAL paywall gating —
// getModuleProgress('visual-intelligence', VISUAL_ACTIVATION_EXERCISE_IDS)
// decides whether Reading Preparation™/Core Reading Journey™ unlock
// (see quantum-speed-reading/page.tsx, phrase-reading/page.tsx,
// preparation/page.tsx). A stub exercise with no real completion path
// must never appear here, or the gate would become permanently
// impossible to satisfy. Extend this list as more of the suite's 7
// exercises ship. The full planned roster (including not-yet-built ones,
// for the suite's own "coming next" display) lives separately in
// src/components/qsr/visual-activation/visualActivationSuite.ts, which
// is never imported by anything gating-related.
export const VISUAL_ACTIVATION_SEQUENCE: readonly ExerciseSequenceItem[] = [
  {
    exerciseId: 'theta-breathing-anchor',
    title: 'Theta Breathing & Focal Anchor',
    summary: 'A calming alpha/theta breathing warm-up with a synchronized glowing focal anchor.',
    href: '/labs/visual-intelligence/visual-activation',
  },
]

export const VISUAL_ACTIVATION_EXERCISE_IDS = VISUAL_ACTIVATION_SEQUENCE.map((item) => item.exerciseId)
