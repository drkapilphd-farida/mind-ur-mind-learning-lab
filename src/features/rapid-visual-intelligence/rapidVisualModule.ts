// Rapid Visual Intelligence™ module definition.
// Single source of truth for exercise order, titles, routes, and summaries.

export type RapidVisualExercise = {
  exerciseId: string
  title: string
  summary: string
  href: string
  description: string
  trainsAbility: string
}

export const RAPID_VISUAL_MODULE: readonly RapidVisualExercise[] = [
  {
    exerciseId: 'flash-words',
    title: 'Flash Words™',
    summary: 'Recognise single words at decreasing flash durations.',
    href: '/labs/quantum-speed-reading/rapid-visual-intelligence/flash-words',
    description: 'A word appears briefly — identify it before it vanishes. Duration shortens as your recognition sharpens.',
    trainsAbility: 'Word recognition speed',
  },
  {
    exerciseId: 'flash-numbers',
    title: 'Flash Numbers™',
    summary: 'Register multi-digit numbers in a single glance.',
    href: '/labs/quantum-speed-reading/rapid-visual-intelligence/flash-numbers',
    description: 'A number flashes for a fraction of a second. Identify it from four choices. Digit count increases as accuracy improves.',
    trainsAbility: 'Numerical processing speed',
  },
  {
    exerciseId: 'flash-images',
    title: 'Flash Icons™',
    summary: 'Identify visual symbols at high speed.',
    href: '/labs/quantum-speed-reading/rapid-visual-intelligence/flash-images',
    description: 'A visual icon appears briefly — select it from four similar choices. Builds visual discrimination and shape memory.',
    trainsAbility: 'Visual symbol recognition',
  },
  {
    exerciseId: 'flash-symbols',
    title: 'Flash Symbols™',
    summary: 'Distinguish visually similar letters and characters.',
    href: '/labs/quantum-speed-reading/rapid-visual-intelligence/flash-symbols',
    description: 'Visually similar symbols — letters, digits, characters — flash briefly. Correct discrimination trains visual precision.',
    trainsAbility: 'Visual discrimination',
  },
  {
    exerciseId: 'flash-phrases',
    title: 'Flash Phrases™',
    summary: 'Process short phrases in a single glance.',
    href: '/labs/quantum-speed-reading/rapid-visual-intelligence/flash-phrases',
    description: 'A short phrase flashes across your vision. Recognise it entirely before it disappears — phrase length increases with accuracy.',
    trainsAbility: 'Phrase recognition and chunking',
  },
] as const

export const LAB_ID = 'quantum-speed-reading'
export const MODULE_ID = 'rapid-visual-intelligence'
