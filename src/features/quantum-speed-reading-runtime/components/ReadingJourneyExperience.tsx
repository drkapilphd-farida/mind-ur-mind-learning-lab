'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getNextStage } from '@/core/universal-learning-engine/reading-experience'
import type { ReadingSession, ReadingSessionProgress } from '@/core/universal-learning-engine/reading-experience'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { startIntelligentReadingSession } from '../actions/startIntelligentReadingSession'
import { advanceIntelligentReadingStage } from '../actions/advanceIntelligentReadingStage'
import type { IntelligentReadingSessionResult, StartReadingJourneyResult } from '../types/IntelligentReadingSessionResult'
import { JourneyProgressDots } from './reading-journey/JourneyProgressDots'
import { ChapterReadyScreen } from './reading-journey/ChapterReadyScreen'
import { KeywordWarmupScreen } from './reading-journey/KeywordWarmupScreen'
import { WordJourneyScreen } from './reading-journey/WordJourneyScreen'
import { PhraseJourneyScreen } from './reading-journey/PhraseJourneyScreen'
import { SentenceJourneyScreen } from './reading-journey/SentenceJourneyScreen'
import { ParagraphJourneyScreen } from './reading-journey/ParagraphJourneyScreen'
import { FullChapterReadingScreen } from './reading-journey/FullChapterReadingScreen'
import { CelebrationScreen } from './reading-journey/CelebrationScreen'

type ReadingJourneyExperienceProps = {
  documentId: string
  documentTitle: string
  projectId: string
  onComplete?: () => void
}

// Every screen the journey moves through, in real, fixed order. The
// two intro screens are purely presentational (no real Reading Session
// stage corresponds to them); the five that follow map 1:1 onto the
// Reading Experience Engine's own real, unchanged six stages
// (word/phrase/sentence/paragraph/chapter/completion) — 'full-chapter'
// re-skins what the 'chapter' stage shows (real original text instead of
// a concepts recap) and 'celebration' re-skins 'completion'. The real
// stage taxonomy itself is never touched.
const JOURNEY_SCREENS = ['chapter-ready', 'keyword-warmup', 'word', 'phrase', 'sentence', 'paragraph', 'full-chapter', 'celebration'] as const
type JourneyScreen = (typeof JOURNEY_SCREENS)[number]

type ReadyState = {
  kind: 'ready'
  session: ReadingSession
  progress: ReadingSessionProgress
  chapterOrder: number
  totalChapters: number
  chapterFullText: string | null
  screen: JourneyScreen
}

type LocalState = { kind: 'loading' } | { kind: 'error'; message: string } | ReadyState

function resolveScreenFromRealStage(session: ReadingSession, progress: ReadingSessionProgress): JourneyScreen {
  const stage = getNextStage(session, progress)
  if (!stage) return 'celebration'
  if (stage.type === 'word') return 'word'
  if (stage.type === 'phrase') return 'phrase'
  if (stage.type === 'sentence') return 'sentence'
  if (stage.type === 'paragraph') return 'paragraph'
  if (stage.type === 'chapter') return 'full-chapter'
  return 'celebration'
}

// Reading Journey Experience™ (Sprint-5). Replaces Sprint-4/4.5's
// "Intelligent Reading" presentation layer entirely, per this sprint's
// own explicit product brief: the Reading Experience Engine™, its five
// Server Actions, the Reading Session APIs, and the underlying database
// are completely unchanged — this component only changes what the
// learner sees and how they move through it. No technical vocabulary
// ("Reading Session," "stage," "chunk," "asset," "Blueprint") ever
// appears in any learner-facing copy in this file or its child screens.
export function ReadingJourneyExperience({ documentId, documentTitle, projectId, onComplete }: ReadingJourneyExperienceProps): React.JSX.Element {
  const [state, setState] = useState<LocalState>({ kind: 'loading' })
  const latestAdvanceRequestId = useRef(0)
  const syncChain = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    let cancelled = false
    startIntelligentReadingSession({ documentId, chapterOrder: 0 }).then((result) => {
      if (cancelled) return
      applyStartResult(result)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId])

  function applyStartResult(result: StartReadingJourneyResult): void {
    if (!result.success) {
      setState({ kind: 'error', message: result.error })
      return
    }
    // A genuinely fresh journey (never touched before) opens on Chapter
    // Ready; resuming an already-in-progress one skips straight back to
    // wherever the reader really left off — the intro is a one-time
    // welcome, never repeated.
    const screen = result.progress.status === 'not-started' ? 'chapter-ready' : resolveScreenFromRealStage(result.session, result.progress)
    setState({
      kind: 'ready',
      session: result.session,
      progress: result.progress,
      chapterOrder: result.chapterOrder,
      totalChapters: result.totalChapters,
      chapterFullText: result.chapterFullText ?? null,
      screen,
    })
    if (result.progress.status === 'completed') onComplete?.()
  }

  function applyAdvanceResult(result: IntelligentReadingSessionResult): void {
    if (!result.success) return
    setState((current) => (current.kind === 'ready' ? { ...current, progress: result.progress, screen: resolveScreenFromRealStage(result.session, result.progress) } : current))
    if (result.progress.status === 'completed') onComplete?.()
  }

  // Mirrors advanceIntelligentReadingStage.ts's own real, deterministic
  // rule exactly (Sprint-4.5's own optimistic-transition pattern, carried
  // over unchanged): the next real stage's content is already fully
  // present client-side, so only the reader's own progress marker
  // genuinely needs a server round-trip — the visible transition never
  // waits on it.
  function advanceRealStage(): void {
    if (state.kind !== 'ready') return
    const { session, progress, chapterOrder } = state
    const currentIndex = progress.currentStageIndex
    if (currentIndex >= session.stages.length) return

    const completingStage = session.stages[currentIndex]
    const newIndex = currentIndex + 1
    const completedStageIds = completingStage && !progress.completedStageIds.includes(completingStage.stageId) ? [...progress.completedStageIds, completingStage.stageId] : progress.completedStageIds
    const optimisticProgress: ReadingSessionProgress = { currentStageIndex: newIndex, completedStageIds, status: newIndex >= session.stages.length ? 'completed' : 'in-progress' }

    setState({ ...state, progress: optimisticProgress, screen: resolveScreenFromRealStage(session, optimisticProgress) })
    if (optimisticProgress.status === 'completed') onComplete?.()

    const requestId = ++latestAdvanceRequestId.current
    syncChain.current = syncChain.current.then(async () => {
      try {
        const result = await advanceIntelligentReadingStage({ documentId, chapterOrder, direction: 'next' })
        if (latestAdvanceRequestId.current !== requestId) return
        applyAdvanceResult(result)
      } catch {
        // A transient background-sync failure never interrupts the
        // learner's own already-visible progress — the next natural
        // advance (or a future page load's own real resume) reconciles.
      }
    })
  }

  function goToNextChapter(): void {
    if (state.kind !== 'ready') return
    const nextChapterOrder = state.chapterOrder + 1
    setState({ kind: 'loading' })
    startIntelligentReadingSession({ documentId, chapterOrder: nextChapterOrder }).then(applyStartResult)
  }

  if (state.kind === 'loading') {
    return <p className={cn(TYPOGRAPHY.body, 'py-16 text-center text-muted-foreground')}>Preparing your chapter…</p>
  }

  if (state.kind === 'error') {
    return <p className={cn(TYPOGRAPHY.body, 'rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive')}>{state.message}</p>
  }

  const { session, chapterFullText, screen, totalChapters, chapterOrder } = state
  const screenIndexForDots = JOURNEY_SCREENS.indexOf(screen) - 1 // dots start at Keyword Warm-up, Chapter Ready isn't a "step"

  return (
    <div className="space-y-8">
      {screen !== 'chapter-ready' && screen !== 'celebration' && (
        <div className="flex items-center justify-between">
          <Link href={`/preview/learning-projects/${projectId}`} className={cn(TYPOGRAPHY.caption, 'flex items-center gap-1 text-muted-foreground hover:text-foreground')}>
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Exit
          </Link>
          <JourneyProgressDots totalSteps={JOURNEY_SCREENS.length - 2} currentStepIndex={screenIndexForDots} />
          <span className="w-10" aria-hidden="true" />
        </div>
      )}

      <div key={screen} className="animate-in fade-in duration-(--duration-base)">
        {screen === 'chapter-ready' && (
          <ChapterReadyScreen
            chapterTitle={totalChapters > 1 ? `${documentTitle} · Chapter ${chapterOrder + 1}` : documentTitle}
            estimatedDurationSeconds={session.estimatedDurationSeconds}
            keywordCount={session.assets.words.length}
            phraseCount={session.assets.phrases.length}
            sentenceCount={session.assets.sentences.length}
            paragraphCount={session.assets.paragraphs.length}
            onStart={() => setState({ ...state, screen: 'keyword-warmup' })}
          />
        )}
        {screen === 'keyword-warmup' && <KeywordWarmupScreen words={session.assets.words} onFinished={() => setState({ ...state, screen: 'word' })} />}
        {screen === 'word' && <WordJourneyScreen words={session.assets.words} onFinished={advanceRealStage} />}
        {screen === 'phrase' && <PhraseJourneyScreen phrases={session.assets.phrases} onFinished={advanceRealStage} />}
        {screen === 'sentence' && <SentenceJourneyScreen sentences={session.assets.sentences} onFinished={advanceRealStage} />}
        {screen === 'paragraph' && <ParagraphJourneyScreen paragraphs={session.assets.paragraphs} onFinished={advanceRealStage} />}
        {screen === 'full-chapter' && <FullChapterReadingScreen chapterFullText={chapterFullText} onFinished={advanceRealStage} />}
        {screen === 'celebration' && <CelebrationScreen projectId={projectId} hasNextChapter={chapterOrder + 1 < totalChapters} onNextChapter={goToNextChapter} />}
      </div>
    </div>
  )
}
