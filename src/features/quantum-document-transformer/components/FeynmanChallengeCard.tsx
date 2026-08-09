'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2, Lightbulb, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { FeynmanChallenge, FeynmanEvaluationResponse } from '../types'

type FeynmanChallengeCardProps = {
  challenge: FeynmanChallenge
}

type EvaluationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; score: number; feedback: string }
  | { status: 'error'; error: string }

const MAX_EXPLANATION_LENGTH = 1500

function scoreLabel(score: number): string {
  if (score >= 5) return 'Excellent!'
  if (score >= 4) return 'Great work!'
  if (score >= 3) return 'Good start!'
  return 'Keep going!'
}

// Feynman Challenge™ — a real, document-specific prompt inviting the
// learner to explain the core concept back in their own words, now
// genuinely interactive: type an explanation, get it scored and given
// encouraging, constructive feedback by a single, on-demand, lightweight
// AI call (never part of the main document-generation call, and never
// persisted — see /api/quantum-document-transformer/feynman-evaluate and
// generateFeynmanEvaluation.ts).
export function FeynmanChallengeCard({ challenge }: FeynmanChallengeCardProps): React.JSX.Element {
  const [explanation, setExplanation] = useState('')
  const [evaluation, setEvaluation] = useState<EvaluationState>({ status: 'idle' })

  async function handleEvaluate(): Promise<void> {
    const trimmed = explanation.trim()
    if (trimmed.length === 0) return

    setEvaluation({ status: 'loading' })
    try {
      const response = await fetch('/api/quantum-document-transformer/feynman-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: challenge.topic, prompt: challenge.prompt, learner_explanation: trimmed }),
      })
      const json = (await response.json()) as FeynmanEvaluationResponse
      if (!json.success) {
        setEvaluation({ status: 'error', error: json.error })
        return
      }
      setEvaluation({ status: 'success', score: json.score, feedback: json.feedback })
    } catch {
      setEvaluation({ status: 'error', error: 'We could not evaluate your explanation. Please try again.' })
    }
  }

  const isLoading = evaluation.status === 'loading'

  return (
    <div className="quantum-section-card p-4">
      <div className="flex items-center gap-2">
        <div className="quantum-icon-chip" aria-hidden="true">
          <Lightbulb className="size-3.5 text-amber-500" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-foreground">Feynman Challenge™</p>
      </div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{challenge.topic}</p>
      <p className="mt-1.5 text-sm text-foreground">{challenge.prompt}</p>

      <div className="mt-3.5 space-y-2">
        <Textarea
          value={explanation}
          onChange={(event) => setExplanation(event.target.value.slice(0, MAX_EXPLANATION_LENGTH))}
          placeholder="Teach this like a 10-year-old... explain it in your own simple words."
          rows={4}
          maxLength={MAX_EXPLANATION_LENGTH}
          className="resize-none text-sm"
          aria-label="Your explanation"
        />
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">{explanation.trim().length === 0 ? 'Write a few sentences, then get AI feedback.' : `${explanation.length}/${MAX_EXPLANATION_LENGTH}`}</p>
          <Button type="button" size="sm" disabled={explanation.trim().length === 0 || isLoading} onClick={() => void handleEvaluate()}>
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                Evaluating…
              </>
            ) : (
              <>
                <Sparkles className="size-3.5" aria-hidden="true" />
                Evaluate with AI
              </>
            )}
          </Button>
        </div>
      </div>

      {evaluation.status === 'error' && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <p>{evaluation.error}</p>
        </div>
      )}

      {evaluation.status === 'success' && (
        <div className={cn('mt-3 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-3', 'animate-in fade-in slide-in-from-top-1 duration-200')}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" aria-hidden="true" />
            <p className="text-sm font-semibold text-foreground">
              {evaluation.score}/5 — {scoreLabel(evaluation.score)}
            </p>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">{evaluation.feedback}</p>
        </div>
      )}
    </div>
  )
}
