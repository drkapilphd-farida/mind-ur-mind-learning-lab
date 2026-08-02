# ADR 0001 — AI Learning Studio™ Domain Model (Sprint 0)

## Status

Accepted (Sprint 0 — Platform Foundation™). Migrations only; not yet applied
to the live database (see §5).

## Context

Sprint 0 needs a database foundation for the new AI Learning Studio™ shell
(`/preview/*`) covering: family accounts, learning projects, documents,
learning sessions (extensible across Reading/Memory/Revision/Research),
AI usage tracking, subscriptions/plans/entitlements, and role-based
permissions — without touching the existing Brain Training Studio™ schema
(`courses`, `lessons`, `enrollments`, `exercise_progress`,
`practice_sessions`, and the various `*_discovery_sessions` /
`*_sessions` tables). Per the sprint's own scope, this is architecture
only — no business logic, no UI wired to any of it yet.

The instruction for this ADR was explicit: **design the domain model
first, derive the schema from it second** — so this document states the
entities and relationships before the SQL does.

## 1. Entities

| Entity | Owns | Notes |
|---|---|---|
| **User** | — | `auth.users` (Supabase-managed). Every other entity ultimately traces back to a user via `user_id`. |
| **Profile** | User (1:1) | **Existing** `public.profiles` — reused as-is, not re-modeled. Zero changes in this sprint. |
| **Family** | — | A group. Has exactly one owner (the creator); zero or more members. |
| **Family Member** | Family | Not in the brief's named list, but implied by "Owner / Member / Child Profile" (original Sprint 0 spec) — a family without a membership join table can't express who's in it. Supports both real accounts (`user_id` set) and child members with no login of their own (`user_id` null, `display_name` instead). |
| **Learning Project** | User, optional Family | A container ("IELTS Prep", "Grade 9 Biology") that documents and sessions attach to. Optionally shared with a family. |
| **Document** | User, optional Learning Project | An uploaded/created learning artifact. Storage reference only in this sprint — no upload UI. |
| **Learning Session** | User, optional Learning Project | **The one entity the brief called out for extensibility.** See §2. |
| **AI Event** | User, optional Learning Session | Named `AIEvent`, not `AIUsage`, per this sprint's explicit correction. One row per discrete AI call (chat turn, generation, analysis) — the foundation for a future AI Economics Engine, not a business feature itself yet. |
| **Plan** | — | The purchasable catalog (Free / Individual / Family / ...). Public, like the existing `courses` catalog pattern. |
| **Subscription** | User, optional Family, Plan | A user's (or family's) active plan instance. Reuses the existing Stripe billing integration pattern — this sprint only adds the table, no billing logic. |
| **Entitlement** | Plan (template) or User (override) | What a plan — or a specific user override — actually unlocks. Deliberately generic (`key`/`value jsonb`) rather than one boolean column per feature, so new limits don't require a schema change. |
| **Role** | — | A named role (`owner`, `family_admin`, `member`, `child`, ...). Lookup table. |
| **Permission** | — | A named capability (`documents:create`, `family:invite_member`, ...). Lookup table. |
| **Audit Log** | optional User (actor) | Append-only record of significant actions, system-wide. |

## 2. Learning Session — extensibility design

The brief's requirement: one `Learning Session` concept usable by Reading,
Memory, Revision, and Research, not a table per feature. The existing
Brain Training Studio™ schema already has the *opposite* shape
(`reading_discovery_sessions`, `memory_discovery_sessions`,
`fixation_sessions`, ...) — one table per experience — which is correct
for that side of the product (each is a genuinely different observation
shape) but is exactly what this new entity must avoid repeating.

Design: **one table, a `session_type` discriminator, and a `data jsonb`
payload** —

```
learning_sessions (
  session_type  text CHECK (session_type IN ('reading','memory','revision','research')),
  data          jsonb   -- shape is per session_type, validated in application code
  ...
)
```

Why a `CHECK` constraint over a Postgres `ENUM` type: adding a fifth
session type later is `ALTER TABLE ... DROP CONSTRAINT / ADD CONSTRAINT`
(one migration, no type-wide lock implications); widening a Postgres enum
has its own set of migration footguns. Why `jsonb` over a column-per-field
schema: the four session types will have genuinely different payload
shapes (a Research session tracks sources; a Revision session tracks a
spaced-repetition schedule) — a single wide table with dozens of
mostly-null columns would be worse, not more "relational." This mirrors
the existing codebase's own established pattern (`memory_discovery_sessions.events
jsonb`, `reading_intelligence_sessions` and others already lean on `jsonb`
for session-shaped data) — not a new idea introduced here, just applied
one level more generically.

## 3. Relationships

```
auth.users ──1:1── profiles                              [existing, untouched]
auth.users ──1:*── family_members ──*:1── families
auth.users ──1:*── learning_projects ──*:0..1── families
auth.users ──1:*── documents ──*:0..1── learning_projects
auth.users ──1:*── learning_sessions ──*:0..1── learning_projects
auth.users ──1:*── ai_events ──*:0..1── learning_sessions
auth.users ──1:*── subscriptions ──*:1── plans
                    subscriptions ──*:0..1── families
plans ──1:*── entitlements (plan-level, user_id null)
auth.users ──1:*── entitlements (user-level override, plan_id null)
auth.users ──*:*── roles (via user_roles, optionally scoped to a family)
roles ──*:*── permissions (via role_permissions)
auth.users ──0..1:*── audit_logs (actor; system events have no actor)
```

## 4. What's deliberately excluded from this sprint

- **No columns added to `public.profiles`.** A `family_id` on `profiles`
  was considered and rejected — `family_members` is the single source of
  truth for membership, avoiding a denormalized field that could drift
  out of sync (and a user may plausibly belong to more than one family
  over time — divorced parents' households, for example).
- **No family-shared RLS on `documents`/`learning_sessions`/`ai_events`.**
  Sprint 0 ships owner-only (`user_id = auth.uid()`) policies for these
  three; family-shared visibility is a real feature decision (who can see
  a child's session data, exactly?) deferred to whichever future sprint
  actually builds family dashboards, not decided implicitly by a
  foundation-sprint RLS policy.
- **No write access from `authenticated` to `subscriptions`,
  `entitlements`, `user_roles`, or `audit_logs`.** These are
  system/service-role-written tables (Stripe webhooks, server actions
  using the service-role client) — granting client-writable INSERT here
  would let a user forge their own entitlements or audit trail.

## 5. Migration files (not applied)

Seven files under `supabase/migrations/`, timestamped `20260711000001`–
`20260711000007`, additive only — no `ALTER`/`DROP` on any existing
table. Per this sprint's instruction, these are **generated only**; none
have been run against the connected Supabase project.
