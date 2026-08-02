import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DIFFICULTY_LEVEL_NAME, DIFFICULTY_LEVEL_THRESHOLDS } from '../../adaptive/difficultyCalculator'
import type { DifficultyLevelNumber } from '../../adaptive/types/adaptiveTypes'

type LevelUnlockLadderProps = {
  currentLevel: DifficultyLevelNumber
}

const ALL_LEVELS: readonly DifficultyLevelNumber[] = [1, 2, 3, 4, 5]

function requirementText(level: DifficultyLevelNumber): string {
  if (level === 1) return 'Available from the start.'
  const threshold = DIFFICULTY_LEVEL_THRESHOLDS.find((t) => t.level === level)
  if (!threshold) return ''
  if (threshold.streakThreshold === 0) return `Reach ${threshold.sessionThreshold} completed sessions.`
  return `Reach ${threshold.sessionThreshold} completed sessions and a ${threshold.streakThreshold}-day streak.`
}

// Gradual, never-all-at-once unlock ladder — each level beyond the current
// one shows its own real requirement rather than a locked mystery.
export function LevelUnlockLadder({ currentLevel }: LevelUnlockLadderProps): React.JSX.Element {
  return (
    <div className="space-y-2">
      {ALL_LEVELS.map((level) => {
        const unlocked = level <= currentLevel
        return (
          <div
            key={level}
            className={cn('flex items-center gap-3 rounded-2xl border p-3', unlocked ? 'border-success/30 bg-success/[0.04]' : 'bg-card')}
          >
            <div
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                unlocked ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground',
              )}
              aria-hidden="true"
            >
              {unlocked ? <Check className="size-4" /> : <Lock className="size-3.5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                Level {level} · {DIFFICULTY_LEVEL_NAME[level]}
              </p>
              {!unlocked ? <p className="mt-0.5 text-xs text-muted-foreground">{requirementText(level)}</p> : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
