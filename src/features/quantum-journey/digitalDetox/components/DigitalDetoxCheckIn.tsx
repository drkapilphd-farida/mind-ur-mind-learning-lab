'use client'

import { useState } from 'react'
import { Flame, MoonStar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { playClickChime } from '@/app/unified-quantum-session-preview/components/soundEngine'
import { saveDigitalDetoxCheckin } from '../actions/saveDigitalDetoxCheckin'

type Phase = 'asking' | 'saving' | 'answered'

type DigitalDetoxCheckInProps = {
  onComplete: () => void
}

// Digital Detox Check-in™ — shown once per day, before Step 1 of every
// journey session (see QuantumJourneySession.tsx's own gate). Quick and
// low-friction on purpose: one question, two buttons, a brief streak
// confirmation, then straight into the real session — never a second
// screen the user has to click through.
export function DigitalDetoxCheckIn({ onComplete }: DigitalDetoxCheckInProps): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>('asking')
  const [streak, setStreak] = useState<number | null>(null)
  const [keptPhoneAway, setKeptPhoneAway] = useState<boolean | null>(null)

  async function handleAnswer(answer: boolean): Promise<void> {
    playClickChime()
    setKeptPhoneAway(answer)
    setPhase('saving')
    const result = await saveDigitalDetoxCheckin(answer)
    setStreak(result.success ? result.streak : null)
    setPhase('answered')
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MoonStar className="size-6" aria-hidden="true" />
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Digital Detox Check-in</p>
        <h2 className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground">
          Did you keep your phone away for 1 hour before sleep last night?
        </h2>
      </div>

      {phase !== 'answered' && (
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            size="lg"
            className="w-full max-w-xs rounded-full"
            disabled={phase === 'saving'}
            onClick={() => void handleAnswer(true)}
          >
            Yes, I did
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full max-w-xs rounded-full"
            disabled={phase === 'saving'}
            onClick={() => void handleAnswer(false)}
          >
            Not this time
          </Button>
        </div>
      )}

      {phase === 'answered' && (
        <div className="flex w-full flex-col items-center gap-5">
          <p className="text-sm text-muted-foreground">
            {keptPhoneAway ? "Nice — that's a real win for your focus." : 'No judgment — tonight is a fresh chance.'}
          </p>

          {keptPhoneAway && streak !== null && streak > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-2 text-sm font-medium text-foreground">
              <Flame className="size-4 text-orange-500" aria-hidden="true" />
              {streak}-Day Detox Streak
            </div>
          )}

          <Button type="button" size="lg" className="w-full max-w-xs rounded-full" onClick={onComplete}>
            Continue →
          </Button>
        </div>
      )}
    </div>
  )
}
