'use client'

import { VisualActivationPhase } from './VisualActivationPhase'
import { computeVisualActivationXp } from './visualActivationDataset'
import { computePoolExerciseXp, type Phase2PoolExerciseId } from './qsrProCircuitRotation'
import { SchulteGridDrillExperience } from '@/features/schulte-grid-drill/components/SchulteGridDrillExperience'
import { EspZenerTelepathyExperience } from '@/features/esp-zener-telepathy/components/EspZenerTelepathyExperience'
import { PhotographicMemoryExperience } from '@/features/photographic-memory/components/PhotographicMemoryExperience'
import { ColorSceneTransformationExperience } from '@/features/color-scene-transformation/components/ColorSceneTransformationExperience'
import { HemisphericColorSyncExperience } from '@/features/hemispheric-color-sync/components/HemisphericColorSyncExperience'
import { QuantumMentalRotationExperience } from '@/features/quantum-mental-rotation/components/QuantumMentalRotationExperience'
import { QuantumHiddenTargetGridExperience } from '@/features/quantum-hidden-target-grid/components/QuantumHiddenTargetGridExperience'

// A flat XP floor for Schulte Grid specifically — it has no accuracy%
// concept (own real metric is completion time/mistake count, per its own
// doc comment), so awarding via computeVisualActivationXp/
// computePoolExerciseXp would mean fabricating an accuracy number that
// was never measured. Matches MIND_AWAKENING_XP_AWARD's own value —
// UnifiedQuantumSession.tsx's precedent for "this level has no
// accuracy-scaled reward to compute."
const SCHULTE_GRID_FLAT_XP = 50

const POOL_TITLES: Record<Phase2PoolExerciseId, string> = {
  'visual-activation': 'Visual Activation Complete',
  'schulte-grid-drill': 'Peripheral Vision Activator Complete',
  'esp-zener-telepathy': 'Telepathy Sprint Complete',
  'photographic-memory': 'Deep Visualisation Recall Complete',
  'color-scene-transformation': 'Scene Transformation Complete',
  'hemispheric-color-sync': 'Hemispheric Sync Complete',
  'quantum-mental-rotation': 'Mental Rotation Complete',
  'quantum-hidden-target-grid': 'Hidden Target Grid Complete',
}

type RotatingVisualActivationPhaseProps = {
  // Decided once, up front, by UnifiedQuantumSession.tsx (single source
  // of truth — see its own comment on why the pick can't be computed
  // independently in more than one place).
  pickedId: Phase2PoolExerciseId
  // Uniform completion signal every pick normalizes into — mirrors
  // UnifiedQuantumSession.tsx's existing showRewardThenGoTo(title,
  // statLine, xpAwarded, nextPhase) call shape, just sourced here instead
  // of computed inline, since which formula/title applies now depends on
  // which pool member ran.
  onComplete: (xpEarned: number, statLine: string | undefined, title: string) => void
}

// QSR Pro Circuit™ — Phase 2 (Right-Brain / Intuition Kick). Free users
// always get today's exact Visual Activation drill — zero regression
// risk. Pro users rotate across the full Category A pool (7 exercises,
// each already embeddable with zero component changes — 6 of 7 already
// proven in production by QuantumJourneySession.tsx).
export function RotatingVisualActivationPhase({ pickedId, onComplete }: RotatingVisualActivationPhaseProps): React.JSX.Element {
  function handleClassicComplete(accuracyPercent: number, speedScore: number): void {
    onComplete(computeVisualActivationXp(accuracyPercent, speedScore), `${accuracyPercent}% Accuracy • Speed Score ${speedScore}`, POOL_TITLES['visual-activation'])
  }

  function handleAccuracyOnlyComplete(id: Exclude<Phase2PoolExerciseId, 'visual-activation' | 'schulte-grid-drill'>, accuracyPercent: number): void {
    onComplete(computePoolExerciseXp(accuracyPercent), `${accuracyPercent}% Accuracy`, POOL_TITLES[id])
  }

  switch (pickedId) {
    case 'schulte-grid-drill':
      return <SchulteGridDrillExperience onComplete={() => onComplete(SCHULTE_GRID_FLAT_XP, undefined, POOL_TITLES['schulte-grid-drill'])} />
    case 'esp-zener-telepathy':
      return <EspZenerTelepathyExperience onComplete={(accuracyPercent) => handleAccuracyOnlyComplete('esp-zener-telepathy', accuracyPercent)} />
    case 'photographic-memory':
      return <PhotographicMemoryExperience onComplete={(accuracyPercent) => handleAccuracyOnlyComplete('photographic-memory', accuracyPercent)} />
    case 'color-scene-transformation':
      return <ColorSceneTransformationExperience onComplete={(accuracyPercent) => handleAccuracyOnlyComplete('color-scene-transformation', accuracyPercent)} />
    case 'hemispheric-color-sync':
      return <HemisphericColorSyncExperience onComplete={(accuracyPercent) => handleAccuracyOnlyComplete('hemispheric-color-sync', accuracyPercent)} />
    case 'quantum-mental-rotation':
      return <QuantumMentalRotationExperience onComplete={(accuracyPercent) => handleAccuracyOnlyComplete('quantum-mental-rotation', accuracyPercent)} />
    case 'quantum-hidden-target-grid':
      return <QuantumHiddenTargetGridExperience onComplete={(accuracyPercent) => handleAccuracyOnlyComplete('quantum-hidden-target-grid', accuracyPercent)} />
    case 'visual-activation':
    default:
      return <VisualActivationPhase onComplete={handleClassicComplete} />
  }
}
