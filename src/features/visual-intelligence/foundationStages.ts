// Visual Intelligence Lab™ — Foundation Journey™.
// Sprint-1 established this as the single source of truth for stage
// content. Sprint-2 (Experience Engine™) extends it with the richer
// content each stage's guided experience needs — still no exercise
// engine, timer, or scoring: `guidedSteps` describes guidance copy only,
// never a real measured activity.

import { Eye, Target, Focus, Sparkles, TrendingUp, type LucideIcon } from 'lucide-react'

export type FoundationStageId = 'eye-activation' | 'focus-lock' | 'image-persistence' | 'visual-expansion' | 'reading-flow'

export type GuidedStep = {
  title: string
  description: string
}

export type FoundationStage = {
  id: FoundationStageId
  order: 1 | 2 | 3 | 4 | 5
  title: string
  /** One-line hook for the Sprint-1 home preview card. */
  summary: string
  /** Intro screen's one-line hook — distinct from `summary`. */
  subtitle: string
  /** Intro screen's "small explanation" / Purpose card body. */
  purpose: string
  /** Benefits card bullets. */
  benefits: readonly string[]
  /** Short, calm motivational line shown on the intro screen. */
  quote: string
  /** Guided flow steps — variable length (1 for Stage 3, 3 elsewhere); one shared component handles both. */
  guidedSteps: readonly GuidedStep[]
  completionTitle: string
  completionSubtitle: string
  estimatedDuration: string
  icon: LucideIcon
}

export const FOUNDATION_JOURNEY_STAGES: readonly FoundationStage[] = [
  {
    id: 'eye-activation',
    order: 1,
    title: 'Eye Activation™',
    summary: 'Prepare your eyes before training begins.',
    subtitle: 'Wake up your visual system before beginning today’s journey.',
    purpose: 'This stage gently prepares your eye muscles for focused visual work.',
    benefits: ['Eye relaxation', 'Better comfort', 'Improved readiness'],
    quote: 'A calm start leads to a focused session.',
    guidedSteps: [
      { title: 'Warm-up', description: 'Loosen up your eyes with easy, continuous motion.' },
      { title: 'Stretch', description: 'Gently extend how far your eyes can comfortably move.' },
      { title: 'Blink Awareness', description: 'Reset with slow, deliberate blinks.' },
    ],
    completionTitle: 'Eyes Fully Activated',
    completionSubtitle: 'Visual system activated.',
    estimatedDuration: '60 Seconds',
    icon: Eye,
  },
  {
    id: 'focus-lock',
    order: 2,
    title: 'Focus Lock™',
    summary: 'Train steady eye fixation on a single point.',
    subtitle: 'Train your eyes to hold steady, focused attention.',
    purpose: 'Builds the ability to hold your gaze steady — the foundation of visual stability.',
    benefits: ['Steadier gaze', 'Reduced eye strain', 'Sharper attention'],
    quote: 'Stillness sharpens focus.',
    guidedSteps: [
      { title: 'Eye Stability', description: 'Practice holding your gaze steady on a single point.' },
      { title: 'Attention Lock', description: 'Train sustained attention without distraction.' },
      { title: 'Fixation Preparation', description: 'Prepare for focused visual fixation ahead.' },
    ],
    completionTitle: 'Focus Improved',
    completionSubtitle: 'Your fixation training experience is complete.',
    estimatedDuration: '45 Seconds',
    icon: Target,
  },
  {
    id: 'image-persistence',
    order: 3,
    title: 'Image Persistence Challenge™',
    summary: 'Sustain visual focus after an image disappears.',
    subtitle: 'Prepare your visual system for sustained fixation.',
    purpose: 'Train visual attention before image practice.',
    benefits: ['Sustained visual attention', 'Stronger mental imagery', 'Calm, focused observation'],
    quote: 'What the eyes hold, the mind remembers.',
    guidedSteps: [
      { title: 'Future Session', description: 'You will observe carefully, close your eyes, and notice temporary visual impressions.' },
    ],
    completionTitle: 'Visual Memory Strengthened',
    completionSubtitle: 'You’re ready for the real challenge in a future sprint.',
    estimatedDuration: '90-120 sec',
    icon: Focus,
  },
  {
    id: 'visual-expansion',
    order: 4,
    title: 'Visual Expansion™',
    summary: 'Widen peripheral awareness and eye span.',
    subtitle: 'Expand your peripheral awareness and eye span.',
    purpose: 'Expands how much you can take in at once without moving your eyes.',
    benefits: ['Wider peripheral vision', 'Reduced eye movement', 'Faster visual intake'],
    quote: 'See more without moving your eyes.',
    guidedSteps: [
      { title: 'Peripheral Awareness', description: 'Notice what appears at the edge of your vision.' },
      { title: 'Visual Span', description: 'Practice taking in more at a single glance.' },
      { title: 'Reading Window', description: 'Prepare the visual window real reading will use.' },
    ],
    completionTitle: 'Peripheral Awareness Ready',
    completionSubtitle: 'Your visual span training experience is complete.',
    estimatedDuration: '60 Seconds',
    icon: Sparkles,
  },
  {
    id: 'reading-flow',
    order: 5,
    title: 'Reading Flow™',
    summary: 'Prepare smooth, forward-moving reading habits.',
    subtitle: 'Prepare smooth reading movement.',
    purpose: 'Introduces regression control and smooth pursuit — the bridge into real reading practice.',
    benefits: ['Smoother eye movement', 'Fewer backtracks', 'Reading-ready rhythm'],
    quote: 'Reading flows forward, never back.',
    guidedSteps: [
      { title: 'Regression Awareness', description: 'Notice the habit of re-reading, without judgment.' },
      { title: 'Eye Movement Preparation', description: 'Prepare for smooth, forward-moving pursuit.' },
      { title: 'Reading Rhythm', description: 'Find a steady rhythm before real reading begins.' },
    ],
    completionTitle: 'Reading Flow Ready',
    completionSubtitle: 'You’re ready to bring this rhythm into real reading.',
    estimatedDuration: '90-120 sec',
    icon: TrendingUp,
  },
] as const
