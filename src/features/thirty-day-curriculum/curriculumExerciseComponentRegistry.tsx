'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

export type EmbeddableExerciseProps = { onComplete: () => void }

// Every registry entry is lazy-loaded (next/dynamic, ssr: false) — the
// wizard only ever mounts ONE of these 41 heavy exercise engines at a
// time, so eagerly importing all 41 into the curriculum route's bundle
// would be real, avoidable bloat. Cast through `unknown`: the real
// components' onComplete signatures vary (`() => void`,
// `(accuracyPercent: number) => void`, `(result, estimatedWpm) => void`,
// etc.) — TypeScript already allows a caller to pass a zero-arg function
// wherever more parameters are declared (verified throughout this
// feature's own components), so this is a real, safe compatibility, not
// a loophole; the cast just lets the registry hold one uniform type
// instead of 41 bespoke ones.
function lazy(importFn: () => Promise<{ default: ComponentType<never> }>): ComponentType<EmbeddableExerciseProps> {
  return dynamic(importFn, { ssr: false }) as unknown as ComponentType<EmbeddableExerciseProps>
}

function lazyNamed<T extends ComponentType<never>>(importFn: () => Promise<Record<string, T>>, exportName: string): ComponentType<EmbeddableExerciseProps> {
  return lazy(() => importFn().then((mod) => ({ default: mod[exportName] as ComponentType<never> })))
}

// Brain Gym — 10 Visual Activation Suite ids all share ONE component
// (no deep-linking to a single drill exists — see that component's own
// doc comment); the wizard renders the full suite as that day's Brain
// Gym step regardless of which of the 10 the day's plan nominally named.
const VISUAL_ACTIVATION_SUITE_COMPONENT = lazyNamed(
  () => import('@/components/qsr/visual-activation/VisualActivationSuiteExperience'),
  'VisualActivationSuiteExperience',
)

export const CURRICULUM_EMBEDDABLE_COMPONENTS: Readonly<Record<string, ComponentType<EmbeddableExerciseProps>>> = {
  'theta-breathing-anchor': VISUAL_ACTIVATION_SUITE_COMPONENT,
  'cardinal-oculomotor-stretches': VISUAL_ACTIVATION_SUITE_COMPONENT,
  'infinity-figure-eight-gliding': VISUAL_ACTIVATION_SUITE_COMPONENT,
  'peripheral-flash-expander': VISUAL_ACTIVATION_SUITE_COMPONENT,
  'quantum-tachistoscope-multi-word-blast': VISUAL_ACTIVATION_SUITE_COMPONENT,
  'aura-edge-color-pulsing': VISUAL_ACTIVATION_SUITE_COMPONENT,
  'blink-trigger-micro-recall': VISUAL_ACTIVATION_SUITE_COMPONENT,
  'tratak-afterimage-stretches': VISUAL_ACTIVATION_SUITE_COMPONENT,
  'schulte-grid-speed-drill': VISUAL_ACTIVATION_SUITE_COMPONENT,
  'rapid-visual-span-expander': VISUAL_ACTIVATION_SUITE_COMPONENT,

  'saccadic-eye-jump': lazyNamed(() => import('@/features/brain-gym/components/SaccadicEyeJumpExperience'), 'SaccadicEyeJumpExperience'),
  'cross-lateral-tap': lazyNamed(() => import('@/features/brain-gym/components/CrossLateralTapExperience'), 'CrossLateralTapExperience'),
  'fast-pattern-blinking': lazyNamed(() => import('@/features/brain-gym/components/FastPatternBlinkingExperience'), 'FastPatternBlinkingExperience'),
  'peripheral-expanding-circle': lazyNamed(
    () => import('@/features/brain-gym/components/PeripheralExpandingCircleExperience'),
    'PeripheralExpandingCircleExperience',
  ),
  'brain-gym-circuit': lazyNamed(() => import('@/features/brain-gym/components/BrainGymCircuitExperience'), 'BrainGymCircuitExperience'),

  // Right-Brain / Intuition
  'photographic-memory': lazyNamed(() => import('@/features/photographic-memory/components/PhotographicMemoryExperience'), 'PhotographicMemoryExperience'),
  'pictorial-essence-sprint': lazyNamed(
    () => import('@/features/pictorial-essence-sprint/components/PictorialEssenceSprintExperience'),
    'PictorialEssenceSprintExperience',
  ),
  'hemispheric-color-sync': lazyNamed(
    () => import('@/features/hemispheric-color-sync/components/HemisphericColorSyncExperience'),
    'HemisphericColorSyncExperience',
  ),
  'after-image-gazing': lazyNamed(() => import('@/features/after-image-gazing/components/AfterImageGazingExperience'), 'AfterImageGazingExperience'),
  'dot-memory-grid': lazyNamed(() => import('@/features/dot-memory-grid/components/DotMemoryGridExperience'), 'DotMemoryGridExperience'),
  'number-flash-grid': lazyNamed(() => import('@/features/number-flash-grid/components/NumberFlashGridExperience'), 'NumberFlashGridExperience'),
  'word-flash-grid': lazyNamed(() => import('@/features/word-flash-grid/components/WordFlashGridExperience'), 'WordFlashGridExperience'),
  'image-flash-grid': lazyNamed(() => import('@/features/image-flash-grid/components/ImageFlashGridExperience'), 'ImageFlashGridExperience'),
  'esp-zener-telepathy-sprint': lazyNamed(() => import('@/features/esp-zener-telepathy/components/EspZenerTelepathyExperience'), 'EspZenerTelepathyExperience'),
  'quantum-hidden-target-grid': lazyNamed(
    () => import('@/features/quantum-hidden-target-grid/components/QuantumHiddenTargetGridExperience'),
    'QuantumHiddenTargetGridExperience',
  ),

  // Visualization
  'quantum-mental-rotation': lazyNamed(
    () => import('@/features/quantum-mental-rotation/components/QuantumMentalRotationExperience'),
    'QuantumMentalRotationExperience',
  ),
  'color-scene-transformation': lazyNamed(
    () => import('@/features/color-scene-transformation/components/ColorSceneTransformationExperience'),
    'ColorSceneTransformationExperience',
  ),
  'sensory-hologram-builder': lazyNamed(
    () => import('@/features/sensory-hologram-builder/components/SensoryHologramBuilderExperience'),
    'SensoryHologramBuilderExperience',
  ),
  'fluid-energy-balancer': lazyNamed(() => import('@/features/fluid-energy-balancer/components/FluidEnergyBalancerExperience'), 'FluidEnergyBalancerExperience'),

  // Reading Hub
  'dynamic-chunk-sliding': lazyNamed(() => import('@/features/dynamic-chunk-sliding/components/DynamicChunkSlidingExperience'), 'DynamicChunkSlidingExperience'),
  'vertical-chunk-sliding': lazyNamed(() => import('@/features/vertical-chunk-sliding/components/VerticalChunkSlidingExperience'), 'VerticalChunkSlidingExperience'),
  'flash-recall-sprint': lazyNamed(() => import('@/features/flash-recall-sprint/components/FlashRecallSprintExperience'), 'FlashRecallSprintExperience'),
  'vertical-flash-recall': lazyNamed(() => import('@/features/vertical-flash-recall/components/VerticalFlashRecallExperience'), 'VerticalFlashRecallExperience'),
  'vertical-word-reading': lazyNamed(() => import('@/features/vertical-word-reading/components/VerticalWordReadingExperience'), 'VerticalWordReadingExperience'),
  'phrase-reading-mode': lazyNamed(() => import('@/features/phrase-reading-mode/components/PhraseReadingModeExperience'), 'PhraseReadingModeExperience'),
  'sentence-reading-mode': lazyNamed(() => import('@/features/sentence-reading-mode/components/SentenceReadingModeExperience'), 'SentenceReadingModeExperience'),
  'paragraph-reading-mode': lazyNamed(() => import('@/features/paragraph-reading-mode/components/ParagraphReadingModeExperience'), 'ParagraphReadingModeExperience'),
  'guided-paragraph-reading-mode': lazyNamed(
    () => import('@/features/guided-paragraph-reading-mode/components/GuidedParagraphReadingModeExperience'),
    'GuidedParagraphReadingModeExperience',
  ),
  'subvocalization-destroyer': lazyNamed(
    () => import('@/features/subvocalization-destroyer/components/SubvocalizationDestroyerExperience'),
    'SubvocalizationDestroyerExperience',
  ),
  'photographic-reading': lazyNamed(() => import('@/features/photographic-reading/components/PhotographicReadingExperience'), 'PhotographicReadingExperience'),
  'dual-stream-split-reader': lazyNamed(
    () => import('@/features/dual-stream-split-reader/components/DualStreamSplitReaderExperience'),
    'DualStreamSplitReaderExperience',
  ),
}

export function getEmbeddableComponent(exerciseId: string): ComponentType<EmbeddableExerciseProps> | undefined {
  return CURRICULUM_EMBEDDABLE_COMPONENTS[exerciseId]
}
