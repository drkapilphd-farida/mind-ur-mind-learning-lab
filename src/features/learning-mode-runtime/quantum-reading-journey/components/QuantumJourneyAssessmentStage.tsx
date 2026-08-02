'use client'

import { useMemo } from 'react'
import { AssessmentQuestionScreen } from '@/features/quantum-speed-reading-runtime/assessment/components/AssessmentQuestionScreen'
import type { AssessmentExerciseAsset } from '@/core/universal-learning-engine/exercise-asset-builder'
import { toAssessmentQuestions } from '@/features/learning-mode-runtime/exercise-assets/toAssessmentQuestions'
import { QuantumJourneyEmptyStage } from './QuantumJourneyEmptyStage'

type QuantumJourneyAssessmentStageProps = {
  assessmentAssets: readonly AssessmentExerciseAsset[]
  onComplete: (correctCount: number, total: number) => void
  onSkip: () => void
}

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2. This IS "Reading
// Assessment" for the Quantum Reading Journey™ — AssessmentQuestionScreen
// alone (unmodified), never ReadingAssessmentFlow. ReadingAssessmentFlow/
// buildAssessmentQuestions/qsr_reading_assessments are hard-coupled to the
// pre-signup WPM-pacing assessment (AssessmentPassage[]/
// DocumentComprehensionSignal[]) and stay completely untouched — real
// questions here come from AssessmentAssets.mcqs (Sprint 1, already
// zero-AI) via toAssessmentQuestions (Sprint QSR-1, unmodified).
export function QuantumJourneyAssessmentStage({ assessmentAssets, onComplete, onSkip }: QuantumJourneyAssessmentStageProps): React.JSX.Element {
  const questions = useMemo(() => toAssessmentQuestions(assessmentAssets), [assessmentAssets])

  if (questions.length === 0) {
    return <QuantumJourneyEmptyStage message="This chapter doesn't have enough content yet for a comprehension check." onSkip={onSkip} />
  }

  return <AssessmentQuestionScreen questions={questions} onComplete={(correctCount) => onComplete(correctCount, questions.length)} />
}
