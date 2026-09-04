import { createClient } from '@/lib/supabase/server'
import { getIsPaidUser } from './getIsPaidUser'

const HABIT_BUILDER_ENTITLEMENT_KEY = 'habit_builder_access'

// Developer Whitelist™ — permanent, code-level bypass for the Habit
// Builder Day 8+ paywall, independent of isDevUnlockEnabled() (which only
// ever auto-bypasses in local dev/staging, never on the real production
// domain — see that file's own comment). Lowercased for a
// case-insensitive match against the real, case-preserved auth email.
const DEVELOPER_WHITELIST_EMAILS = ['drkapilphd@gmail.com']

// Habit Builder Paywall™ — the real, plan-scoped check behind the 21-Day
// Journey's Day 8+ gate (journey/[day]/page.tsx, HabitDashboard.tsx).
// Deliberately NOT getIsPaidUser() alone: that function treats any
// active row in `subscriptions` as paid, regardless of which plan — using
// it here would mean a Habit Builder purchase and a QSR Masterclass
// purchase couldn't be told apart, which the founder explicitly requires
// (a Habit Builder purchase must never unlock Masterclass content, and
// this function must not touch getIsPaidUser() itself, since every other
// paid gate in the app also calls it). This checks a user-level
// `entitlements` row (granted only by the Habit Builder webhook/claim
// flow — see 20260903000002_create_habit_builder_payments_and_entitlement.sql)
// OR falls back to getIsPaidUser() so today's existing, separately-decided
// behavior — a Masterclass/app-continued subscriber already gets Habit
// Builder access — stays exactly as it is, untouched. `email` is optional
// only so existing callers that genuinely have no user (never true for
// either real call site today) don't need an unreachable branch — always
// pass the real signed-in user's email when one exists, for the
// Developer Whitelist™ check above.
export async function hasHabitBuilderAccess(userId: string, email: string | null = null): Promise<boolean> {
  if (email !== null && DEVELOPER_WHITELIST_EMAILS.includes(email.toLowerCase())) {
    return true
  }

  const supabase = await createClient()

  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('key', HABIT_BUILDER_ENTITLEMENT_KEY)
    .maybeSingle()

  if (entitlement !== null) return true

  return getIsPaidUser(userId)
}
