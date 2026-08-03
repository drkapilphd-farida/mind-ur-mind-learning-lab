'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Flame, Sparkles, Tags } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { isMcqQuizQuestion, type LegacyQuizQuestion, type QuantumDocument } from '../types'
import { QuantumDocumentSpeedReadingView } from './QuantumDocumentSpeedReadingView'
import { QuantumDocumentRecallQuizView } from './QuantumDocumentRecallQuizView'
import { QuantumDocumentMcqQuizView } from './QuantumDocumentMcqQuizView'
import { SpiderNotesTreeView } from './SpiderNotesTreeView'
import { FeynmanChallengeCard } from './FeynmanChallengeCard'
import { MnemonicsListView } from './MnemonicsListView'
import { SubjectLensView } from './SubjectLensView'
import { DocumentOutcomeProfileCard } from './DocumentOutcomeProfileCard'
import { SelectionTooltip } from '@/features/quantum-mentor/components/SelectionTooltip'
import { saveQuantumDocumentSession } from '../actions/saveQuantumDocumentSession'
import { getQuantumDocumentSessionHistory } from '../actions/getQuantumDocumentSessionHistory'
import { getQuantumDocumentOutcomeProfile, type QuantumDocumentOutcomeProfile } from '../actions/getQuantumDocumentOutcomeProfile'
import { computeQuantumDocumentStreak } from '../quantumDocumentSessionTracking'
import { logger } from '@/lib/logger'

type SessionPhase = 'results' | 'reading' | 'quiz' | 'complete'
type SessionReward = { xpEarned: number; streak: number }

// Isolated Document View™ — extracted from AIDocumentTransformerWidget so
// the heavy per-document output (Summary, Spider Notes, Reading Text,
// Feynman Challenge, Mnemonics, Subject Lens, Keywords, Quantum Session)
// lives on its own route (/library/[id]) instead of dumping into the main
// dashboard feed. Everything below is unchanged logic, just relocated —
// same session Dialog, same XP/streak save flow.
function ReadingTextSection({ readingText }: { readingText: string }): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="quantum-section-card p-4">
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <div className="quantum-icon-chip" aria-hidden="true">
            <BookOpen className="size-3.5 text-sky-500" />
          </div>
          <p className="text-sm font-semibold tracking-wide text-foreground">Reading Text</p>
        </div>
        <span className="text-xs font-medium text-primary">{isExpanded ? 'Hide' : 'Show'}</span>
      </button>

      {isExpanded && (
        <p className="mt-3 max-h-96 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-foreground">{readingText}</p>
      )}
    </div>
  )
}

function XpGainBadge({ xpEarned, streak }: SessionReward): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedXp = useCountUp(xpEarned, 800, prefersReducedMotion)

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4',
        !prefersReducedMotion && 'animate-in zoom-in-95 fade-in duration-300',
      )}
    >
      <div className="flex items-center gap-2 text-2xl font-bold tabular-nums text-foreground">
        <Sparkles className="size-5 text-indigo-500" aria-hidden="true" />
        +{Math.round(animatedXp)} XP
      </div>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Flame className={cn('size-4', streak > 0 ? 'text-orange-500' : 'text-muted-foreground/40')} aria-hidden="true" />
        {streak} day{streak !== 1 ? 's' : ''} streak
      </div>
    </div>
  )
}

function QuantumSessionCompleteCard({ reward }: { reward: SessionReward | null }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-foreground/[0.02] p-6 text-center">
      <p className={TYPOGRAPHY.h3}>Session complete 🎉</p>
      <p className={TYPOGRAPHY.small}>You read the document and completed the recall quiz.</p>
      {reward ? (
        <XpGainBadge xpEarned={reward.xpEarned} streak={reward.streak} />
      ) : (
        <p className={cn(TYPOGRAPHY.caption, 'text-muted-foreground')}>We couldn&rsquo;t save your progress this time.</p>
      )}
      <Button type="button" variant="outline" asChild>
        <Link href="/dashboard#upload-document">Transform another document</Link>
      </Button>
    </div>
  )
}

type QuantumDocumentDetailViewProps = {
  document: QuantumDocument
  initialOutcomeProfile: QuantumDocumentOutcomeProfile
}

export function QuantumDocumentDetailView({ document, initialOutcomeProfile }: QuantumDocumentDetailViewProps): React.JSX.Element {
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('results')
  const [sessionReward, setSessionReward] = useState<SessionReward | null>(null)
  const [outcomeProfile, setOutcomeProfile] = useState(initialOutcomeProfile)

  // Gamification & XP Sync — fires once, when the learner finishes BOTH
  // real halves of the session (speed reading + recall quiz). The XP
  // number itself is never computed here — the Server Action recomputes
  // it from the real correctAnswersCount so a tampered client request
  // can't award arbitrary XP. Document Outcome Profile™ is refetched
  // right after so the score/mastery card reflects this attempt
  // immediately, without a full page reload.
  async function handleQuizComplete(correctAnswersCount: number, totalQuestionsCount: number): Promise<void> {
    const saveResult = await saveQuantumDocumentSession({
      quantumDocumentId: document.id,
      correctAnswersCount,
      totalQuestionsCount,
    })

    if (saveResult.success) {
      const [history, freshOutcomeProfile] = await Promise.all([
        getQuantumDocumentSessionHistory(),
        getQuantumDocumentOutcomeProfile(document.id),
      ])
      setSessionReward({ xpEarned: saveResult.xpEarned, streak: computeQuantumDocumentStreak(history) })
      setOutcomeProfile(freshOutcomeProfile)
    } else {
      logger.error('[QuantumDocumentTransformer] Session Saved — FAIL', { error: saveResult.error })
      setSessionReward(null)
    }

    setSessionPhase('complete')
  }

  const sessionDialogOpen = sessionPhase === 'reading' || sessionPhase === 'quiz'
  const firstQuestion = document.quizQuestions[0]
  const isMcqQuiz = firstQuestion !== undefined && isMcqQuizQuestion(firstQuestion)

  return (
    <div className="glass-premium-card glass-premium-lift p-5 sm:p-8">
      {sessionPhase === 'complete' ? (
        <QuantumSessionCompleteCard reward={sessionReward} />
      ) : (
        <SelectionTooltip documentContext={`${document.title}\n\n${document.aiSummary}`} documentLanguage={document.targetLanguage}>
          <div className="space-y-4">
            <div className="quantum-section-card p-4">
              <div className="flex items-center gap-2">
                <div className="quantum-icon-chip" aria-hidden="true">
                  <Sparkles className="size-3.5 text-indigo-500" />
                </div>
                <p className="text-sm font-semibold tracking-wide text-foreground">Summary</p>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-foreground">{document.aiSummary}</p>
            </div>

            {/* Quantum Speed Reading First™ — the primary action now sits
                right below the summary overview, not buried at the bottom
                after every deep-dive section, so a learner can launch
                straight into reading. */}
            <Button type="button" size="lg" className="w-full rounded-full" onClick={() => setSessionPhase('reading')}>
              🚀 Start Quantum Speed Reading ({document.quizQuestions.length} recall question{document.quizQuestions.length !== 1 ? 's' : ''})
            </Button>

            <DocumentOutcomeProfileCard profile={outcomeProfile} />

            <SpiderNotesTreeView root={document.spiderNotes} />

            <ReadingTextSection readingText={document.readingText} />

            <FeynmanChallengeCard challenge={document.feynmanChallenge} />
            <MnemonicsListView mnemonics={document.mnemonics} />
            <SubjectLensView lens={document.subjectLens} />

            <div className="quantum-section-card p-4">
              <div className="flex items-center gap-2">
                <div className="quantum-icon-chip" aria-hidden="true">
                  <Tags className="size-3.5 text-orange-500" />
                </div>
                <p className="text-sm font-semibold tracking-wide text-foreground">Keywords</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {document.keywords.map((keyword) => (
                  <Badge key={keyword} variant="outline">{keyword}</Badge>
                ))}
              </div>
            </div>

            <Button type="button" variant="ghost" className="w-full" asChild>
              <Link href="/dashboard#upload-document">Transform another document</Link>
            </Button>
          </div>
        </SelectionTooltip>
      )}

      <Dialog open={sessionDialogOpen} onOpenChange={(open) => { if (!open) setSessionPhase('results') }}>
        <DialogContent className="flex h-[85vh] max-w-3xl flex-col p-6 sm:max-w-3xl" showCloseButton={false}>
          <DialogTitle className="sr-only">{document.title} — Quantum Session</DialogTitle>
          {sessionPhase === 'reading' && (
            <QuantumDocumentSpeedReadingView
              title={document.title}
              readingText={document.readingText}
              onComplete={() => setSessionPhase(document.quizQuestions.length > 0 ? 'quiz' : 'complete')}
              onExit={() => setSessionPhase('results')}
            />
          )}
          {sessionPhase === 'quiz' && (
            isMcqQuiz ? (
              <QuantumDocumentMcqQuizView
                title={document.title}
                quizQuestions={document.quizQuestions.filter(isMcqQuizQuestion)}
                onComplete={(correctAnswersCount, totalQuestionsCount) => void handleQuizComplete(correctAnswersCount, totalQuestionsCount)}
                onExit={() => setSessionPhase('results')}
              />
            ) : (
              <QuantumDocumentRecallQuizView
                title={document.title}
                quizQuestions={document.quizQuestions.filter((question): question is LegacyQuizQuestion => !isMcqQuizQuestion(question))}
                onComplete={(correctAnswersCount, totalQuestionsCount) => void handleQuizComplete(correctAnswersCount, totalQuestionsCount)}
                onExit={() => setSessionPhase('results')}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
