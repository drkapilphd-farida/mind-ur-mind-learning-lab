# Roadmap

[← Back to index](./PROJECT_BLUEPRINT.md)

**This file is documentation only.** Nothing listed here has been implemented. It is a recommended set of next sprints derived directly from the gaps recorded in [LIMITATIONS_AND_TECHNICAL_DEBT.md](./LIMITATIONS_AND_TECHNICAL_DEBT.md) and the "Not yet built" items in [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md). An AI or engineer picking this project up should treat this as a menu of options to propose, not a queue to silently execute.

## 1. Guided Paragraph Reading™ (5th Reading Mode)

Currently `status: 'coming-soon'` in `readingHubModes.ts` with no route, no dataset, no components. The next mode to build if the product roadmap calls for it. Should follow the exact "How to Extend" steps in [AI_HANDOVER.md](./AI_HANDOVER.md) — dataset → Settings → Canvas → Experience → route, with a naming-collision check against any existing "guided-paragraph" or similarly-named route first.

## 2. Resolve the motion-model asymmetry

Three different scrolling axes currently coexist (horizontal for Phrase Reading, vertical for Vertical Word/Sentence Reading, windowed-peek for Paragraph Reading — see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)). A deliberate decision is needed: either (a) pick one motion model and roll it out to every mode, or (b) explicitly ratify that Paragraph Reading's structurally different windowed model is permanent (given its real, documented justification around variable paragraph height) while Vertical Word/Sentence Reading converge with Phrase Reading's horizontal model, or vice versa. This should not happen as another narrowly-scoped single-mode sprint without first deciding the target end-state, given how many sequential sprints have already touched this exact question.

## 3. Per-session historical WPM

Requires a new Supabase migration adding a WPM/words-read/completion-percent column (or a new sibling table) alongside `practice_sessions`. This is the single highest-leverage fix available — it unblocks Reading Hub's Recent Activity from ever showing real numbers instead of "Not tracked yet," and would enable a future WPM-over-time trend view. Per [ARCHITECTURE.md](./ARCHITECTURE.md) Rule 10, any such migration should be presented to a human for explicit sign-off before being written or applied — it is exactly the kind of change that rule exists to gate.

## 4. Cross-device Best Record sync

Move (or mirror) the `localStorage`-based Best Record into a real, per-user database value — likely a column on the existing `exercise_progress` table (one row already exists per user/lab/exercise) rather than a new table. Would need to decide reconciliation behavior for a user with different local bests on two devices (e.g. take the max on sync).

## 5. Persist mode settings and Target WPM

Reading Width, Font Size, Phrase Size, Sentence Width, and Target WPM currently all reset every visit (see [LIMITATIONS_AND_TECHNICAL_DEBT.md](./LIMITATIONS_AND_TECHNICAL_DEBT.md)). A `localStorage`-based persistence layer (following the same low-footprint pattern `readingLocalHistory.ts` already established for Best Record) would resolve this without requiring a database change.

## 6. Reading Hub discoverability improvements

- Add a Reading Hub link from the Library page, not just Lab Home.
- Consider linking each mode's completion screen "Back to Lab" action back to the Reading Hub instead (or in addition), since that is more likely where the user actually came from.

## 7. AI Reading Coach (exploratory, not scoped)

Mentioned as a longer-term product direction in earlier planning but never scoped into a concrete sprint brief. Would likely involve real AI analysis of a user's reading session data (once per-session WPM history exists — see item 3) to produce coaching feedback. Should not be started until item 3 exists, since there is currently no real per-session performance data to coach from — building this first would risk violating the project's own "never fabricate data" rule ([ARCHITECTURE.md](./ARCHITECTURE.md), Rule 5).

## 8. pdf.js extraction robustness (cross-feature note)

Outside Quantum Speed Reading™ V2's own scope, but worth flagging for whoever owns document extraction: a `standardFontDataUrl` warning has been observed from pdf.js during real PDF extraction elsewhere in the platform. Not confirmed to cause failures yet, but worth a proactive look. Not a Quantum Speed Reading™ V2 roadmap item — noted here only because it surfaced during adjacent verification work.

[← Back to index](./PROJECT_BLUEPRINT.md) · [Next: AI Handover →](./AI_HANDOVER.md)
