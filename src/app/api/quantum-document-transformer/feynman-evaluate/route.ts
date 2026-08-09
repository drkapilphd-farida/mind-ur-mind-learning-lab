import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateFeynmanEvaluation } from '@/features/quantum-document-transformer/generateFeynmanEvaluation'
import { checkFeynmanEvaluationRateLimit } from '@/features/quantum-document-transformer/feynmanEvaluationRateLimiter'
import { FeynmanEvaluationRequestSchema, type FeynmanEvaluationResponse } from '@/features/quantum-document-transformer/types'
import { logger } from '@/lib/logger'

// Interactive Feynman Challenge™ — same shape as /api/quantum-mentor/
// explain-selection: a lightweight, client-initiated, non-mutating AI
// call has no Server Action equivalent since it isn't a database
// mutation. One request in, one Claude call, one response out — the
// learner's explanation and the score are never persisted, only the
// call's cost is logged (see generateFeynmanEvaluation.ts).
export async function POST(request: Request): Promise<Response> {
  try {
    return await handleFeynmanEvaluate(request)
  } catch (error) {
    // Same "the catch that was missing" fix as the other Route Handlers
    // in this app — every path below already returns clean JSON; this
    // only catches a genuinely unexpected throw.
    logger.error('[FeynmanEvaluation] Unhandled exception', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' } satisfies FeynmanEvaluationResponse, { status: 500 })
  }
}

async function handleFeynmanEvaluate(request: Request): Promise<Response> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'You must be signed in to use AI evaluation.' } satisfies FeynmanEvaluationResponse, { status: 401 })
  }

  const rateLimitDecision = checkFeynmanEvaluationRateLimit(user.id)
  if (!rateLimitDecision.allowed) {
    return NextResponse.json(
      { success: false, error: "You're evaluating a lot right now — take a short breather and try again in a moment." } satisfies FeynmanEvaluationResponse,
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitDecision.retryAfterMs / 1000)) } },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request.' } satisfies FeynmanEvaluationResponse, { status: 400 })
  }

  const parsed = FeynmanEvaluationRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request.' } satisfies FeynmanEvaluationResponse, { status: 400 })
  }

  logger.info('[FeynmanEvaluation] Evaluation Generated — START', { userId: user.id })
  const result = await generateFeynmanEvaluation(parsed.data.topic, parsed.data.prompt, parsed.data.learner_explanation)
  if (!result.success) {
    logger.error('[FeynmanEvaluation] Evaluation Generated — FAIL', { userId: user.id, error: result.error })
    return NextResponse.json({ success: false, error: result.error } satisfies FeynmanEvaluationResponse, { status: 502 })
  }
  logger.info('[FeynmanEvaluation] Evaluation Generated — SUCCESS', { userId: user.id, modelId: result.modelId })

  return NextResponse.json({ success: true, score: result.score, feedback: result.feedback } satisfies FeynmanEvaluationResponse, { status: 200 })
}
