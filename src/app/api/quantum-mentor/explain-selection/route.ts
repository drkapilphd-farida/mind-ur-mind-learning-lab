import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSelectionExplanation } from '@/features/quantum-mentor/generateSelectionExplanation'
import { checkSelectionExplanationRateLimit } from '@/features/quantum-mentor/selectionExplanationRateLimiter'
import { ExplainSelectionRequestSchema } from '@/features/quantum-mentor/types'
import { logger } from '@/lib/logger'

// Text Selection & Interactive AI Mentor Copilot™ — a lightweight,
// synchronous endpoint per ENGINEERING_CONSTITUTION.md §5 ("Route Handlers
// ... third-party callback endpoints" is the named list, but this mirrors
// /api/quantum-documents/transform's own precedent: a client-initiated,
// non-mutating AI call has no Server Action equivalent since it isn't a
// database mutation). One request in, one Claude call, one response out —
// no persistence of the explanation itself; only its cost is logged.
export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'You must be signed in to use the AI Mentor.' }, { status: 401 })
  }

  const rateLimitDecision = checkSelectionExplanationRateLimit(user.id)
  if (!rateLimitDecision.allowed) {
    return NextResponse.json(
      { success: false, error: "You're asking the AI Mentor for a lot right now — take a short breather and try again in a moment." },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitDecision.retryAfterMs / 1000)) } },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 })
  }

  const parsed = ExplainSelectionRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 })
  }

  logger.info('[QuantumMentorSelection] Explanation Generated — START', { userId: user.id, actionType: parsed.data.action_type, targetLanguage: parsed.data.target_language })
  const result = await generateSelectionExplanation(parsed.data.selected_text, parsed.data.context, parsed.data.action_type, parsed.data.target_language)
  if (!result.success) {
    logger.error('[QuantumMentorSelection] Explanation Generated — FAIL', { userId: user.id, error: result.error })
    return NextResponse.json({ success: false, error: result.error }, { status: 502 })
  }
  logger.info('[QuantumMentorSelection] Explanation Generated — SUCCESS', { userId: user.id, modelId: result.modelId })

  return NextResponse.json({ success: true, explanation: result.explanation }, { status: 200 })
}
