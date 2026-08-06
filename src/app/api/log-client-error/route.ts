import { NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { logger } from '@/lib/logger'

const ClientErrorReportSchema = z
  .object({
    context: z.string().max(200),
    message: z.string().max(2000),
    digest: z.string().max(200).optional(),
    url: z.string().max(2000).optional(),
  })
  .strict()

// Light — this only exists to close a real gap: every client-side
// error.tsx boundary in this app previously called logger.error()
// directly, which in the browser just calls console.error() — visible
// to that one user's own devtools, never to anyone operating the
// platform. This route is what actually gets a client-side error into
// server-side (and therefore Vercel/operator-visible) logs. See
// reportClientError.ts for the sending side.
const REPORT_RATE_LIMIT = { max: 20, windowMs: 60_000 }

export async function POST(request: Request): Promise<Response> {
  const clientIp = await getClientIp()
  if (!checkRateLimit(`log-client-error:${clientIp}`, REPORT_RATE_LIMIT).allowed) {
    return NextResponse.json({ received: false }, { status: 429 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ received: false }, { status: 400 })
  }

  const parsed = ClientErrorReportSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ received: false }, { status: 400 })
  }

  // `logger`'s own buildEntry spreads the context object AFTER setting
  // the top-level `message` field (see src/lib/logger.ts) — a context
  // key literally named `message` would silently clobber it, hiding
  // which boundary reported this. clientMessage avoids the collision.
  logger.error(`[client] ${parsed.data.context}`, {
    clientMessage: parsed.data.message,
    digest: parsed.data.digest,
    url: parsed.data.url,
    clientIp,
  })

  return NextResponse.json({ received: true })
}
