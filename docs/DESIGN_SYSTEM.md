# Design System Foundation™

Authoritative visual reference for Mind Ur Mind Learning Lab™. Every future
Lab (Memory Intelligence Lab™, Focus Intelligence Lab™, AI Mentor™, Parent
Dashboard™, Admin CMS™, ...) must build on what's documented here rather than
introducing parallel tokens, colors, or components.

This is Sprint 3A: a visual-architecture pass on top of the existing
Tailwind v4 + shadcn/ui (`radix-nova` style) foundation already in place
since Sprint 1. Nothing here changes Sprint 1–2G business logic or behavior.

## Philosophy

Calm, trusted, premium, scientific, minimal, timeless — the reference points
are Apple, Linear, Notion, Headspace, Apple Fitness. Explicitly **not**
Duolingo-style gamification: no cartoon mascots, no flashy gradients, no
celebratory confetti. Progress is communicated through clean rings, quiet
numbers, and a monochrome neutral palette — color is reserved, not default.

## 1. Design tokens

All tokens live in `src/app/globals.css`, defined once as CSS custom
properties and consumed through Tailwind v4's `@theme` system. **Never
hardcode a color, radius, duration, or z-index value in a component** —
reference the token.

### Colors

Base palette is OKLCH, neutral-first (`baseColor: neutral` in
`components.json`). Defined for both `:root` (light) and `.dark` —
dark mode is already fully token-complete, even though no UI toggle exists
yet (see [§10 Dark mode](#10-dark-mode-future-ready)).

| Token | Use |
|---|---|
| `primary` / `primary-foreground` | The one accent. CTAs, active/current state, focus rings. |
| `secondary` / `secondary-foreground` | Secondary buttons, quiet badges. |
| `muted` / `muted-foreground` | De-emphasized text, disabled surfaces, captions. |
| `accent` / `accent-foreground` | Hover/active backgrounds on interactive rows. |
| `destructive` | Errors, irreversible actions, validation failures. |
| `success` / `success-foreground` | **New in 3A.** Reserved for genuine status communication (form validation success, system confirmations). See [§9](#9-color-usage-rules) — routine "completed" states intentionally stay monochrome. |
| `warning` / `warning-foreground` | **New in 3A.** Reserved for genuine cautionary states (e.g. "session about to expire"). Not for routine UI. |
| `border` / `input` / `ring` | Borders, form borders, focus ring color. |
| `card` / `popover` / `sidebar` (+ `-foreground`) | Surface-specific background/text pairs. |
| `chart-1` … `chart-5` | Data visualization only (used by `WeeklyActivityChart`). |

### Radius scale

One base (`--radius: 0.625rem`), every tier derived from it — never set a
raw `border-radius`:

`radius-sm` (×0.6) · `radius-md` (×0.8) · `radius-lg` (×1, the default)
· `radius-xl` (×1.4) · `radius-2xl` (×1.8) · `radius-3xl` (×2.2) · `radius-4xl` (×2.6)

### Z-index scale — new in 3A

```
--z-dropdown: 1000   --z-overlay: 1200   --z-toast: 1400
--z-sticky:   1100   --z-modal:   1300   --z-tooltip: 1500
```
Use via Tailwind's arbitrary-value syntax: `z-(--z-modal)`. Anything that
stacks above page content must use one of these, not an arbitrary number.

### Motion duration scale — new in 3A

```
--duration-fast:   150ms   (hover/press feedback)
--duration-base:   300ms   (default — most transitions)
--duration-slow:   500ms   (page-level fade/slide entrances)
--duration-slower: 700ms   (exercise-screen hero entrances)
```
Use via `duration-(--duration-base)`. These name the four speeds already in
use across Sprint 1–2G (exercise screens, card hovers); nothing was rescaled.

### Spacing & opacity

No parallel scale was introduced — Tailwind's default spacing scale (4px
base unit) and opacity scale are already comprehensive and used
consistently. Conventions to follow:
- Card padding: `p-4` (compact) or `p-5`/`p-6` (standard).
- Section spacing: `space-y-4` (within a card group) or `space-y-6`/`space-y-8` (between page sections).
- Disabled/locked opacity: `opacity-50` (form controls) or `opacity-60` (locked cards, e.g. `ModuleProgressCard`'s coming-soon state).
- Decorative/muted icon opacity: `text-muted-foreground/30` (large empty-state icons).

## 2. Typography

`src/lib/designSystem/typography.ts` exports `TYPOGRAPHY`, a named constant
per tier. Each formalizes a pattern already in production use — adopting it
is encouraged for new work, but no existing page was rewritten to use it.

| Tier | Classes | Existing example |
|---|---|---|
| `display` | `text-4xl font-semibold tracking-tight sm:text-5xl` | Reserved for future marketing/hero use |
| `h1` | `text-2xl font-semibold tracking-tight sm:text-3xl` | Dashboard/Progress page titles |
| `h2` | `text-lg font-semibold tracking-tight` | Reserved for sub-page section titles |
| `h3` | `text-base font-semibold` | "Your Labs", "Recent activity" section headers |
| `h4` | `text-sm font-semibold` | "Progress timeline", "Session history" card headers |
| `bodyLarge` | `text-base leading-7` | Exercise screen body copy |
| `body` | `text-sm leading-6` | Default paragraph text |
| `small` | `text-sm text-muted-foreground` | Secondary descriptive text |
| `caption` | `text-xs text-muted-foreground` | Card captions, timestamps |
| `label` | `text-xs font-medium uppercase tracking-wider text-muted-foreground` | Card eyebrows ("QUANTUM SPEED READING LAB™", "PRACTICE SUMMARY") |
| `button` | `text-sm font-medium` | Matches `Button`'s internal text size |

## 3. Buttons

`src/components/ui/button.tsx` — six variants × seven sizes, all via one
`cva` definition. Every state already exists through standard HTML/ARIA
mechanics, not bespoke classes:

- **Primary** = `variant="default"`. **Secondary** = `variant="secondary"`.
  **Ghost** = `variant="ghost"`. **Outline** = `variant="outline"`.
  **Danger** = `variant="destructive"`. **Icon Button** = `size="icon"` /
  `icon-xs` / `icon-sm` / `icon-lg`.
- **Hover / Focus / Pressed** — built into `buttonVariants` (`hover:bg-*`,
  `focus-visible:ring-3 focus-visible:ring-ring/50`, `active:translate-y-px`).
- **Disabled** — native `disabled` attribute, `disabled:opacity-50 disabled:pointer-events-none`.
- **Loading — new in 3A.** `<Button loading>`: shows a spinning `Loader2Icon`,
  sets `aria-busy="true"`, and forces `disabled` (prevents double-submit)
  regardless of the `disabled` prop. Additive — every existing `<Button>`
  call is unaffected since `loading` defaults to `false`. Not supported with
  `asChild` (the child, e.g. a `Link`, owns its own content).

## 4. Cards

`src/components/ui/card.tsx` provides the composable primitive (`Card`,
`CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`,
`CardFooter`). Every named "card type" in the brief is a content pattern
built from this one primitive plus the typography/icon/color tokens above —
not a separate component each:

- **Dashboard / Summary / Analytics / Stat Card** → `StatCard`,
  `PracticeSummaryCard`, `ModuleProgressCard`, `DailyStreakCard` (Sprint 2A–2G).
- **Exercise Card** → the exercise grid cards on `/labs/quantum-speed-reading`.
- **Empty State Card — new in 3A.** `src/components/ui/empty-state-card.tsx`.
  Formalizes the empty-state markup previously hand-rolled identically on
  Dashboard ("haven't enrolled in any courses") and Progress
  ("no progress data yet"). Those two pages are left untouched (Sprint 1–2G
  preservation); this is the canonical version for every future empty state.
- **Loading Card — new in 3A.** `src/components/ui/loading-card.tsx`. One
  pulsing skeleton block, formalizing the `animate-pulse rounded-xl bg-muted`
  pattern already used ad hoc in every route's `loading.tsx`. Existing
  `loading.tsx` files are untouched (each shapes its skeleton to its own
  page layout); compose several `LoadingCard`s for any future one.
- **Error Card** → no dedicated primitive needed; every route already has an
  `error.tsx` boundary using standard `Card`/`EmptyStateCard`-shaped markup.

## 5. Form components

Existing: `Input`, `Textarea`, `Label`, `Form` (react-hook-form bindings).
**New in 3A**, added via the shadcn CLI (already-themed, accessible Radix
primitives — zero custom CSS, matches every existing token automatically):
`Checkbox`, `RadioGroup`/`RadioGroupItem`, `Select` (+ subcomponents),
`Switch`. "Search" is an `Input` with a leading icon, not a separate
primitive. Validation styling is shared across all of them via the
`aria-invalid:` Tailwind variant already baked into each component —
set `aria-invalid` on the field and the destructive-colored ring appears
automatically.

## 6. Icon system

`src/lib/designSystem/icons.ts` exports `ICON_SIZE` — formalizes the
`size-3.5` / `size-4` / `size-5` / `size-10` pattern already used
consistently for `lucide-react` icons (the configured icon library) across
every component built in Sprint 1–2G. `sm` = inline-with-text icons,
`md` = the default for buttons/badges, `lg` = standalone status icons,
`xl` = large empty-state icons.

## 7. Motion foundation

`tw-animate-css` already provides the fade/slide/scale utility classes in
use (`animate-in fade-in`, `slide-in-from-bottom-2`, etc.). The
`usePrefersReducedMotion` hook (established in Sprint 2A) is the single
source of truth for respecting `prefers-reduced-motion` — any component with
continuous or glide motion must check it and substitute the
`exercise-reduced-motion-pulse` keyframe (a soft scale/opacity pulse) instead
of motion-heavy animation. No new animation primitives were added; the
duration tokens in §1 are the only 3A motion addition — pair them with the
existing utilities (`duration-(--duration-base)` instead of `duration-300`).

## 8. Layout system

No new layout primitives — existing conventions, now documented:
- **Container**: dashboard shell pages render inside `<main>` with the
  sidebar layout from `(dashboard)/layout.tsx`; content itself uses
  `max-w-2xl` (Lab/Progress pages) or full-width grids.
- **Grid**: stat rows use `grid grid-cols-2 gap-4 sm:grid-cols-4`; course/exercise
  lists use `space-y-4`.
- **Breakpoints**: Tailwind defaults (`sm` 640px, `md` 768px, `lg` 1024px,
  `xl` 1280px, `2xl` 1536px) — no custom breakpoints.
- **Safe areas**: exercise screens use `min-h-[100dvh]` (not `100vh`) to
  respect mobile safe areas.

## 9. Color usage rules

- **Primary**: the one accent color — CTAs, the current/active state, focus
  rings. Never used for more than one prominent element per view.
- **Success / Warning**: reserved for genuine status communication (a form
  validated, a session about to expire) — **not** for routine progress
  states. Completed/locked/current exercise and module states intentionally
  stay monochrome (black-on-white badges, not green checkmarks), which is a
  deliberate choice consistent with the calm/premium philosophy in §0, not
  an oversight. Do not retrofit existing "Completed" badges to use `success`.
- **Destructive**: errors and irreversible actions only.
- **Neutral** (`muted`, `secondary`, `border`): everything else — the
  default for 95% of surfaces. When in doubt, use neutral.
- **Never** introduce a raw hex/oklch value or a new named color outside
  this token set without updating this document first.

## 10. Dark mode (future-ready)

`.dark` class tokens are fully defined in `globals.css` alongside `:root` —
every color in §1 has a dark-mode counterpart, including the new
`success`/`warning` pair. No UI toggle exists yet (out of scope for 3A — no
new business features), but any future toggle only needs to add/remove the
`.dark` class on `<html>`; zero component changes required.

## 11. Accessibility

- Focus rings: `focus-visible:ring-3 focus-visible:ring-ring/50` baked into
  every interactive primitive (buttons, inputs, the new checkbox/radio/select/switch).
- `aria-disabled` + descriptive `aria-label` on locked cards (`ModuleProgressCard`,
  exercise cards — Sprint 2E pattern, reused, not reinvented).
- `aria-busy` on loading buttons (new in 3A).
- Color contrast: the neutral OKLCH palette was authored at shadcn's
  `radix-nova` defaults, which target WCAG AA. The new `success`/`warning`
  tokens were measured (OKLCH → linear sRGB → WCAG relative luminance, not
  eyeballed) against both light- and dark-mode page backgrounds and against
  their own solid-fill foreground; the first values chosen (L=0.6/0.75)
  failed AA for normal text (3.58:1 / 2.29:1) and were corrected to L=0.52
  (success) / L=0.48 (warning), now 5.21:1 / 6.71:1 in light mode and
  8.44:1 / 10.30:1 in dark mode — see Accessibility Report in the sprint
  deliverable for the full measured table.
- Keyboard navigation: no new interactive elements were added without a
  tab-reachable, keyboard-operable native element underneath (Radix
  primitives for checkbox/radio/select/switch are fully keyboard-operable
  out of the box).

## 12. Performance

- No new runtime dependencies — `radix-ui`, `lucide-react`,
  `class-variance-authority` were already installed and are reused by the
  4 new form primitives.
- All new files are small, tree-shaken on import (typography/icon constants
  are plain objects; new components are tiny, single-purpose).
- No existing CSS was duplicated — every new token extends the existing
  `@theme` blocks in `globals.css` rather than introducing a parallel system.
