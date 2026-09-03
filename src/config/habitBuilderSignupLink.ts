// Quantum Mindset & Habit Builder™ — single source of truth for where the
// /programs/habit-builder landing page's "Start Free" CTA sends a
// logged-out visitor. journey/[day]/page.tsx already redirects a genuine
// brand-new user (no session history, no baseline diagnostic) straight to
// the mandatory baseline diagnostic before Day 1 ever renders — so this
// only ever needs to point at Day 1 itself, not the diagnostic directly.
const JOURNEY_DAY_ONE_PATH = '/labs/quantum-speed-reading/journey/1'

// /signup/page.tsx reads `next` and passes it through SignUpForm →
// signUp.ts, which already honors it end-to-end (including the
// email-confirmation redirect) — see that action's own doc comment.
export const HABIT_BUILDER_SIGNUP_HREF = `/signup?next=${encodeURIComponent(JOURNEY_DAY_ONE_PATH)}`
