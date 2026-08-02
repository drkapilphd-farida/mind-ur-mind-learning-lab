import { createClient } from '@/lib/supabase/server'
import type { MindPassportSnapshot } from '../dnaTypes'

// Anonymous-safe: an anonymous visitor gets null, never an error.
export async function getMindPassportSnapshot(): Promise<MindPassportSnapshot | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase.from('mind_passport_snapshots').select('*').eq('user_id', user.id).maybeSingle()

  if (!data) return null

  return {
    visualDnaLevel: data.visual_dna_level as MindPassportSnapshot['visualDnaLevel'],
    visualIntelligenceScore: data.visual_intelligence_score,
    primaryTrait: data.primary_trait,
    observationStyle: data.observation_style,
    growthPercent: data.growth_percent,
    achievementCount: data.achievement_count,
    latestAiSummary: data.latest_ai_summary,
  }
}
