'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export type RecordableJourneyDomain = 'intuition' | 'right_brain' | 'visualisation'

export type RecordDomainPerformanceInput = {
  domain: RecordableJourneyDomain
  exerciseId: string
  accuracyPercent: number
}

// Smart Weakness Targeting™ — one real row per completed attempt of a
// domain-mapped Step 1/2 exercise inside the 21-Day journey wizard. Never
// called for Word Flash/Schulte Grid (neither maps to a tracked domain)
// or for the reading step (its accuracy already lives in
// `daily_quantum_sessions`). Anonymous visitors: a silent no-op, matching
// this app's other session-recording actions' existing posture.
export async function recordDomainPerformance(input: RecordDomainPerformanceInput): Promise<void> {
  if (!Number.isInteger(input.accuracyPercent) || input.accuracyPercent < 0 || input.accuracyPercent > 100) {
    logger.warn('recordDomainPerformance received an out-of-range accuracyPercent', { input })
    return
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { error } = await supabase.from('domain_performance_sessions').insert({
    user_id: user.id,
    domain: input.domain,
    exercise_id: input.exerciseId,
    accuracy_percent: input.accuracyPercent,
  })

  if (error) {
    logger.warn('failed to persist domain performance session', { error: error.message, domain: input.domain, exerciseId: input.exerciseId })
  }
}
