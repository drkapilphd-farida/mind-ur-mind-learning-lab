'use client'

import { useEffect, useState, useTransition } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SessionErrorBanner } from '@/features/learning-mode-runtime/components'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { startMentorSession } from '../actions/startMentorSession'
import { endMentorSession } from '../actions/endMentorSession'
import { getMentorSessionContext } from '../actions/getMentorSessionContext'
import { getMentorConversation } from '../actions/getMentorConversation'
import { sendMentorMessage } from '../actions/sendMentorMessage'
import { getMentorRecommendations } from '../actions/getMentorRecommendations'
import { getMentorSessionHistory } from '../actions/getMentorSessionHistory'
import type { MentorSession, MentorSessionContext } from '../types'
import type { MentorConversationTurn } from '../types/MentorConversationTurn'
import type { MentorRecommendation } from '../types/MentorRecommendation'
import type { MentorSessionHistoryEntry } from '../types/MentorSessionHistoryEntry'

type AiMentorWorkspaceProps = {
  initialSession: MentorSession | null
  initialSessionHistory: readonly MentorSessionHistoryEntry[]
}

type LiveState = {
  kind: 'no-session'
} | {
  kind: 'active'
  session: MentorSession
  context: MentorSessionContext | null
  conversation: readonly MentorConversationTurn[]
  recommendations: readonly MentorRecommendation[] | null
}

function formatSessionDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

// AI Learning Studio™ V1 Launch UX Transformation — suggested prompts.
// Real, fixed learner messages, sent through the exact same
// `sendMentorMessage` call every typed message already uses (see
// handleSend below) — no new send path, no new AI/backend surface. Lets
// the mentor guide the conversation instead of waiting on a blank
// textarea.
const SUGGESTED_PROMPTS = ['Explain Simply', 'Quiz Me', 'Give Examples', 'Test My Understanding', 'Summarize This'] as const

// AI Mentor™ Sprint-1 — Foundation. The real client orchestrator proving
// the session lifecycle and route work end to end.
//
// AI Mentor™ Sprint-2 — the first real conversation turn. `conversation`
// holds the real, already-persisted turn history — restored via
// `getMentorConversation` whenever a real active session exists (on
// mount, or right after starting a new one), never fabricated. Sending a
// message calls the one real `sendMentorMessage` action, which persists
// both the learner's real message and the mentor's real reply
// server-side; this component only ever appends what that action
// actually returns, never an optimistic guess at what the mentor will
// say.
//
// AI Mentor™ Sprint-3 — real, deterministic recommendations.
// `recommendations` is restored on mount alongside the conversation
// history (proactive, not gated behind a button — a recommendation a
// learner has to ask for isn't really proactive) via
// `getMentorRecommendations`. Never AI-generated, never fabricated —
// the same real, threshold-based logic `recommendMentorFocus` computes
// from the real context this workspace already loads.
//
// AI Mentor™ Sprint-4 — Session History. `sessionHistory` starts from
// the real, server-rendered `initialSessionHistory` (mirroring how
// `initialSession` itself is seeded) and is refreshed after a real
// session ends, so the newly-ended session appears in the real list
// immediately rather than only after a full page reload. Shown in the
// no-session view, where "here is your history — start a new one?" is
// the real, natural question.
//
// AI Mentor™ Sprint-5 — Production Polish. Every state now reuses the
// same `EmptyStateCard`/`Card` conventions QSR's, Memory's, and Smart
// Notes' own workspaces already use, and the Shared Learning Runtime's
// own `SessionErrorBanner` (the exact component all three other Learning
// Modes already reuse for errors) replaces a bespoke error `<p>`. Soft
// `fade-in` entrances, a focus-visible textarea ring, and an
// `aria-live` region for new conversation turns were added. No prop, no
// action call, no state transition, no functionality changed — every
// edit here is visual, spacing, or accessibility only.
//
// AI Learning Studio™ V1 Living Product Sprint — a real returning
// session's context/recommendations/conversation now all load eagerly on
// mount (context previously required a manual "Load Context" click —
// removed, one real click fewer); `isRestoringSession` shows honest
// "loading" copy during that brief real window instead of the previously
// misleading "No messages yet" flash.
export function AiMentorWorkspace({ initialSession, initialSessionHistory }: AiMentorWorkspaceProps): React.JSX.Element {
  const [state, setState] = useState<LiveState>(initialSession !== null ? { kind: 'active', session: initialSession, context: null, conversation: [], recommendations: null } : { kind: 'no-session' })
  const [sessionHistory, setSessionHistory] = useState<readonly MentorSessionHistoryEntry[]>(initialSessionHistory)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  // AI Learning Studio™ V1 Living Product Sprint — a real returning
  // session's own conversation/recommendations/context are all restored
  // async on mount; until they resolve, `conversation`/`recommendations`/
  // `context` all start out empty/null, which previously rendered as "No
  // messages yet" (false — history is loading, not absent) and a silently
  // missing Suggestions card. This flag lets the real restoring window
  // show honest "loading" copy instead.
  const [isRestoringSession, setIsRestoringSession] = useState(initialSession !== null)

  useEffect(() => {
    if (initialSession === null) return
    let cancelled = false

    // Context now loads eagerly alongside conversation/recommendations —
    // previously gated behind a manual "Load Context" button, a real,
    // unnecessary click this sprint's own "do not increase clicks" rule
    // asks to remove. Same real `getMentorSessionContext` action, just
    // called here instead of on click.
    Promise.all([getMentorConversation(initialSession.id), getMentorRecommendations(initialSession.id), getMentorSessionContext(initialSession.id)]).then(
      ([conversationResult, recommendationsResult, contextResult]) => {
        if (cancelled) return
        setState((current) => {
          if (current.kind !== 'active' || current.session.id !== initialSession.id) return current
          return {
            ...current,
            conversation: conversationResult.success ? conversationResult.turns : current.conversation,
            recommendations: recommendationsResult.success ? recommendationsResult.recommendations : current.recommendations,
            context: contextResult.success ? contextResult.context : current.context,
          }
        })
        setIsRestoringSession(false)
      },
    )

    return () => {
      cancelled = true
    }
  }, [initialSession])

  function handleStart(): void {
    setError(null)
    startTransition(async () => {
      const result = await startMentorSession()
      if (!result.success) {
        setError(result.error)
        return
      }
      setState({ kind: 'active', session: result.session, context: null, conversation: [], recommendations: null })
    })
  }

  function handleEnd(sessionId: string): void {
    setError(null)
    startTransition(async () => {
      const result = await endMentorSession(sessionId)
      if (!result.success) {
        setError(result.error)
        return
      }
      setState({ kind: 'no-session' })

      const historyResult = await getMentorSessionHistory()
      if (historyResult.success) setSessionHistory(historyResult.history)
    })
  }

  function handleSend(sessionId: string, textOverride?: string): void {
    const message = (textOverride ?? draft).trim()
    if (message.length === 0) return

    setError(null)
    startTransition(async () => {
      const result = await sendMentorMessage({ sessionId, message })
      if (!result.success) {
        setError(result.error)
        return
      }
      setDraft('')
      setState((current) => (current.kind === 'active' && current.session.id === sessionId ? { ...current, conversation: [...current.conversation, result.learnerTurn, result.mentorTurn] } : current))
    })
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-lg space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        {error !== null && <SessionErrorBanner message={error} />}

        {state.kind === 'no-session' ? (
          <div className="animate-in fade-in space-y-6 duration-(--duration-slow)">
            <EmptyStateCard
              icon={Sparkles}
              title="AI Mentor"
              description="Start a session with your AI Mentor."
              action={
                <Button disabled={pending} onClick={handleStart}>
                  {pending ? 'Starting…' : 'Start Mentor Session'}
                </Button>
              }
            />

            {sessionHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Past Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border">
                    {sessionHistory.map((entry) => (
                      <li key={entry.id} className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40">
                        <span className={TYPOGRAPHY.body}>{formatSessionDate(entry.startedAt)}</span>
                        <span className={TYPOGRAPHY.caption}>
                          {entry.turnCount} message{entry.turnCount === 1 ? '' : 's'} · {entry.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="animate-in fade-in slide-in-from-top-1 flex items-center gap-2 duration-(--duration-base)">
              <Sparkles className={`${ICON_SIZE.lg} text-primary`} aria-hidden="true" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">AI Mentor</h1>
                <p className={TYPOGRAPHY.caption}>Session active since {new Date(state.session.startedAt).toLocaleString()}</p>
              </div>
            </div>

            {state.context === null && isRestoringSession && <p className={TYPOGRAPHY.small}>Getting your progress ready…</p>}

            {state.context !== null && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Learning Projects</dt>
                      <dd className="text-foreground">{state.context.learningProjectsCount}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Reading sessions completed</dt>
                      <dd className="text-foreground">{state.context.readingSessionsCompleted}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Memory sessions completed</dt>
                      <dd className="text-foreground">{state.context.memorySessionsCompleted}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Smart Notes sessions completed</dt>
                      <dd className="text-foreground">{state.context.smartNotesSessionsCompleted}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Documents with notes</dt>
                      <dd className="text-foreground">{state.context.documentsWithNotes}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            )}

            {state.recommendations === null && isRestoringSession && <p className={TYPOGRAPHY.small}>Preparing suggestions…</p>}

            {state.recommendations !== null && state.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {state.recommendations.map((recommendation, index) => (
                      <li key={recommendation.id} className="animate-in fade-in slide-in-from-left-1 fill-mode-backwards flex items-start gap-2 duration-(--duration-base)" style={{ animationDelay: `${index * 60}ms` }}>
                        <Sparkles className={`${ICON_SIZE.sm} mt-0.5 shrink-0 text-primary`} aria-hidden="true" />
                        <span className={TYPOGRAPHY.small}>{recommendation.message}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div aria-live="polite" aria-atomic="false">
                  {state.conversation.length === 0 ? (
                    <p className={TYPOGRAPHY.small}>{isRestoringSession ? 'Loading your conversation…' : 'No messages yet — say hello to your mentor.'}</p>
                  ) : (
                    <ul className="space-y-2">
                      {state.conversation.map((turn) => (
                        <li key={turn.id} className={turn.role === 'mentor' ? 'text-foreground' : 'text-right text-muted-foreground'}>
                          <span className="text-sm whitespace-pre-wrap">{turn.content}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <Button key={prompt} type="button" size="sm" variant="outline" disabled={pending} onClick={() => handleSend(state.session.id, prompt)}>
                      {prompt}
                    </Button>
                  ))}
                </div>

                <div className="flex items-end gap-2 pt-2">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    rows={2}
                    placeholder="Message your mentor…"
                    aria-label="Message your AI Mentor"
                    className="w-full resize-none rounded-md border bg-background p-2 text-sm text-foreground transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  />
                  <Button size="sm" disabled={pending || draft.trim().length === 0} onClick={() => handleSend(state.session.id)}>
                    {pending ? 'Sending…' : 'Send'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button variant="ghost" disabled={pending} onClick={() => handleEnd(state.session.id)}>
              End Session
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
