'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Flame, Quote, Rocket, Sparkles, Tags, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { isMcqQuizQuestion, type LegacyQuizQuestion, type QuantumDocument } from '../types'
import { resolveKeywordIcon } from '../keywordIcons'
import { QuantumDocumentSpeedReadingView } from './QuantumDocumentSpeedReadingView'
import { QuantumDocumentRecallQuizView } from './QuantumDocumentRecallQuizView'
import { QuantumDocumentMcqQuizView } from './QuantumDocumentMcqQuizView'
import { SpiderNotesTreeView } from './SpiderNotesTreeView'
import { FeynmanChallengeCard } from './FeynmanChallengeCard'
import { MnemonicsListView } from './MnemonicsListView'
import { SubjectLensView } from './SubjectLensView'
import { ShortStoryCard } from './ShortStoryCard'
import { RecallQuestionsCard } from './RecallQuestionsCard'
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

// Honest YouTube Fallback™ — permanent, can't-miss disclosure (not a
// dismissible toast) for a document built from a YouTube video's real
// title/description because no transcript could be retrieved. Sits
// above the tabs so it's visible no matter which tab is active.
function MetadataOnlySummaryBanner(): React.JSX.Element {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-amber-800 dark:text-amber-400">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p className="text-xs leading-relaxed">
        <span className="font-semibold">This overview is based on the video&rsquo;s title &amp; description only.</span> We couldn&rsquo;t retrieve its
        transcript, so this isn&rsquo;t a summary of the actual video content — quiz and recall features are turned off for this document.
      </p>
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
  // QSR Bridge™ — a separate, standalone dialog, deliberately NOT wired
  // into `sessionPhase`/`sessionDialogOpen` below: that state machine
  // drives the real, tracked full-document reading+quiz session (XP,
  // streak, quantum_document_sessions). Practicing just the one-sentence
  // summary is a quick, untracked speed-reading rep — reusing
  // QuantumDocumentSpeedReadingView's own lightweight, no-tracking reader
  // (same "never pollute the tracked system with something that isn't
  // really it" discipline that component's own doc comment already
  // states), but with its own isolated open/close state so it can never
  // accidentally fall through into the quiz phase or an XP award.
  const [isSummaryPracticeOpen, setIsSummaryPracticeOpen] = useState(false)
  const summaryPracticeText = document.oneSentenceSummary ?? document.aiSummary

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
          <div className="space-y-6">
            {document.isMetadataOnlySummary && <MetadataOnlySummaryBanner />}

            {/* Segmented into tabs rather than one long scroll — Summary,
                Spider Notes, Keywords, Memory Techniques, and Practice
                each get their own space instead of competing for
                attention in a single stacked column. */}
            <Tabs defaultValue="summary">
              <TabsList className="w-full">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="spider-notes">Spider Notes</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="memory-techniques">Memory Techniques</TabsTrigger>
                <TabsTrigger value="practice">Practice</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-6 space-y-4">
                {/* QSR Bridge™ — seamlessly hands the summary off to the
                    speed-reading reader, right at the top of the tab
                    where the summary itself lives. */}
                <Button
                  type="button"
                  size="lg"
                  className="brand-gradient w-full rounded-full text-white shadow-md hover:opacity-90"
                  onClick={() => setIsSummaryPracticeOpen(true)}
                >
                  <Rocket className="size-4" aria-hidden="true" />
                  Practice this summary in Quantum Speed Reading Mode
                </Button>

                {/* One-Sentence Summary™ — the single powerful line a
                    learner should walk away with, given its own
                    eye-catching card ahead of the fuller ai_summary
                    below rather than folded into it. Null for a document
                    generated before this field existed — never fabricated
                    for an old row, the card simply doesn't render. */}
                {document.oneSentenceSummary && (
                  <div className="quantum-section-card border-primary/25 bg-primary/[0.05] p-5">
                    <div className="flex items-center gap-2">
                      <div className="quantum-icon-chip" aria-hidden="true">
                        <Quote className="size-3.5 text-primary" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">In One Sentence</p>
                    </div>
                    <p className="mt-2 text-base font-semibold leading-snug text-foreground">{document.oneSentenceSummary}</p>
                  </div>
                )}

                <div className="quantum-section-card p-4">
                  <div className="flex items-center gap-2">
                    <div className="quantum-icon-chip" aria-hidden="true">
                      <Sparkles className="size-3.5 text-indigo-500" />
                    </div>
                    <p className="text-sm font-semibold tracking-wide text-foreground">Summary</p>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-foreground">{document.aiSummary}</p>
                </div>
              </TabsContent>

              <TabsContent value="spider-notes" className="mt-6">
                <SpiderNotesTreeView root={document.spiderNotes} />
              </TabsContent>

              <TabsContent value="keywords" className="mt-6">
                <div className="quantum-section-card p-4">
                  <div className="flex items-center gap-2">
                    <div className="quantum-icon-chip" aria-hidden="true">
                      <Tags className="size-3.5 text-orange-500" />
                    </div>
                    <p className="text-sm font-semibold tracking-wide text-foreground">Keywords</p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {document.keywords.map((keyword) => {
                      const KeywordIcon = resolveKeywordIcon(keyword.icon)
                      return (
                        <div
                          key={keyword.word}
                          className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm"
                        >
                          <div className="quantum-icon-chip shrink-0" aria-hidden="true">
                            <KeywordIcon className="size-3.5 text-orange-500" />
                          </div>
                          <span className="truncate text-sm font-medium text-foreground">{keyword.word}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="memory-techniques" className="mt-6 space-y-4">
                {/* Short Story Method is a separate technique from
                    Feynman/mnemonics, not a replacement — shown first
                    since it's the newest, most "read less" way in.
                    Null for a document generated before this field
                    existed. */}
                {document.shortStory && <ShortStoryCard story={document.shortStory} keywords={document.keywords} memoryAnchor={document.oneSentenceSummary} />}
                {/* Feynman Challenge asks a learner to explain the
                    topic back — a self-assessment against specific
                    content, so it's excluded for a metadata-only
                    summary along with the Quiz/Recall Questions below. */}
                {!document.isMetadataOnlySummary && <FeynmanChallengeCard challenge={document.feynmanChallenge} />}
                <MnemonicsListView mnemonics={document.mnemonics} />
                <SubjectLensView lens={document.subjectLens} />
              </TabsContent>

              <TabsContent value="practice" className="mt-6 space-y-4">
                {/* Quantum Speed Reading First™ — the primary action sits
                    at the top of this tab, not buried after every
                    deep-dive section, so a learner can launch straight
                    into reading. The quiz+recall session is a genuine
                    factual-recall test, so it — and RecallQuestionsCard
                    below — is excluded for a metadata-only summary
                    (see MetadataOnlySummaryBanner); reading practice
                    itself (no grading) stays available via the Summary
                    tab's own "Practice this summary" button. */}
                {!document.isMetadataOnlySummary && (
                  <Button type="button" size="lg" className="w-full rounded-full" onClick={() => setSessionPhase('reading')}>
                    🚀 Start Quantum Speed Reading ({document.quizQuestions.length} recall question{document.quizQuestions.length !== 1 ? 's' : ''})
                  </Button>
                )}

                <DocumentOutcomeProfileCard profile={outcomeProfile} />

                {!document.isMetadataOnlySummary && <RecallQuestionsCard questions={document.recallQuestions} />}

                <ReadingTextSection readingText={document.readingText} />
              </TabsContent>
            </Tabs>

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

      <Dialog open={isSummaryPracticeOpen} onOpenChange={setIsSummaryPracticeOpen}>
        <DialogContent className="flex h-[85vh] max-w-3xl flex-col p-6 sm:max-w-3xl" showCloseButton={false}>
          <DialogTitle className="sr-only">{document.title} — Summary Practice</DialogTitle>
          {isSummaryPracticeOpen && (
            <QuantumDocumentSpeedReadingView
              title={`${document.title} — Summary Practice`}
              readingText={summaryPracticeText}
              onComplete={() => setIsSummaryPracticeOpen(false)}
              onExit={() => setIsSummaryPracticeOpen(false)}
              completionCopy={{
                finishedHeadline: 'Nice work — you read the summary.',
                finishedSubtext: 'Head back to explore the rest of the document whenever you’re ready.',
                skipLabel: 'Done',
                continueLabel: 'Done',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
