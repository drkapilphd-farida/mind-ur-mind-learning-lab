# AI Learning Studio™ — Sprint ALS-21 Remaining Non-Functional Features

**Sprint:** ALS-21 — Complete Functional Completion

This lists every real feature or option that remains non-functional after this sprint's fixes, and — per
this sprint's own explicit instruction — confirms each one is either hidden or honestly disabled with a
proper "Coming Soon"/"Not available yet" state, never a broken button or silent failure.

## Learning Modes

1. **Research Mode™** — no real runtime. Now visually disclosed with a "Coming Soon" badge on its own
   Learning Blueprint™ card (fixed this sprint); clicking it still navigates to a real, honest "Coming in
   a future production sprint" screen via the universal Learning Workspace™. No longer recommendable as
   the AI's own top pick (fixed this sprint).
2. **Exam Preparation™** — no real runtime. Same treatment as Research Mode™: "Coming Soon" badge, honest
   Workspace fallback screen, never recommended.

## Upload options

3. **Website** (URL upload) — the option is visible in the Upload Wizard, correctly disabled, with a real
   "Coming Soon" badge. Confirmed via audit: no dead click, no error, no silent no-op — a genuinely
   unclickable, honestly-labeled button.
4. **YouTube** (video-link upload) — same treatment as Website: visible, disabled, "Coming Soon" badge.
5. **PowerPoint** and **EPUB** — two additional upload options (not named in this sprint's own checklist,
   found during the audit) with the identical honest disabled/"Coming Soon" treatment.
6. **Audio** — not offered as an upload option in the wizard at all (distinct from "disabled" — it simply
   isn't presented as a choice). A real audio-capture component (`RecordAndLearnExperience.tsx`) exists,
   but only in a separate, unrelated onboarding flow (`/welcome/record`), not reachable from the document
   Upload Wizard. Not a bug — an option that was never offered isn't a broken one.

## AI Mentor™

7. **Per-document conversation/session model** — AI Mentor™ still has no chunk/ULO-shaped session of its
   own (a deliberate architectural decision, unchanged by this sprint). This sprint added real, honest
   *awareness* of the learner's most recently active document (title + section headings) to its prompt
   context — a meaningfully different, smaller thing than a full per-document mentor session, and
   disclosed as such.

## Mind Assessment Center™ (a separate, older core module)

8. **Real scoring, real multi-question navigation, and the promised "Transformation Dashboard"** — this
   sprint's own fix was explicitly scoped to a *minimal safety fix* (no dead buttons, no placeholder text
   shown as real), not a full rebuild. The underlying flow is still built on mock/hardcoded data
   (`mockData`, `mockAssessments`) and shows only one static, hardcoded question. This remains real,
   disclosed non-functionality — now honestly presented (disabled Previous/Next with a stated reason, real
   visual feedback on answer selection, no dead Finish button, no literal "placeholder" text shown to
   users) rather than a broken experience. A full rebuild is out of this sprint's "no new features" scope
   and belongs to a future, dedicated sprint for this separate module.

## What is explicitly NOT on this list (because it's fully functional)

Every one of the nine AI Learning Studio™ Learning Modes' own core experience (open, load, render, real
content, resume where applicable, complete where applicable) — see
`AI_LEARNING_STUDIO_ALS_21_FUNCTIONAL_COMPLETION_REPORT.md` for the full per-mode matrix. None of the
honestly-structural content decisions (Mind Map™'s outline, Flashcards™' review cards, MCQs™'s structural
questions, Memory Mode™'s three prompt-based methods) are "non-functional" — they are real, working,
deliberately-scoped features, not placeholders.
