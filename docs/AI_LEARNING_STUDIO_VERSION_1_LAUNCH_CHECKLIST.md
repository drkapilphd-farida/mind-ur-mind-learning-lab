# AI Learning Studio™ — Version-1 Launch Checklist

**Release Candidate:** RC-1

This checklist separates what RC-1 has already verified from what still requires a human, ops-level, or
founder decision before Version-1 can go live for real users. Nothing in the "Still required" section is
a code defect — every item is either a deployment action outside a code sprint's authority, or a decision
this arc has consistently deferred to the founder rather than assuming.

## Already verified as part of RC-1 (this sprint)

- [x] `npx tsc --noEmit` — clean, zero errors, whole repo.
- [x] `npx eslint .` — clean, zero warnings or errors, whole repo.
- [x] `npx vitest run` — 644 test files, 3,927 tests, all passing.
- [x] `npm run build` — 126 routes, zero build errors, byte-identical to the immediately prior sprint's
      own build output (confirming a stable, unchanged codebase going into RC-1).
- [x] Full route-guard sweep — every public route (`/`, `/login`, `/signup`, `/forgot-password`) serves
      real content; every one of the 23 protected routes spanning the entire user journey (dashboard,
      Studio, upload, processing, Workspace, all 9 Learning Modes' own routes and Workspace query-param
      entries, AI Mentor™) correctly redirects unauthenticated access to `/login` with the real
      destination preserved in a `next` parameter.
- [x] Migration status confirmed via `supabase migration list` — 8 real migrations unapplied (see Known
      Issues #1), consistent with the standing, founder-confirmed policy.
- [x] Every sprint from ALS-1 through ALS-19 re-confirmed as still-accurate, un-regressed groundwork —
      no prior sprint's own disclosed finding has silently drifted or been contradicted by this sprint's
      own fresh verification.

## Still required before a real production launch

### Deployment
- [ ] **Apply the 8 pending Supabase migrations** to the linked, hosted project (Known Issues #1). Without
      this, document upload, Universal Learning Object storage, Smart Notes™, AI Mentor™, Mind Map™/
      Flashcards™ caching, Focus Mode™, and MCQs™ will all fail for real users — the tables/columns/CHECK
      constraints these features depend on don't exist yet on the remote database.
- [ ] Confirm all required environment variables (Supabase URL/keys, `ANTHROPIC_API_KEY` for AI Mentor™,
      Stripe keys if billing is in scope for this launch) are set in the real production environment —
      this arc's own `.env.example` lists what's expected but this sprint did not have access to verify
      real production secrets.
- [ ] Confirm the Supabase Storage bucket for uploaded documents (ALS-10) exists and has the correct RLS
      policies applied in production, not just as a migration file.

### Quality assurance
- [ ] **A real, credentialed, click-through QA pass** — every sprint since ALS-14 has disclosed that this
      development environment has no seeded test user or processed document, so no sprint in this arc has
      performed an actual authenticated browser walkthrough. RC-1's own verification is exhaustive at the
      source-code and route-guard level but is not a substitute for a human clicking through the real
      product with a real account and a real uploaded document.
- [ ] Verify the full upload → processing → ULO → all-nine-modes journey with at least one real `.pdf`,
      one real `.docx`, and one real `.txt` file, including a genuinely short document (to exercise MCQs™'s
      own honest "not enough real sections" fallback) and a genuinely long one.
- [ ] Verify resume behavior by deliberately closing the browser mid-session in at least two modes (e.g.
      Quantum Speed Reading™ and Focus Mode™'s Pomodoro variant, which has the most novel resume-adjacent
      behavior — see Known Issues, ALS-16's own disclosed ephemeral-phase-on-refresh design).
- [ ] Cross-browser check (Safari, Chrome, Firefox) and a real mobile-device check (not just responsive
      dev-tools emulation) for at least the Reading, Memory, and MCQs experiences.

### Product decisions (not this sprint's to make)
- [ ] Decide the fate of the 9 disclosed orphaned intelligence/profile functions (Known Issues #8) — wire
      them into a real dashboard feature, or remove them, as an explicit future sprint.
- [ ] Decide whether to scope a future sprint for UCE-3B (semantic enrichment) — the one architectural
      change that would upgrade Mind Map™, Flashcards™, Memory Mode™'s three prompt-based methods, and
      MCQs™ from honest-structural to AI-enriched, without breaking any existing consumer.
- [ ] Decide whether Quantum Speed Reading™'s missing RSVP presentation and speed control (Known Issues
      #5) should be built for Version-1.1, given the platform's own name.

### Sign-off
- [ ] Founder/product owner reviews `AI_LEARNING_STUDIO_VERSION_1_RELEASE_NOTES.md`,
      `AI_LEARNING_STUDIO_VERSION_1_KNOWN_ISSUES.md`, and this checklist, and confirms readiness to
      proceed with the deployment steps above.

## What this checklist deliberately does not include

Any Version-2 feature work (Learning DNA™, Adaptive Learning™, AI Brain Profiling™, Personalized Flash
Cards™/Revision™/Focus Coaching™, Focus DNA™, Adaptive Focus™, AI Productivity Coach™) — see
`AI_LEARNING_STUDIO_VERSION_1_LOCK_CONFIRMATION.md` for the explicit scope freeze this Release Candidate
represents.
