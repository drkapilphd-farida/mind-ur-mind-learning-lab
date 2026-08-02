'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// Mind Passport™ Integration — the one deliberate exception to this lab's
// "derive-live, never store" convention: a single upserted current-
// snapshot row per user (not append-only), so future Mind Passport pages
// can read the latest computed identity/score/summary without
// recomputing the whole Visual DNA engine.
const SaveMindPassportSnapshotInputSchema = z
  .object({
    visualDnaLevel: z.string().min(1),
    visualIntelligenceScore: z.number().min(0),
    primaryTrait: z.string().min(1),
    observationStyle: z.string().min(1),
    growthPercent: z.number().nullable(),
    achievementCount: z.number().min(0),
    latestAiSummary: z.string().min(1),
  })
  .strict()

export type SaveMindPassportSnapshotInput = z.infer<typeof SaveMindPassportSnapshotInputSchema>
export type SaveMindPassportSnapshotResult = { success: true } | { success: false; error: string }

export async function saveMindPassportSnapshot(input: unknown): Promise<SaveMindPassportSnapshotResult> {
  const parsed = SaveMindPassportSnapshotInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('mind passport snapshot input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Invalid snapshot data.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: true }
  }

  const { error } = await supabase.from('mind_passport_snapshots').upsert(
    {
      user_id: user.id,
      visual_dna_level: parsed.data.visualDnaLevel,
      visual_intelligence_score: Math.round(parsed.data.visualIntelligenceScore),
      primary_trait: parsed.data.primaryTrait,
      observation_style: parsed.data.observationStyle,
      growth_percent: parsed.data.growthPercent,
      achievement_count: parsed.data.achievementCount,
      latest_ai_summary: parsed.data.latestAiSummary,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (error) {
    logger.warn('failed to save mind passport snapshot', { error: error.message })
    return { success: false, error: 'Failed to save snapshot.' }
  }

  return { success: true }
}
