import { Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/lib/formatRelativeDate'
import type { QuantumDocumentOutcomeProfile } from '../actions/getQuantumDocumentOutcomeProfile'

type DocumentOutcomeProfileCardProps = {
  profile: QuantumDocumentOutcomeProfile
}

type MasteryLevel = { label: string; className: string }

// Mastery bands chosen deliberately conservative (80%/50%) so "Mastered"
// means genuinely mastered, not just attempted — this card exists so a
// learner (or a parent glancing at the same page) can trust the label,
// not feel flattered by it.
function getMasteryLevel(latestScorePercent: number | null): MasteryLevel {
  if (latestScorePercent === null) return { label: 'Not Yet Attempted', className: 'text-muted-foreground' }
  if (latestScorePercent >= 80) return { label: 'Mastered', className: 'text-success' }
  if (latestScorePercent >= 50) return { label: 'Good Progress', className: 'text-warning' }
  return { label: 'Needs Review', className: 'text-destructive' }
}

// Document Outcome Profile™ — real quiz-session data for exactly this
// document (see getQuantumDocumentOutcomeProfile.ts), never a fabricated
// or estimated score. Deliberately just an on-page summary card, not a
// separate parent account/portal — this codebase has no parent-facing
// auth or role today, so anyone who can already see this document (a
// student, or a parent looking over their shoulder) sees this same card.
export function DocumentOutcomeProfileCard({ profile }: DocumentOutcomeProfileCardProps): React.JSX.Element {
  const mastery = getMasteryLevel(profile.latestScorePercent)

  return (
    <div className="quantum-section-card p-4">
      <div className="flex items-center gap-2">
        <div className="quantum-icon-chip" aria-hidden="true">
          <Award className="size-3.5 text-violet-500" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-foreground">Document Outcome Profile™</p>
      </div>

      {profile.attemptsCount === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Not yet attempted — complete a Quantum Session to see your mastery here.</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className={cn('text-2xl font-bold tabular-nums', mastery.className)}>{profile.latestScorePercent}%</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Latest Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-foreground">{profile.bestScorePercent}%</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Best Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-foreground">{profile.attemptsCount}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Attempt{profile.attemptsCount !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
            <span className={cn('text-xs font-semibold', mastery.className)}>{mastery.label}</span>
            {profile.latestAttemptedAt && (
              <span className="text-xs text-muted-foreground">Last attempt {formatRelativeDate(profile.latestAttemptedAt)}</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
