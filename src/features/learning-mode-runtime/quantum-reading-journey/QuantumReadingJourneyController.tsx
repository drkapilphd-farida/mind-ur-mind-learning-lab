'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { SessionResumeBanner } from '@/features/learning-mode-runtime/components'
import { useQuantumReadingJourneyController } from './useQuantumReadingJourneyController'
import { QuantumJourneyLoadingScreen } from './components/QuantumJourneyLoadingScreen'
import { QuantumJourneyErrorScreen } from './components/QuantumJourneyErrorScreen'
import { QuantumJourneyChapterReadyScreen } from './components/QuantumJourneyChapterReadyScreen'
import { QuantumJourneyChapterCompleteScreen } from './components/QuantumJourneyChapterCompleteScreen'
import { QuantumJourneyStageDots } from './components/QuantumJourneyStageDots'
import { QuantumJourneyWordFlashStage } from './components/QuantumJourneyWordFlashStage'
import { QuantumJourneyChunkReadingStage } from './components/QuantumJourneyChunkReadingStage'
import { QuantumJourneyPhraseStage } from './components/QuantumJourneyPhraseStage'
import { QuantumJourneySentenceStage } from './components/QuantumJourneySentenceStage'
import { QuantumJourneyParagraphStage } from './components/QuantumJourneyParagraphStage'
import { QuantumJourneyReadingSprintStage } from './components/QuantumJourneyReadingSprintStage'
import { QuantumJourneyAssessmentStage } from './components/QuantumJourneyAssessmentStage'

type QuantumReadingJourneyControllerProps = {
  documentId: string
  projectId: string
  initialChapterOrder?: number
  onExitToHome: () => void
}

const STAGE_STEP_INDEX: Partial<Record<string, number>> = {
  'transition-to-word-flash': 0,
  'word-flash': 0,
  'transition-to-chunk-reading': 1,
  'chunk-reading': 1,
  'transition-to-phrase-reading': 2,
  'phrase-reading': 2,
  'transition-to-sentence-reading': 3,
  'sentence-reading': 3,
  'transition-to-paragraph-reading': 4,
  'paragraph-reading': 4,
  'transition-to-reading-sprint': 5,
  'reading-sprint': 5,
  'transition-to-assessment': 6,
  assessment: 6,
}

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2 (Reading Experience
// Integration™), polished in Sprint QSR-2.5 (Reading Journey UX &
// Navigation™). One component tree, conditional render, no route change
// between stages. The 5-stage persisted state machine
// (useQuantumReadingJourneyController) is untouched this sprint — every
// change here is presentational: warmer transition/loading copy, a
// within-chapter step indicator, a real completion summary, and a
// friendlier error/recovery frame.
export function QuantumReadingJourneyController({ documentId, projectId, initialChapterOrder, onExitToHome }: QuantumReadingJourneyControllerProps): React.JSX.Element {
  const controller = useQuantumReadingJourneyController(documentId, initialChapterOrder)
  const { state } = controller
  const [resumeBannerDismissed, setResumeBannerDismissed] = useState(false)

  if (state.kind === 'loading') return <QuantumJourneyLoadingScreen label="Organising this chapter…" />
  if (state.kind === 'error') return <QuantumJourneyErrorScreen message={state.message} onRetry={controller.retry} onReturnToDashboard={onExitToHome} />

  const {
    uiStage,
    wordAssets,
    documentWordAssets,
    chunkAssets,
    documentChunkAssets,
    assessmentAssets,
    paragraphAssets,
    documentPhraseAssets,
    documentSentenceAssets,
    chapterContent,
    chapterOrder,
    totalChapters,
    documentTitle,
    assessmentScore,
    didResume,
    readingTimeMinutes,
  } = state
  const stepIndex = STAGE_STEP_INDEX[uiStage]

  return (
    <div className="space-y-8">
      {uiStage !== 'chapter-ready' && uiStage !== 'chapter-complete' && (
        <div className="flex items-center justify-between">
          <button onClick={onExitToHome} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Exit
          </button>
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {totalChapters > 1 ? `Chapter ${chapterOrder + 1} of ${totalChapters}` : 'Reading Journey'}
          </span>
          <span className="w-10" aria-hidden="true" />
        </div>
      )}

      {stepIndex !== undefined && <QuantumJourneyStageDots currentStepIndex={stepIndex} />}

      {didResume && !resumeBannerDismissed && uiStage !== 'chapter-ready' && uiStage !== 'chapter-complete' && <SessionResumeBanner onDismiss={() => setResumeBannerDismissed(true)} />}

      <div key={uiStage} className="animate-in fade-in duration-300">
        {uiStage === 'chapter-ready' && (
          <QuantumJourneyChapterReadyScreen
            chapterTitle={totalChapters > 1 ? `${documentTitle} · Chapter ${chapterOrder + 1}` : documentTitle}
            wordCount={wordAssets.length}
            chunkCount={chunkAssets.length}
            questionCount={assessmentAssets.length}
            onStart={controller.startChapter}
          />
        )}
        {uiStage === 'transition-to-word-flash' && <QuantumJourneyLoadingScreen label="Preparing important words…" />}

        {uiStage === 'word-flash' && (
          <QuantumJourneyWordFlashStage projectId={projectId} wordAssets={documentWordAssets} onComplete={controller.handleWordFlashComplete} onSkip={() => controller.skipStage('word-flash')} />
        )}
        {uiStage === 'transition-to-chunk-reading' && <QuantumJourneyLoadingScreen label="Great! Now let's read meaningful chunks." />}

        {uiStage === 'chunk-reading' && (
          <QuantumJourneyChunkReadingStage projectId={projectId} chunkAssets={documentChunkAssets} onComplete={controller.handleChunkReadingComplete} onSkip={() => controller.skipStage('chunk-reading')} />
        )}
        {uiStage === 'transition-to-phrase-reading' && <QuantumJourneyLoadingScreen label="Now let's explore meaningful phrases." />}

        {uiStage === 'phrase-reading' && (
          <QuantumJourneyPhraseStage projectId={projectId} phraseAssets={documentPhraseAssets} onComplete={controller.handlePhraseReadingComplete} onSkip={() => controller.skipStage('phrase-reading')} />
        )}
        {uiStage === 'transition-to-sentence-reading' && <QuantumJourneyLoadingScreen label="Great! Now the key sentences." />}

        {uiStage === 'sentence-reading' && (
          <QuantumJourneySentenceStage
            projectId={projectId}
            chapterId={`${documentId}-chapter-${chapterOrder}`}
            sentenceAssets={documentSentenceAssets}
            onComplete={controller.handleSentenceReadingComplete}
            onSkip={() => controller.skipStage('sentence-reading')}
          />
        )}
        {uiStage === 'transition-to-paragraph-reading' && <QuantumJourneyLoadingScreen label="Let's reflect on the key ideas." />}

        {uiStage === 'paragraph-reading' && <QuantumJourneyParagraphStage paragraphAssets={paragraphAssets} onComplete={controller.handleParagraphReadingComplete} />}
        {uiStage === 'transition-to-reading-sprint' && <QuantumJourneyLoadingScreen label="Time for a Reading Sprint." />}

        {uiStage === 'reading-sprint' && (
          <QuantumJourneyReadingSprintStage chapterContent={chapterContent} onComplete={controller.handleReadingSprintComplete} onSkip={() => controller.skipStage('reading-sprint')} />
        )}
        {uiStage === 'transition-to-assessment' && <QuantumJourneyLoadingScreen label="Excellent. Let's check understanding." />}

        {uiStage === 'assessment' && (
          <QuantumJourneyAssessmentStage assessmentAssets={assessmentAssets} onComplete={controller.handleAssessmentComplete} onSkip={() => controller.skipStage('assessment')} />
        )}
        {uiStage === 'transition-to-complete' && <QuantumJourneyLoadingScreen label="Wrapping up this chapter…" />}

        {uiStage === 'chapter-complete' && (
          <QuantumJourneyChapterCompleteScreen
            assessmentScore={assessmentScore}
            wordsCovered={wordAssets.length}
            readingTimeMinutes={readingTimeMinutes}
            chaptersCompleted={chapterOrder + 1}
            totalChapters={totalChapters}
            hasNextChapter={chapterOrder + 1 < totalChapters}
            onNextChapter={controller.goToNextChapter}
            onGoHome={onExitToHome}
          />
        )}
      </div>
    </div>
  )
}
