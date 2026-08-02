import { createClient } from '@/lib/supabase/server'
import { getDailyQuantumSessionHistory } from '@/app/unified-quantum-session-preview/actions/getDailyQuantumSessionHistory'
import type { JourneyDomain } from '../types'

const MIN_SESSIONS_TO_QUALIFY = 2
const RECENT_SAMPLE_SIZE = 5
// Requirement 2 asks for genuine "struggling," not just whichever domain
// happens to be relatively lowest among otherwise-fine scores — a user
// averaging 90/92/88% across domains shouldn't get an unnecessary
// targeted drill. Only a real, absolute struggling bar triggers injection.
const STRUGGLING_ACCURACY_THRESHOLD = 65

export type WeakestDomainResult = { domain: JourneyDomain; averageAccuracyPercent: number } | null

// Smart Weakness Targeting™ — reads real, already-persisted accuracy
// history across all 4 tracked domains (Reading from `daily_quantum_
// sessions`, the other 3 from `domain_performance_sessions`) and returns
// the one domain the signed-in user is genuinely struggling with, or null
// if there isn't enough data yet, or nothing qualifies as struggling.
// Requires at least MIN_SESSIONS_TO_QUALIFY real attempts in a domain
// before ever calling it "weak" — a single unlucky session never triggers
// injection.
export async function getWeakestDomain(): Promise<WeakestDomainResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: domainRows }, readingHistory] = await Promise.all([
    supabase
      .from('domain_performance_sessions')
      .select('domain, accuracy_percent, occurred_at')
      .eq('user_id', user.id)
      .order('occurred_at', { ascending: false })
      .limit(60),
    getDailyQuantumSessionHistory(RECENT_SAMPLE_SIZE),
  ])

  const averageAccuracyByDomain = new Map<JourneyDomain, number>()

  if (readingHistory.length >= MIN_SESSIONS_TO_QUALIFY) {
    const average = readingHistory.reduce((sum, session) => sum + session.accuracyPercent, 0) / readingHistory.length
    averageAccuracyByDomain.set('reading', average)
  }

  const recentAccuraciesByDomain = new Map<string, number[]>()
  for (const row of domainRows ?? []) {
    const accuracies = recentAccuraciesByDomain.get(row.domain) ?? []
    if (accuracies.length < RECENT_SAMPLE_SIZE) accuracies.push(row.accuracy_percent)
    recentAccuraciesByDomain.set(row.domain, accuracies)
  }
  for (const [domain, accuracies] of recentAccuraciesByDomain) {
    if (accuracies.length < MIN_SESSIONS_TO_QUALIFY) continue
    const average = accuracies.reduce((sum, accuracy) => sum + accuracy, 0) / accuracies.length
    averageAccuracyByDomain.set(domain as JourneyDomain, average)
  }

  let weakest: WeakestDomainResult = null
  for (const [domain, averageAccuracyPercent] of averageAccuracyByDomain) {
    if (averageAccuracyPercent > STRUGGLING_ACCURACY_THRESHOLD) continue
    if (weakest === null || averageAccuracyPercent < weakest.averageAccuracyPercent) {
      weakest = { domain, averageAccuracyPercent: Math.round(averageAccuracyPercent) }
    }
  }
  return weakest
}
